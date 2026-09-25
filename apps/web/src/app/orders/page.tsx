'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api';

interface Order {
  id: number; orderNumber: string; status: string; totalAmount: number;
  vatAmount: number; paymentMethod: string | null; createdAt: string; paidAt: string | null;
  table: { name: string | null; number: number };
  orderItems: { quantity: number; unitPrice: number; subtotal: number; product: { name: string } }[];
}

const STATUS_STYLE: Record<string, string> = {
  OPEN: 'bg-indigo-500/20 text-indigo-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  READY: 'bg-amber-500/20 text-amber-400',
  PAID: 'bg-emerald-500/20 text-emerald-400',
  CANCELLED: 'bg-slate-500/20 text-slate-400',
};
const STATUS_LABEL: Record<string, string> = { OPEN:'เปิด', CONFIRMED:'ยืนยัน', READY:'พร้อมเสิร์ฟ', PAID:'ชำระแล้ว', CANCELLED:'ยกเลิก' };
const PM_LABEL: Record<string, string> = { CASH:'เงินสด', CREDIT_CARD:'บัตรเครดิต', QR_CODE:'พร้อมเพย์' };

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    setLoading(true);
    try { setOrders(await ordersApi.getAll(filter || undefined)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fmt = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2 });
  const fmtDate = (d: string) => new Date(d).toLocaleString('th-TH');

  const filtered = search
    ? orders.filter(o => o.orderNumber.includes(search) || o.table.name?.includes(search) || `โต๊ะ ${o.table.number}`.includes(search))
    : orders;

  const totalRevenue = orders.filter(o => o.status === 'PAID').reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-slate-400 hover:text-white">← กลับ</button>
        <span className="text-slate-600">|</span>
        <span>📋</span>
        <h1 className="text-xl font-bold">ประวัติออเดอร์</h1>
        <span className="ml-auto text-sm text-slate-400">รวมชำระแล้ว: <span className="text-emerald-400 font-bold">฿{fmt(totalRevenue)}</span></span>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 ค้นหาเลขออเดอร์ / โต๊ะ..."
            className="flex-1 min-w-48 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
          {['', 'OPEN', 'PAID', 'CANCELLED'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
              {s === '' ? 'ทั้งหมด' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? <p className="text-slate-400 text-center py-8">กำลังโหลด...</p> :
          filtered.length === 0 ? <p className="text-slate-400 text-center py-8">ไม่พบออเดอร์</p> :
          filtered.map(order => (
            <div key={order.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-slate-750"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{order.orderNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
                    {order.paymentMethod && <span className="text-xs text-slate-400">{PM_LABEL[order.paymentMethod]}</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {order.table.name || `โต๊ะ ${order.table.number}`} · {fmtDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-400">฿{fmt(order.totalAmount)}</p>
                  <p className="text-xs text-slate-500">VAT ฿{fmt(order.vatAmount)}</p>
                </div>
                <span className="text-slate-400">{expanded === order.id ? '▲' : '▼'}</span>
              </div>

              {expanded === order.id && (
                <div className="border-t border-slate-700 px-4 py-3 space-y-2">
                  <table className="w-full text-sm">
                    <thead><tr className="text-slate-400 text-xs"><th className="text-left py-1">รายการ</th><th className="text-center">จำนวน</th><th className="text-right">ราคา</th><th className="text-right">รวม</th></tr></thead>
                    <tbody>
                      {order.orderItems.map((item, i) => (
                        <tr key={i}><td className="py-1">{item.product.name}</td><td className="text-center">{item.quantity}</td><td className="text-right">฿{fmt(item.unitPrice)}</td><td className="text-right">฿{fmt(item.subtotal)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex gap-2 pt-2 border-t border-slate-700">
                    <button onClick={() => window.open(`http://localhost:3001/receipt/${order.id}/customer`, '_blank')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-400 text-xs">
                      🧾 ใบเสร็จลูกค้า
                    </button>
                    <button onClick={() => window.open(`http://localhost:3001/receipt/${order.id}/kitchen`, '_blank')}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs">
                      🖨️ ใบสั่งครัว
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
