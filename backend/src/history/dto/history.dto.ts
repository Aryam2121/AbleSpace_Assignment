import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateHistoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  pathJson: any;
}

export class ViewHistoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  userId?: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  pathJson: any;

  @ApiProperty()
  createdAt: Date;
}
