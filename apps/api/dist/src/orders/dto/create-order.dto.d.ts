export declare class CreateOrderItemDto {
    productId: number;
    quantity: number;
    note?: string;
}
export declare class CreateOrderDto {
    tableId: number;
    items: CreateOrderItemDto[];
    note?: string;
}
export declare class CheckoutOrderDto {
    paymentMethod: 'CASH' | 'CREDIT_CARD' | 'QR_CODE';
}
