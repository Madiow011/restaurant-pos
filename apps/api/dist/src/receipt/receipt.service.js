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
exports.ReceiptService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const SHOP = { name: 'ร้านอาหาร Demo', address: '123 ถ.สุขุมวิท กรุงเทพฯ', phone: '02-123-4567', taxId: '1234567890123' };
let ReceiptService = class ReceiptService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getReceiptData(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { table: true, orderItems: { include: { product: { include: { category: true } } } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return {
            shop: SHOP,
            order: { id: order.id, orderNumber: order.orderNumber, tableName: order.table?.name || `โต๊ะ ${order.table?.number}`, status: order.status, paymentMethod: order.paymentMethod, paidAt: order.paidAt, createdAt: order.createdAt },
            items: order.orderItems.map((i) => ({ name: i.product.name, category: i.product.category?.name, quantity: i.quantity, unitPrice: i.unitPrice, subtotal: i.subtotal, note: i.note })),
            summary: { subtotal: order.subtotal, vatRate: order.vatRate, vatAmount: order.vatAmount, totalAmount: order.totalAmount },
        };
    }
    async generateCustomerReceiptHTML(orderId) {
        const { shop, order, items, summary } = await this.getReceiptData(orderId);
        const fmt = (n) => n.toLocaleString('th-TH', { minimumFractionDigits: 2 });
        const fmtDate = (d) => d ? new Date(d).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) : '-';
        const pmLabel = { CASH: 'เงินสด', CREDIT_CARD: 'บัตรเครดิต', QR_CODE: 'QR/พร้อมเพย์' };
        return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><title>ใบเสร็จ ${order.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Sarabun',sans-serif;font-size:14px;background:#fff;color:#111}.receipt{max-width:320px;margin:0 auto;padding:16px}.center{text-align:center}.shop-name{font-size:18px;font-weight:bold}.divider{border:none;border-top:1px dashed #999;margin:8px 0}table{width:100%;border-collapse:collapse}th{font-size:12px;border-bottom:1px solid #ccc;padding:4px 0}.total-row td{font-weight:bold;font-size:16px;border-top:2px solid #111;padding-top:6px}.footer{font-size:11px;color:#666;text-align:center;margin-top:12px}@media print{.no-print{display:none}}</style></head>
<body><div class="receipt"><div class="center"><div class="shop-name">${shop.name}</div><div>${shop.address}</div><div>โทร: ${shop.phone}</div><div style="font-size:11px;color:#666">เลขผู้เสียภาษี: ${shop.taxId}</div></div>
<hr class="divider"><table><tr><td><strong>${order.orderNumber}</strong></td><td style="text-align:right"><strong>${order.tableName}</strong></td></tr><tr><td colspan="2" style="font-size:12px;color:#666">วันที่: ${fmtDate(order.createdAt)}</td></tr>${order.paymentMethod ? `<tr><td colspan="2" style="font-size:12px">ชำระ: ${pmLabel[order.paymentMethod] || order.paymentMethod}</td></tr>` : ''}</table>
<hr class="divider"><table><thead><tr><th style="text-align:left">รายการ</th><th>จำนวน</th><th style="text-align:right">ราคา</th><th style="text-align:right">รวม</th></tr></thead><tbody>${items.map((i) => `<tr><td style="padding:3px 0">${i.name}${i.note ? `<br><small style="color:#666">(${i.note})</small>` : ''}</td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">${fmt(i.unitPrice)}</td><td style="text-align:right">${fmt(i.subtotal)}</td></tr>`).join('')}</tbody></table>
<hr class="divider"><table><tr><td>ยอดก่อน VAT</td><td style="text-align:right">${fmt(summary.subtotal)} ฿</td></tr><tr><td>VAT ${(summary.vatRate * 100).toFixed(0)}%</td><td style="text-align:right">${fmt(summary.vatAmount)} ฿</td></tr><tr class="total-row"><td>รวมทั้งสิ้น</td><td style="text-align:right">${fmt(summary.totalAmount)} ฿</td></tr></table>
<hr class="divider"><div class="footer"><p>*** ขอบคุณที่ใช้บริการ ***</p></div>
<div class="no-print" style="margin-top:16px;text-align:center"><button onclick="window.print()" style="padding:8px 24px;background:#4f46e5;color:#fff;border:none;border-radius:8px;cursor:pointer">🖨️ พิมพ์ใบเสร็จลูกค้า</button></div></div></body></html>`;
    }
    async generateKitchenOrderHTML(orderId) {
        const { order, items } = await this.getReceiptData(orderId);
        const fmtDate = (d) => d ? new Date(d).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) : '-';
        return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><title>ครัว ${order.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Sarabun',sans-serif;font-size:16px;background:#fff;color:#111}.receipt{max-width:320px;margin:0 auto;padding:16px}.header{text-align:center;border:3px double #111;padding:10px;margin-bottom:10px}.table-name{font-size:32px;font-weight:bold}.divider{border:none;border-top:2px dashed #333;margin:8px 0}.item{display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid #eee}.item-name{font-size:20px;font-weight:bold}.item-qty{font-size:28px;font-weight:bold;min-width:50px;text-align:right}.note{font-size:14px;color:#e53e3e;margin-top:3px}@media print{.no-print{display:none}}</style></head>
<body><div class="receipt"><div class="header"><div style="font-size:12px;letter-spacing:3px;margin-bottom:4px">🍳 ใบสั่งครัว — KITCHEN ORDER</div><div class="table-name">${order.tableName}</div><div style="font-size:14px;color:#555">#${order.orderNumber}</div></div>
<div style="font-size:13px;color:#666;text-align:center;margin-bottom:8px">⏰ ${fmtDate(order.createdAt)}</div>
<hr class="divider">
${items.map((i) => `<div class="item"><div><div class="item-name">${i.name}</div>${i.note ? `<div class="note">⚠️ ${i.note}</div>` : ''}</div><div class="item-qty">× ${i.quantity}</div></div>`).join('')}
<hr class="divider"><div style="text-align:center;font-size:16px;margin-top:8px">รวม ${items.reduce((s, i) => s + i.quantity, 0)} รายการ</div>
<div class="no-print" style="margin-top:16px;text-align:center"><button onclick="window.print()" style="padding:10px 24px;background:#1a202c;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:16px">🖨️ พิมพ์ใบสั่งครัว</button></div></div></body></html>`;
    }
};
exports.ReceiptService = ReceiptService;
exports.ReceiptService = ReceiptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReceiptService);
//# sourceMappingURL=receipt.service.js.map