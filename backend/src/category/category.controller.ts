import { Controller, Get, Post, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CategoryDto, CategoryWithProductsDto } from './dto/category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({ name: 'navigationId', required: false })
  @ApiResponse({ status: 200, description: 'Returns all categories', type: [CategoryDto] })
  async findAll(@Query('navigationId') navigationId?: string) {
    return this.categoryService.findAll(navigationId);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiQuery({ name: 'includeProducts', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns category with optional products', type: CategoryWithProductsDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findBySlug(
    @Param('slug') slug: string,
    @Query('includeProducts') includeProducts?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    const include = includeProducts === 'true';
    return this.categoryService.findBySlug(slug, include, page, limit);
  }

  @Post(':slug/scrape')
  @ApiOperation({ summary: 'Trigger on-demand scrape for category products' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Scraping job queued' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async triggerScrape(@Param('slug') slug: string) {
    return this.categoryService.triggerScrape(slug);
  }
}
