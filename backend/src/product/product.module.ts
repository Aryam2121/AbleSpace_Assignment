import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ScrapingModule } from '../scraping/scraping.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scraping',
    }),
    ScrapingModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
