import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PhotosService } from './photos.service';
import { CreatePhotoDto, PhotoQueryDto, UpdatePhotoDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('photos')
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add photo to business (owner only)' })
  @ApiResponse({ status: 201, description: 'Photo added successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to add photos to this business' })
  create(@GetUser('id') userId: string, @Body() dto: CreatePhotoDto) {
    return this.photosService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List photos with filters' })
  @ApiResponse({ status: 200, description: 'Photos retrieved successfully' })
  findAll(@Query() query: PhotoQueryDto) {
    return this.photosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get photo by ID' })
  @ApiResponse({ status: 200, description: 'Photo retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Photo not found' })
  findOne(@Param('id') id: string) {
    return this.photosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update photo (owner only)' })
  @ApiResponse({ status: 200, description: 'Photo updated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this photo' })
  update(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdatePhotoDto) {
    return this.photosService.update(userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete photo (owner only)' })
  @ApiResponse({ status: 200, description: 'Photo deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this photo' })
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.photosService.remove(userId, id);
  }
}
