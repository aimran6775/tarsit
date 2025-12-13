import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'tarsit',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
          ],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) return reject(error);
          if (result) resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadImages(
    files: Express.Multer.File[],
    folder: string = 'tarsit',
  ): Promise<UploadApiResponse[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  async deleteImages(publicIds: string[]): Promise<any> {
    return cloudinary.api.delete_resources(publicIds);
  }

  // Generate different sizes
  getImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
    } = {},
  ): string {
    const { width = 800, height = 600, crop = 'fill', quality = 'auto' } = options;

    return cloudinary.url(publicId, {
      width,
      height,
      crop,
      quality,
      fetch_format: 'auto',
    });
  }
}
