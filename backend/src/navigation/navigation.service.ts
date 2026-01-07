import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { ScrapingService } from '../scraping/scraping.service';

@Injectable()
export class NavigationService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private scrapingService: ScrapingService,
    @InjectQueue('scraping') private scrapingQueue: Queue,
  ) {}

  async findAll() {
    const cacheKey = this.cache.generateKey('navigation', 'all');
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const navigations = await this.prisma.navigation.findMany({
      include: {
        _count: {
          select: { categories: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const result = navigations.map(nav => ({
      ...nav,
      categoryCount: nav._count.categories,
    }));

    await this.cache.set(cacheKey, result, 3600); // Cache for 1 hour
    return result;
  }

  async findBySlug(slug: string, includeCategories = false) {
    const cacheKey = this.cache.generateKey('navigation', slug, includeCategories ? 'with-categories' : 'basic');
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const navigation = await this.prisma.navigation.findUnique({
      where: { slug },
      include: includeCategories ? {
        categories: {
          where: { parentId: null }, // Only root categories
          orderBy: { title: 'asc' },
          include: {
            _count: {
              select: { products: true },
            },
          },
        },
      } : undefined,
    });

    if (!navigation) {
      throw new NotFoundException(`Navigation with slug '${slug}' not found`);
    }

    const result = includeCategories ? {
      ...navigation,
      categories: navigation.categories.map(cat => ({
        ...cat,
        productCount: cat._count?.products || cat.productCount,
      })),
    } : navigation;

    await this.cache.set(cacheKey, result, 1800); // Cache for 30 minutes
    return result;
  }

  async triggerScrape(slug: string) {
    const navigation = await this.prisma.navigation.findUnique({
      where: { slug },
    });

    if (!navigation) {
      throw new NotFoundException(`Navigation with slug '${slug}' not found`);
    }

    // Check if scraping is needed
    const isValid = await this.scrapingService.checkCacheValidity(navigation.lastScrapedAt);
    
    if (isValid) {
      return {
        message: 'Data is already fresh, skipping scrape',
        lastScrapedAt: navigation.lastScrapedAt,
      };
    }

    // Queue the scraping job
    await this.scrapingQueue.add('scrape-category', {
      type: 'category',
      url: `https://www.worldofbooks.com/${slug}`,
      navigationId: navigation.id,
    });

    // Clear cache
    await this.cache.clear(`navigation:${slug}*`);

    return {
      message: 'Scraping job queued successfully',
      navigationId: navigation.id,
    };
  }

  async scrapeAll() {
    // Queue navigation scraping
    await this.scrapingQueue.add('scrape-navigation', {
      type: 'navigation',
    });

    // Clear all navigation cache
    await this.cache.clear('navigation:*');

    return {
      message: 'Navigation scraping job queued successfully',
    };
  }
}
