import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { SignupBusinessDto } from './dto/signup-business.dto';
import { JwtPayload } from './jwt.strategy';
import { MailService } from '../mail/mail.service';
import { geocodeAddress, geocodeCityState, getDefaultCityCoordinates } from '../utils/geocoding';
import { validatePasswordStrength } from '../common/validators/password.validator';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async signup(dto: SignupDto) {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(dto.password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      });
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          dto.phone ? { phone: dto.phone } : {},
          dto.username ? { username: dto.username } : {},
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email already registered');
      }
      if (dto.phone && existingUser.phone === dto.phone) {
        throw new ConflictException('Phone number already registered');
      }
      if (dto.username && existingUser.username === dto.username) {
        throw new ConflictException('Username already taken');
      }
    }

    // Hash password with increased rounds for better security
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        phone: dto.phone,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        verified: false, // Will be verified via email
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
      },
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 86400000); // 24 hours

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Send verification email
    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        user.firstName,
        verificationToken,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Combined signup for business owners - creates user + business in one transaction
   */
  async signupBusiness(dto: SignupBusinessDto) {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(dto.password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      });
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          dto.phone ? { phone: dto.phone } : {},
          dto.username ? { username: dto.username } : {},
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email already registered');
      }
      if (dto.phone && existingUser.phone === dto.phone) {
        throw new ConflictException('Phone number already registered');
      }
      if (dto.username && existingUser.username === dto.username) {
        throw new ConflictException('Username already taken');
      }
    }

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.business.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Invalid category selected');
    }

    // Geocode address if coordinates not provided
    let latitude = dto.business.latitude;
    let longitude = dto.business.longitude;

    if (latitude === undefined || longitude === undefined) {
      // Try full address first
      const geocoded = await geocodeAddress({
        addressLine1: dto.business.addressLine1,
        addressLine2: dto.business.addressLine2,
        city: dto.business.city,
        state: dto.business.state,
        zipCode: dto.business.zipCode,
        country: dto.business.country || 'USA',
      });

      if (geocoded) {
        latitude = geocoded.latitude;
        longitude = geocoded.longitude;
      } else {
        // Fallback to city/state
        const cityGeocode = await geocodeCityState(dto.business.city, dto.business.state);
        if (cityGeocode) {
          latitude = cityGeocode.latitude;
          longitude = cityGeocode.longitude;
        } else {
          // Last resort: default city coordinates
          const defaults = getDefaultCityCoordinates(dto.business.city);
          if (defaults) {
            latitude = defaults.latitude;
            longitude = defaults.longitude;
          }
        }
      }
    }

    // Generate slug from business name
    const baseSlug = dto.business.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug exists and make unique if needed
    const existingBusiness = await this.prisma.business.findUnique({
      where: { slug: baseSlug },
    });

    const slug = existingBusiness
      ? `${baseSlug}-${Date.now().toString(36)}`
      : baseSlug;

    // Hash password with increased rounds for better security
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user and business in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user with BUSINESS_OWNER role
      const user = await tx.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          phone: dto.phone,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: 'BUSINESS_OWNER',
          verified: false,
        },
      });

      // Create business linked to user
      const business = await tx.business.create({
        data: {
          name: dto.business.name,
          slug,
          description: dto.business.description,
          categoryId: dto.business.categoryId,
          addressLine1: dto.business.addressLine1,
          addressLine2: dto.business.addressLine2,
          city: dto.business.city,
          state: dto.business.state,
          zipCode: dto.business.zipCode,
          country: dto.business.country || 'USA',
          latitude: latitude!,
          longitude: longitude!,
          phone: dto.business.phone,
          email: dto.business.email,
          website: dto.business.website,
          priceRange: dto.business.priceRange || 'MODERATE',
          ownerId: user.id,
          verified: false,
          active: true,
        },
        include: {
          category: true,
        },
      });

      // Generate verification token for email
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 86400000); // 24 hours

      await tx.user.update({
        where: { id: user.id },
        data: {
          verificationToken,
          verificationTokenExpiry,
        },
      });

      return { user, business, verificationToken };
    });

    // Send verification email (outside transaction)
    try {
      await this.mailService.sendVerificationEmail(
        result.user.email,
        result.user.firstName,
        result.verificationToken,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    // Generate tokens
    const tokens = await this.generateTokens(
      result.user.id,
      result.user.email,
      result.user.role,
    );

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        verified: result.user.verified,
      },
      business: {
        id: result.business.id,
        name: result.business.name,
        slug: result.business.slug,
        category: result.business.category,
        city: result.business.city,
        state: result.business.state,
        verified: result.business.verified,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        verified: user.verified,
      },
      ...tokens,
    };
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        active: true,
      },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    try {
      await this.mailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetToken,
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't throw error to prevent email enumeration
    }

    return {
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(dto.newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      });
    }

    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpiry: {
          gte: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password with increased rounds for better security
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return {
      success: true,
      message: 'Password has been reset successfully',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gte: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Update user as verified and clear verification token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return {
        success: true,
        message: 'If the email exists and is not verified, a verification link has been sent',
      };
    }

    if (user.verified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 86400000); // 24 hours

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Send verification email
    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        user.firstName,
        verificationToken,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    return {
      success: true,
      message: 'If the email exists and is not verified, a verification link has been sent',
    };
  }

  async handleOAuthLogin(oauthUser: {
    providerId: string;
    provider: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }) {
    // Check if user exists with this provider
    let user = await this.prisma.user.findFirst({
      where: {
        provider: oauthUser.provider,
        providerId: oauthUser.providerId,
      },
    });

    if (!user) {
      // Check if email already exists (user might have signed up with email/password)
      const existingUser = await this.prisma.user.findUnique({
        where: { email: oauthUser.email },
      });

      if (existingUser) {
        // Link OAuth account to existing user
        user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            provider: oauthUser.provider,
            providerId: oauthUser.providerId,
            avatar: oauthUser.avatar || existingUser.avatar,
            verified: true, // OAuth emails are pre-verified
          },
        });
      } else {
        // Create new user from OAuth
        user = await this.prisma.user.create({
          data: {
            email: oauthUser.email,
            firstName: oauthUser.firstName,
            lastName: oauthUser.lastName,
            avatar: oauthUser.avatar,
            provider: oauthUser.provider,
            providerId: oauthUser.providerId,
            verified: true, // OAuth emails are pre-verified
            passwordHash: null, // No password for OAuth users
          },
        });

        // Send welcome email
        try {
          await this.mailService.sendWelcomeEmail(
            user.email,
            user.firstName,
          );
        } catch (error) {
          console.error('Failed to send welcome email:', error);
        }
      }
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        verified: user.verified,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    dto: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatar?: string;
      username?: string;
    },
  ) {
    // Check if username is being changed and if it's already taken
    if (dto.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          username: dto.username,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new ConflictException('Username already taken');
      }
    }

    // Check if phone is being changed and if it's already taken
    if (dto.phone) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          phone: dto.phone,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new ConflictException('Phone number already registered');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.avatar && { avatar: dto.avatar }),
        ...(dto.username && { username: dto.username }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        verified: true,
      },
    });

    return updatedUser;
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        verified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
