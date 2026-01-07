import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoryDto } from './dto/history.dto';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async create(createHistoryDto: CreateHistoryDto) {
    return this.prisma.viewHistory.create({
      data: createHistoryDto,
    });
  }

  async findBySessionId(sessionId: string, limit = 50) {
    return this.prisma.viewHistory.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByUserId(userId: string, limit = 100) {
    return this.prisma.viewHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
