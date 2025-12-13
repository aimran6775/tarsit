import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';
import { ChatsService } from '../chats/chats.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

interface OnlineUser {
  userId: string;
  socketId: string;
  connectedAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');
  private onlineUsers = new Map<string, OnlineUser>();

  constructor(
    private messagesService: MessagesService,
    private chatsService: ChatsService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove user from online users
    for (const [userId, user] of this.onlineUsers.entries()) {
      if (user.socketId === client.id) {
        this.onlineUsers.delete(userId);
        this.server.emit('user:offline', { userId });
        break;
      }
    }
  }

  @SubscribeMessage('user:online')
  async handleUserOnline(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.onlineUsers.set(data.userId, {
      userId: data.userId,
      socketId: client.id,
      connectedAt: new Date(),
    });

    this.server.emit('user:online', {
      userId: data.userId,
      timestamp: new Date(),
    });

    return { success: true, userId: data.userId };
  }

  @SubscribeMessage('join:chat')
  async handleJoinChat(
    @MessageBody() data: { chatId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`chat:${data.chatId}`);
    
    this.logger.log(`User ${data.userId} joined chat ${data.chatId}`);
    
    return { success: true, chatId: data.chatId };
  }

  @SubscribeMessage('leave:chat')
  async handleLeaveChat(
    @MessageBody() data: { chatId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`chat:${data.chatId}`);
    
    this.logger.log(`User ${data.userId} left chat ${data.chatId}`);
    
    return { success: true, chatId: data.chatId };
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @MessageBody()
    data: {
      chatId: string;
      userId: string;
      content: string;
    },
  ) {
    try {
      // Create message in database using existing service
      const message = await this.messagesService.create(data.userId, {
        chatId: data.chatId,
        content: data.content,
      });

      // Update chat last message
      await this.chatsService.updateLastMessage(
        data.chatId,
        data.content,
        data.userId,
      );

      // Emit to all users in the chat room
      this.server.to(`chat:${data.chatId}`).emit('message:receive', {
        message,
        chatId: data.chatId,
      });

      return { success: true, message };
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @MessageBody() data: { chatId: string; userId: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast to others in the chat room (except sender)
    client.to(`chat:${data.chatId}`).emit('typing:start', {
      chatId: data.chatId,
      userId: data.userId,
      userName: data.userName,
    });

    return { success: true };
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @MessageBody() data: { chatId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast to others in the chat room (except sender)
    client.to(`chat:${data.chatId}`).emit('typing:stop', {
      chatId: data.chatId,
      userId: data.userId,
    });

    return { success: true };
  }

  @SubscribeMessage('message:read')
  async handleMessageRead(
    @MessageBody() data: { chatId: string; userId: string },
  ) {
    try {
      const result = await this.messagesService.markAsRead(data.userId, data.chatId);

      // Notify the sender that their messages were read
      this.server.to(`chat:${data.chatId}`).emit('message:read', {
        chatId: data.chatId,
        userId: data.userId,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to mark messages as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Get online users
  @SubscribeMessage('users:online')
  handleGetOnlineUsers() {
    const onlineUserIds = Array.from(this.onlineUsers.keys());
    return { success: true, users: onlineUserIds };
  }

  // Check if specific user is online
  @SubscribeMessage('user:check-status')
  handleCheckUserStatus(@MessageBody() data: { userId: string }) {
    const isOnline = this.onlineUsers.has(data.userId);
    return { success: true, userId: data.userId, isOnline };
  }

  // Send notification to specific user
  async sendNotificationToUser(userId: string, notification: Record<string, unknown>) {
    const user = this.onlineUsers.get(userId);
    if (user) {
      this.server.to(user.socketId).emit('notification:receive', notification);
    }
  }

  // Send message to specific chat (for external triggers like admin messages)
  async sendMessageToChat(chatId: string, message: Record<string, unknown>) {
    this.server.to(`chat:${chatId}`).emit('message:receive', {
      message,
      chatId,
    });
  }
}
