import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  navigationId: string;

  @ApiProperty({ required: false })
  parentId?: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  productCount: number;

  @ApiProperty({ required: false })
  lastScrapedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CategoryWithChildrenDto extends CategoryDto {
  @ApiProperty({ type: () => [CategoryDto] })
  children: CategoryDto[];
}

export class CategoryWithProductsDto extends CategoryDto {
  @ApiProperty({ type: () => [Object] })
  products: any[];

  @ApiProperty()
  totalProducts: number;
}
