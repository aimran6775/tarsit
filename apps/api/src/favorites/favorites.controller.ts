import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto, FavoriteQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) { }

  @Post()
  @ApiOperation({ summary: 'Add business to favorites' })
  @ApiResponse({ status: 201, description: 'Business added to favorites' })
  @ApiResponse({ status: 400, description: 'Business already in favorites' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  create(@GetUser('id') userId: string, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiResponse({ status: 200, description: 'Favorites retrieved successfully' })
  findAll(@GetUser('id') userId: string, @Query() query: FavoriteQueryDto) {
    return this.favoritesService.findAll(userId, query);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove favorite by ID' })
  @ApiResponse({ status: 200, description: 'Favorite removed successfully' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.favoritesService.remove(userId, id);
  }

  @Delete('business/:businessId')
  @ApiOperation({ summary: 'Remove favorite by business ID' })
  @ApiResponse({ status: 200, description: 'Favorite removed successfully' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  removeByBusinessId(
    @GetUser('id') userId: string,
    @Param('businessId') businessId: string,
  ) {
    return this.favoritesService.removeByBusinessId(userId, businessId);
  }
}
