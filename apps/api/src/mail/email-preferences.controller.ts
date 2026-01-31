/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMAIL PREFERENCES CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Public endpoints for managing email preferences and unsubscribe.
 * No authentication required for unsubscribe links.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailCategory, EmailPreferencesService } from './email-preferences.service';

// ============================================================================
// DTOs
// ============================================================================

class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  promotionalEmails?: boolean;

  @IsOptional()
  @IsBoolean()
  weeklyDigest?: boolean;

  @IsOptional()
  @IsBoolean()
  appointmentReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  appointmentUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  reviewNotifications?: boolean;
}

class UnsubscribeDto {
  @IsString()
  token!: string;

  @IsOptional()
  @IsString()
  category?: EmailCategory;
}

class ResubscribeDto {
  @IsString()
  token!: string;

  @IsOptional()
  @IsString({ each: true })
  categories?: EmailCategory[];
}

// ============================================================================
// CONTROLLER
// ============================================================================

@ApiTags('Email Preferences')
@Controller('email-preferences')
export class EmailPreferencesController {
  constructor(private readonly preferencesService: EmailPreferencesService) {}

  // ==========================================================================
  // PUBLIC ENDPOINTS (No Auth Required)
  // ==========================================================================

  @Get('unsubscribe')
  @ApiOperation({ summary: 'Get preferences for unsubscribe page' })
  @ApiQuery({ name: 'token', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Preferences retrieved' })
  @ApiResponse({ status: 404, description: 'Invalid token' })
  async getUnsubscribePreferences(@Query('token') token: string) {
    const preferences = await this.preferencesService.getPreferencesByToken(token);

    if (!preferences) {
      return { error: 'Invalid or expired unsubscribe link' };
    }

    // Return masked email and preferences (don't expose full email)
    const maskedEmail = this.maskEmail(preferences.email);

    return {
      email: maskedEmail,
      preferences: {
        promotionalEmails: preferences.promotionalEmails,
        weeklyDigest: preferences.weeklyDigest,
        appointmentReminders: preferences.appointmentReminders,
        appointmentUpdates: preferences.appointmentUpdates,
        reviewNotifications: preferences.reviewNotifications,
        unsubscribedAll: preferences.unsubscribedAll,
      },
    };
  }

  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe from emails' })
  @ApiResponse({ status: 200, description: 'Successfully unsubscribed' })
  async unsubscribe(@Body() dto: UnsubscribeDto) {
    try {
      if (dto.category) {
        await this.preferencesService.unsubscribeFromCategory(dto.token, dto.category);
        return {
          success: true,
          message: `You have been unsubscribed from ${dto.category.replace('-', ' ')} emails.`,
        };
      } else {
        await this.preferencesService.unsubscribeAll(dto.token);
        return {
          success: true,
          message: 'You have been unsubscribed from all marketing emails. You will still receive important account and security notifications.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Invalid or expired unsubscribe link. Please contact support if you need assistance.',
      };
    }
  }

  @Post('resubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Re-subscribe to emails' })
  @ApiResponse({ status: 200, description: 'Successfully resubscribed' })
  async resubscribe(@Body() dto: ResubscribeDto) {
    try {
      await this.preferencesService.resubscribe(dto.token, dto.categories);
      return {
        success: true,
        message: 'Your email preferences have been updated.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Unable to update preferences. Please try again or contact support.',
      };
    }
  }

  @Put('update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update email preferences via token' })
  @ApiQuery({ name: 'token', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Preferences updated' })
  async updatePreferencesWithToken(
    @Query('token') token: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    try {
      const updated = await this.preferencesService.updatePreferences({ token }, dto);
      return {
        success: true,
        message: 'Your email preferences have been saved.',
        preferences: {
          promotionalEmails: updated.promotionalEmails,
          weeklyDigest: updated.weeklyDigest,
          appointmentReminders: updated.appointmentReminders,
          appointmentUpdates: updated.appointmentUpdates,
          reviewNotifications: updated.reviewNotifications,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Unable to update preferences.',
      };
    }
  }

  // ==========================================================================
  // AUTHENTICATED ENDPOINTS
  // ==========================================================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user email preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved' })
  async getMyPreferences(@CurrentUser() user: { id: string; email: string }) {
    const preferences = await this.preferencesService.getOrCreatePreferences(
      user.email,
      user.id,
    );

    return {
      email: user.email,
      preferences: {
        promotionalEmails: preferences.promotionalEmails,
        weeklyDigest: preferences.weeklyDigest,
        appointmentReminders: preferences.appointmentReminders,
        appointmentUpdates: preferences.appointmentUpdates,
        reviewNotifications: preferences.reviewNotifications,
        unsubscribedAll: preferences.unsubscribedAll,
      },
    };
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user email preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated' })
  async updateMyPreferences(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdatePreferencesDto,
  ) {
    const updated = await this.preferencesService.updatePreferences(
      { userId: user.id },
      dto,
    );

    return {
      success: true,
      message: 'Email preferences saved',
      preferences: {
        promotionalEmails: updated.promotionalEmails,
        weeklyDigest: updated.weeklyDigest,
        appointmentReminders: updated.appointmentReminders,
        appointmentUpdates: updated.appointmentUpdates,
        reviewNotifications: updated.reviewNotifications,
      },
    };
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local.length <= 2) {
      return `${local[0]}***@${domain}`;
    }
    return `${local[0]}${local[1]}***${local[local.length - 1]}@${domain}`;
  }
}
