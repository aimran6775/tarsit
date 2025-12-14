import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreatePhotoDto {
  @ApiProperty({ example: 'cuid123', description: 'Business ID' })
  @IsString()
  businessId: string;

  @ApiProperty({
    example: 'https://storage.example.com/photo.jpg',
    description: 'Photo URL',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    example: 'Interior view of the restaurant',
    description: 'Photo caption',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  caption?: string;

  @ApiProperty({
    example: false,
    description: 'Set as primary photo',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
