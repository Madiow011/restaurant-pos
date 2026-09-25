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
exports.FinanceService = exports.EXPENSE_CATEGORIES = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
exports.EXPENSE_CATEGORIES = ['วัตถุดิบ', 'ค่าแรง', 'ค่าเช่า', 'สาธารณูปโภค', 'อุปกรณ์', 'การตลาด', 'อื่นๆ'];
let FinanceService = class FinanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findExpenses(month) {
        const where = {};
        if (month) {
            const [y, m] = month.split('-').map(Number);
            where.date = {
                gte: new Date(y, m - 1, 1),
                lte: new Date(y, m, 0, 23, 59, 59),
            };
        }
        return this.prisma.expense.findMany({ where, orderBy: { date: 'desc' } });
    }
    createExpense(data) {
        return this.prisma.expense.create({
            data: { ...data, date: data.date ? new Date(data.date) : new Date() },
        });
    }
    async updateExpense(id, data) {
        const exp = await this.prisma.expense.findUnique({ where: { id } });
        if (!exp)
            throw new common_1.NotFoundException('Expense not found');
        return this.prisma.expense.update({ where: { id }, data });
    }
    async deleteExpense(id) {
        const exp = await this.prisma.expense.findUnique({ where: { id } });
        if (!exp)
            throw new common_1.NotFoundException('Expense not found');
        return this.prisma.expense.delete({ where: { id } });
    }
    async getProfitLoss(month) {
        const [y, m] = month.split('-').map(Number);
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59);
        const [orders, expenses] = await Promise.all([
            this.prisma.order.findMany({
                where: { status: 'PAID', paidAt: { gte: start, lte: end } },
            }),
            this.prisma.expense.findMany({
                where: { date: { gte: start, lte: end } },
            }),
        ]);
        const revenue = orders.reduce((s, o) => s + o.subtotal, 0);
        const vat = orders.reduce((s, o) => s + o.vatAmount, 0);
        const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
        const grossProfit = revenue - totalExpense;
        const expenseByCategory = {};
        for (const e of expenses) {
            expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
        }
        return {
            month,
            revenue,
            vat,
            totalIncome: revenue + vat,
            expenses: totalExpense,
            expenseByCategory,
            grossProfit,
            orderCount: orders.length,
            avgOrderValue: orders.length > 0 ? revenue / orders.length : 0,
        };
    }
    async getYearlySummary(year) {
        const result = [];
        for (let m = 1; m <= 12; m++) {
            const month = `${year}-${String(m).padStart(2, '0')}`;
            const pl = await this.getProfitLoss(month);
            result.push({ month, label: new Date(year, m - 1).toLocaleDateString('th-TH', { month: 'short' }), ...pl });
        }
        return result;
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map