import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

export class SubscriptionKeysDto {
  @ApiProperty({ description: 'The p256dh key for push encryption' })
  @IsString()
  @IsNotEmpty()
  p256dh!: string;

  @ApiProperty({ description: 'The auth secret for push encryption' })
  @IsString()
  @IsNotEmpty()
  auth!: string;
}

export class CreatePushSubscriptionDto {
  @ApiProperty({ description: 'The push subscription endpoint URL' })
  @IsUrl()
  @IsNotEmpty()
  endpoint!: string;

  @ApiProperty({ description: 'The encryption keys for the subscription' })
  @ValidateNested()
  @Type(() => SubscriptionKeysDto)
  keys!: SubscriptionKeysDto;

  @ApiPropertyOptional({ description: 'The user agent string of the browser' })
  @IsString()
  @IsOptional()
  userAgent?: string;
}

export class UnsubscribeDto {
  @ApiProperty({ description: 'The push subscription endpoint URL to unsubscribe' })
  @IsUrl()
  @IsNotEmpty()
  endpoint!: string;
}

export class PushSubscriptionResponseDto {
  @ApiProperty({ description: 'The subscription ID' })
  id!: string;
}

export class VapidKeyResponseDto {
  @ApiProperty({ description: 'The VAPID public key for client-side subscription' })
  publicKey!: string | null;

  @ApiProperty({ description: 'Whether push notifications are enabled' })
  enabled!: boolean;
}
