import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum, IsUrl } from 'class-validator';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
}

export class CreateMessageDto {
  @ApiProperty({
    description: 'ID of the chat',
    example: 'chat-uuid-here',
  })
  @IsString()
  @IsNotEmpty()
  chatId!: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, I would like to know more about your services.',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
    default: MessageType.TEXT,
    required: false,
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({
    description: 'Array of attachment URLs (for images/files)',
    type: [String],
    required: false,
    example: ['https://example.com/image.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  attachments?: string[];
}
