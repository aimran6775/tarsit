import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search businesses with advanced filters' })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions (autocomplete)' })
  getSuggestions(@Query('q') query: string) {
    return this.searchService.getSuggestions(query);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending businesses' })
  getTrending() {
    return this.searchService.getTrending();
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get popular businesses nearby' })
  getPopularNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius?: number,
  ) {
    return this.searchService.getPopularNearby(
      Number(latitude),
      Number(longitude),
      radius ? Number(radius) : undefined,
    );
  }
}
