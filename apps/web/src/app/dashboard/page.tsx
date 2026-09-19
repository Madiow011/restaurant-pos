'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API = 'http://localhost:3001';

interface DayStat { date: string; label: string; revenue: number; orders: number; vat: number; }
interface Summary { orders: number; revenue: number; vat: number; subtotal: number; }
interface TopProduct { id: number; name: string; category: string; icon: string; price: number; qty: number; revenue: number; }
interface CatStat { id: number; name: string; icon: string; qty: number; revenue: number; }

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'week' | 'month'>('week');
  const [daily, setDaily] = useState<DayStat[]>([]);
  const [monthly, setMonthly] = useState<DayStat[]>([]);
  const [today, setToday] = useState<Summary | null>(null);
  const [thisMonth, setThisMonth] = useState<Summary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [catStats, setCatStats] = useState<CatStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [d, m, t, tm, tp, cs] = await Promise.all([
          axios.get(`${API}/reports/daily?days=7`).then(r => r.data),
          axios.get(`${API}/reports/monthly?months=6`).then(r => r.data),
          axios.get(`${API}/reports/summary/today`).then(r => r.data),
          axios.get(`${API}/reports/summary/month`).then(r => r.data),
          axios.get(`${API}/reports/top-products?limit=8`).then(r => r.data),
          axios.get(`${API}/reports/categories`).then(r => r.data),
        ]);
        setDaily(d); setMonthly(m); setToday(t); setThisMonth(tm);
        setTopProducts(tp); setCatStats(cs);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const fmt = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2 });
  const fmtShort = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : n.toFixed(0);

  const data = tab === 'week' ? daily : monthly;
  const maxRev = Math.max(...data.map(d => d.revenue), 1);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-slate-400 hover:text-white">← กลับ</button>
          <span className="text-slate-600">|</span>
          <span className="text-xl">📊</span>
          <h1 className="text-xl font-bold">รายงานยอดขาย</h1>
        </div>
        <button onClick={() => window.location.reload()} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg">🔄</button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center"><div className="text-4xl mb-3 animate-pulse">📊</div><p>กำลังโหลดข้อมูล...</p></div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto p-6 space-y-6">

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'ยอดขายวันนี้', value: `฿${fmt(today?.revenue || 0)}`, sub: `${today?.orders || 0} ออเดอร์`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
              { label: 'ยอดขายเดือนนี้', value: `฿${fmt(thisMonth?.revenue || 0)}`, sub: `${thisMonth?.orders || 0} ออเดอร์`, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
              { label: 'VAT วันนี้ (7%)', value: `฿${fmt(today?.vat || 0)}`, sub: 'ภาษีมูลค่าเพิ่ม', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
              { label: 'VAT เดือนนี้ (7%)', value: `฿${fmt(thisMonth?.vat || 0)}`, sub: 'ภาษีมูลค่าเพิ่ม', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
            ].map((card, i) => (
              <div key={i} className={`rounded-2xl p-4 border ${card.bg}`}>
                <p className="text-xs text-slate-400 mb-1">{card.label}</p>
                <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
                <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Graph */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">📈 กราฟยอดขาย</h2>
              <div className="flex gap-2">
                {(['week','month'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                    {t === 'week' ? '7 วัน' : '6 เดือน'}
                  </button>
                ))}
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end gap-2 h-48 mt-2">
              {data.map((d, i) => {
                const h = maxRev > 0 ? (d.revenue / maxRev) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex justify-center">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 bg-slate-700 rounded-lg px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <p className="font-bold text-white">฿{fmt(d.revenue)}</p>
                        <p className="text-slate-400">{d.orders} ออเดอร์</p>
                      </div>
                      <div
                        className="w-full rounded-t-lg bg-indigo-500 hover:bg-indigo-400 transition-all duration-300 min-h-[4px]"
                        style={{ height: `${Math.max(h, 2)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 text-center leading-tight">{d.label}</span>
                    <span className="text-xs text-indigo-400 font-medium">{fmtShort(d.revenue)}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-500 inline-block"></span> ยอดขายรวม (VAT)</span>
              <span>รวม: ฿{fmt(data.reduce((s,d) => s + d.revenue, 0))}</span>
              <span>VAT: ฿{fmt(data.reduce((s,d) => s + d.vat, 0))}</span>
            </div>
          </div>

          {/* Top Products + Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <h2 className="font-bold text-lg mb-4">🏆 เมนูขายดี Top 8</h2>
              <div className="space-y-2">
                {topProducts.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">ยังไม่มีข้อมูล</p>
                ) : topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < 3 ? 'bg-amber-500 text-amber-900' : 'bg-slate-700 text-slate-400'}`}>
                      {i + 1}
                    </span>
                    <span className="text-lg flex-shrink-0">{p.icon || '🍴'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(p.qty / (topProducts[0]?.qty || 1)) * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-amber-400">{p.qty} ชิ้น</p>
                      <p className="text-xs text-slate-400">฿{fmt(p.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Stats */}
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <h2 className="font-bold text-lg mb-4">📂 ยอดขายตามหมวดหมู่</h2>
              <div className="space-y-3">
                {catStats.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">ยังไม่มีข้อมูล</p>
                ) : catStats.map((c, i) => {
                  const maxCat = catStats[0]?.revenue || 1;
                  return (
                    <div key={c.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm flex items-center gap-2">
                          <span>{c.icon || '📂'}</span>
                          <span>{c.name}</span>
                        </span>
                        <span className="text-sm font-bold text-emerald-400">฿{fmt(c.revenue)}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${(c.revenue / maxCat) * 100}%` }} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{c.qty} รายการ</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* VAT Summary */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-amber-500/20">
            <h2 className="font-bold text-lg mb-4">🧾 สรุปภาษี VAT เดือนนี้</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-400 mb-1">ยอดขายก่อน VAT</p>
                <p className="text-xl font-black text-white">฿{fmt(thisMonth?.subtotal || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">VAT 7% ที่ต้องนำส่ง</p>
                <p className="text-xl font-black text-amber-400">฿{fmt(thisMonth?.vat || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">ยอดรวมทั้งหมด</p>
                <p className="text-xl font-black text-emerald-400">฿{fmt(thisMonth?.revenue || 0)}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center mt-3">ข้อมูลนี้ใช้ประกอบการยื่นภาษีมูลค่าเพิ่ม (ภพ.30) ประจำเดือน</p>
          </div>

        </div>
      )}
    </div>
  );
}
