'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API = 'http://localhost:3001';
const CATS = ['วัตถุดิบ','ค่าแรง','ค่าเช่า','สาธารณูปโภค','อุปกรณ์','การตลาด','อื่นๆ'];
const CAT_ICONS: Record<string,string> = { วัตถุดิบ:'🥬', ค่าแรง:'👷', ค่าเช่า:'🏠', สาธารณูปโภค:'💡', อุปกรณ์:'🔧', การตลาด:'📣', อื่นๆ:'📦' };

interface Expense { id: number; title: string; amount: number; category: string; note: string | null; date: string; }
interface PL { revenue: number; vat: number; totalIncome: number; expenses: number; grossProfit: number; orderCount: number; expenseByCategory: Record<string,number>; }

export default function FinancePage() {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pl, setPL] = useState<PL | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'expenses'|'pl'>('pl');
  const [form, setForm] = useState({ title:'', amount:'', category:'วัตถุดิบ', note:'', date: new Date().toISOString().slice(0,10) });
  const [editId, setEditId] = useState<number|null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadData(); }, [month]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [exp, plData] = await Promise.all([
        axios.get(`${API}/finance/expenses?month=${month}`).then(r => r.data),
        axios.get(`${API}/finance/pl/${month}`).then(r => r.data),
      ]);
      setExpenses(exp);
      setPL(plData);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.title || !form.amount) return alert('กรุณากรอกข้อมูลให้ครบ');
    try {
      const data = { ...form, amount: parseFloat(form.amount) };
      if (editId) { await axios.patch(`${API}/finance/expenses/${editId}`, data); }
      else { await axios.post(`${API}/finance/expenses`, data); }
      setForm({ title:'', amount:'', category:'วัตถุดิบ', note:'', date: new Date().toISOString().slice(0,10) });
      setEditId(null); setShowForm(false);
      loadData();
    } catch { alert('❌ เกิดข้อผิดพลาด'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ลบรายการนี้?')) return;
    await axios.delete(`${API}/finance/expenses/${id}`);
    loadData();
  };

  const startEdit = (e: Expense) => {
    setEditId(e.id);
    setForm({ title: e.title, amount: e.amount.toString(), category: e.category, note: e.note||'', date: e.date.slice(0,10) });
    setShowForm(true);
  };

  const fmt = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2 });
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH');

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-slate-400 hover:text-white">← กลับ</button>
        <span className="text-slate-600">|</span>
        <span>💰</span>
        <h1 className="text-xl font-bold">บัญชีการเงิน</h1>
        <div className="ml-auto flex items-center gap-2">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
          <button onClick={() => window.open(`${API}/export/report?start=${month}-01&end=${month}-31`, '_blank')}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium">
            📄 Export PDF
          </button>
          <button onClick={() => window.open(`${API}/export/csv?start=${month}-01&end=${month}-31`, '_blank')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium">
            📊 Export CSV
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* P&L Summary Cards */}
        {pl && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label:'รายรับ (ไม่รวม VAT)', value:`฿${fmt(pl.revenue)}`, color:'text-emerald-400', bg:'bg-emerald-500/10 border-emerald-500/30' },
              { label:'รายจ่ายทั้งหมด', value:`฿${fmt(pl.expenses)}`, color:'text-rose-400', bg:'bg-rose-500/10 border-rose-500/30' },
              { label:pl.grossProfit >= 0 ? 'กำไร 🎉' : 'ขาดทุน ⚠️', value:`฿${fmt(Math.abs(pl.grossProfit))}`, color: pl.grossProfit >= 0 ? 'text-indigo-400' : 'text-amber-400', bg: pl.grossProfit >= 0 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-amber-500/10 border-amber-500/30' },
              { label:'VAT ที่ต้องนำส่ง', value:`฿${fmt(pl.vat)}`, color:'text-amber-400', bg:'bg-amber-500/10 border-amber-500/30' },
            ].map((c,i) => (
              <div key={i} className={`rounded-2xl p-4 border ${c.bg}`}>
                <p className="text-xs text-slate-400 mb-1">{c.label}</p>
                <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700">
          {[{key:'pl',label:'📊 กำไร/ขาดทุน'},{key:'expenses',label:'💸 รายจ่าย'}].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* P&L Tab */}
        {tab === 'pl' && pl && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income vs Expense */}
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <h3 className="font-bold mb-4">📈 สรุปรายรับ-รายจ่าย</h3>
              <div className="space-y-3">
                {[
                  { label:'รายรับจากการขาย', value: pl.revenue, color:'bg-emerald-500' },
                  { label:'รายจ่ายทั้งหมด', value: pl.expenses, color:'bg-rose-500' },
                ].map((row, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{row.label}</span>
                      <span className="font-bold">฿{fmt(row.value)}</span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full`}
                        style={{ width: `${Math.min((row.value / Math.max(pl.revenue, pl.expenses)) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
                <div className="border-t border-slate-600 pt-3 flex justify-between font-bold text-base">
                  <span className={pl.grossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {pl.grossProfit >= 0 ? '✅ กำไรสุทธิ' : '⚠️ ขาดทุน'}
                  </span>
                  <span className={pl.grossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    ฿{fmt(Math.abs(pl.grossProfit))}
                  </span>
                </div>
              </div>
            </div>

            {/* Expense by Category */}
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <h3 className="font-bold mb-4">💸 รายจ่ายแยกตามประเภท</h3>
              <div className="space-y-2">
                {Object.entries(pl.expenseByCategory).sort((a,b) => b[1]-a[1]).map(([cat, amt]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-lg">{CAT_ICONS[cat] || '📦'}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span>{cat}</span>
                        <span className="font-bold">฿{fmt(amt)}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${(amt / pl.expenses) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(pl.expenseByCategory).length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-4">ยังไม่มีรายจ่ายเดือนนี้</p>
                )}
              </div>
            </div>

            {/* VAT Box */}
            <div className="lg:col-span-2 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
              <h3 className="font-bold text-amber-400 mb-3">🧾 สรุปภาษี VAT — ใช้ยื่น ภพ.30</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-xs text-slate-400">ยอดขาย (ไม่รวม VAT)</p><p className="text-lg font-black text-white">฿{fmt(pl.revenue)}</p></div>
                <div><p className="text-xs text-slate-400">VAT Output 7%</p><p className="text-lg font-black text-amber-400">฿{fmt(pl.vat)}</p></div>
                <div><p className="text-xs text-slate-400">ออเดอร์ทั้งหมด</p><p className="text-lg font-black text-white">{pl.orderCount} รายการ</p></div>
              </div>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {tab === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">{editId ? '✏️ แก้ไขรายจ่าย' : '➕ บันทึกรายจ่าย'}</h3>
                <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title:'', amount:'', category:'วัตถุดิบ', note:'', date: new Date().toISOString().slice(0,10) }); }}
                  className="text-indigo-400 text-sm">
                  {showForm ? 'ซ่อน' : 'เพิ่ม +'}
                </button>
              </div>
              {(showForm || editId) && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">รายการ *</label>
                    <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
                      placeholder="เช่น ซื้อวัตถุดิบ, จ่ายค่าแรง"
                      className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">จำนวนเงิน (บาท) *</label>
                    <input type="number" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))}
                      placeholder="0.00"
                      className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">ประเภท</label>
                    <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}
                      className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                      {CATS.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">วันที่</label>
                    <input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))}
                      className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">หมายเหตุ</label>
                    <input value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))}
                      placeholder="รายละเอียดเพิ่มเติม"
                      className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                      บันทึก
                    </button>
                    {editId && (
                      <button onClick={() => { setEditId(null); setShowForm(false); }}
                        className="px-4 rounded-xl bg-slate-700 hover:bg-slate-600">ยกเลิก</button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Expense List */}
            <div className="lg:col-span-2 space-y-2">
              <h3 className="font-bold">รายจ่ายเดือน {month} ({expenses.length} รายการ | รวม ฿{fmt(expenses.reduce((s,e)=>s+e.amount,0))})</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {expenses.length === 0 ? (
                  <div className="text-center py-8 text-slate-400"><p className="text-3xl mb-2">💸</p><p>ยังไม่มีรายจ่าย</p></div>
                ) : expenses.map(exp => (
                  <div key={exp.id} className="bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-700">
                    <span className="text-2xl">{CAT_ICONS[exp.category] || '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{exp.title}</p>
                      <p className="text-xs text-slate-400">{exp.category} · {fmtDate(exp.date)}</p>
                      {exp.note && <p className="text-xs text-slate-500">{exp.note}</p>}
                    </div>
                    <p className="text-rose-400 font-bold">-฿{fmt(exp.amount)}</p>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(exp)} className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs">✏️</button>
                      <button onClick={() => handleDelete(exp.id)} className="px-2 py-1 rounded-lg bg-rose-900/50 hover:bg-rose-800/50 text-rose-400 text-xs">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
