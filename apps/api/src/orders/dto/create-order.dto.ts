export class CreateOrderItemDto {
  productId: number;
  quantity: number;
  note?: string;
}

export class CreateOrderDto {
  tableId: number;
  items: CreateOrderItemDto[];
  note?: string;
}

export class CheckoutOrderDto {
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'QR_CODE';
}
