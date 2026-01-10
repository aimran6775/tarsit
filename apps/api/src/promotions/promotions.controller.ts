import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Request,
    UseGuards
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePromotionDto, UpdatePromotionDto, UsePromotionDto, ValidatePromoCodeDto } from './dto';
import { PromotionsService } from './promotions.service';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post('business/:businessId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new promotion for a business' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 201, description: 'Promotion created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or duplicate code' })
  create(
    @Param('businessId') businessId: string,
    @Body() dto: CreatePromotionDto,
  ) {
    return this.promotionsService.create(businessId, dto);
  }

  @Get('business/:businessId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all promotions for a business' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'List of promotions' })
  findAllByBusiness(@Param('businessId') businessId: string) {
    return this.promotionsService.findAllByBusiness(businessId);
  }

  @Get('business/:businessId/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get promotion statistics for a business' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'Promotion statistics' })
  getStats(@Param('businessId') businessId: string) {
    return this.promotionsService.getStats(businessId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific promotion' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiResponse({ status: 200, description: 'Promotion details' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Put(':id/business/:businessId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a promotion' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiParam({ name: 'businessId', description: 'Business ID (for ownership verification)' })
  @ApiResponse({ status: 200, description: 'Promotion updated successfully' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  update(
    @Param('id') id: string,
    @Param('businessId') businessId: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.promotionsService.update(id, businessId, dto);
  }

  @Delete(':id/business/:businessId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a promotion' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiParam({ name: 'businessId', description: 'Business ID (for ownership verification)' })
  @ApiResponse({ status: 200, description: 'Promotion deleted successfully' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  delete(
    @Param('id') id: string,
    @Param('businessId') businessId: string,
  ) {
    return this.promotionsService.delete(id, businessId);
  }

  @Post('validate/:businessId')
  @ApiOperation({ summary: 'Validate a promo code (public)' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'Validation result' })
  validateCode(
    @Param('businessId') businessId: string,
    @Body() dto: ValidatePromoCodeDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.promotionsService.validateCode(businessId, dto, userId);
  }

  @Post('use/:businessId')
  @ApiOperation({ summary: 'Use a promo code (record usage)' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'Promotion used successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  usePromotion(
    @Param('businessId') businessId: string,
    @Body() dto: UsePromotionDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.promotionsService.usePromotion(businessId, dto, userId);
  }
}
