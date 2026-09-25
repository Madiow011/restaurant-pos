import { FinanceService } from './finance.service';
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    getExpenses(month?: string): any;
    createExpense(body: any): any;
    updateExpense(id: number, body: any): Promise<any>;
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
    getYearlySummary(year: string): Promise<any[]>;
}
