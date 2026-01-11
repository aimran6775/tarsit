import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';

export const LANGUAGE_CODES = ['en', 'ar', 'ur', 'hi', 'es', 'fr', 'de'] as const;

export class TranslateTextDto {
  @ApiProperty({ description: 'Text to translate' })
  @IsString()
  text!: string;

  @ApiProperty({ description: 'Target language code', enum: LANGUAGE_CODES })
  @IsString()
  @IsIn(LANGUAGE_CODES)
  targetLang!: string;

  @ApiPropertyOptional({ description: 'Source language code', enum: LANGUAGE_CODES, default: 'en' })
  @IsOptional()
  @IsString()
  @IsIn(LANGUAGE_CODES)
  sourceLang?: string;

  @ApiPropertyOptional({ description: 'Entity type for caching (e.g., business_name)' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID for caching' })
  @IsOptional()
  @IsString()
  entityId?: string;
}

export class BatchTextItem {
  @ApiProperty({ description: 'Text to translate' })
  @IsString()
  text!: string;

  @ApiPropertyOptional({ description: 'Entity type for caching' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID for caching' })
  @IsOptional()
  @IsString()
  entityId?: string;
}

export class BatchTranslateDto {
  @ApiProperty({ description: 'Array of texts to translate', type: [BatchTextItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchTextItem)
  texts!: BatchTextItem[];

  @ApiProperty({ description: 'Target language code', enum: LANGUAGE_CODES })
  @IsString()
  @IsIn(LANGUAGE_CODES)
  targetLang!: string;

  @ApiPropertyOptional({ description: 'Source language code', enum: LANGUAGE_CODES, default: 'en' })
  @IsOptional()
  @IsString()
  @IsIn(LANGUAGE_CODES)
  sourceLang?: string;
}

export class TranslateBusinessDto {
  @ApiProperty({ description: 'Business ID to translate' })
  @IsString()
  businessId!: string;

  @ApiProperty({ description: 'Target language code', enum: LANGUAGE_CODES })
  @IsString()
  @IsIn(LANGUAGE_CODES)
  targetLang!: string;
}

export class DetectLanguageDto {
  @ApiProperty({ description: 'Text to detect language of' })
  @IsString()
  text!: string;
}

export class ClearCacheDto {
  @ApiProperty({ description: 'Entity type (e.g., business_name, service_description)' })
  @IsString()
  entityType!: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsString()
  entityId!: string;
}

// Response DTOs
export class TranslationResultDto {
  @ApiProperty()
  originalText!: string;

  @ApiProperty()
  translatedText!: string;

  @ApiProperty()
  sourceLang!: string;

  @ApiProperty()
  targetLang!: string;

  @ApiProperty()
  cached!: boolean;

  @ApiPropertyOptional()
  quality?: number;
}

export class BatchTranslationResultDto {
  @ApiProperty({ type: [TranslationResultDto] })
  translations!: TranslationResultDto[];

  @ApiProperty()
  totalCached!: number;

  @ApiProperty()
  totalTranslated!: number;
}

export class SupportedLanguageDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  nativeName!: string;

  @ApiProperty()
  rtl!: boolean;
}

export class TranslationStatsDto {
  @ApiProperty()
  totalCached!: number;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  byLanguage!: Record<string, number>;

  @ApiProperty()
  topHits!: Array<{ sourceText: string; targetLang: string; hitCount: number }>;
}
