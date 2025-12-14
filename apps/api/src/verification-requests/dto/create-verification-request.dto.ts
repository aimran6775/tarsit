import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVerificationRequestDto {
  @ApiProperty({
    description: 'The ID of the business to verify',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({
    description: 'Supporting documents or information for verification',
    example: 'Business license number: BL123456, Tax ID: TX789012',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'URLs to uploaded verification documents (business license, tax documents, etc.)',
    example: ['https://cloudinary.com/doc1.pdf', 'https://cloudinary.com/doc2.pdf'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documents?: string[];
}
