import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const EXPENSE_CATEGORIES = ['วัตถุดิบ', 'ค่าแรง', 'ค่าเช่า', 'สาธารณูปโภค', 'อุปกรณ์', 'การตลาด', 'อื่นๆ'];

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ===== EXPENSES =====
  findExpenses(month?: string) {
    const where: any = {};
    if (month) {
      const [y, m] = month.split('-').map(Number);
      where.date = {
        gte: new Date(y, m - 1, 1),
        lte: new Date(y, m, 0, 23, 59, 59),
      };
    }
    return this.prisma.expense.findMany({ where, orderBy: { date: 'desc' } });
  }

  createExpense(data: { title: string; amount: number; category: string; note?: string; date?: string }) {
    return this.prisma.expense.create({
      data: { ...data, date: data.date ? new Date(data.date) : new Date() },
    });
  }

  async updateExpense(id: number, data: any) {
    const exp = await this.prisma.expense.findUnique({ where: { id } });
    if (!exp) throw new NotFoundException('Expense not found');
    return this.prisma.expense.update({ where: { id }, data });
  }

  async deleteExpense(id: number) {
    const exp = await this.prisma.expense.findUnique({ where: { id } });
    if (!exp) throw new NotFoundException('Expense not found');
    return this.prisma.expense.delete({ where: { id } });
  }

  // ===== P&L REPORT =====
  async getProfitLoss(month: string) {
    const [y, m] = month.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const [orders, expenses]: [any[], any[]] = await Promise.all([
      this.prisma.order.findMany({
        where: { status: 'PAID', paidAt: { gte: start, lte: end } },
      }),
      this.prisma.expense.findMany({
        where: { date: { gte: start, lte: end } },
      }),
    ]);

    const revenue = orders.reduce((s, o) => s + o.subtotal, 0); // ไม่รวม VAT
    const vat = orders.reduce((s, o) => s + o.vatAmount, 0);
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const grossProfit = revenue - totalExpense;

    // แยกค่าใช้จ่ายตามหมวดหมู่
    const expenseByCategory: Record<string, number> = {};
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

  // ===== YEARLY SUMMARY =====
  async getYearlySummary(year: number) {
    const result = [];
    for (let m = 1; m <= 12; m++) {
      const month = `${year}-${String(m).padStart(2, '0')}`;
      const pl = await this.getProfitLoss(month);
      result.push({ month, label: new Date(year, m-1).toLocaleDateString('th-TH', { month:'short' }), ...pl });
    }
    return result;
  }
}
