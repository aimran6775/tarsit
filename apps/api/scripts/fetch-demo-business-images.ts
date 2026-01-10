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

type WikimediaSearchResult = {
  title: string;
};

type WikimediaSearchResponse = {
  query?: {
    search?: WikimediaSearchResult[];
  };
};

type WikimediaExtMetadataValue = {
  value?: string;
};

type WikimediaImageInfo = {
  url?: string;
  thumburl?: string;
  descriptionurl?: string;
  extmetadata?: Record<string, WikimediaExtMetadataValue>;
};

type WikimediaPagesResponse = {
  query?: {
    pages?: Record<string, { title?: string; imageinfo?: WikimediaImageInfo[] }>;
  };
};

type CommonsCandidate = {
  title: string;
  url: string;
  thumbUrl?: string;
  descriptionUrl?: string;
  licenseShortName?: string;
  licenseUrl?: string;
  artist?: string;
  attribution?: string;
  credit?: string;
};

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMeta(info: WikimediaImageInfo | undefined, key: string): string | undefined {
  const raw = info?.extmetadata?.[key]?.value;
  if (!raw) return undefined;
  return stripHtml(raw);
}

function isLicenseAllowed(licenseShortName: string | undefined): boolean {
  if (!licenseShortName) return false;
  const s = licenseShortName.toLowerCase();

  // Exclude non-commercial / no-derivatives / fair use
  if (
    s.includes('noncommercial') ||
    s.includes('nc') ||
    s.includes('no derivatives') ||
    s.includes('nd')
  ) {
    return false;
  }
  if (s.includes('fair use')) return false;

  // Allow common commercially-usable licenses
  if (s.includes('cc0')) return true;
  if (s.includes('public domain') || s === 'pd' || s.startsWith('pd-')) return true;
  if (s.includes('cc by-sa') || s.includes('cc-by-sa')) return true;
  if (s.includes('cc by') || s.includes('cc-by')) return true;

  return false;
}

function buildCommonsAttributionCaption(candidate: CommonsCandidate): string {
  const parts: string[] = [];

  parts.push(candidate.title);
  if (candidate.artist) parts.push(`by ${candidate.artist}`);
  if (candidate.licenseShortName) parts.push(candidate.licenseShortName);
  parts.push('source: Wikimedia Commons');

  return parts.join(' · ');
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchCommonsFiles(params: { query: string; limit: number }): Promise<string[]> {
  const { query, limit } = params;
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');
  url.searchParams.set('list', 'search');
  url.searchParams.set('srnamespace', '6'); // File:
  url.searchParams.set('srlimit', String(limit));
  url.searchParams.set('srsearch', query);

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'tarsit-demo-seed/1.0 (commons image fetch)',
    },
  });
  if (!res.ok) {
    throw new Error(`Commons search failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as WikimediaSearchResponse;
  const titles = (data.query?.search ?? []).map((r) => r.title).filter(Boolean);
  // Prefer raster formats that our storage bucket accepts.
  return titles.filter((t) => /\.(jpe?g|png|webp|gif)$/i.test(t));
}

async function fetchCommonsCandidates(titles: string[]): Promise<CommonsCandidate[]> {
  if (titles.length === 0) return [];

  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|extmetadata');
  url.searchParams.set('iiurlwidth', '1200');
  url.searchParams.set('titles', titles.join('|'));

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'tarsit-demo-seed/1.0 (commons image fetch)',
    },
  });
  if (!res.ok) {
    throw new Error(`Commons imageinfo failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as WikimediaPagesResponse;
  const pages = data.query?.pages ?? {};

  const candidates: CommonsCandidate[] = [];
  for (const page of Object.values(pages)) {
    const title = page.title;
    const info = page.imageinfo?.[0];
    const urlValue = info?.url;
    if (!title || !urlValue) continue;

    const licenseShortName = getMeta(info, 'LicenseShortName') ?? getMeta(info, 'License');
    const licenseUrl = getMeta(info, 'LicenseUrl');
    const artist = getMeta(info, 'Artist');
    const attribution = getMeta(info, 'Attribution');
    const credit = getMeta(info, 'Credit');

    candidates.push({
      title,
      url: urlValue,
      thumbUrl: info?.thumburl,
      descriptionUrl: info?.descriptionurl,
      licenseShortName,
      licenseUrl,
      artist,
      attribution,
      credit,
    });
  }

  return candidates;
}

async function fetchImageBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download image: ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get('content-type') ?? 'application/octet-stream';
  const arrayBuffer = await res.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType };
}

function looksLikeSvg(url: string | undefined): boolean {
  if (!url) return false;
  return url.toLowerCase().includes('.svg');
}

function normalizeContentType(raw: string): string {
  return raw.split(';')[0]?.trim().toLowerCase();
}

