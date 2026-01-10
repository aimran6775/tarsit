import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { UserRole } from '@prisma/client';
import { IsStrongPassword } from '../../common/validators/password.validator';

export class SignupDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email!: string;

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
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: '+14155551234', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.CUSTOMER, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
