import { PrismaService } from '../prisma/prisma.service';
export declare const EXPENSE_CATEGORIES: string[];
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    findExpenses(month?: string): any;
    createExpense(data: {
        title: string;
        amount: number;
        category: string;
        note?: string;
        date?: string;
    }): any;
    updateExpense(id: number, data: any): Promise<any>;
    deleteExpense(id: number): Promise<any>;
    getProfitLoss(month: string): Promise<{
        month: string;
        revenue: any;
        vat: any;
        totalIncome: any;
        expenses: any;
        expenseByCategory: Record<string, number>;
        grossProfit: number;
        orderCount: number;
        avgOrderValue: number;
    }>;
    getYearlySummary(year: number): Promise<any[]>;
}
