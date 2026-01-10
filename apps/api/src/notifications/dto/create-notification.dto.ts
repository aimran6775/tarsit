import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, MaxLength } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ example: 'cuid123', description: 'User ID to notify' })
  @IsString()
  userId!: string;

  @ApiProperty({ enum: NotificationType, description: 'Notification type' })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({ example: 'Your appointment has been confirmed', description: 'Title' })
  @IsString()
  @MaxLength(100)
  title!: string;

  @ApiProperty({
    example: 'Your appointment at ABC Business is confirmed for Dec 15 at 2:00 PM',
    description: 'Message',
  })
  @IsString()
  @MaxLength(500)
  message!: string;
}
