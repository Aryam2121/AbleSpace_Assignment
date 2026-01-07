import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { ScrapingService } from '../scraping/scraping.service';
import { ProductQueryDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private scrapingService: ScrapingService,
    @InjectQueue('scraping') private scrapingQueue: Queue,
  ) {}

  async findAll(query: ProductQueryDto) {
    const { page = 1, limit = 20, category, minPrice, maxPrice, search, author } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) {
      const cat = await this.prisma.category.findFirst({
        where: { slug: category },
      });
      if (cat) {
        where.categoryId = cat.id;
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (author) {
      where.author = { contains: author, mode: 'insensitive' };
    }

    const cacheKey = this.cache.generateKey(
      'products',
      JSON.stringify(where),
      `page-${page}`,
      `limit-${limit}`
    );
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const result = {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    await this.cache.set(cacheKey, result, 600); // Cache for 10 minutes
    return result;
  }

  async findById(id: string, includeDetail = true) {
    const cacheKey = this.cache.generateKey('product', id, includeDetail ? 'detailed' : 'basic');
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: includeDetail ? {
        detail: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        category: {
          select: {
            title: true,
            slug: true,
          },
        },
      } : undefined,
    });

    if (!product) {
      throw new NotFoundException(`Product with id '${id}' not found`);
    }

    // Fetch recommended products if available
    let recommendedProducts = [];
    if (includeDetail && product.detail?.recommendations) {
      const recommendations = JSON.parse(product.detail.recommendations || '[]');
      if (recommendations.length > 0) {
        recommendedProducts = await this.prisma.product.findMany({
          where: {
            sourceId: {
              in: recommendations.slice(0, 6),
            },
          },
          select: {
            id: true,
            sourceId: true,
            title: true,
            author: true,
            price: true,
            currency: true,
            imageUrl: true,
          },
        });
      }
    }

    const result = {
      ...product,
      recommendedProducts,
    };

    await this.cache.set(cacheKey, result, 1800);
    return result;
  }

  async triggerScrape(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with id '${id}' not found`);
    }

    const isValid = await this.scrapingService.checkCacheValidity(product.lastScrapedAt);
    
    if (isValid) {
      return {
        message: 'Data is already fresh, skipping scrape',
        lastScrapedAt: product.lastScrapedAt,
      };
    }

    // Queue product detail scraping
    await this.scrapingQueue.add('scrape-product-detail', {
      type: 'product-detail',
      productId: product.id,
    });

    await this.cache.clear(`product:${id}*`);

    return {
      message: 'Scraping job queued successfully',
      productId: product.id,
    };
  }
}
