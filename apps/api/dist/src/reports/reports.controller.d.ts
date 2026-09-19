import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    daily(days?: string): Promise<any[]>;
    monthly(months?: string): Promise<any[]>;
    topProducts(limit?: string): Promise<any[]>;
    summaryToday(): Promise<{
        orders: number;
        revenue: any;
        vat: any;
        subtotal: any;
    }>;
    summaryMonth(): Promise<{
        orders: number;
        revenue: any;
        vat: any;
        subtotal: any;
    }>;
    categories(): Promise<any[]>;
}
