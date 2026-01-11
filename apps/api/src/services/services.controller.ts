import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateServiceDto, ServiceQueryDto, UpdateServiceDto } from './dto';
import { ServicesService } from './services.service';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create service (business owners only)' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to add services to this business' })
  create(@GetUser('id') userId: string, @Body() dto: CreateServiceDto) {
    return this.servicesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List services with filters' })
  @ApiResponse({ status: 200, description: 'Services retrieved successfully' })
  findAll(@Query() query: ServiceQueryDto) {
    return this.servicesService.findAll(query);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get services for a business with optional price conversion' })
  @ApiQuery({ name: 'currency', required: false, description: 'Target currency code for price conversion (e.g., USD, AED, EUR)' })
  @ApiResponse({ status: 200, description: 'Services retrieved with converted prices' })
  findByBusiness(
    @Param('businessId') businessId: string,
    @Query('currency') currencyCode?: string,
  ) {
    return this.servicesService.findByBusinessWithConversion(businessId, currencyCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({ status: 200, description: 'Service retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service (owner only)' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this service' })
  update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete service (owner only)' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this service' })
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.servicesService.remove(userId, id);
  }
}
