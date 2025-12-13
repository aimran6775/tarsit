import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import * as crypto from 'crypto';

/**
 * API Key Management Service
 * Handles generation, validation, and management of API keys
 */
@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a new API key
   */
  async generateApiKey(userId: string, name: string): Promise<{
    key: string;
    keyId: string;
  }> {
    // Generate a secure API key
    const apiKey = `tarsit_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = this.hashKey(apiKey);

    // Store hashed key in database
    // Note: You'll need to add an ApiKey model to Prisma schema
    // For now, this is a placeholder implementation
    const keyId = crypto.randomUUID();

    // In a real implementation, you would:
    // await this.prisma.apiKey.create({
    //   data: {
    //     id: keyId,
    //     userId,
    //     name,
    //     keyHash,
    //     createdAt: new Date(),
    //     lastUsedAt: null,
    //     expiresAt: null, // or set expiry
    //     active: true,
    //   },
    // });

    return {
      key: apiKey, // Only return plain key once - store hash
      keyId,
    };
  }

  /**
   * Validate an API key
   */
  async validateApiKey(apiKey: string): Promise<{
    valid: boolean;
    userId?: string;
    keyId?: string;
  }> {
    if (!apiKey || !apiKey.startsWith('tarsit_')) {
      return { valid: false };
    }

    const keyHash = this.hashKey(apiKey);

    // In a real implementation, you would:
    // const apiKeyRecord = await this.prisma.apiKey.findFirst({
    //   where: {
    //     keyHash,
    //     active: true,
    //     OR: [
    //       { expiresAt: null },
    //       { expiresAt: { gt: new Date() } },
    //     ],
    //   },
    // });

    // if (!apiKeyRecord) {
    //   return { valid: false };
    // }

    // Update last used timestamp
    // await this.prisma.apiKey.update({
    //   where: { id: apiKeyRecord.id },
    //   data: { lastUsedAt: new Date() },
    // });

    // return {
    //   valid: true,
    //   userId: apiKeyRecord.userId,
    //   keyId: apiKeyRecord.id,
    // };

    // Placeholder return
    return { valid: false };
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(keyId: string, userId: string): Promise<void> {
    // In a real implementation:
    // await this.prisma.apiKey.updateMany({
    //   where: {
    //     id: keyId,
    //     userId, // Ensure user owns the key
    //   },
    //   data: {
    //     active: false,
    //   },
    // });
  }

  /**
   * List API keys for a user
   */
  async listApiKeys(userId: string): Promise<any[]> {
    // In a real implementation:
    // return this.prisma.apiKey.findMany({
    //   where: { userId, active: true },
    //   select: {
    //     id: true,
    //     name: true,
    //     createdAt: true,
    //     lastUsedAt: true,
    //     expiresAt: true,
    //     // Never return the key hash
    //   },
    //   orderBy: { createdAt: 'desc' },
    // });

    return [];
  }

  /**
   * Hash an API key for storage
   */
  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
