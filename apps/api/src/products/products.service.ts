import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll(categoryId?: number) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: true },
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }
}
