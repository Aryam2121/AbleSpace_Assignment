import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { ProductDto, ProductWithDetailDto, ProductQueryDto, PaginatedProductsDto } from './dto/product.dto';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated products', type: PaginatedProductsDto })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({ name: 'includeDetail', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Returns product with details', type: ProductWithDetailDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findById(
    @Param('id') id: string,
    @Query('includeDetail') includeDetail?: string,
  ) {
    const include = includeDetail !== 'false';
    return this.productService.findById(id, include);
  }

  @Post(':id/scrape')
  @ApiOperation({ summary: 'Trigger on-demand scrape for product details' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Scraping job queued' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async triggerScrape(@Param('id') id: string) {
    return this.productService.triggerScrape(id);
  }
}
