import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  findOne(id: number) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  create(data: { name: string; icon?: string; sortOrder?: number }) {
    return this.prisma.category.create({ data });
  }

  async update(id: number, data: { name?: string; icon?: string; sortOrder?: number; isActive?: boolean }) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: number) {
    const cat: any = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!cat) throw new NotFoundException('Category not found');
    if (cat._count.products > 0) {
      return this.prisma.category.update({ where: { id }, data: { isActive: false } });
    }
    return this.prisma.category.delete({ where: { id } });
  }
}
