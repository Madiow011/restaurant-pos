import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll(categoryId?: number) {
    return this.prisma.product.findMany({
      where: { ...(categoryId ? { categoryId } : {}) },
      include: { category: true },
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id }, include: { category: true } });
  }

  create(data: { name: string; price: number; categoryId: number; description?: string; imageUrl?: string; sortOrder?: number }) {
    return this.prisma.product.create({ data, include: { category: true } });
  }

  async update(id: number, data: { name?: string; price?: number; categoryId?: number; description?: string; isActive?: boolean; sortOrder?: number }) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.product.update({ where: { id }, data, include: { category: true } });
  }

  async remove(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    // soft delete
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  async hardDelete(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.product.delete({ where: { id } });
  }
}
