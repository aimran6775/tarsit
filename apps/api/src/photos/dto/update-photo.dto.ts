import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsNumber, MaxLength, Min } from 'class-validator';

export class UpdatePhotoDto {
  @ApiProperty({
    example: true,
    description: 'Set as featured photo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

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
    example: 0,
    description: 'Display order (lower numbers appear first)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
