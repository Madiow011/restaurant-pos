import { PrismaService } from '../prisma/prisma.service';
export declare class ReceiptService {
    private prisma;
    constructor(prisma: PrismaService);
    getReceiptData(orderId: number): Promise<{
        shop: {
            name: string;
            address: string;
            phone: string;
            taxId: string;
        };
        order: {
            id: any;
            orderNumber: any;
            tableName: any;
            status: any;
            paymentMethod: any;
            paidAt: any;
            createdAt: any;
        };
        items: any;
        summary: {
            subtotal: any;
            vatRate: any;
            vatAmount: any;
            totalAmount: any;
        };
    }>;
    generateCustomerReceiptHTML(orderId: number): Promise<string>;
    generateKitchenOrderHTML(orderId: number): Promise<string>;
}
