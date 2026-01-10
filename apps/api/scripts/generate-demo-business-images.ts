import { PrismaClient } from '@prisma/client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import OpenAI from 'openai';
import * as path from 'path';

const prisma = new PrismaClient();

// Load environment variables from apps/api/.env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function getSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const supabaseServiceKey = requireEnv('SUPABASE_SERVICE_KEY');

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function buildImagePrompts(params: {
  businessName: string;
  categoryName: string;
  description?: string | null;
  city: string;
  state: string;
}): string[] {
  const { businessName, categoryName, description, city, state } = params;

  const base = [
    `Photorealistic small business photography for a local ${categoryName} shop named "${businessName}" in ${city}, ${state}.`,
    description ? `Business vibe: ${description}` : null,
    'Ultra realistic, natural lighting, handheld 35mm look, shallow depth of field, true-to-life colors.',
    'No logos or trademarks, no watermarks, no text overlays, no brand names, no signage with readable text.',
  ]
    .filter(Boolean)
    .join(' ');

  return [
    `${base} Exterior storefront, street-level view, clean modern small-business facade, realistic neighborhood background, midday light.`,
    `${base} Interior wide shot showing the space layout, warm lighting, realistic furniture/equipment, inviting atmosphere.`,
    `${base} Close-up detail shot of the work being done (hands/tools) without identifying faces, realistic textures and materials.`,
    `${base} Team working candidly in the shop (non-identifiable faces), authentic uniforms/aprons, documentary style.`,
    `${base} Counter/service desk interaction moment (non-identifiable faces), friendly and professional, documentary photo.`,
  ];
}

async function fetchImageAsPngBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download image: ${res.status} ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadToSupabase(params: {
  supabase: SupabaseClient;
  bucket: string;
  objectPath: string;
  buffer: Buffer;
  contentType: string;
}): Promise<string> {
  const { supabase, bucket, objectPath, buffer, contentType } = params;

  const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  return publicUrl;
}

async function main(): Promise<void> {
  if (process.env.ALLOW_IMAGE_GENERATION !== 'true') {
    throw new Error(
      'Refusing to run: set ALLOW_IMAGE_GENERATION=true to generate and upload AI images.'
    );
  }

  const openAiKey = requireEnv('OPENAI_API_KEY');

  const model = process.env.DEMO_IMAGE_MODEL ?? 'dall-e-3';

  type ImageSize = '1024x1024' | '1024x1792' | '1792x1024';
  const sizeRaw = process.env.DEMO_IMAGE_SIZE ?? '1024x1024';
  const allowedSizes: ReadonlyArray<ImageSize> = ['1024x1024', '1024x1792', '1792x1024'];
  if (!allowedSizes.includes(sizeRaw as ImageSize)) {
    throw new Error(`Invalid DEMO_IMAGE_SIZE: ${sizeRaw}. Allowed: ${allowedSizes.join(', ')}`);
  }
  const size: ImageSize = sizeRaw as ImageSize;
  const imagesPerBusiness = Number(process.env.DEMO_IMAGES_PER_BUSINESS ?? '5');
  const dryRun = process.env.DEMO_IMAGE_DRY_RUN === 'true';

  const bucketName = process.env.DEMO_IMAGE_BUCKET ?? 'tarsit-media';

  const openai = new OpenAI({ apiKey: openAiKey });
  const supabase = getSupabaseAdminClient();

  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: 'asc' },
    include: { category: true },
  });

  if (businesses.length === 0) {
    console.log('No businesses found. Run the demo seed first.');
    return;
  }

  console.log(`Found ${businesses.length} businesses.`);

  for (const business of businesses) {
    const prompts = buildImagePrompts({
      businessName: business.name,
      categoryName: business.category.name,
      description: business.description,
      city: business.city,
      state: business.state,
    }).slice(0, Math.max(1, imagesPerBusiness));

    console.log(`\n🏪 ${business.name} (${business.city}, ${business.state})`);
    prompts.forEach((p, idx) => console.log(`  [${idx + 1}] ${p}`));

    if (dryRun) {
      continue;
    }

    // Replace existing photos for the business
    await prisma.photo.deleteMany({ where: { businessId: business.id } });

    const uploadedUrls: string[] = [];

    for (let i = 0; i < prompts.length; i += 1) {
      const prompt = prompts[i];

      const image = await openai.images.generate({
        model,
        prompt,
        size,
      });

      type GeneratedImage = { url?: string; b64_json?: string };
      const first: GeneratedImage | undefined = image.data?.[0];

      let pngBuffer: Buffer;
      if (first?.b64_json) {
        pngBuffer = Buffer.from(first.b64_json, 'base64');
      } else if (first?.url) {
        pngBuffer = await fetchImageAsPngBuffer(first.url);
      } else {
        throw new Error('OpenAI image response missing url/b64_json');
      }

      const objectPath = `demo/businesses/${business.id}/${Date.now()}-${i + 1}.png`;
      const publicUrl = await uploadToSupabase({
        supabase,
        bucket: bucketName,
        objectPath,
        buffer: pngBuffer,
        contentType: 'image/png',
      });

      uploadedUrls.push(publicUrl);

      await prisma.photo.create({
        data: {
          businessId: business.id,
          url: publicUrl,
          caption: `Photo ${i + 1}`,
          order: i,
          featured: i === 0,
        },
      });
    }

    if (uploadedUrls.length > 0) {
      await prisma.business.update({
        where: { id: business.id },
        data: {
          coverImage: uploadedUrls[0],
        },
      });
    }

    console.log(`✅ Uploaded ${uploadedUrls.length} images`);
  }

  console.log('\nDone.');
}

main()
  .catch((e) => {
    console.error('❌ Image generation failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
