import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Cache } from '../common/decorators/cache.decorator';
import { SearchQueryDto } from './dto';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
@ApiHeader({ name: 'X-Region-Code', required: false, description: 'Region code (e.g., US, UAE)' })
@ApiHeader({ name: 'X-Language-Code', required: false, description: 'Language code (e.g., en, ar)' })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Cache(60) // Cache for 1 minute
  @ApiOperation({ summary: 'Search businesses with advanced filters' })
  search(@Query() query: SearchQueryDto, @Req() req: Request) {
    // Use region from middleware if not explicitly provided in query
    const searchQuery = {
      ...query,
      regionCode: query.regionCode || req.regionCode,
      regionId: query.regionId || req.regionId,
    };
    return this.searchService.search(searchQuery);
  }

  @Get('suggestions')
  @Cache(300) // Cache for 5 minutes
  @ApiOperation({ summary: 'Get search suggestions (autocomplete)' })
  getSuggestions(@Query('q') query: string) {
    return this.searchService.getSuggestions(query);
  }

  @Get('trending')
  @Cache(300) // Cache for 5 minutes
  @ApiOperation({ summary: 'Get trending businesses' })
  getTrending(@Req() req: Request) {
    return this.searchService.getTrending(req.regionId);
  }

  @Get('nearby')
  @Cache(60) // Cache for 1 minute
  @ApiOperation({ summary: 'Get popular businesses nearby' })
  getPopularNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius?: number,
    @Req() req?: Request,
  ) {
    return this.searchService.getPopularNearby(
      Number(latitude),
      Number(longitude),
      radius ? Number(radius) : undefined,
      req?.regionId,
    );
  }
}
