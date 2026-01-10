import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from './dto';
import { SavedSearchesService } from './saved-searches.service';

@Controller('saved-searches')
@UseGuards(JwtAuthGuard)
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Post()
  async create(@Body() dto: CreateSavedSearchDto, @Req() req: any) {
    return this.savedSearchesService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.savedSearchesService.findAll(req.user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: any) {
    return this.savedSearchesService.findById(req.user.id, id);
  }

  @Get(':id/execute')
  async executeSearch(@Param('id') id: string, @Req() req: any) {
    return this.savedSearchesService.executeSearch(req.user.id, id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSavedSearchDto,
    @Req() req: any,
  ) {
    return this.savedSearchesService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.savedSearchesService.delete(req.user.id, id);
    return { message: 'Saved search deleted' };
  }
}
