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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDailySales(days = 7) {
        const result = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            const orders = await this.prisma.order.findMany({
                where: { status: 'PAID', paidAt: { gte: start, lte: end } },
            });
            result.push({
                date: start.toISOString().slice(0, 10),
                label: start.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' }),
                revenue: orders.reduce((s, o) => s + o.totalAmount, 0),
                orders: orders.length,
                vat: orders.reduce((s, o) => s + o.vatAmount, 0),
            });
        }
        return result;
    }
    async getMonthlySales(months = 6) {
        const result = [];
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
            const orders = await this.prisma.order.findMany({
                where: { status: 'PAID', paidAt: { gte: start, lte: end } },
            });
            result.push({
                month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                label: d.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }),
                revenue: orders.reduce((s, o) => s + o.totalAmount, 0),
                orders: orders.length,
                vat: orders.reduce((s, o) => s + o.vatAmount, 0),
            });
        }
        return result;
    }
    async getTopProducts(limit = 10) {
        const items = await this.prisma.orderItem.findMany({
            include: { product: { include: { category: true } }, order: true },
            where: { order: { status: 'PAID' } },
        });
        const map = new Map();
        for (const item of items) {
            const id = item.productId;
            if (!map.has(id)) {
                map.set(id, { id, name: item.product.name, category: item.product.category?.name, icon: item.product.category?.icon, price: item.product.price, qty: 0, revenue: 0 });
            }
            const r = map.get(id);
            r.qty += item.quantity;
            r.revenue += item.subtotal;
        }
        return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, limit);
    }
    async getSummaryToday() {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const orders = await this.prisma.order.findMany({
            where: { status: 'PAID', paidAt: { gte: start, lte: end } },
        });
        return {
            orders: orders.length,
            revenue: orders.reduce((s, o) => s + o.totalAmount, 0),
            vat: orders.reduce((s, o) => s + o.vatAmount, 0),
            subtotal: orders.reduce((s, o) => s + o.subtotal, 0),
        };
    }
    async getSummaryMonth() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const orders = await this.prisma.order.findMany({
            where: { status: 'PAID', paidAt: { gte: start, lte: end } },
        });
        return {
            orders: orders.length,
            revenue: orders.reduce((s, o) => s + o.totalAmount, 0),
            vat: orders.reduce((s, o) => s + o.vatAmount, 0),
            subtotal: orders.reduce((s, o) => s + o.subtotal, 0),
        };
    }
    async getCategoryStats() {
        const items = await this.prisma.orderItem.findMany({
            include: { product: { include: { category: true } }, order: true },
            where: { order: { status: 'PAID' } },
        });
        const map = new Map();
        for (const item of items) {
            const catId = item.product.categoryId;
            if (!map.has(catId)) {
                map.set(catId, { id: catId, name: item.product.category?.name, icon: item.product.category?.icon, qty: 0, revenue: 0 });
            }
            const r = map.get(catId);
            r.qty += item.quantity;
            r.revenue += item.subtotal;
        }
        return [...map.values()].sort((a, b) => b.revenue - a.revenue);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map