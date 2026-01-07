import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sourceId: string;

  @ApiProperty({ required: false })
  categoryId?: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  author?: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ required: false })
  imageUrl?: string;

  @ApiProperty()
  sourceUrl: string;

  @ApiProperty({ required: false })
  lastScrapedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ProductDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  specs?: any;

  @ApiProperty({ required: false })
  ratingsAvg?: number;

  @ApiProperty()
  reviewsCount: number;

  @ApiProperty({ type: [String] })
  recommendations: string[];

  @ApiProperty({ required: false })
  publisher?: string;

  @ApiProperty({ required: false })
  publicationDate?: string;

  @ApiProperty({ required: false })
  isbn?: string;
}

export class ReviewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  author: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: Date;
}

export class ProductWithDetailDto extends ProductDto {
  @ApiProperty({ type: ProductDetailDto, required: false })
  detail?: ProductDetailDto;

  @ApiProperty({ type: [ReviewDto] })
  reviews: ReviewDto[];
}

export class ProductQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  author?: string;
}

export class PaginatedProductsDto {
  @ApiProperty({ type: [ProductDto] })
  products: ProductDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
