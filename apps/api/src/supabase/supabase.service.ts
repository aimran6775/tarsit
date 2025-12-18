import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase!: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);
  private readonly bucketName = 'tarsit-media';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase URL or Key is missing. Supabase features will be disabled.');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

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
