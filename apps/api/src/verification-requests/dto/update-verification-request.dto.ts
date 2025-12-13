import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateVerificationRequestDto {
  @ApiProperty({
    description: 'Status of the verification request',
    enum: VerificationStatus,
    example: VerificationStatus.APPROVED,
    required: false,
  })
  @IsEnum(VerificationStatus)
  @IsOptional()
  status?: VerificationStatus;

  @ApiProperty({
    description: 'Admin notes or rejection reason',
    example: 'Approved: All documents verified',
    required: false,
  })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}
