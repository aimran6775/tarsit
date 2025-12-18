import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({ example: 'cuid123', description: 'Business ID to chat with' })
  @IsString()
  businessId!: string;
}
