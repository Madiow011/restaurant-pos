import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDailySales(days?: number): Promise<any[]>;
    getMonthlySales(months?: number): Promise<any[]>;
    getTopProducts(limit?: number): Promise<any[]>;
    getSummaryToday(): Promise<{
        orders: number;
        revenue: any;
        vat: any;
        subtotal: any;
    }>;
    getSummaryMonth(): Promise<{
        orders: number;
        revenue: any;
        vat: any;
        subtotal: any;
    }>;
    getCategoryStats(): Promise<any[]>;
}
