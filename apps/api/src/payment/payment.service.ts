import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';

const PROMPTPAY_NUMBER = '0812345678';
const SHOP_NAME = 'ร้านอาหาร Demo';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  // ===== PROMPTPAY QR =====
  async createPromptPayQR(orderId: number) {
    const order: any = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { table: true, orderItems: { include: { product: true } } },
    });
    if (!order) throw new BadRequestException('Order not found');

    // สร้าง PromptPay payload ตาม EMV QR Code standard
    const payload = this.buildPromptPayPayload(
      PROMPTPAY_NUMBER,
      order.totalAmount,
      order.orderNumber,
    );

    return {
      orderId,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      promptPayNumber: PROMPTPAY_NUMBER,
      shopName: SHOP_NAME,
      qrPayload: payload,
    };
  }

  private buildPromptPayPayload(phone: string, amount: number, ref: string): string {
    // Format phone: 0812345678 → 0066812345678
    const formattedPhone = '0066' + phone.replace(/^0/, '');

    const formatTLV = (tag: string, value: string) => {
      const len = value.length.toString().padStart(2, '0');
      return tag + len + value;
    };

    const merchantAccInfo = formatTLV('00', 'A000000677010111') + formatTLV('01', formattedPhone);
    const amountStr = amount.toFixed(2);
    const transRef = ref.replace(/[^A-Z0-9]/gi, '').substring(0, 25);

    let payload =
      formatTLV('00', '01') +
      formatTLV('01', '12') +
      formatTLV('29', merchantAccInfo) +
      formatTLV('53', '764') +
      formatTLV('54', amountStr) +
      formatTLV('58', 'TH') +
      formatTLV('59', SHOP_NAME.substring(0, 25)) +
      formatTLV('60', 'Bangkok') +
      formatTLV('62', formatTLV('05', transRef));

    payload += formatTLV('63', this.crc16(payload + '6304'));
    return payload;
  }

  private crc16(data: string): string {
    let crc = 0xffff;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      }
    }
    return ((crc & 0xffff) >>> 0).toString(16).toUpperCase().padStart(4, '0');
  }

  // ===== STRIPE =====
  async createStripePaymentIntent(orderId: number) {
    const order: any = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    // ใน sandbox mode: สร้าง mock payment intent
    const mockPaymentIntentId = `pi_sandbox_${Date.now()}_${orderId}`;
    const mockClientSecret = `${mockPaymentIntentId}_secret_test`;

    return {
      orderId,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      currency: 'thb',
      paymentIntentId: mockPaymentIntentId,
      clientSecret: mockClientSecret,
      mode: 'sandbox',
      testCards: [
        { number: '4242 4242 4242 4242', desc: 'บัตรสำเร็จ' },
        { number: '4000 0000 0000 0002', desc: 'บัตรถูกปฏิเสธ' },
        { number: '4000 0025 0000 3155', desc: 'ต้องยืนยัน 3D Secure' },
      ],
    };
  }

  async confirmStripePayment(orderId: number, paymentIntentId: string) {
    const order: any = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    // Sandbox: ถ้า paymentIntentId ขึ้นต้นด้วย pi_sandbox_ ถือว่าผ่าน
    const success = paymentIntentId.startsWith('pi_sandbox_');

    if (success) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID', paymentMethod: 'CREDIT_CARD', paidAt: new Date() },
      });
      await this.prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'AVAILABLE' },
      });
    }

    return {
      success,
      orderId,
      paymentIntentId,
      message: success ? 'ชำระเงินสำเร็จ' : 'ชำระเงินไม่สำเร็จ',
    };
  }
}
