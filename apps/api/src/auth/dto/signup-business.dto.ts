import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsEnum,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsStrongPassword } from '../../common/validators/password.validator';

class BusinessDataDto {
  @ApiProperty({ example: 'QuickFix Phone Repair' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Professional iPhone and Android repair services' })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 'category-uuid-here' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: '123 Market Street' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty({ example: 'Suite 100', required: false })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'San Francisco' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'CA' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(2)
  state: string;

  @ApiProperty({ example: '94102' })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({ example: 'USA', default: 'USA' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: '+14155551234' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'contact@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'https://example.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ enum: ['BUDGET', 'MODERATE', 'EXPENSIVE'], example: 'MODERATE', default: 'MODERATE' })
  @IsOptional()
  @IsEnum(['BUDGET', 'MODERATE', 'EXPENSIVE'])
  priceRange?: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';

  // Latitude and longitude are optional - will be geocoded if not provided
  @ApiProperty({ example: 37.7749, description: 'Latitude (optional - will be geocoded)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({ example: -122.4194, description: 'Longitude (optional - will be geocoded)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}

export class SignupBusinessDto {
  // User account fields
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'johndoe', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @Matches(/^[a-z0-9_]+$/, { message: 'Username can only contain lowercase letters, numbers, and underscores' })
  username?: string;

  @ApiProperty({ 
    example: 'SecurePass123!', 
    minLength: 8,
    description: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  })
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+14155551234', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  // Business fields
  @ApiProperty({ type: BusinessDataDto })
  @ValidateNested()
  @Type(() => BusinessDataDto)
  business: BusinessDataDto;
}
