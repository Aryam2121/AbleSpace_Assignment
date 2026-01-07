import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { ScrapingService } from '../scraping/scraping.service';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private scrapingService: ScrapingService,
    @InjectQueue('scraping') private scrapingQueue: Queue,
  ) {}

  async findAll(navigationId?: string) {
    const cacheKey = this.cache.generateKey('categories', navigationId || 'all');
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const categories = await this.prisma.category.findMany({
      where: navigationId ? { navigationId } : undefined,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { title: 'asc' },
    });

    const result = categories.map(cat => ({
      ...cat,
      productCount: cat._count.products || cat.productCount,
    }));

    await this.cache.set(cacheKey, result, 3600);
    return result;
  }

  async findBySlug(slug: string, includeProducts = false, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const cacheKey = this.cache.generateKey(
      'category',
      slug,
      includeProducts ? `products-${page}-${limit}` : 'basic'
    );
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const category = await this.prisma.category.findFirst({
      where: { slug },
      include: {
        children: {
          orderBy: { title: 'asc' },
        },
        ...(includeProducts && {
          products: {
            take: limit,
            skip,
            orderBy: { createdAt: 'desc' },
          },
        }),
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }

    let result: any = category;

    if (includeProducts) {
      const totalProducts = await this.prisma.product.count({
        where: { categoryId: category.id },
      });

      result = {
        ...category,
        totalProducts,
      };
    }

    await this.cache.set(cacheKey, result, 1800);
    return result;
  }

  async triggerScrape(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }

    const isValid = await this.scrapingService.checkCacheValidity(category.lastScrapedAt);
    
    if (isValid) {
      return {
        message: 'Data is already fresh, skipping scrape',
        lastScrapedAt: category.lastScrapedAt,
      };
    }

    // Queue product scraping for this category
    await this.scrapingQueue.add('scrape-products', {
      type: 'product',
      url: `https://www.worldofbooks.com/category/${slug}`,
      categoryId: category.id,
    });

    await this.cache.clear(`category:${slug}*`);

    return {
      message: 'Scraping job queued successfully',
      categoryId: category.id,
    };
  }
}
