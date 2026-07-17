export class CreatePromptPayDto {
  orderId: number;
  amount: number;
}

export class CreateStripePaymentDto {
  orderId: number;
  amount: number;
}

export class ConfirmStripePaymentDto {
  orderId: number;
  paymentIntentId: string;
}
