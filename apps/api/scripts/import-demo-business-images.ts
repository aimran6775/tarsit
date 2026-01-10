import { PrismaClient } from '@prisma/client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
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

type ImageFile = {
  filePath: string;
  fileName: string;
  slug: string;
  order: number;
  contentType: string;
};

function detectContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  throw new Error(`Unsupported image extension: ${ext}`);
}

function parseImageFileName(fileName: string): { slug: string; order: number } {
  // Expected: <businessSlug>_<order>.<ext> (e.g. quickfix-phone-repair_1.jpg)
  const ext = path.extname(fileName);
  const base = fileName.slice(0, -ext.length);
  const match = base.match(/^(?<slug>[a-z0-9-]+)_(?<order>\d+)$/);
  if (!match?.groups?.slug || !match.groups.order) {
    throw new Error(
      `Invalid filename "${fileName}". Expected: <businessSlug>_<order>.<ext> (e.g. quickfix-phone-repair_1.jpg)`
    );
  }
  return { slug: match.groups.slug, order: Number(match.groups.order) };
}

function listImages(dir: string): ImageFile[] {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`Image directory not found: ${dir}`);
  }

  const entries = fs.readdirSync(dir);
  const images: ImageFile[] = [];

  for (const fileName of entries) {
    const filePath = path.join(dir, fileName);
    if (!fs.statSync(filePath).isFile()) continue;

    const contentType = detectContentType(fileName);
    const { slug, order } = parseImageFileName(fileName);

    images.push({ filePath, fileName, slug, order, contentType });
  }

  return images.sort((a, b) => a.slug.localeCompare(b.slug) || a.order - b.order);
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

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  return publicUrl;
}

async function main(): Promise<void> {
  if (process.env.ALLOW_IMAGE_IMPORT !== 'true') {
    throw new Error(
      'Refusing to run: set ALLOW_IMAGE_IMPORT=true to upload local images and write Photo records.'
    );
  }

  const imagesDir = process.env.DEMO_IMAGE_DIR ?? path.resolve(__dirname, '../prisma/demo-images');
  const bucketName = process.env.DEMO_IMAGE_BUCKET ?? 'tarsit-media';

  const supabase = getSupabaseAdminClient();

  const businesses = await prisma.business.findMany({
    select: { id: true, slug: true, name: true },
  });
  const businessBySlug = new Map(businesses.map((b) => [b.slug, b] as const));

  const images = listImages(imagesDir);
  if (images.length === 0) {
    throw new Error(`No images found in ${imagesDir}. Add files like: quickfix-phone-repair_1.jpg`);
  }

  const slugsInFiles = Array.from(new Set(images.map((i) => i.slug)));
  const missingSlugs = slugsInFiles.filter((slug) => !businessBySlug.has(slug));
  if (missingSlugs.length) {
    throw new Error(`These slugs do not exist in DB: ${missingSlugs.join(', ')}`);
  }

  console.log(`Found ${images.length} image files for ${slugsInFiles.length} businesses.`);

  // Group by slug
  const bySlug = new Map<string, ImageFile[]>();
  for (const img of images) {
    const group = bySlug.get(img.slug) ?? [];
    group.push(img);
    bySlug.set(img.slug, group);
  }

  for (const [slug, group] of bySlug.entries()) {
    const business = businessBySlug.get(slug);
    if (!business) continue;

    console.log(`\n🏪 Importing for ${business.name} (${slug})`);

    // Replace existing photos
    await prisma.photo.deleteMany({ where: { businessId: business.id } });

    const uploadedUrls: Array<{ url: string; order: number }> = [];

    for (const img of group.sort((a, b) => a.order - b.order)) {
      const buffer = fs.readFileSync(img.filePath);
      const objectPath = `demo/businesses/${business.id}/import/${Date.now()}-${img.fileName}`;
      const publicUrl = await uploadToSupabase({
        supabase,
        bucket: bucketName,
        objectPath,
        buffer,
        contentType: img.contentType,
      });

      uploadedUrls.push({ url: publicUrl, order: img.order });

      await prisma.photo.create({
        data: {
          businessId: business.id,
          url: publicUrl,
          caption: `Photo ${img.order}`,
          order: img.order,
          featured: img.order === 1,
        },
      });
    }

    const cover = uploadedUrls.sort((a, b) => a.order - b.order)[0]?.url;
    if (cover) {
      await prisma.business.update({ where: { id: business.id }, data: { coverImage: cover } });
    }

    console.log(`✅ Imported ${uploadedUrls.length} images`);
  }

  console.log('\nDone.');
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
