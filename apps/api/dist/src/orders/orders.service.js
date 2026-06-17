"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateOrderNumber() {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.prisma.order.count();
        return `ORD-${dateStr}-${String(count + 1).padStart(3, '0')}`;
    }
    async create(dto) {
        const products = await this.prisma.product.findMany({
            where: { id: { in: dto.items.map((i) => i.productId) } },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));
        const items = dto.items.map((item) => {
            const product = productMap.get(item.productId);
            if (!product)
                throw new common_1.NotFoundException(`Product ${item.productId} not found`);
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
    findOne(id) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                orderItems: { include: { product: true } },
                table: true,
            },
        });
    }
    async addItems(orderId, dto) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const products = await this.prisma.product.findMany({
            where: { id: { in: dto.items.map((i) => i.productId) } },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));
        const items = dto.items.map((item) => {
            const product = productMap.get(item.productId);
            if (!product)
                throw new common_1.NotFoundException(`Product ${item.productId} not found`);
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
    async checkout(orderId, dto) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
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
    async cancel(orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map