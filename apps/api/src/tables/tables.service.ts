import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        orders: {
          where: { status: { in: ['OPEN', 'CONFIRMED', 'READY'] } },
          orderBy: { createdAt: 'desc' }, take: 1,
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
          orderBy: { createdAt: 'desc' }, take: 1,
        },
      },
    });
  }

  create(data: { number: number; name?: string; capacity?: number }) {
    return this.prisma.table.create({ data });
  }

  async update(id: number, data: { name?: string; capacity?: number; status?: any }) {
    const t = await this.prisma.table.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Table not found');
    return this.prisma.table.update({ where: { id }, data });
  }

  async remove(id: number) {
    const t: any = await this.prisma.table.findUnique({
      where: { id }, include: { _count: { select: { orders: true } } },
    });
    if (!t) throw new NotFoundException('Table not found');
    if (t._count.orders > 0) throw new BadRequestException('ไม่สามารถลบโต๊ะที่มีออเดอร์ได้');
    return this.prisma.table.delete({ where: { id } });
  }

  updateStatus(id: number, status: string) {
    return this.prisma.table.update({ where: { id }, data: { status: status as any } });
  }
}
