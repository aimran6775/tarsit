import {
  Injectable,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UploadsService {
  constructor(private cloudinaryService: CloudinaryService) {}

  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  async uploadImage(file: Express.Multer.File, folder: string = 'tarsit') {
    this.validateFile(file);

    try {
      const result = await this.cloudinaryService.uploadImage(file, folder);

      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'tarsit',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 files allowed per upload');
    }

    // Validate all files
    files.forEach((file) => this.validateFile(file));

    try {
      const results = await this.cloudinaryService.uploadImages(files, folder);

      const images = results.map((result) => ({
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      }));

      return {
        images,
        count: images.length,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload images: ${error.message}`);
    }
  }

  async deleteImage(publicId: string) {
    try {
      await this.cloudinaryService.deleteImage(publicId);
      return { success: true, message: 'Image deleted successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to delete image: ${error.message}`);
    }
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new PayloadTooLargeException(
        `File too large. Maximum size: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }
  }
}
