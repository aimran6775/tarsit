import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';
import {
    CreatePushSubscriptionDto,
    PushSubscriptionResponseDto,
    UnsubscribeDto,
    VapidKeyResponseDto,
} from './dto/push-subscription.dto';
import { PushService } from './push.service';

interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

@ApiTags('push')
@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Get('vapid-key')
  @ApiOperation({ summary: 'Get VAPID public key for push subscription' })
  @ApiResponse({
    status: 200,
    description: 'Returns VAPID public key',
    type: VapidKeyResponseDto,
  })
  getVapidKey(): VapidKeyResponseDto {
    return {
      publicKey: this.pushService.getPublicKey(),
      enabled: this.pushService.isEnabled(),
    };
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to push notifications' })
  @ApiResponse({
    status: 201,
    description: 'Successfully subscribed',
    type: PushSubscriptionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async subscribe(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreatePushSubscriptionDto,
  ): Promise<PushSubscriptionResponseDto> {
    return this.pushService.subscribe(user.userId, {
      endpoint: dto.endpoint,
      keys: {
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
      },
      userAgent: dto.userAgent,
    });
  }

  @Delete('unsubscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unsubscribe from push notifications' })
  @ApiResponse({ status: 204, description: 'Successfully unsubscribed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unsubscribe(
    @CurrentUser() user: JwtUser,
    @Body() dto: UnsubscribeDto,
  ): Promise<void> {
    await this.pushService.unsubscribe(user.userId, dto.endpoint);
  }

  @Delete('unsubscribe-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove all push subscriptions for current user' })
  @ApiResponse({ status: 204, description: 'Successfully unsubscribed all' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unsubscribeAll(@CurrentUser() user: JwtUser): Promise<void> {
    await this.pushService.unsubscribeAll(user.userId);
  }
}
