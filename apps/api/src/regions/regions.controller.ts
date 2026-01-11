import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { RegionListResponseDto, RegionWithBusinessCountDto } from './dto/region.dto';
import { RegionsService } from './regions.service';

@ApiTags('Regions')
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

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
