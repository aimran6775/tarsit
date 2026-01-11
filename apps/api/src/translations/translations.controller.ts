import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
    BatchTranslateDto,
    BatchTranslationResultDto,
    ClearCacheDto,
    DetectLanguageDto,
    SupportedLanguageDto,
    TranslateBusinessDto,
    TranslateTextDto,
    TranslationResultDto,
    TranslationStatsDto,
} from './dto';
import { TranslationsService } from './translations.service';

@ApiTags('translations')
@Controller('translations')
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Get('languages')
  @ApiOperation({ summary: 'Get all supported languages' })
  @ApiResponse({ status: 200, description: 'List of supported languages', type: [SupportedLanguageDto] })
  getSupportedLanguages(): SupportedLanguageDto[] {
    return this.translationsService.getSupportedLanguages();
  }

  @Post('translate')
  @ApiOperation({ summary: 'Translate a single text' })
  @ApiResponse({ status: 200, description: 'Translation result', type: TranslationResultDto })
  async translateText(@Body() dto: TranslateTextDto): Promise<TranslationResultDto> {
    return this.translationsService.translate(
      dto.text,
      dto.targetLang,
      dto.sourceLang || 'en',
      dto.entityType,
      dto.entityId,
    );
  }

  @Post('translate/batch')
  @ApiOperation({ summary: 'Translate multiple texts in batch' })
  @ApiResponse({ status: 200, description: 'Batch translation results', type: BatchTranslationResultDto })
  async translateBatch(@Body() dto: BatchTranslateDto): Promise<BatchTranslationResultDto> {
    return this.translationsService.translateBatch(dto.texts, dto.targetLang, dto.sourceLang || 'en');
  }

  @Post('translate/business')
  @ApiOperation({ summary: 'Translate all content for a business' })
  @ApiResponse({ status: 200, description: 'Business translation results' })
  async translateBusiness(@Body() dto: TranslateBusinessDto) {
    return this.translationsService.translateBusiness(dto.businessId, dto.targetLang);
  }

  @Post('detect')
  @ApiOperation({ summary: 'Detect the language of text' })
  @ApiResponse({ status: 200, description: 'Detected language code' })
  async detectLanguage(@Body() dto: DetectLanguageDto): Promise<{ language: string }> {
    const language = await this.translationsService.detectLanguage(dto.text);
    return { language };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get translation cache statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Translation statistics', type: TranslationStatsDto })
  async getStats(): Promise<TranslationStatsDto> {
    return this.translationsService.getStats();
  }

  @Delete('cache')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BUSINESS_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear translation cache for an entity' })
  @ApiResponse({ status: 200, description: 'Number of cache entries cleared' })
  async clearCache(@Query() dto: ClearCacheDto): Promise<{ cleared: number }> {
    const cleared = await this.translationsService.clearCache(dto.entityType, dto.entityId);
    return { cleared };
  }
}
