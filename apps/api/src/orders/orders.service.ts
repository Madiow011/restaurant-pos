import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, CheckoutOrderDto } from './dto/create-order.dto';

interface ProductRecord { id: number; name: string; price: number; categoryId: number; }

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private async generateOrderNumber(): Promise<string> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    // ใช้ count ของวันนี้ ไม่ใช่ count ทั้งหมด → ป้องกัน duplicate
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    const todayCount = await this.prisma.order.count({ where: { createdAt: { gte: start, lte: end } } });
    return `ORD-${dateStr}-${String(todayCount + 1).padStart(3, '0')}`;
  }

  async create(dto: CreateOrderDto) {
    const products: ProductRecord[] = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map(i => i.productId) }, isActive: true },
    });
    const pm = new Map<number, ProductRecord>(products.map(p => [p.id, p]));

    const items = dto.items.map(item => {
      const p = pm.get(item.productId);
      if (!p) throw new NotFoundException(`Product ${item.productId} not found`);
      return { productId: item.productId, quantity: item.quantity, unitPrice: p.price, subtotal: p.price * item.quantity, note: item.note };
    });

    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
    const vatAmount = subtotal * 0.07;
    const order = await this.prisma.order.create({
      data: {
        orderNumber: await this.generateOrderNumber(),
        tableId: dto.tableId, note: dto.note,
        subtotal, vatRate: 0.07, vatAmount, totalAmount: subtotal + vatAmount,
        orderItems: { create: items },
      },
      include: { orderItems: { include: { product: true } }, table: true },
    });
    await this.prisma.table.update({ where: { id: dto.tableId }, data: { status: 'OCCUPIED' } });
    return order;
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: { include: { product: true } }, table: true },
    });
  }

  // ประวัติออเดอร์ทั้งหมด
  findAll(status?: string) {
    return this.prisma.order.findMany({
      where: status ? { status: status as any } : {},
      include: { table: true, orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async addItems(orderId: number, dto: CreateOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const products: ProductRecord[] = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map(i => i.productId) } },
    });
    const pm = new Map<number, ProductRecord>(products.map(p => [p.id, p]));

    const items = dto.items.map(item => {
      const p = pm.get(item.productId);
      if (!p) throw new NotFoundException(`Product ${item.productId} not found`);
      return { orderId, productId: item.productId, quantity: item.quantity, unitPrice: p.price, subtotal: p.price * item.quantity, note: item.note };
    });

    await this.prisma.orderItem.createMany({ data: items });
    const all: any[] = await this.prisma.orderItem.findMany({ where: { orderId } });
    const subtotal = all.reduce((s, i) => s + i.subtotal, 0);
    const vatAmount = subtotal * 0.07;
    return this.prisma.order.update({
      where: { id: orderId },
      data: { subtotal, vatAmount, totalAmount: subtotal + vatAmount },
      include: { orderItems: { include: { product: true } }, table: true },
    });
  }

  async checkout(orderId: number, dto: CheckoutOrderDto) {
    const order: any = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID', paymentMethod: dto.paymentMethod, paidAt: new Date() },
      include: { orderItems: { include: { product: true } }, table: true },
    });
    await this.prisma.table.update({ where: { id: order.tableId }, data: { status: 'AVAILABLE' } });
    return updated;
  }

  async cancel(orderId: number) {
    const order: any = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    const updated = await this.prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } });
    await this.prisma.table.update({ where: { id: order.tableId }, data: { status: 'AVAILABLE' } });
    return updated;
  }
}
