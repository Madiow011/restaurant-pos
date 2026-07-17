import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SHOP_NAME = 'ร้านอาหาร Demo';
const SHOP_ADDRESS = '123 ถ.สุขุมวิท กรุงเทพฯ 10110';
const SHOP_PHONE = '02-123-4567';
const TAX_ID = '1234567890123';

@Injectable()
export class ReceiptService {
  constructor(private prisma: PrismaService) {}

  async getReceiptData(orderId: number) {
    const order: any = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
        orderItems: { include: { product: { include: { category: true } } } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    return {
      shop: { name: SHOP_NAME, address: SHOP_ADDRESS, phone: SHOP_PHONE, taxId: TAX_ID },
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        tableName: order.table?.name || `โต๊ะ ${order.table?.number}`,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
      },
      items: order.orderItems.map((item: any) => ({
        name: item.product.name,
        category: item.product.category?.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        note: item.note,
      })),
      summary: {
        subtotal: order.subtotal,
        vatRate: order.vatRate,
        vatAmount: order.vatAmount,
        totalAmount: order.totalAmount,
      },
    };
  }

  async generateReceiptHTML(orderId: number): Promise<string> {
    const data = await this.getReceiptData(orderId);
    const { shop, order, items, summary } = data;

    const formatMoney = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2 });
    const formatDate = (d: any) => d ? new Date(d).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) : '-';

    const paymentMethodLabel: Record<string, string> = {
      CASH: 'เงินสด', CREDIT_CARD: 'บัตรเครดิต', QR_CODE: 'QR Code / พร้อมเพย์',
    };

    const itemsHTML = items.map((item: any) => `
      <tr>
        <td style="padding:4px 0;">${item.name}${item.note ? `<br><small style="color:#666">(${item.note})</small>` : ''}</td>
        <td style="text-align:center;padding:4px 8px;">${item.quantity}</td>
        <td style="text-align:right;padding:4px 0;">${formatMoney(item.unitPrice)}</td>
        <td style="text-align:right;padding:4px 0;">${formatMoney(item.subtotal)}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ใบเสร็จ ${order.orderNumber}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Sarabun', 'TH Sarabun New', sans-serif; font-size:14px; color:#111; background:#fff; }
  .receipt { max-width:320px; margin:0 auto; padding:16px; }
  .center { text-align:center; }
  .shop-name { font-size:18px; font-weight:bold; margin-bottom:2px; }
  .divider { border:none; border-top:1px dashed #999; margin:8px 0; }
  .divider-solid { border:none; border-top:2px solid #111; margin:8px 0; }
  table { width:100%; border-collapse:collapse; }
  th { font-size:12px; border-bottom:1px solid #ccc; padding:4px 0; }
  .summary-row td { padding:3px 0; }
  .total-row td { font-weight:bold; font-size:16px; border-top:2px solid #111; padding-top:6px; }
  .vat-label { font-size:11px; color:#666; }
  .footer { font-size:11px; color:#666; text-align:center; margin-top:12px; }
  @media print {
    body { font-size:12px; }
    .receipt { max-width:80mm; padding:4px; }
    .no-print { display:none; }
  }
</style>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
<div class="receipt">
  <div class="center">
    <div class="shop-name">${shop.name}</div>
    <div>${shop.address}</div>
    <div>โทร: ${shop.phone}</div>
    <div style="font-size:11px;color:#666;">เลขผู้เสียภาษี: ${shop.taxId}</div>
  </div>
  <hr class="divider">
  <table>
    <tr><td><strong>เลขที่:</strong> ${order.orderNumber}</td><td style="text-align:right"><strong>${order.tableName}</strong></td></tr>
    <tr><td colspan="2" style="font-size:12px;color:#666;">วันที่: ${formatDate(order.createdAt)}</td></tr>
    ${order.paidAt ? `<tr><td colspan="2" style="font-size:12px;color:#666;">ชำระเมื่อ: ${formatDate(order.paidAt)}</td></tr>` : ''}
    ${order.paymentMethod ? `<tr><td colspan="2" style="font-size:12px;">ช่องทาง: ${paymentMethodLabel[order.paymentMethod] || order.paymentMethod}</td></tr>` : ''}
  </table>
  <hr class="divider">
  <table>
    <thead>
      <tr>
        <th style="text-align:left;">รายการ</th>
        <th style="text-align:center;">จำนวน</th>
        <th style="text-align:right;">ราคา</th>
        <th style="text-align:right;">รวม</th>
      </tr>
    </thead>
    <tbody>${itemsHTML}</tbody>
  </table>
  <hr class="divider">
  <table class="summary">
    <tr class="summary-row">
      <td>ยอดรวมก่อน VAT</td>
      <td style="text-align:right;">${formatMoney(summary.subtotal)} บาท</td>
    </tr>
    <tr class="summary-row">
      <td><span class="vat-label">VAT ${(summary.vatRate * 100).toFixed(0)}%</span></td>
      <td style="text-align:right;">${formatMoney(summary.vatAmount)} บาท</td>
    </tr>
    <tr class="total-row">
      <td>ยอดรวมทั้งสิ้น</td>
      <td style="text-align:right;">${formatMoney(summary.totalAmount)} บาท</td>
    </tr>
  </table>
  <hr class="divider">
  <div class="footer">
    <p>*** ขอบคุณที่ใช้บริการ ***</p>
    <p>ใบเสร็จนี้สามารถใช้เป็นหลักฐาน</p>
    <p>การชำระเงินและการคำนวณภาษี</p>
  </div>
  <div class="no-print" style="margin-top:16px;text-align:center;">
    <button onclick="window.print()" style="padding:8px 24px;background:#4f46e5;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;">🖨️ พิมพ์ใบเสร็จ</button>
  </div>
</div>
</body>
</html>`;
  }
}
