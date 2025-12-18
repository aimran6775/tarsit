import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload a single image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          description: 'Optional folder name (e.g., "businesses", "profiles")',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File, @Body('folder') folder?: string) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.uploadsService.uploadImage(file, folder || 'tarsit');
  }

  @Post('images')
  @ApiOperation({ summary: 'Upload multiple images (max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        folder: {
          type: 'string',
          description: 'Optional folder name',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder?: string
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    return this.uploadsService.uploadMultipleImages(files, folder || 'tarsit');
  }

  @Delete('image')
  @ApiOperation({ summary: 'Delete an image from storage' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path of the image in storage',
          example: 'tarsit/businesses/abc123.jpg',
        },
      },
    },
  })
  deleteImage(@Body('path') path: string) {
    if (!path) {
      throw new BadRequestException('Path is required');
    }
    return this.uploadsService.deleteImage(path);
  }
}
