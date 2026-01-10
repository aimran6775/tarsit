import {
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecentlyViewedService } from './recently-viewed.service';

@Controller('recently-viewed')
@UseGuards(JwtAuthGuard)
export class RecentlyViewedController {
  constructor(private readonly recentlyViewedService: RecentlyViewedService) {}

  @Get()
  async getRecentlyViewed(@Req() req: any, @Query('limit') limit?: string) {
    return this.recentlyViewedService.getRecentlyViewed(
      req.user.id,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Post(':businessId')
  async recordView(@Param('businessId') businessId: string, @Req() req: any) {
    await this.recentlyViewedService.recordView(req.user.id, businessId);
    return { message: 'View recorded' };
  }

  @Delete()
  async clearHistory(@Req() req: any) {
    await this.recentlyViewedService.clearHistory(req.user.id);
    return { message: 'History cleared' };
  }

  @Delete(':businessId')
  async removeItem(@Param('businessId') businessId: string, @Req() req: any) {
    await this.recentlyViewedService.removeItem(req.user.id, businessId);
    return { message: 'Item removed' };
  }
}
