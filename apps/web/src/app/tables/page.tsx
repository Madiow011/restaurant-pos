'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tablesApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Table { id: number; number: number; name: string | null; capacity: number; status: string; }

export default function TablesManagePage() {
  const router = useRouter();
  const isAdmin = useAuthStore(s => s.isAdmin);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ number: '', name: '', capacity: '4' });
  const [editTable, setEditTable] = useState<Table | null>(null);

  useEffect(() => {
    if (!isAdmin()) { router.push('/'); return; }
    fetch();
  }, []);

  const fetch = async () => {
    setLoading(true);
    try { setTables(await tablesApi.getAll()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.number) return alert('กรุณาใส่เลขโต๊ะ');
    try {
      const data = { number: parseInt(form.number), name: form.name || undefined, capacity: parseInt(form.capacity) || 4 };
      if (editTable) { await tablesApi.update(editTable.id, data); }
      else { await tablesApi.create(data); }
      setForm({ number: '', name: '', capacity: '4' });
      setEditTable(null);
      fetch();
    } catch (e: any) { alert(e?.response?.data?.message || '❌ เกิดข้อผิดพลาด'); }
  };

  const handleDelete = async (t: Table) => {
    if (!confirm(`ลบโต๊ะ ${t.name || t.number}?`)) return;
    try { await tablesApi.remove(t.id); fetch(); }
    catch (e: any) { alert(e?.response?.data?.message || '❌ ไม่สามารถลบได้'); }
  };

  const startEdit = (t: Table) => {
    setEditTable(t);
    setForm({ number: t.number.toString(), name: t.name || '', capacity: t.capacity.toString() });
  };

  const STATUS_COLOR: Record<string, string> = {
    AVAILABLE: 'bg-emerald-500/20 text-emerald-400',
    OCCUPIED: 'bg-rose-500/20 text-rose-400',
    RESERVED: 'bg-amber-500/20 text-amber-400',
    CLEANING: 'bg-slate-500/20 text-slate-400',
  };
  const STATUS_LABEL: Record<string, string> = { AVAILABLE:'ว่าง', OCCUPIED:'มีลูกค้า', RESERVED:'จอง', CLEANING:'ทำความสะอาด' };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-slate-400 hover:text-white">← กลับ</button>
        <span className="text-slate-600">|</span>
        <span>🪑</span>
        <h1 className="text-xl font-bold">จัดการโต๊ะ</h1>
      </header>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <h2 className="font-bold text-lg mb-4">{editTable ? '✏️ แก้ไขโต๊ะ' : '➕ เพิ่มโต๊ะใหม่'}</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">เลขโต๊ะ *</label>
              <input type="number" value={form.number} onChange={e => setForm(f => ({...f, number: e.target.value}))}
                placeholder="1, 2, 3..."
                className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">ชื่อโต๊ะ (ไม่บังคับ)</label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="เช่น โต๊ะ VIP, โต๊ะริมหน้าต่าง"
                className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">จำนวนที่นั่ง</label>
              <input type="number" value={form.capacity} onChange={e => setForm(f => ({...f, capacity: e.target.value}))}
                className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                {editTable ? 'บันทึก' : 'เพิ่มโต๊ะ'}
              </button>
              {editTable && (
                <button onClick={() => { setEditTable(null); setForm({ number: '', name: '', capacity: '4' }); }}
                  className="px-4 rounded-xl bg-slate-700 hover:bg-slate-600">
                  ยกเลิก
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table List */}
        <div className="lg:col-span-2 space-y-2">
          <h2 className="font-bold text-lg">โต๊ะทั้งหมด ({tables.length})</h2>
          {loading ? <p className="text-slate-400">กำลังโหลด...</p> :
            tables.map(t => (
              <div key={t.id} className="bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-4 border border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-xl font-black">{t.number}</div>
                <div className="flex-1">
                  <p className="font-medium">{t.name || `โต๊ะ ${t.number}`}</p>
                  <p className="text-xs text-slate-400">👤 {t.capacity} ที่นั่ง</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLOR[t.status]}`}>{STATUS_LABEL[t.status]}</span>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(t)}
                    className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs">✏️</button>
                  <button onClick={() => handleDelete(t)}
                    className="px-3 py-1 rounded-lg bg-rose-900/50 hover:bg-rose-800/50 text-rose-400 text-xs">🗑️</button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
