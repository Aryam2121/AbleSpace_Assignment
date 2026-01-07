import { ApiProperty } from '@nestjs/swagger';

export class NavigationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ required: false })
  lastScrapedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  categoryCount?: number;
}

export class NavigationWithCategoriesDto extends NavigationDto {
  @ApiProperty({ type: () => [Object] })
  categories: any[];
}
