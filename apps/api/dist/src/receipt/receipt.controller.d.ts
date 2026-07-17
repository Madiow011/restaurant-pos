import { ReceiptService } from './receipt.service';
import { Response } from 'express';
export declare class ReceiptController {
    private readonly receiptService;
    constructor(receiptService: ReceiptService);
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
    getReceiptHTML(orderId: number, res: Response): Promise<void>;
}
