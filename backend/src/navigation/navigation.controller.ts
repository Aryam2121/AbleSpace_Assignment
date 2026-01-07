import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NavigationService } from './navigation.service';
import { NavigationDto, NavigationWithCategoriesDto } from './dto/navigation.dto';

@ApiTags('navigation')
@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all navigation headings' })
  @ApiResponse({ status: 200, description: 'Returns all navigation headings', type: [NavigationDto] })
  async findAll() {
    return this.navigationService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get navigation by slug' })
  @ApiParam({ name: 'slug', description: 'Navigation slug' })
  @ApiQuery({ name: 'includeCategories', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Returns navigation with optional categories', type: NavigationWithCategoriesDto })
  @ApiResponse({ status: 404, description: 'Navigation not found' })
  async findBySlug(
    @Param('slug') slug: string,
    @Query('includeCategories') includeCategories?: string,
  ) {
    const include = includeCategories === 'true';
    return this.navigationService.findBySlug(slug, include);
  }

  @Post(':slug/scrape')
  @ApiOperation({ summary: 'Trigger on-demand scrape for navigation categories' })
  @ApiParam({ name: 'slug', description: 'Navigation slug' })
  @ApiResponse({ status: 200, description: 'Scraping job queued' })
  @ApiResponse({ status: 404, description: 'Navigation not found' })
  async triggerScrape(@Param('slug') slug: string) {
    return this.navigationService.triggerScrape(slug);
  }

  @Post('scrape')
  @ApiOperation({ summary: 'Scrape all navigation headings' })
  @ApiResponse({ status: 200, description: 'Scraping job queued' })
  async scrapeAll() {
    return this.navigationService.scrapeAll();
  }
}
