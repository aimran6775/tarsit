import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReportDto, ReportTarget } from './dto/create-report.dto';
import { ReportPriority, ReportStatus, UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateReportDto, @Req() req: any) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    return this.reportsService.create(req.user.id, dto, ipAddress);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll(
    @Query('status') status?: ReportStatus,
    @Query('targetType') targetType?: ReportTarget,
    @Query('priority') priority?: ReportPriority,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.findAll({
      status,
      targetType,
      priority,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getStats() {
    return this.reportsService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findById(@Param('id') id: string) {
    return this.reportsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
    @Req() req: any,
  ) {
    return this.reportsService.update(id, req.user.id, dto);
  }
}
