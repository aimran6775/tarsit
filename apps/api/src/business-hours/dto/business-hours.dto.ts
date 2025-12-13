import {
  IsInt,
  IsString,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  Matches,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BusinessHourDto {
  @ApiProperty({ description: 'Day of week (0 = Sunday, 6 = Saturday)', minimum: 0, maximum: 6 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ description: 'Opening time in HH:MM format', example: '09:00' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'openTime must be in HH:MM format',
  })
  openTime: string;

  @ApiProperty({ description: 'Closing time in HH:MM format', example: '17:00' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'closeTime must be in HH:MM format',
  })
  closeTime: string;

  @ApiPropertyOptional({ description: 'Whether the business is closed on this day' })
  @IsBoolean()
  @IsOptional()
  isClosed?: boolean;
}

export class SetBusinessHoursDto {
  @ApiProperty({ type: [BusinessHourDto], description: 'Array of business hours for each day' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessHourDto)
  hours: BusinessHourDto[];
}

export class UpdateAppointmentSettingsDto {
  @ApiPropertyOptional({ description: 'Enable/disable appointments for this business' })
  @IsBoolean()
  @IsOptional()
  appointmentsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Default appointment duration in minutes', minimum: 15 })
  @IsInt()
  @Min(15)
  @IsOptional()
  appointmentDuration?: number;

  @ApiPropertyOptional({ description: 'Buffer time between appointments in minutes', minimum: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  appointmentBuffer?: number;

  @ApiPropertyOptional({ description: 'How many days in advance customers can book', minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  advanceBookingDays?: number;
}
