import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class UpdateAppointmentDto {
  @ApiPropertyOptional({
    enum: AppointmentStatus,
    description: 'Appointment status',
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    example: 'Confirmed for 2:00 PM',
    description: 'Update notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
