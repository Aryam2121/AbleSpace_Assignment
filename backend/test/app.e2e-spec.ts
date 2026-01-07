import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('/api/navigation (GET)', () => {
    it('should return array of navigations', () => {
      return request(app.getHttpServer())
        .get('/api/navigation')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/api/products (GET)', () => {
    it('should return paginated products', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('products');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(res.body).toHaveProperty('totalPages');
        });
    });

    it('should filter products by price range', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .query({ minPrice: 5, maxPrice: 20 })
        .expect(200)
        .expect((res) => {
          const products = res.body.products;
          products.forEach((product: any) => {
            expect(product.price).toBeGreaterThanOrEqual(5);
            expect(product.price).toBeLessThanOrEqual(20);
          });
        });
    });
  });
});
