import { Injectable } from '@nestjs/common';
import { PlaywrightCrawler, Dataset } from 'crawlee';
import { PrismaService } from '../prisma/prisma.service';

export interface ScrapedNavigation {
  title: string;
  slug: string;
  url: string;
}

export interface ScrapedCategory {
  title: string;
  slug: string;
  url: string;
  productCount?: number;
}

export interface ScrapedProduct {
  sourceId: string;
  title: string;
  author?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  sourceUrl: string;
}

export interface ScrapedProductDetail {
  description?: string;
  specs?: any;
  ratingsAvg?: number;
  reviewsCount?: number;
  recommendations?: string[];
  publisher?: string;
  publicationDate?: string;
  isbn?: string;
  reviews?: Array<{
    author: string;
    rating: number;
    text: string;
  }>;
}

@Injectable()
export class ScrapingService {
  private readonly baseUrl = 'https://www.worldofbooks.com';
  private readonly delayMs: number;
  private readonly timeoutMs: number;

  constructor(private prisma: PrismaService) {
    this.delayMs = parseInt(process.env.SCRAPING_DELAY_MS || '2000');
    this.timeoutMs = parseInt(process.env.SCRAPING_TIMEOUT_MS || '30000');
  }

  async scrapeNavigation(): Promise<ScrapedNavigation[]> {
    const navigation: ScrapedNavigation[] = [];

    const crawler = new PlaywrightCrawler({
      requestHandlerTimeoutSecs: this.timeoutMs / 1000,
      maxRequestRetries: 3,
      requestHandler: async ({ page, request, log }) => {
        log.info(`Scraping navigation from ${request.url}`);

        try {
          // Wait for page to load
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(this.delayMs);

          // Example selectors - adjust based on actual site structure
          const navItems = await page.locator('nav a, header a, .menu a').all();

          for (const item of navItems) {
            try {
              const title = await item.textContent();
              const href = await item.getAttribute('href');

              if (title && href && title.trim().length > 0) {
                const cleanTitle = title.trim();
                const slug = this.generateSlug(cleanTitle);
                const url = href.startsWith('http') ? href : `${this.baseUrl}${href}`;

                navigation.push({
                  title: cleanTitle,
                  slug,
                  url,
                });
              }
            } catch (err) {
              log.warning(`Failed to extract nav item: ${err.message}`);
            }
          }

          log.info(`Extracted ${navigation.length} navigation items`);
        } catch (error) {
          log.error(`Error scraping navigation: ${error.message}`);
          throw error;
        }
      },
    });

    await crawler.run([this.baseUrl]);
    return this.deduplicateNavigation(navigation);
  }

  async scrapeCategories(navigationUrl: string): Promise<ScrapedCategory[]> {
    const categories: ScrapedCategory[] = [];

    const crawler = new PlaywrightCrawler({
      requestHandlerTimeoutSecs: this.timeoutMs / 1000,
      maxRequestRetries: 3,
      requestHandler: async ({ page, request, log }) => {
        log.info(`Scraping categories from ${request.url}`);

        try {
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(this.delayMs);

          // Example selectors - adjust based on actual site
          const categoryItems = await page.locator('.category-item, .category-link, [data-category]').all();

          for (const item of categoryItems) {
            try {
              const title = await item.textContent();
              const href = await item.getAttribute('href');

              if (title && href) {
                const cleanTitle = title.trim();
                const slug = this.generateSlug(cleanTitle);
                const url = href.startsWith('http') ? href : `${this.baseUrl}${href}`;

                // Try to extract product count
                const countText = await item.locator('.count, .product-count').textContent().catch(() => null);
                const productCount = countText ? this.extractNumber(countText) : 0;

                categories.push({
                  title: cleanTitle,
                  slug,
                  url,
                  productCount,
                });
              }
            } catch (err) {
              log.warning(`Failed to extract category: ${err.message}`);
            }
          }

          log.info(`Extracted ${categories.length} categories`);
        } catch (error) {
          log.error(`Error scraping categories: ${error.message}`);
          throw error;
        }
      },
    });

    await crawler.run([navigationUrl]);
    return this.deduplicateCategories(categories);
  }

