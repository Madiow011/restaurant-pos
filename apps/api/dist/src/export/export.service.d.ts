import { PrismaService } from '../prisma/prisma.service';
export declare class ExportService {
    private prisma;
    constructor(prisma: PrismaService);
    getOrdersCSV(startDate?: string, endDate?: string): Promise<string>;
    getSummaryHTML(startDate?: string, endDate?: string): Promise<string>;
}