function isSupportedImageContentType(contentType: string): boolean {
  return (
    contentType === 'image/jpeg' ||
    contentType === 'image/png' ||
    contentType === 'image/webp' ||
    contentType === 'image/gif'
  );
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

function buildQueriesForBusiness(params: {
  name: string;
  categoryName: string;
  city: string;
  state: string;
  description?: string | null;
}): string[] {
  const { name, categoryName, city, state, description } = params;

  const base = [name, categoryName, `${city} ${state}`].filter(Boolean).join(' ');
  const categoryOnly = categoryName;

  // Keep queries generic to increase hit rate while still relevant.
  const fromDescription = description ? `${categoryName} ${description}` : null;

  return [base, fromDescription, categoryOnly].filter((q): q is string => Boolean(q));
}

async function main(): Promise<void> {
  if (process.env.ALLOW_IMAGE_FETCH !== 'true') {
    throw new Error(
      'Refusing to run: set ALLOW_IMAGE_FETCH=true to fetch internet images and write Photo records.'
    );
  }

  const perBusiness = Number(process.env.DEMO_IMAGES_PER_BUSINESS ?? '5');
  const bucketName = process.env.DEMO_IMAGE_BUCKET ?? 'tarsit-media';
  const dryRun = process.env.DEMO_IMAGE_DRY_RUN === 'true';
  const searchLimit = Math.max(20, Number(process.env.DEMO_IMAGES_SEARCH_LIMIT ?? '60'));
  const maxTitlesPerQuery = Math.max(10, Number(process.env.DEMO_IMAGES_TITLES_PER_QUERY ?? '40'));

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
    const queries = buildQueriesForBusiness({
      name: business.name,
      categoryName: business.category.name,
      city: business.city,
      state: business.state,
      description: business.description,
    });

    console.log(`\n🏪 ${business.name} (${business.city}, ${business.state})`);
    console.log(`Queries: ${queries.join(' | ')}`);

    const picked: CommonsCandidate[] = [];

    for (const query of queries) {
      if (picked.length >= perBusiness) break;

      const titles = await searchCommonsFiles({ query, limit: searchLimit });
      // Be polite to the API
      await sleep(250);

      const candidates = await fetchCommonsCandidates(titles.slice(0, maxTitlesPerQuery));
      await sleep(250);

      for (const c of candidates) {
        if (picked.length >= perBusiness) break;
        if (!c.url) continue;
        if (!isLicenseAllowed(c.licenseShortName)) continue;
        if (picked.some((p) => p.url === c.url)) continue;
        picked.push(c);
      }
    }

    if (picked.length === 0) {
      console.log('⚠️  No open-license images found for this business.');
      continue;
    }

    console.log(`Selected ${picked.length} images.`);
    if (dryRun) {
      picked.forEach((img, idx) => {
        console.log(`  [${idx + 1}] ${img.url}`);
      });
      continue;
    }

    const uploaded: Array<{
      url: string;
      order: number;
      thumbnail?: string;
      caption: string;
      featured: boolean;
    }> = [];

    for (let i = 0; i < picked.length; i += 1) {
      const img = picked[i];

      // Prefer raster downloads (Commons may return SVG originals)
      const primaryUrl = looksLikeSvg(img.url) && img.thumbUrl ? img.thumbUrl : img.url;
      const fallbackUrl = primaryUrl !== img.url ? img.url : img.thumbUrl;

      let downloaded = await fetchImageBuffer(primaryUrl);
      let contentType = normalizeContentType(downloaded.contentType);
      if (contentType === 'image/svg+xml' && fallbackUrl) {
        downloaded = await fetchImageBuffer(fallbackUrl);
        contentType = normalizeContentType(downloaded.contentType);
      }

      if (!isSupportedImageContentType(contentType)) {
        console.log(`⚠️  Skipping unsupported content-type: ${contentType}`);
        continue;
      }

      const { buffer } = downloaded;
      const ext = contentType.includes('png')
        ? 'png'
        : contentType.includes('webp')
          ? 'webp'
          : contentType.includes('gif')
            ? 'gif'
            : 'jpg';

      const objectPath = `demo/businesses/${business.id}/commons/${Date.now()}-${i + 1}.${ext}`;
      const publicUrl = await uploadToSupabase({
        supabase,
        bucket: bucketName,
        objectPath,
        buffer,
        contentType,
      });

      const order = uploaded.length;
      uploaded.push({
        url: publicUrl,
        order,
        thumbnail: img.thumbUrl ?? undefined,
        caption: buildCommonsAttributionCaption(img),
        featured: order === 0,
      });
    }

    if (uploaded.length === 0) {
      console.log('⚠️  No supported images uploaded; leaving existing photos unchanged');
      continue;
    }

    const cover = uploaded.sort((a, b) => a.order - b.order)[0]?.url;

    await prisma.$transaction([
      prisma.photo.deleteMany({ where: { businessId: business.id } }),
      prisma.photo.createMany({
        data: uploaded.map((u) => ({
          businessId: business.id,
          url: u.url,
          thumbnail: u.thumbnail,
          caption: u.caption,
          order: u.order,
          featured: u.featured,
        })),
      }),
      prisma.business.update({
        where: { id: business.id },
        data: { coverImage: cover },
      }),
    ]);

    console.log(`✅ Uploaded ${uploaded.length} images and updated DB`);
  }

  console.log('\nDone.');
}

main()
  .catch((e) => {
    console.error('❌ Fetch failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
