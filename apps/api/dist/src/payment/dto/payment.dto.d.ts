export declare class CreatePromptPayDto {
    orderId: number;
    amount: number;
}
export declare class CreateStripePaymentDto {
    orderId: number;
    amount: number;
}
export declare class ConfirmStripePaymentDto {
    orderId: number;
    paymentIntentId: string;
}
