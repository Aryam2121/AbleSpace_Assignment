import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ScrapingService } from './scraping.service';
import { PrismaService } from '../prisma/prisma.service';

interface ScrapeJobData {
  type: 'navigation' | 'category' | 'product' | 'product-detail';
  url?: string;
  navigationId?: string;
  categoryId?: string;
  productId?: string;
  page?: number;
  limit?: number;
}

@Processor('scraping')
export class ScrapingProcessor {
  constructor(
    private scrapingService: ScrapingService,
    private prisma: PrismaService,
  ) {}

  @Process('scrape-navigation')
  async handleNavigationScrape(job: Job<ScrapeJobData>) {
    const jobRecord = await this.prisma.scrapeJob.create({
      data: {
        targetUrl: 'https://www.worldofbooks.com',
        targetType: 'navigation',
        status: 'processing',
        startedAt: new Date(),
      },
    });

    try {
      const navItems = await this.scrapingService.scrapeNavigation();

      for (const item of navItems) {
        await this.prisma.navigation.upsert({
          where: { slug: item.slug },
          update: {
            title: item.title,
            lastScrapedAt: new Date(),
          },
          create: {
            title: item.title,
            slug: item.slug,
            lastScrapedAt: new Date(),
          },
        });
      }

      await this.prisma.scrapeJob.update({
        where: { id: jobRecord.id },
        data: {
          status: 'completed',
          finishedAt: new Date(),
        },
      });

      return { success: true, count: navItems.length };
    } catch (error) {
      await this.prisma.scrapeJob.update({
        where: { id: jobRecord.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          errorLog: error.message,
          attempts: jobRecord.attempts + 1,
        },
      });
      throw error;
    }
  }

  @Process('scrape-category')
  async handleCategoryScrape(job: Job<ScrapeJobData>) {
    const { url, navigationId } = job.data;

    const jobRecord = await this.prisma.scrapeJob.create({
      data: {
        targetUrl: url,
        targetType: 'category',
        status: 'processing',
        startedAt: new Date(),
      },
    });

    try {
      const categories = await this.scrapingService.scrapeCategories(url);

      for (const cat of categories) {
        await this.prisma.category.upsert({
          where: {
            navigationId_slug: {
              navigationId,
              slug: cat.slug,
            },
          },
          update: {
            title: cat.title,
            productCount: cat.productCount || 0,
            lastScrapedAt: new Date(),
          },
          create: {
            navigationId,
            title: cat.title,
            slug: cat.slug,
            productCount: cat.productCount || 0,
            lastScrapedAt: new Date(),
          },
        });
      }

      await this.prisma.scrapeJob.update({
        where: { id: jobRecord.id },
        data: {
          status: 'completed',
          finishedAt: new Date(),
        },
      });

      return { success: true, count: categories.length };
    } catch (error) {
      await this.prisma.scrapeJob.update({
        where: { id: jobRecord.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          errorLog: error.message,
          attempts: jobRecord.attempts + 1,
        },
      });
      throw error;
    }
  }

  @Process('scrape-products')
  async handleProductsScrape(job: Job<ScrapeJobData>) {
    const { url, categoryId, page = 1, limit = 20 } = job.data;

    const jobRecord = await this.prisma.scrapeJob.create({
      data: {
        targetUrl: url,
        targetType: 'product',
        status: 'processing',
        startedAt: new Date(),
      },
    });

    try {
      const products = await this.scrapingService.scrapeProducts(url, page, limit);

      for (const prod of products) {
        await this.prisma.product.upsert({
          where: { sourceId: prod.sourceId },
          update: {
            title: prod.title,
            author: prod.author,
            price: prod.price,
            currency: prod.currency,
            imageUrl: prod.imageUrl,
            sourceUrl: prod.sourceUrl,
            categoryId,
            lastScrapedAt: new Date(),
          },
          create: {
            sourceId: prod.sourceId,
            title: prod.title,
            author: prod.author,
            price: prod.price,
            currency: prod.currency,
            imageUrl: prod.imageUrl,
            sourceUrl: prod.sourceUrl,
            categoryId,
            lastScrapedAt: new Date(),
          },
        });
      }

      await this.prisma.scrapeJob.update({
        where: { id: jobRecord.id },
        data: {
          status: 'completed',
          finishedAt: new Date(),
        },
      });

      return { success: true, count: products.length };
    } catch (error) {
      await this.prisma.scrapeJob.update({
        where: { id: jobRecord.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          errorLog: error.message,
          attempts: jobRecord.attempts + 1,
        },
      });
      throw error;
    }
  }

  @Process('scrape-product-detail')
  async handleProductDetailScrape(job: Job<ScrapeJobData>) {
    const { productId } = job.data;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const jobRecord = await this.prisma.scrapeJob.create({
      data: {
        targetUrl: product.sourceUrl,
        targetType: 'product-detail',
        status: 'processing',
        startedAt: new Date(),
      },
    });

    try {
      const detail = await this.scrapingService.scrapeProductDetail(product.sourceUrl);

      // Upsert product detail
      await this.prisma.productDetail.upsert({
        where: { productId },
        update: {
          description: detail.description,
          specs: detail.specs ? JSON.stringify(detail.specs) : null,
          ratingsAvg: detail.ratingsAvg,
          reviewsCount: detail.reviewsCount,
          recommendations: detail.recommendations ? JSON.stringify(detail.recommendations) : '[]',
          publisher: detail.publisher,
          publicationDate: detail.publicationDate,
          isbn: detail.isbn,
        },
        create: {
          productId,
          description: detail.description,
          specs: detail.specs ? JSON.stringify(detail.specs) : null,
          ratingsAvg: detail.ratingsAvg,
          reviewsCount: detail.reviewsCount,
          recommendations: detail.recommendations ? JSON.stringify(detail.recommendations) : '[]',
          publisher: detail.publisher,
          publicationDate: detail.publicationDate,
          isbn: detail.isbn,
        },
      });

      // Create reviews
      if (detail.reviews && detail.reviews.length > 0) {
        // Delete old reviews
        await this.prisma.review.deleteMany({
          where: { productId },
        });

        // Create new reviews
        await this.prisma.review.createMany({
          data: detail.reviews.map(review => ({
            productId,
            author: review.author,
            rating: review.rating,
            text: review.text,
          })),
        });
      }

      // Update product lastScrapedAt
      await this.prisma.product.update({
        where: { id: productId },
        data: { lastScrapedAt: new Date() },
      });

      await this.prisma.scrapeJob.update({
        where: { id: jobRecord.id },
        data: {
          status: 'completed',
          finishedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      await this.prisma.scrapeJob.update({
        where: { id: jobRecord.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          errorLog: error.message,
          attempts: jobRecord.attempts + 1,
        },
      });
      throw error;
    }
  }
}
