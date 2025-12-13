import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto, MessageQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message in a chat' })
  create(@GetUser('sub') userId: string, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(userId, createMessageDto);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count for current user' })
  getUnreadCount(@GetUser('sub') userId: string) {
    return this.messagesService.getUnreadCount(userId);
  }

  @Get(':chatId')
  @ApiOperation({ summary: 'Get all messages in a chat' })
  findAll(
    @GetUser('sub') userId: string,
    @Param('chatId') chatId: string,
    @Query() query: MessageQueryDto,
  ) {
    return this.messagesService.findAll(userId, chatId, query);
  }

  @Patch(':chatId/mark-as-read')
  @ApiOperation({ summary: 'Mark all messages in a chat as read' })
  markAsRead(@GetUser('sub') userId: string, @Param('chatId') chatId: string) {
    return this.messagesService.markAsRead(userId, chatId);
  }
}
