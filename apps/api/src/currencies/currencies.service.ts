import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrenciesService {
  private readonly logger = new Logger(CurrenciesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get all active currencies
   */
  async findAll() {
    const currencies = await this.prisma.currency.findMany({
      where: { active: true },
      orderBy: { code: 'asc' },
    });

    return {
      currencies,
      total: currencies.length,
    };
  }

  /**
   * Get a single currency by code
   */
  async findByCode(code: string) {
    const currency = await this.prisma.currency.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!currency) {
      throw new NotFoundException(`Currency with code "${code}" not found`);
    }

    return currency;
  }

  /**
   * Convert amount from one currency to another
   */
  async convert(amount: number, fromCode: string, toCode: string) {
    const fromCurrency = await this.findByCode(fromCode);
    const toCurrency = await this.findByCode(toCode);

    // Convert through USD as base currency
    // First convert to USD, then to target currency
    const amountInUSD = amount * fromCurrency.exchangeRateToUSD;
    const convertedAmount = amountInUSD / toCurrency.exchangeRateToUSD;

    // Calculate direct exchange rate
    const exchangeRate = fromCurrency.exchangeRateToUSD / toCurrency.exchangeRateToUSD;

    return {
      originalAmount: amount,
      fromCurrency: fromCode.toUpperCase(),
      convertedAmount: Number(convertedAmount.toFixed(toCurrency.decimalPlaces)),
      toCurrency: toCode.toUpperCase(),
      exchangeRate: Number(exchangeRate.toFixed(6)),
      formatted: this.formatConversion(
        amount,
        fromCurrency,
        convertedAmount,
        toCurrency,
      ),
    };
  }

  /**
   * Format a price with the currency's symbol and formatting rules
   */
  formatPrice(
    amount: number,
    currency: {
      symbol: string;
      symbolPosition: string;
      decimalPlaces: number;
      thousandSeparator: string;
      decimalSeparator: string;
    },
  ): string {
    // Format the number
    const parts = amount.toFixed(currency.decimalPlaces).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSeparator);
    const formattedNumber = parts.join(currency.decimalSeparator);

    // Add symbol in correct position
    if (currency.symbolPosition === 'before') {
      return `${currency.symbol}${formattedNumber}`;
    } else {
      return `${formattedNumber} ${currency.symbol}`;
    }
  }

  /**
   * Format a conversion result for display
   */
  private formatConversion(
    originalAmount: number,
    fromCurrency: {
      code: string;
      symbol: string;
      symbolPosition: string;
      decimalPlaces: number;
      thousandSeparator: string;
      decimalSeparator: string;
    },
    convertedAmount: number,
    toCurrency: {
      code: string;
      symbol: string;
      symbolPosition: string;
      decimalPlaces: number;
      thousandSeparator: string;
      decimalSeparator: string;
    },
  ): string {
    const formattedOriginal = this.formatPrice(originalAmount, fromCurrency);
    const formattedConverted = this.formatPrice(convertedAmount, toCurrency);
    return `${formattedOriginal} ${fromCurrency.code} = ${formattedConverted} ${toCurrency.code}`;
  }

  /**
   * Get formatted price for display in a specific currency
   */
  async getFormattedPrice(amount: number, currencyCode: string, _locale?: string): Promise<string> {
    const currency = await this.findByCode(currencyCode);
    return this.formatPrice(amount, currency);
  }

  /**
   * Update exchange rates from external API
   * Runs daily at midnight UTC
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateExchangeRates() {
    this.logger.log('Updating exchange rates...');

    try {
      // Use exchangerate-api.com (free tier: 1500 requests/month)
      // Alternative: Open Exchange Rates, Fixer.io, etc.
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD',
      );

      if (!response.ok) {
        this.logger.error(`Failed to fetch exchange rates: ${response.status}`);
        return;
      }

      const data = await response.json();
      const rates = data.rates;

      // Update each currency in our database
      const currencies = await this.prisma.currency.findMany();

      for (const currency of currencies) {
        if (currency.code === 'USD') {
          // USD is base currency, rate is always 1
          continue;
        }

        const rate = rates[currency.code];
        if (rate) {
          // The API gives us "1 USD = X foreign currency"
          // We need "1 foreign currency = X USD" (inverse)
          const rateToUSD = 1 / rate;

          await this.prisma.currency.update({
            where: { id: currency.id },
            data: {
              exchangeRateToUSD: rateToUSD,
              lastRateUpdate: new Date(),
            },
          });

          this.logger.log(`Updated ${currency.code}: 1 ${currency.code} = ${rateToUSD.toFixed(6)} USD`);
        }
      }

      this.logger.log('Exchange rates updated successfully');
    } catch (error) {
      this.logger.error('Error updating exchange rates:', error);
    }
  }

  /**
   * Manually trigger exchange rate update
   */
  async manualUpdateRates() {
    await this.updateExchangeRates();
    return { message: 'Exchange rates updated successfully' };
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(fromCode: string, toCode: string) {
    const fromCurrency = await this.findByCode(fromCode);
    const toCurrency = await this.findByCode(toCode);

    const exchangeRate = fromCurrency.exchangeRateToUSD / toCurrency.exchangeRateToUSD;

    return {
      from: fromCode.toUpperCase(),
      to: toCode.toUpperCase(),
      rate: Number(exchangeRate.toFixed(6)),
      inverse: Number((1 / exchangeRate).toFixed(6)),
      lastUpdate: fromCurrency.lastRateUpdate || toCurrency.lastRateUpdate,
    };
  }
}
