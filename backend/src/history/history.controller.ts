import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { CreateHistoryDto, ViewHistoryDto } from './dto/history.dto';

@ApiTags('history')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Record view history' })
  @ApiBody({ type: CreateHistoryDto })
  @ApiResponse({ status: 201, description: 'History recorded', type: ViewHistoryDto })
  async create(@Body() createHistoryDto: CreateHistoryDto) {
    return this.historyService.create(createHistoryDto);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get browsing history by session ID' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns history', type: [ViewHistoryDto] })
  async findBySessionId(
    @Param('sessionId') sessionId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 50,
  ) {
    return this.historyService.findBySessionId(sessionId, limit);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get browsing history by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns history', type: [ViewHistoryDto] })
  async findByUserId(
    @Param('userId') userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 100,
  ) {
    return this.historyService.findByUserId(userId, limit);
  }
}
