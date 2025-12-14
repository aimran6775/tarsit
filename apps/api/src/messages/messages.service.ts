import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto, MessageQueryDto } from './dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateMessageDto) {
    // Verify chat exists and user has access
    const chat = await this.prisma.chat.findUnique({
      where: { id: dto.chatId },
      include: {
        business: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // User must be either the customer or the business owner
    const isCustomer = chat.userId === userId;
    const isBusinessOwner = chat.business.ownerId === userId;

    if (!isCustomer && !isBusinessOwner) {
      throw new ForbiddenException('Not authorized to send messages in this chat');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        type: dto.type || 'TEXT',
        attachments: dto.attachments || [],
        senderType: 'USER', // Default to USER, can be passed in DTO if needed
        sender: {
          connect: { id: userId },
        },
        chat: {
          connect: { id: dto.chatId },
        },
      },
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

    // Update chat's updatedAt timestamp
    await this.prisma.chat.update({
      where: { id: dto.chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async findAll(userId: string, chatId: string, query: MessageQueryDto) {
    // Verify chat exists and user has access
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        business: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isCustomer = chat.userId === userId;
    const isBusinessOwner = chat.business.ownerId === userId;

    if (!isCustomer && !isBusinessOwner) {
      throw new ForbiddenException('Not authorized to view messages in this chat');
    }

    const { page = 1, limit = 50, isRead } = query;
    const skip = (page - 1) * limit;

    const where = {
      chatId,
      ...(isRead !== undefined && { isRead }),
    };

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(userId: string, chatId: string) {
    // Verify chat exists and user has access
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        business: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isCustomer = chat.userId === userId;
    const isBusinessOwner = chat.business.ownerId === userId;

    if (!isCustomer && !isBusinessOwner) {
      throw new ForbiddenException('Not authorized to mark messages as read');
    }

    // Mark all unread messages in this chat (except user's own messages) as read
    const result = await this.prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        read: false,
      },
      data: {
        read: true,
      },
    });

    return {
      success: true,
      messagesMarkedAsRead: result.count,
    };
  }

  async getUnreadCount(userId: string) {
    // Get unread count for customer
    const customerChats = await this.prisma.chat.findMany({
      where: { userId },
      select: { id: true },
    });

    const customerChatIds = customerChats.map((c) => c.id);

    // Get unread count for business owner
    const businesses = await this.prisma.business.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });

    const businessChats = await this.prisma.chat.findMany({
      where: { businessId: { in: businesses.map((b) => b.id) } },
      select: { id: true },
    });

    const businessChatIds = businessChats.map((c) => c.id);

    // Combine both
    const allChatIds = [...customerChatIds, ...businessChatIds];

    const unreadCount = await this.prisma.message.count({
      where: {
        chatId: { in: allChatIds },
        senderId: { not: userId },
        read: false,
      },
    });

    return { unreadCount };
  }
}
