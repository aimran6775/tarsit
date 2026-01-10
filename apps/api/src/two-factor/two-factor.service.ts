import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { LoggerService } from '../common/services/logger.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TwoFactorService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly encryptionKey: Buffer;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private logger: LoggerService,
  ) {
    // Use JWT secret or a dedicated 2FA key
    const key =
      this.config.get<string>('TWO_FACTOR_SECRET') ||
      this.config.get<string>('JWT_SECRET') ||
      'default-secret-key-for-development';
    this.encryptionKey = crypto.scryptSync(key, 'salt', 32);
  }

  async setup(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    // Check if already set up
    const existing = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (existing?.enabled) {
      throw new BadRequestException('Two-factor authentication is already enabled');
    }

    // Generate secret (Base32 encoded for TOTP compatibility)
    const secret = this.generateSecret();
    const encryptedSecret = this.encrypt(secret);

    // Get user email for QR code
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    // Upsert the 2FA record
    await this.prisma.twoFactorAuth.upsert({
      where: { userId },
      update: {
        secret: encryptedSecret,
        enabled: false,
        backupCodes: [],
      },
      create: {
        userId,
        secret: encryptedSecret,
        enabled: false,
        backupCodes: [],
      },
    });

    // Generate QR code URL (otpauth format)
    const issuer = this.config.get<string>('APP_NAME') || 'Tarsit';
    const qrCodeUrl = `otpauth://totp/${issuer}:${user?.email}?secret=${secret}&issuer=${issuer}`;

    this.logger.logSecurityEvent('2fa_setup_initiated', { userId });

    return { secret, qrCodeUrl };
  }

  async enable(
    userId: string,
    code: string,
  ): Promise<{ backupCodes: string[] }> {
    const twoFactor = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactor) {
      throw new BadRequestException('Please set up two-factor authentication first');
    }

    if (twoFactor.enabled) {
      throw new BadRequestException('Two-factor authentication is already enabled');
    }

    // Verify the code
    const secret = this.decrypt(twoFactor.secret);
    const isValid = this.verifyTOTP(secret, code);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    const encryptedBackupCodes = backupCodes.map((c) => this.encrypt(c));

    await this.prisma.twoFactorAuth.update({
      where: { userId },
      data: {
        enabled: true,
        backupCodes: encryptedBackupCodes,
      },
    });

    this.logger.logSecurityEvent('2fa_enabled', { userId });

    return { backupCodes };
  }

  async verify(userId: string, code: string, isBackupCode = false): Promise<boolean> {
    const twoFactor = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactor || !twoFactor.enabled) {
      return true; // 2FA not enabled, skip verification
    }

    if (isBackupCode) {
      // Check backup codes
      const backupCodes = twoFactor.backupCodes.map((c) => this.decrypt(c));
      const codeIndex = backupCodes.findIndex((c) => c === code);

      if (codeIndex === -1) {
        this.logger.logSecurityEvent('2fa_backup_code_failed', { userId });
        throw new UnauthorizedException('Invalid backup code');
      }

      // Remove used backup code
      const updatedCodes = [...twoFactor.backupCodes];
      updatedCodes.splice(codeIndex, 1);

      await this.prisma.twoFactorAuth.update({
        where: { userId },
        data: {
          backupCodes: updatedCodes,
          lastUsedAt: new Date(),
        },
      });

      this.logger.logSecurityEvent('2fa_backup_code_used', {
        userId,
        remainingCodes: updatedCodes.length,
      });

      return true;
    }

    // Verify TOTP
    const secret = this.decrypt(twoFactor.secret);
    const isValid = this.verifyTOTP(secret, code);

    if (!isValid) {
      this.logger.logSecurityEvent('2fa_verification_failed', { userId });
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.prisma.twoFactorAuth.update({
      where: { userId },
      data: { lastUsedAt: new Date() },
    });

    this.logger.logSecurityEvent('2fa_verified', { userId });
    return true;
  }

  async disable(userId: string, code: string): Promise<void> {
    const twoFactor = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactor || !twoFactor.enabled) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    // Verify the code first
    const secret = this.decrypt(twoFactor.secret);
    const isValid = this.verifyTOTP(secret, code);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.twoFactorAuth.delete({
      where: { userId },
    });

    this.logger.logSecurityEvent('2fa_disabled', { userId });
  }

  async getStatus(userId: string): Promise<{ enabled: boolean; backupCodesRemaining: number }> {
    const twoFactor = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    return {
      enabled: twoFactor?.enabled || false,
      backupCodesRemaining: twoFactor?.backupCodes.length || 0,
    };
  }

  async regenerateBackupCodes(userId: string, code: string): Promise<{ backupCodes: string[] }> {
    const twoFactor = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactor || !twoFactor.enabled) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    // Verify current code
    const secret = this.decrypt(twoFactor.secret);
    const isValid = this.verifyTOTP(secret, code);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    const backupCodes = this.generateBackupCodes();
    const encryptedBackupCodes = backupCodes.map((c) => this.encrypt(c));

    await this.prisma.twoFactorAuth.update({
      where: { userId },
      data: { backupCodes: encryptedBackupCodes },
    });

    this.logger.logSecurityEvent('2fa_backup_codes_regenerated', { userId });

    return { backupCodes };
  }

  // Helper methods
  private generateSecret(): string {
    const buffer = crypto.randomBytes(20);
    return this.base32Encode(buffer);
  }

  private generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () => {
      return crypto.randomBytes(4).toString('hex').toUpperCase();
    });
  }

  private verifyTOTP(secret: string, code: string): boolean {
    const time = Math.floor(Date.now() / 30000);
    // Check current and adjacent time windows for clock drift
    for (let i = -1; i <= 1; i++) {
      const expectedCode = this.generateTOTP(secret, time + i);
      if (expectedCode === code) {
        return true;
      }
    }
    return false;
  }

  private generateTOTP(secret: string, counter: number): string {
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(counter));

    const decodedSecret = this.base32Decode(secret);
    const hmac = crypto.createHmac('sha1', decodedSecret);
    hmac.update(buffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0f;
    const code =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    return (code % 1000000).toString().padStart(6, '0');
  }

  private base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let bits = 0;
    let value = 0;

    for (const byte of buffer) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        result += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      result += alphabet[(value << (5 - bits)) & 31];
    }

    return result;
  }

  private base32Decode(encoded: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const result: number[] = [];
    let bits = 0;
    let value = 0;

    for (const char of encoded.toUpperCase()) {
      const index = alphabet.indexOf(char);
      if (index === -1) continue;

      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        result.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(result);
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  private decrypt(text: string): string {
    const [ivHex, authTagHex, encrypted] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
