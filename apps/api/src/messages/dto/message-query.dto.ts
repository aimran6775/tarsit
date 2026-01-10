import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsBoolean } from 'class-validator';

export class MessageQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of messages per page',
    default: 50,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Filter by read status',
    example: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
