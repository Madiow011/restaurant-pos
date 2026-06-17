import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TableStatus } from '../generated/prisma/client';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        orders: {
          where: { status: { in: ['OPEN', 'CONFIRMED', 'READY'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.table.findUnique({
      where: { id },
      include: {
        orders: {
          where: { status: { in: ['OPEN', 'CONFIRMED', 'READY'] } },
          include: { orderItems: { include: { product: true } } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  updateStatus(id: number, status: TableStatus) {
    return this.prisma.table.update({
      where: { id },
      data: { status },
    });
  }
}
