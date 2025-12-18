import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Cache } from '../common/decorators/cache.decorator';
import { SearchQueryDto } from './dto';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Cache(60) // Cache for 1 minute
  @ApiOperation({ summary: 'Search businesses with advanced filters' })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query);
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
  getTrending() {
    return this.searchService.getTrending();
  }

  @Get('nearby')
  @Cache(60) // Cache for 1 minute
  @ApiOperation({ summary: 'Get popular businesses nearby' })
  getPopularNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius?: number
  ) {
    return this.searchService.getPopularNearby(
      Number(latitude),
      Number(longitude),
      radius ? Number(radius) : undefined
    );
  }
}
