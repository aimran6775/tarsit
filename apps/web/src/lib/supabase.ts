import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseStorageUrl = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL || supabaseUrl;

// Lazy initialization to avoid build-time errors
let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Missing Supabase environment variables');
      // Return a mock client for build time - will be replaced at runtime
      _supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
        auth: { persistSession: false },
      });
    } else {
      _supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
  }
  return _supabase;
}

// Export as a getter to ensure lazy initialization
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseClient() as any)[prop];
  },
});

// Storage bucket name
export const STORAGE_BUCKET = 'tarsit-media';

/**
 * Get the public URL for a file in Supabase Storage
 */
export function getStorageUrl(path: string): string {
  if (!path) return '';

  // If it's already a full URL, return it
  if (path.startsWith('http')) {
    return path;
  }

  // Build the public URL
  return `${supabaseStorageUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

/**
 * Get an optimized image URL with transformations
 */
export function getOptimizedStorageUrl(
  path: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  if (!path) return '';

  const { width, height, quality = 80 } = options;

  // If it's already a full URL, extract the path
  let filePath = path;
  if (path.startsWith('http')) {
    const match = path.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+?)(?:\?|$)/);
    if (match) {
      filePath = match[1];
    } else {
      return path; // Return original if can't parse
    }
  }

  // Use render endpoint for transformations
  const baseUrl = `${supabaseStorageUrl}/storage/v1/render/image/public/${STORAGE_BUCKET}/${filePath}`;

  const params = new URLSearchParams();
  if (width) params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  params.set('quality', quality.toString());
  params.set('format', 'webp');
  params.set('resize', 'cover');

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadToStorage(
  file: File,
  folder: string = 'uploads'
): Promise<{ url: string; path: string } | null> {
  try {
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: '31536000', // 1 year cache
    });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const url = getStorageUrl(data.path);
    return { url, path: data.path };
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFromStorage(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
}
