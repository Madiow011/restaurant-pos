import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    createPromptPayQR(orderId: number): Promise<{
        orderId: number;
        orderNumber: any;
        amount: any;
        promptPayNumber: string;
        shopName: string;
        qrPayload: string;
    }>;
    createStripePayment(orderId: number): Promise<{
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
    confirmStripePayment(body: {
        orderId: number;
        paymentIntentId: string;
    }): Promise<{
        success: boolean;
        orderId: number;
        paymentIntentId: string;
        message: string;
    }>;
}
