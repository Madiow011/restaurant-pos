import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentService {
    private prisma;
    constructor(prisma: PrismaService);
    createPromptPayQR(orderId: number): Promise<{
        orderId: number;
        orderNumber: any;
        amount: any;
        promptPayNumber: string;
        shopName: string;
        qrPayload: string;
    }>;
    private buildPromptPayPayload;
    private crc16;
    createStripePaymentIntent(orderId: number): Promise<{
        orderId: number;
        orderNumber: any;
        amount: any;
        currency: string;
        paymentIntentId: string;
        clientSecret: string;
        mode: string;
        testCards: {
            number: string;
            desc: string;
        }[];
    }>;
    confirmStripePayment(orderId: number, paymentIntentId: string): Promise<{
        success: boolean;
        orderId: number;
        paymentIntentId: string;
        message: string;
    }>;
}