  async scrapeProducts(categoryUrl: string, page = 1, limit = 20): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];
    const url = `${categoryUrl}?page=${page}&limit=${limit}`;

    const crawler = new PlaywrightCrawler({
      requestHandlerTimeoutSecs: this.timeoutMs / 1000,
      maxRequestRetries: 3,
      requestHandler: async ({ page, request, log }) => {
        log.info(`Scraping products from ${request.url}`);

        try {
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(this.delayMs);

          // Example selectors - adjust based on actual site
          const productCards = await page.locator('.product-card, .product-item, [data-product]').all();

          for (const card of productCards) {
            try {
              const title = await card.locator('.title, h3, h4, .product-title').textContent();
              const author = await card.locator('.author, .by-line').textContent().catch(() => null);
              const priceText = await card.locator('.price, .product-price').textContent();
              const image = await card.locator('img').getAttribute('src').catch(() => null);
              const link = await card.locator('a').first().getAttribute('href');

              if (title && priceText && link) {
                const price = this.extractPrice(priceText);
                const productUrl = link.startsWith('http') ? link : `${this.baseUrl}${link}`;
                const sourceId = this.extractSourceId(productUrl);

                products.push({
                  sourceId,
                  title: title.trim(),
                  author: author?.trim() || null,
                  price,
                  currency: 'GBP',
                  imageUrl: image,
                  sourceUrl: productUrl,
                });
              }
            } catch (err) {
              log.warning(`Failed to extract product: ${err.message}`);
            }
          }

          log.info(`Extracted ${products.length} products`);
        } catch (error) {
          log.error(`Error scraping products: ${error.message}`);
          throw error;
        }
      },
    });

    await crawler.run([url]);
    return products;
  }

  async scrapeProductDetail(productUrl: string): Promise<ScrapedProductDetail> {
    let detail: ScrapedProductDetail = {};

    const crawler = new PlaywrightCrawler({
      requestHandlerTimeoutSecs: this.timeoutMs / 1000,
      maxRequestRetries: 3,
      requestHandler: async ({ page, request, log }) => {
        log.info(`Scraping product detail from ${request.url}`);

        try {
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(this.delayMs);

          // Description
          const description = await page.locator('.description, .product-description, [data-description]')
            .textContent()
            .catch(() => null);

          // Ratings
          const ratingText = await page.locator('.rating, .average-rating, [data-rating]')
            .textContent()
            .catch(() => null);
          const reviewCountText = await page.locator('.review-count, .reviews-count')
            .textContent()
            .catch(() => null);

          // Publisher and date
          const publisher = await page.locator('.publisher, [data-publisher]')
            .textContent()
            .catch(() => null);
          const pubDate = await page.locator('.publication-date, [data-pub-date]')
            .textContent()
            .catch(() => null);
          const isbn = await page.locator('.isbn, [data-isbn]')
            .textContent()
            .catch(() => null);

          // Reviews
          const reviews = [];
          const reviewElements = await page.locator('.review, .customer-review').all();
          
          for (const reviewEl of reviewElements.slice(0, 10)) {
            try {
              const author = await reviewEl.locator('.author, .reviewer-name').textContent();
              const ratingEl = await reviewEl.locator('.rating, [data-rating]').textContent();
              const text = await reviewEl.locator('.review-text, .comment').textContent();

              if (author && text) {
                reviews.push({
                  author: author.trim(),
                  rating: this.extractNumber(ratingEl) || 5,
                  text: text.trim(),
                });
              }
            } catch (err) {
              log.warning(`Failed to extract review: ${err.message}`);
            }
          }

          // Recommendations
          const recommendations = [];
          const recElements = await page.locator('.recommended-product a, .similar-product a').all();
          
          for (const rec of recElements.slice(0, 6)) {
            const href = await rec.getAttribute('href').catch(() => null);
            if (href) {
              const url = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
              recommendations.push(this.extractSourceId(url));
            }
          }

          detail = {
            description: description?.trim() || null,
            ratingsAvg: ratingText ? this.extractNumber(ratingText) : null,
            reviewsCount: reviewCountText ? this.extractNumber(reviewCountText) : reviews.length,
            publisher: publisher?.trim() || null,
            publicationDate: pubDate?.trim() || null,
            isbn: isbn?.trim() || null,
            reviews: reviews.length > 0 ? reviews : null,
            recommendations: recommendations.length > 0 ? recommendations : null,
            specs: {},
          };

          log.info('Successfully extracted product detail');
        } catch (error) {
          log.error(`Error scraping product detail: ${error.message}`);
          throw error;
        }
      },
    });

    await crawler.run([productUrl]);
    return detail;
  }

  // Utility methods
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private extractSourceId(url: string): string {
    // Extract ID from URL - adjust based on actual URL structure
    const match = url.match(/\/([a-zA-Z0-9-]+)(?:\?|$)/);
    return match ? match[1] : url.split('/').filter(Boolean).pop() || url;
  }

  private extractPrice(text: string): number {
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  private extractNumber(text: string): number {
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  private deduplicateNavigation(items: ScrapedNavigation[]): ScrapedNavigation[] {
    const seen = new Set<string>();
    return items.filter(item => {
      if (seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    });
  }

  private deduplicateCategories(items: ScrapedCategory[]): ScrapedCategory[] {
    const seen = new Set<string>();
    return items.filter(item => {
      if (seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    });
  }

  async checkCacheValidity(lastScrapedAt: Date | null): Promise<boolean> {
    if (!lastScrapedAt) return false;
    
    const ttlHours = parseInt(process.env.CACHE_TTL_HOURS || '24');
    const expiryTime = new Date(lastScrapedAt.getTime() + ttlHours * 3600 * 1000);
    
    return new Date() < expiryTime;
  }
}
