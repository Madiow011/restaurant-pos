import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('promptpay/:orderId')
  createPromptPayQR(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.paymentService.createPromptPayQR(orderId);
  }

  @Post('stripe/create/:orderId')
  createStripePayment(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.paymentService.createStripePaymentIntent(orderId);
  }

  @Post('stripe/confirm')
  confirmStripePayment(@Body() body: { orderId: number; paymentIntentId: string }) {
    return this.paymentService.confirmStripePayment(body.orderId, body.paymentIntentId);
  }
}
