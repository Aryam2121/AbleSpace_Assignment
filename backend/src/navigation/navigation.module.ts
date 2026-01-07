import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NavigationController } from './navigation.controller';
import { NavigationService } from './navigation.service';
import { ScrapingModule } from '../scraping/scraping.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scraping',
    }),
    ScrapingModule,
  ],
  controllers: [NavigationController],
  providers: [NavigationService],
  exports: [NavigationService],
})
export class NavigationModule {}
