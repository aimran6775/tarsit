import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase!: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);
  private readonly bucketName = 'tarsit-media';
  private readonly storageEndpoint: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    // S3 configuration for direct storage access
    this.storageEndpoint =
      this.configService.get<string>('SUPABASE_S3_ENDPOINT') || `${supabaseUrl}/storage/v1/s3`;

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase URL or Key is missing. Supabase features will be disabled.');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      this.logger.log('Supabase client initialized successfully');
    }
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Get the storage endpoint URL
   */
  getStorageEndpoint(): string {
    return this.storageEndpoint;
  }

  /**
   * Upload an image to Supabase Storage with optimized settings
   */
  async uploadImage(file: Express.Multer.File, folder: string = 'tarsit') {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }

    try {
      const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
          cacheControl: '31536000', // 1 year cache for immutable content
        });

      if (error) {
        throw error;
      }

      const {
        data: { publicUrl },
      } = this.supabase.storage.from(this.bucketName).getPublicUrl(fileName);

      return {
        public_id: data.path,
        url: publicUrl,
        secure_url: publicUrl,
        format: file.mimetype.split('/')[1],
        width: 0, // Supabase doesn't return dimensions on upload
        height: 0,
        bytes: file.size,
      };
    } catch (error) {
      this.logger.error(`Failed to upload image: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get an optimized image URL with transformations
   */
  getOptimizedUrl(
    path: string,
    options: { width?: number; height?: number; quality?: number } = {}
  ): string {
    const { width, height, quality = 80 } = options;
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');

    // Build render URL for image transformations
    const baseUrl = `${supabaseUrl}/storage/v1/render/image/public/${this.bucketName}/${path}`;

    const params = new URLSearchParams();
    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    params.set('quality', quality.toString());
    params.set('format', 'webp');
    params.set('resize', 'cover');

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Delete an image from storage
   */
  async deleteImage(path: string) {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { error } = await this.supabase.storage.from(this.bucketName).remove([path]);

    if (error) {
      this.logger.error(`Failed to delete image: ${error.message}`);
      throw error;
    }

    return true;
  }
}
