import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, MaxLength, IsInt, Min, IsEmail } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'cuid123', description: 'Business ID' })
  @IsString()
  businessId: string;

  @ApiProperty({ example: 'cuid456', description: 'Service ID', required: false })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiProperty({
    example: '2025-12-15T14:00:00Z',
    description: 'Appointment date and time',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    example: 60,
    description: 'Duration in minutes (defaults to 60)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({
    example: 'Please call when you arrive',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Customer name (optional, defaults to logged-in user)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerName?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Customer email (optional, defaults to logged-in user)',
  })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Customer phone (optional, defaults to logged-in user)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  customerPhone?: string;
}
