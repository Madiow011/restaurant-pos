"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const PROMPTPAY_NUMBER = '0812345678';
const SHOP_NAME = 'ร้านอาหาร Demo';
let PaymentService = class PaymentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPromptPayQR(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { table: true, orderItems: { include: { product: true } } },
        });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        const payload = this.buildPromptPayPayload(PROMPTPAY_NUMBER, order.totalAmount, order.orderNumber);
        return {
            orderId,
            orderNumber: order.orderNumber,
            amount: order.totalAmount,
            promptPayNumber: PROMPTPAY_NUMBER,
            shopName: SHOP_NAME,
            qrPayload: payload,
        };
    }
    buildPromptPayPayload(phone, amount, ref) {
        const formattedPhone = '0066' + phone.replace(/^0/, '');
        const formatTLV = (tag, value) => {
            const len = value.length.toString().padStart(2, '0');
            return tag + len + value;
        };
        const merchantAccInfo = formatTLV('00', 'A000000677010111') + formatTLV('01', formattedPhone);
        const amountStr = amount.toFixed(2);
        const transRef = ref.replace(/[^A-Z0-9]/gi, '').substring(0, 25);
        let payload = formatTLV('00', '01') +
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
    crc16(data) {
        let crc = 0xffff;
        for (let i = 0; i < data.length; i++) {
            crc ^= data.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
            }
        }
        return ((crc & 0xffff) >>> 0).toString(16).toUpperCase().padStart(4, '0');
    }
    async createStripePaymentIntent(orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
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
    async confirmStripePayment(orderId, paymentIntentId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
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
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map