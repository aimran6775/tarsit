import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { RegionListResponseDto, RegionWithBusinessCountDto } from './dto/region.dto';
import { RegionsService } from './regions.service';

@ApiTags('Regions')
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get(':code/featured')
  @ApiOperation({ summary: 'Get featured businesses for a region' })
  @ApiParam({ name: 'code', description: 'Region code (e.g., AE, US, GB)', example: 'AE' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of businesses to return', example: 6 })
  @ApiResponse({
    status: 200,
    description: 'Featured businesses in the region',
  })
  async getFeaturedBusinesses(
    @Param('code') code: string,
    @Query('limit') limit?: number,
  ) {
    return this.regionsService.getFeaturedBusinesses(code, limit || 6);
  }

  @Get(':code/popular-categories')
  @ApiOperation({ summary: 'Get popular categories for a region' })
  @ApiParam({ name: 'code', description: 'Region code', example: 'AE' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of categories to return', example: 8 })
  @ApiResponse({
    status: 200,
    description: 'Popular categories in the region with business counts',
  })
  async getPopularCategories(
    @Param('code') code: string,
    @Query('limit') limit?: number,
  ) {
    return this.regionsService.getPopularCategories(code, limit || 8);
  }

  @Get(':code/stats')
  @ApiOperation({ summary: 'Get regional statistics' })
  @ApiParam({ name: 'code', description: 'Region code', example: 'AE' })
  @ApiResponse({
    status: 200,
    description: 'Statistics for the region',
  })
  async getRegionStats(@Param('code') code: string) {
    return this.regionsService.getRegionStats(code);
  }

  @Get(':code/recent')
  @ApiOperation({ summary: 'Get recently added businesses in a region' })
  @ApiParam({ name: 'code', description: 'Region code', example: 'AE' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of businesses to return', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Recently added businesses in the region',
  })
  async getRecentBusinesses(
    @Param('code') code: string,
    @Query('limit') limit?: number,
  ) {
    return this.regionsService.getRecentBusinesses(code, limit || 10);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active regions' })
  @ApiResponse({
    status: 200,
    description: 'List of all active regions with their currencies',
    type: RegionListResponseDto,
  })
  async findAll() {
    return this.regionsService.findAll();
  }

  @Get('with-counts')
  @ApiOperation({ summary: 'Get all regions with business counts' })
  @ApiResponse({
    status: 200,
    description: 'List of regions with number of businesses in each',
    type: [RegionWithBusinessCountDto],
  })
  async findAllWithCounts() {
    return this.regionsService.findAllWithBusinessCounts();
  }

  @Get('detect')
  @ApiOperation({ summary: 'Detect region from IP address' })
  @ApiResponse({
    status: 200,
    description: 'Detected region code based on IP',
    schema: {
      type: 'object',
      properties: {
        regionCode: { type: 'string', example: 'AE' },
        region: { $ref: '#/components/schemas/RegionDto' },
      },
    },
  })
  async detectRegion(@Req() request: Request) {
    // Get IP from various headers (for proxies/load balancers)
    const ip =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      '127.0.0.1';

    const regionCode = await this.regionsService.detectRegionFromIP(ip);
    const region = await this.regionsService.findByCode(regionCode);

    return {
      regionCode,
      detectedIP: ip,
      region,
    };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get a region by code' })
  @ApiParam({ name: 'code', description: 'Region code (e.g., AE, US, GB)', example: 'AE' })
  @ApiResponse({
    status: 200,
    description: 'Region details with currency and business count',
    type: RegionWithBusinessCountDto,
  })
  @ApiResponse({ status: 404, description: 'Region not found' })
  async findByCode(@Param('code') code: string) {
    return this.regionsService.findByCode(code);
  }

  @Get(':code/languages')
  @ApiOperation({ summary: 'Get supported languages for a region' })
  @ApiParam({ name: 'code', description: 'Region code', example: 'AE' })
  @ApiResponse({
    status: 200,
    description: 'List of supported languages for the region',
    schema: {
      type: 'object',
      properties: {
        regionCode: { type: 'string', example: 'AE' },
        regionName: { type: 'string', example: 'United Arab Emirates' },
        defaultLanguage: { type: 'string', example: 'en' },
        languages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'ar' },
              name: { type: 'string', example: 'Arabic' },
              nativeName: { type: 'string', example: 'العربية' },
              isRTL: { type: 'boolean', example: true },
              isDefault: { type: 'boolean', example: false },
            },
          },
        },
      },
    },
  })
  async getLanguages(@Param('code') code: string) {
    return this.regionsService.getSupportedLanguages(code);
  }
}
