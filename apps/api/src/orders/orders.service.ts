import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, CheckoutOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.order.count();
    return `ORD-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }

  async create(dto: CreateOrderDto) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map((i) => i.productId) } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const items = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: product.price * item.quantity,
        note: item.note,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const vatRate = 0.07;
    const vatAmount = subtotal * vatRate;
    const totalAmount = subtotal + vatAmount;

    const order = await this.prisma.order.create({
      data: {
        orderNumber: await this.generateOrderNumber(),
        tableId: dto.tableId,
        note: dto.note,
        subtotal,
        vatRate,
        vatAmount,
        totalAmount,
        orderItems: { create: items },
      },
      include: {
        orderItems: { include: { product: true } },
        table: true,
      },
    });

    await this.prisma.table.update({
      where: { id: dto.tableId },
      data: { status: 'OCCUPIED' },
    });

    return order;
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { product: true } },
        table: true,
      },
    });
  }

  async addItems(orderId: number, dto: CreateOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map((i) => i.productId) } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const items = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      return {
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: product.price * item.quantity,
        note: item.note,
      };
    });

    await this.prisma.orderItem.createMany({ data: items });

    const allItems = await this.prisma.orderItem.findMany({ where: { orderId } });
    const subtotal = allItems.reduce((sum, i) => sum + i.subtotal, 0);
    const vatAmount = subtotal * 0.07;

    return this.prisma.order.update({
      where: { id: orderId },
      data: { subtotal, vatAmount, totalAmount: subtotal + vatAmount },
      include: { orderItems: { include: { product: true } }, table: true },
    });
  }

  async checkout(orderId: number, dto: CheckoutOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentMethod: dto.paymentMethod,
        paidAt: new Date(),
      },
      include: { orderItems: { include: { product: true } }, table: true },
    });

    await this.prisma.table.update({
      where: { id: order.tableId },
      data: { status: 'AVAILABLE' },
    });

    return updated;
  }

  async cancel(orderId: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.table.update({
      where: { id: order.tableId },
      data: { status: 'AVAILABLE' },
    });

    return updated;
  }
}
