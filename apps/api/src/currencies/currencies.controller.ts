import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrenciesService } from './currencies.service';
import {
    ConversionResultDto,
    CurrencyListResponseDto,
    CurrencyResponseDto,
} from './dto/currency.dto';

@ApiTags('Currencies')
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active currencies' })
  @ApiResponse({
    status: 200,
    description: 'List of all active currencies',
    type: CurrencyListResponseDto,
  })
  async findAll() {
    return this.currenciesService.findAll();
  }

  @Get('convert')
  @ApiOperation({ summary: 'Convert amount between currencies' })
  @ApiQuery({ name: 'amount', type: Number, example: 100 })
  @ApiQuery({ name: 'from', type: String, example: 'AED' })
  @ApiQuery({ name: 'to', type: String, example: 'USD' })
  @ApiResponse({
    status: 200,
    description: 'Conversion result',
    type: ConversionResultDto,
  })
  async convert(
    @Query('amount') amount: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.currenciesService.convert(Number(amount), from, to);
  }

  @Get('rate/:from/:to')
  @ApiOperation({ summary: 'Get exchange rate between two currencies' })
  @ApiParam({ name: 'from', description: 'Source currency code', example: 'AED' })
  @ApiParam({ name: 'to', description: 'Target currency code', example: 'USD' })
  @ApiResponse({
    status: 200,
    description: 'Exchange rate information',
    schema: {
      type: 'object',
      properties: {
        from: { type: 'string', example: 'AED' },
        to: { type: 'string', example: 'USD' },
        rate: { type: 'number', example: 0.2723 },
        inverse: { type: 'number', example: 3.6725 },
        lastUpdate: { type: 'string', example: '2026-01-11T00:00:00Z' },
      },
    },
  })
  async getRate(@Param('from') from: string, @Param('to') to: string) {
    return this.currenciesService.getExchangeRate(from, to);
  }

  @Get('format')
  @ApiOperation({ summary: 'Format a price in a specific currency' })
  @ApiQuery({ name: 'amount', type: Number, example: 1234.56 })
  @ApiQuery({ name: 'currency', type: String, example: 'AED' })
  @ApiResponse({
    status: 200,
    description: 'Formatted price string',
    schema: {
      type: 'object',
      properties: {
        formatted: { type: 'string', example: 'د.إ1,234.56' },
        amount: { type: 'number', example: 1234.56 },
        currency: { type: 'string', example: 'AED' },
      },
    },
  })
  async formatPrice(
    @Query('amount') amount: number,
    @Query('currency') currency: string,
  ) {
    const formatted = await this.currenciesService.getFormattedPrice(Number(amount), currency);
    return {
      formatted,
      amount: Number(amount),
      currency: currency.toUpperCase(),
    };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get a currency by code' })
  @ApiParam({ name: 'code', description: 'Currency code', example: 'USD' })
  @ApiResponse({
    status: 200,
    description: 'Currency details',
    type: CurrencyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  async findByCode(@Param('code') code: string) {
    return this.currenciesService.findByCode(code);
  }

  @Post('update-rates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger exchange rate update (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Exchange rates updated',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Exchange rates updated successfully' },
      },
    },
  })
  async updateRates() {
    return this.currenciesService.manualUpdateRates();
  }
}
