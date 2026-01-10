import * as crypto from 'crypto';

/**
 * Session Management Utilities
 * Provides secure session token generation and validation
 */
export class SessionUtil {
  /**
   * Generate a secure session token
   */
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a CSRF token
   */
  static generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash a token for storage (one-way hash)
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verify a token against its hash
   */
  static verifyToken(token: string, hash: string): boolean {
    const tokenHash = this.hashToken(token);
    return crypto.timingSafeEqual(
      Buffer.from(tokenHash),
      Buffer.from(hash),
    );
  }

  /**
   * Generate a secure random string
   */
  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Create a time-based token with expiry
   */
  static createTimeBasedToken(ttlSeconds: number = 3600): {
    token: string;
    expiresAt: Date;
  } {
    return {
      token: this.generateSessionToken(),
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    };
  }
}
