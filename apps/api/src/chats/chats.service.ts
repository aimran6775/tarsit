import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto, ChatQueryDto } from './dto';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateChatDto) {
    // Verify business exists
    const business = await this.prisma.business.findUnique({
      where: { id: dto.businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Check if chat already exists between this user and business
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        userId,
        businessId: dto.businessId,
      },
    });

    if (existingChat) {
      // Return existing chat instead of error
      return this.findOne(userId, existingChat.id);
    }

    return this.prisma.chat.create({
      data: {
        user: {
          connect: { id: userId },
        },
        business: {
          connect: { id: dto.businessId },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, query: ChatQueryDto) {
    const { businessId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(businessId && { businessId }),
    };

    const [chats, total] = await Promise.all([
      this.prisma.chat.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              phone: true,
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              read: true,
              createdAt: true,
              senderId: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      }),
      this.prisma.chat.count({ where }),
    ]);

    return {
      chats: chats.map((chat) => ({
        ...chat,
        lastMessage: chat.messages[0] || null,
        messages: undefined, // Remove the array, keep only lastMessage
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // User must be either the customer or the business owner
    const isCustomer = chat.userId === userId;
    const isBusinessOwner = chat.business.owner.id === userId;

    if (!isCustomer && !isBusinessOwner) {
      throw new ForbiddenException('Not authorized to view this chat');
    }

    return chat;
  }

  async findBusinessChats(userId: string, query: ChatQueryDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Find businesses owned by this user
    const businesses = await this.prisma.business.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });

    if (businesses.length === 0) {
      return {
        chats: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    const businessIds = businesses.map((b) => b.id);

    const where = {
      businessId: { in: businessIds },
    };

    const [chats, total] = await Promise.all([
      this.prisma.chat.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              read: true,
              createdAt: true,
              senderId: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      }),
      this.prisma.chat.count({ where }),
    ]);

    return {
      chats: chats.map((chat) => ({
        ...chat,
        lastMessage: chat.messages[0] || null,
        messages: undefined,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateLastMessage(
    chatId: string,
    content: string,
    senderId: string,
  ) {
    // Get unread count (messages sent by other party)
    const unreadCount = await this.prisma.message.count({
      where: {
        chatId,
        senderId: { not: senderId },
        read: false,
      },
    });

    return this.prisma.chat.update({
      where: { id: chatId },
      data: {
        lastMessage: content.substring(0, 100), // Truncate long messages
        lastMessageAt: new Date(),
        unreadCount,
      },
    });
  }
}
