import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'cuid123', description: 'Business ID' })
  @IsString()
  businessId: string;

  @ApiProperty({ example: 'Haircut & Styling', description: 'Service name' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Professional haircut with consultation and styling',
    description: 'Service description',
  })
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiProperty({ example: 45.0, description: 'Service price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 60, description: 'Duration in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;
}
