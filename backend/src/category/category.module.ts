import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { ScrapingModule } from '../scraping/scraping.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scraping',
    }),
    ScrapingModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
