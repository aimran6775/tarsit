import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Cache } from '../common/decorators/cache.decorator';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { BusinessesService } from './businesses.service';
import { BusinessQueryDto, CreateBusinessDto, UpdateBusinessDto } from './dto';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get('my-business')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current user's business" })
  @ApiResponse({ status: 200, description: 'Business details' })
  @ApiResponse({ status: 404, description: 'No business found for this user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyBusiness(@Request() req: AuthenticatedRequest) {
    return this.businessesService.findByOwnerId(req.user!.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS_OWNER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new business' })
  @ApiResponse({ status: 201, description: 'Business successfully created' })
  @ApiResponse({ status: 403, description: 'Only business owners can create businesses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req: AuthenticatedRequest, @Body() createBusinessDto: CreateBusinessDto) {
    return this.businessesService.create(req.user!.id, createBusinessDto);
  }

  @Get()
  @Cache(60) // Cache for 1 minute
  @ApiOperation({ summary: 'Get all businesses with filters' })
  @ApiResponse({ status: 200, description: 'List of businesses' })
  @ApiQuery({ type: BusinessQueryDto })
  async findAll(@Query() query: BusinessQueryDto) {
    return this.businessesService.findAll(query);
  }

  @Get('slug/:slug')
  @Cache(300) // Cache for 5 minutes
  @ApiOperation({ summary: 'Get business by slug' })
  @ApiResponse({ status: 200, description: 'Business details' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.businessesService.findBySlug(slug);
  }

  @Get(':id')
  @Cache(300) // Cache for 5 minutes
  @ApiOperation({ summary: 'Get business by ID' })
  @ApiResponse({ status: 200, description: 'Business details' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async findOne(@Param('id') id: string) {
    return this.businessesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update business' })
  @ApiResponse({ status: 200, description: 'Business successfully updated' })
  @ApiResponse({ status: 403, description: 'You can only update your own businesses' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() updateBusinessDto: UpdateBusinessDto
  ) {
    return this.businessesService.update(id, req.user!.id, req.user!.role, updateBusinessDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete business' })
  @ApiResponse({ status: 204, description: 'Business successfully deleted' })
  @ApiResponse({ status: 403, description: 'You can only delete your own businesses' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.businessesService.remove(id, req.user.id, req.user.role);
  }
}
