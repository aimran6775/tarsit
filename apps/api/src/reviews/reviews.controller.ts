import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 409, description: 'You have already reviewed this business' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req: AuthenticatedRequest, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews with filters' })
  @ApiResponse({ status: 200, description: 'List of reviews' })
  async findAll(@Query() query: ReviewQueryDto) {
    return this.reviewsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Review details' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 403, description: 'You can only update your own reviews' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, req.user.id, req.user.role, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete review' })
  @ApiResponse({ status: 204, description: 'Review deleted successfully' })
  @ApiResponse({ status: 403, description: 'You can only delete your own reviews' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.reviewsService.remove(id, req.user.id, req.user.role);
  }

  @Post(':id/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Business owner responds to a review' })
  @ApiResponse({ status: 200, description: 'Response added successfully' })
  @ApiResponse({ status: 403, description: 'Only business owners can respond' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async respond(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body('response') responseText: string,
  ) {
    return this.reviewsService.respond(id, req.user.id, req.user.role, responseText);
  }

  @Delete(':id/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete business owner response' })
  @ApiResponse({ status: 204, description: 'Response deleted successfully' })
  @ApiResponse({ status: 403, description: 'Only business owners can delete responses' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteResponse(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.reviewsService.deleteResponse(id, req.user.id, req.user.role);
  }
}
