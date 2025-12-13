import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { ChatsService } from '../chats/chats.service';
import { PrismaService } from '../prisma/prisma.service';
import { MessageType } from './dto/create-message.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private typingUsers: Map<string, Set<string>> = new Map(); // chatId -> Set of userIds

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private messagesService: MessagesService,
    private chatsService: ChatsService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth or query
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token?.toString() ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn('Connection attempt without token');
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Attach user info to socket
      client.userId = payload.sub;
      client.userRole = payload.role;

      // Join user's personal room
      client.join(`user:${client.userId}`);

      this.logger.log(`User ${client.userId} connected to messages gateway`);
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Remove user from all typing indicators
      this.typingUsers.forEach((users, chatId) => {
        users.delete(client.userId!);
        if (users.size === 0) {
          this.typingUsers.delete(chatId);
        } else {
          // Notify others that user stopped typing
          this.server.to(`chat:${chatId}`).emit('user-stopped-typing', {
            userId: client.userId,
            chatId,
          });
        }
      });

      this.logger.log(`User ${client.userId} disconnected from messages gateway`);
    }
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      // Verify user has access to this chat
      const chat = await this.chatsService.findOne(client.userId, data.chatId);
      
      // Join the chat room
      client.join(`chat:${data.chatId}`);
      
      this.logger.log(`User ${client.userId} joined chat ${data.chatId}`);
      
      return { success: true, chatId: data.chatId };
    } catch (error) {
      this.logger.error(`Failed to join chat: ${error.message}`);
      return { error: 'Failed to join chat' };
    }
  }

  @SubscribeMessage('leave-chat')
  async handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    if (!client.userId) return;

    client.leave(`chat:${data.chatId}`);
    
    // Remove from typing indicators
    const typingUsers = this.typingUsers.get(data.chatId);
    if (typingUsers) {
      typingUsers.delete(client.userId);
      if (typingUsers.size === 0) {
        this.typingUsers.delete(data.chatId);
      }
    }

    this.logger.log(`User ${client.userId} left chat ${data.chatId}`);
    return { success: true };
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; content: string; type?: string; attachments?: string[] },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      // Create message in database
      const message = await this.messagesService.create(client.userId, {
        chatId: data.chatId,
        content: data.content,
        type: (data.type as MessageType) || MessageType.TEXT,
        attachments: data.attachments || [],
      });

      // Get full message with sender info
      const fullMessage = await this.prisma.message.findUnique({
        where: { id: message.id },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      // Update chat's last message
      await this.chatsService.updateLastMessage(
        data.chatId,
        data.content,
        client.userId,
      );

      // Emit to all users in the chat room
      this.server.to(`chat:${data.chatId}`).emit('new-message', fullMessage);

      // Notify recipient if they're not in the chat room
      const chat = await this.prisma.chat.findUnique({
        where: { id: data.chatId },
        include: {
          user: { select: { id: true } },
          business: { select: { ownerId: true } },
        },
      });

      if (chat) {
        const recipientId =
          client.userId === chat.userId ? chat.business.ownerId : chat.userId;
        
        // Send notification to recipient's personal room
        this.server.to(`user:${recipientId}`).emit('message-notification', {
          chatId: data.chatId,
          message: fullMessage,
        });
      }

      // Remove user from typing indicators
      const typingUsers = this.typingUsers.get(data.chatId);
      if (typingUsers) {
        typingUsers.delete(client.userId);
        if (typingUsers.size === 0) {
          this.typingUsers.delete(data.chatId);
        }
        // Notify others that user stopped typing
        this.server.to(`chat:${data.chatId}`).emit('user-stopped-typing', {
          userId: client.userId,
          chatId: data.chatId,
        });
      }

      return { success: true, message: fullMessage };
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`);
      return { error: error.message || 'Failed to send message' };
    }
  }

  @SubscribeMessage('typing-start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    if (!client.userId) return;

    const typingUsers = this.typingUsers.get(data.chatId) || new Set();
    typingUsers.add(client.userId);
    this.typingUsers.set(data.chatId, typingUsers);

    // Notify others in the chat (except sender)
    client.to(`chat:${data.chatId}`).emit('user-typing', {
      userId: client.userId,
      chatId: data.chatId,
    });
  }

  @SubscribeMessage('typing-stop')
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    if (!client.userId) return;

    const typingUsers = this.typingUsers.get(data.chatId);
    if (typingUsers) {
      typingUsers.delete(client.userId);
      if (typingUsers.size === 0) {
        this.typingUsers.delete(data.chatId);
      }
    }

    // Notify others
    this.server.to(`chat:${data.chatId}`).emit('user-stopped-typing', {
      userId: client.userId,
      chatId: data.chatId,
    });
  }

  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    if (!client.userId) return;

    try {
      await this.messagesService.markAsRead(client.userId, data.chatId);

      // Notify sender that messages were read
      this.server.to(`chat:${data.chatId}`).emit('messages-read', {
        chatId: data.chatId,
        readBy: client.userId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to mark messages as read: ${error.message}`);
      return { error: error.message };
    }
  }
}
