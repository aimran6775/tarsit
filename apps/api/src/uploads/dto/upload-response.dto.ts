import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ example: 'tarsit/businesses/abc123' })
  publicId: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v1234567890/tarsit/businesses/abc123.jpg' })
  url: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_600,w_800/v1234567890/tarsit/businesses/abc123.jpg' })
  secureUrl: string;

  @ApiProperty({ example: 'jpg' })
  format: string;

  @ApiProperty({ example: 1200 })
  width: number;

  @ApiProperty({ example: 800 })
  height: number;

  @ApiProperty({ example: 245678 })
  bytes: number;
}

export class MultipleUploadResponseDto {
  @ApiProperty({ type: [UploadResponseDto] })
  images: UploadResponseDto[];

  @ApiProperty({ example: 3 })
  count: number;
}
