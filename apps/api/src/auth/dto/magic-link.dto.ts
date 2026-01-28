import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RequestMagicLinkDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ 
    example: 'https://tarsit.com', 
    required: false,
    description: 'URL to redirect after magic link authentication'
  })
  @IsOptional()
  @IsString()
  redirectUrl?: string;
}

export class VerifyMagicLinkDto {
  @ApiProperty({ example: 'abc123def456' })
  @IsString()
  token!: string;
}
