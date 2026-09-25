import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async getOrdersCSV(startDate?: string, endDate?: string): Promise<string> {
    const where: any = { status: 'PAID' };
    if (startDate) where.paidAt = { ...where.paidAt, gte: new Date(startDate) };
    if (endDate) where.paidAt = { ...where.paidAt, lte: new Date(endDate + 'T23:59:59') };

    const orders: any[] = await this.prisma.order.findMany({
      where,
      include: { table: true, orderItems: { include: { product: true } } },
      orderBy: { paidAt: 'desc' },
    });

    const pmLabel: Record<string, string> = { CASH: 'เงินสด', CREDIT_CARD: 'บัตรเครดิต', QR_CODE: 'QR/พร้อมเพย์' };

    const rows = [
      ['เลขออเดอร์', 'โต๊ะ', 'วันที่ชำระ', 'รายการ', 'ยอดก่อน VAT', 'VAT 7%', 'ยอดรวม', 'ช่องทางชำระ'].join(','),
      ...orders.map(o => {
        const items = o.orderItems.map((i: any) => `${i.product.name}x${i.quantity}`).join(' | ');
        const date = o.paidAt ? new Date(o.paidAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) : '';
        return [
          o.orderNumber,
          `"${o.table?.name || `โต๊ะ ${o.table?.number}`}"`,
          `"${date}"`,
          `"${items}"`,
          o.subtotal.toFixed(2),
          o.vatAmount.toFixed(2),
          o.totalAmount.toFixed(2),
          pmLabel[o.paymentMethod] || o.paymentMethod || '',
        ].join(',');
      }),
    ];

    // BOM สำหรับ Excel ภาษาไทย
    return '\uFEFF' + rows.join('\n');
  }

  async getSummaryHTML(startDate?: string, endDate?: string): Promise<string> {
    const where: any = { status: 'PAID' };
    if (startDate) where.paidAt = { ...where.paidAt, gte: new Date(startDate) };
    if (endDate) where.paidAt = { ...where.paidAt, lte: new Date(endDate + 'T23:59:59') };

    const orders: any[] = await this.prisma.order.findMany({
      where,
      include: { table: true, orderItems: { include: { product: { include: { category: true } } } } },
      orderBy: { paidAt: 'desc' },
    });

    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalVat = orders.reduce((s, o) => s + o.vatAmount, 0);
    const totalSubtotal = orders.reduce((s, o) => s + o.subtotal, 0);
    const fmt = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2 });

    // Top products
    const prodMap = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of orders) {
      for (const i of o.orderItems) {
        const key = i.product.name;
        if (!prodMap.has(key)) prodMap.set(key, { name: key, qty: 0, revenue: 0 });
        prodMap.get(key)!.qty += i.quantity;
        prodMap.get(key)!.revenue += i.subtotal;
      }
    }
    const topProds = [...prodMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 10);

    const dateRange = startDate && endDate ? `${startDate} ถึง ${endDate}` : 'ทั้งหมด';

    return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8">
<title>รายงานยอดขาย</title>
<style>
body{font-family:'Sarabun',sans-serif;margin:0;padding:20px;color:#111;font-size:14px}
h1{font-size:20px;margin-bottom:4px}
.sub{color:#666;font-size:13px;margin-bottom:20px}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
.card{background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;padding:12px;text-align:center}
.card-val{font-size:20px;font-weight:bold;color:#4f46e5}
.card-label{font-size:12px;color:#666;margin-top:4px}
table{width:100%;border-collapse:collapse;margin-top:12px}
th{background:#f0f0f0;border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}
td{border:1px solid #ddd;padding:7px;font-size:13px}
tr:nth-child(even){background:#fafafa}
.vat-box{background:#fff8e1;border:1px solid #f59e0b;border-radius:8px;padding:12px;margin-top:20px}
@media print{.no-print{display:none}}
</style>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
</head><body>
<h1>📊 รายงานยอดขาย</h1>
<div class="sub">ช่วงเวลา: ${dateRange} | จำนวนออเดอร์: ${orders.length} รายการ</div>

<div class="cards">
  <div class="card"><div class="card-val">฿${fmt(totalSubtotal)}</div><div class="card-label">ยอดขายก่อน VAT</div></div>
  <div class="card"><div class="card-val" style="color:#f59e0b">฿${fmt(totalVat)}</div><div class="card-label">VAT 7% (นำส่งสรรพากร)</div></div>
  <div class="card"><div class="card-val" style="color:#10b981">฿${fmt(totalRevenue)}</div><div class="card-label">ยอดรวมทั้งหมด</div></div>
</div>

<h3>เมนูขายดี Top 10</h3>
<table>
  <thead><tr><th>#</th><th>รายการ</th><th style="text-align:center">จำนวน</th><th style="text-align:right">รายรับ</th></tr></thead>
  <tbody>${topProds.map((p, i) => `<tr><td>${i+1}</td><td>${p.name}</td><td style="text-align:center">${p.qty}</td><td style="text-align:right">฿${fmt(p.revenue)}</td></tr>`).join('')}</tbody>
</table>

<div class="vat-box" style="margin-top:20px">
  <strong>🧾 สรุปภาษีมูลค่าเพิ่ม (VAT) — ใช้ประกอบการยื่น ภพ.30</strong><br><br>
  ยอดขาย (ไม่รวม VAT): <strong>฿${fmt(totalSubtotal)}</strong><br>
  VAT Output (7%): <strong>฿${fmt(totalVat)}</strong><br>
  ยอดรวมทั้งสิ้น: <strong>฿${fmt(totalRevenue)}</strong>
</div>

<div class="no-print" style="margin-top:20px;display:flex;gap:8px">
  <button onclick="window.print()" style="padding:8px 20px;background:#4f46e5;color:#fff;border:none;border-radius:6px;cursor:pointer">🖨️ พิมพ์รายงาน</button>
</div>
</body></html>`;
  }
}
