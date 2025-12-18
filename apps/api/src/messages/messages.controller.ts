import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto, MessageQueryDto } from './dto';
import { MessagesService } from './messages.service';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message in a chat' })
  create(@GetUser('id') userId: string, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(userId, createMessageDto);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count for current user' })
  getUnreadCount(@GetUser('id') userId: string) {
    return this.messagesService.getUnreadCount(userId);
  }

  @Get('single/:id')
  @ApiOperation({ summary: 'Get a single message by ID' })
  findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.messagesService.findOne(userId, id);
  }

  @Get(':chatId')
  @ApiOperation({ summary: 'Get all messages in a chat' })
  findAll(
    @GetUser('id') userId: string,
    @Param('chatId') chatId: string,
    @Query() query: MessageQueryDto
  ) {
    return this.messagesService.findAll(userId, chatId, query);
  }

  @Patch(':chatId/mark-as-read')
  @ApiOperation({ summary: 'Mark all messages in a chat as read' })
  markAsRead(@GetUser('id') userId: string, @Param('chatId') chatId: string) {
    return this.messagesService.markAsRead(userId, chatId);
  }
}
