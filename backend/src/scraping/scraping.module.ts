import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScrapingService } from './scraping.service';
import { ScrapingProcessor } from './scraping.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scraping',
    }),
  ],
  providers: [ScrapingService, ScrapingProcessor],
  exports: [ScrapingService],
})
export class ScrapingModule {}
