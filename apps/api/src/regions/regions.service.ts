import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all active regions with their currencies
   */
  async findAll() {
    const regions = await this.prisma.region.findMany({
      where: { active: true },
      include: {
        currency: true,
      },
      orderBy: { order: 'asc' },
    });

    return {
      regions,
      total: regions.length,
    };
  }

  /**
   * Get a single region by code (e.g., "AE", "US")
   */
  async findByCode(code: string) {
    const region = await this.prisma.region.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        currency: true,
        _count: {
          select: { businesses: true },
        },
      },
    });

    if (!region) {
      throw new NotFoundException(`Region with code "${code}" not found`);
    }

    return {
      ...region,
      businessCount: region._count.businesses,
    };
  }

  /**
   * Get a single region by ID
   */
  async findById(id: string) {
    const region = await this.prisma.region.findUnique({
      where: { id },
      include: {
        currency: true,
        _count: {
          select: { businesses: true },
        },
      },
    });

    if (!region) {
      throw new NotFoundException(`Region with ID "${id}" not found`);
    }

    return {
      ...region,
      businessCount: region._count.businesses,
    };
  }

  /**
   * Get regions with business counts (for region selector showing activity)
   */
  async findAllWithBusinessCounts() {
    const regions = await this.prisma.region.findMany({
      where: { active: true },
      include: {
        currency: true,
        _count: {
          select: { businesses: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return {
      regions: regions.map((region) => ({
        ...region,
        businessCount: region._count.businesses,
      })),
      total: regions.length,
    };
  }

  /**
   * Detect region from IP address using external API
   * Returns default region (US) if detection fails
   */
  async detectRegionFromIP(ip: string): Promise<string> {
    try {
      // Skip detection for localhost/private IPs
      if (
        ip === '127.0.0.1' ||
        ip === '::1' ||
        ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        ip.startsWith('172.')
      ) {
        return 'US';
      }

      // Use ip-api.com (free, no API key needed, 45 req/min limit)
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`);
      
      if (!response.ok) {
        console.warn(`IP detection failed for ${ip}: ${response.status}`);
        return 'US';
      }

      const data = await response.json();
      
      if (data.countryCode) {
        // Check if we support this region
        const region = await this.prisma.region.findUnique({
          where: { code: data.countryCode },
          select: { code: true },
        });

        if (region) {
          return region.code;
        }
      }

      return 'US'; // Default fallback
    } catch (error) {
      console.error('Error detecting region from IP:', error);
      return 'US';
    }
  }

  /**
   * Get supported languages for a region
   */
  async getSupportedLanguages(regionCode: string) {
    const region = await this.prisma.region.findUnique({
      where: { code: regionCode.toUpperCase() },
      select: {
        code: true,
        name: true,
        defaultLanguage: true,
        supportedLangs: true,
        isRTL: true,
      },
    });

    if (!region) {
      throw new NotFoundException(`Region "${regionCode}" not found`);
    }

    // Map language codes to full language info
    const languageMap: Record<string, { name: string; nativeName: string; isRTL: boolean }> = {
      en: { name: 'English', nativeName: 'English', isRTL: false },
      ar: { name: 'Arabic', nativeName: 'العربية', isRTL: true },
      ur: { name: 'Urdu', nativeName: 'اردو', isRTL: true },
      hi: { name: 'Hindi', nativeName: 'हिन्दी', isRTL: false },
      es: { name: 'Spanish', nativeName: 'Español', isRTL: false },
      fr: { name: 'French', nativeName: 'Français', isRTL: false },
      de: { name: 'German', nativeName: 'Deutsch', isRTL: false },
    };

    return {
      regionCode: region.code,
      regionName: region.name,
      defaultLanguage: region.defaultLanguage,
      languages: region.supportedLangs.map((code) => ({
        code,
        ...languageMap[code],
        isDefault: code === region.defaultLanguage,
      })),
    };
  }
}
