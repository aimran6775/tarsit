import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateFavoriteDto {
  @ApiProperty({ example: 'cuid123', description: 'Business ID to favorite' })
  @IsString()
  businessId!: string;
}
