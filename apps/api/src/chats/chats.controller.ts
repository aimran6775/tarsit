import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { CreateChatDto, ChatQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create or get existing chat with business' })
  create(@GetUser('sub') userId: string, @Body() createChatDto: CreateChatDto) {
    return this.chatsService.create(userId, createChatDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all chats for current user (customer view)' })
  findAll(@GetUser('sub') userId: string, @Query() query: ChatQueryDto) {
    return this.chatsService.findAll(userId, query);
  }

  @Get('business')
  @ApiOperation({
    summary: 'Get all chats for businesses owned by current user (business owner view)',
  })
  findBusinessChats(@GetUser('sub') userId: string, @Query() query: ChatQueryDto) {
    return this.chatsService.findBusinessChats(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single chat by ID' })
  findOne(@GetUser('sub') userId: string, @Param('id') id: string) {
    return this.chatsService.findOne(userId, id);
  }
}
