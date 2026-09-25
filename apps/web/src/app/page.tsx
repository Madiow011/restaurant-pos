'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tablesApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Table } from '@/types';

const STATUS = {
  AVAILABLE: { label:'ว่าง', bg:'bg-emerald-500', text:'text-white', ring:'ring-emerald-400' },
  OCCUPIED:  { label:'มีลูกค้า', bg:'bg-rose-500', text:'text-white', ring:'ring-rose-400' },
  RESERVED:  { label:'จอง', bg:'bg-amber-400', text:'text-amber-900', ring:'ring-amber-300' },
  CLEANING:  { label:'ทำความสะอาด', bg:'bg-slate-500', text:'text-white', ring:'ring-slate-400' },
};

export default function TableSelectionPage() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuthStore();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchTables();
    const t = setInterval(fetchTables, 10000);
    return () => clearInterval(t);
  }, [user]);

  const fetchTables = async () => {
    try { setTables(await tablesApi.getAll()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (!user) return null;

  const available = tables.filter(t => t.status === 'AVAILABLE').length;
  const occupied  = tables.filter(t => t.status === 'OCCUPIED').length;

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <div>
            <h1 className="text-lg font-bold">Restaurant POS</h1>
            <p className="text-xs text-slate-400">เลือกโต๊ะเพื่อเริ่มรับออเดอร์</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs">✅ ว่าง {available}</span>
          <span className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs">🔴 มีลูกค้า {occupied}</span>
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-1.5">
          <button onClick={fetchTables} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white" title="รีเฟรช">🔄</button>
          <button onClick={() => router.push('/orders')}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 hover:text-white transition-colors">
            📋 ออเดอร์
          </button>
          <button onClick={() => router.push('/dashboard')}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 hover:text-white transition-colors">
            📊 Dashboard
          </button>
          <button onClick={() => router.push('/finance')}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 hover:text-white transition-colors">
            💰 บัญชี
          </button>
          {isAdmin() && (
            <>
              <button onClick={() => router.push('/admin')}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 hover:text-white transition-colors">
                ⚙️ เมนู
              </button>
              <button onClick={() => router.push('/tables')}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 hover:text-white transition-colors">
                🪑 โต๊ะ
              </button>
            </>
          )}
          {/* User badge */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-600">
            <span className="text-xs text-slate-300">
              {user.role === 'admin' ? '👑' : '👤'} {user.name}
            </span>
            <button onClick={handleLogout}
              className="px-2 py-1 bg-slate-700 hover:bg-rose-900/50 hover:text-rose-400 rounded-lg text-xs text-slate-400 transition-colors">
              ออก
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <div className="text-center"><div className="text-4xl mb-3 animate-pulse">🍽️</div><p>กำลังโหลด...</p></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map(table => {
              const cfg = STATUS[table.status as keyof typeof STATUS];
              return (
                <button key={table.id}
                  onClick={() => table.status !== 'CLEANING' && router.push(`/pos/${table.id}`)}
                  disabled={table.status === 'CLEANING'}
                  className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 bg-slate-800 ring-2 ${cfg.ring} transition-all duration-200 ${table.status !== 'CLEANING' ? 'hover:scale-105 hover:shadow-xl cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}>
                  <div className={`absolute top-2 right-2 ${cfg.bg} ${cfg.text} text-xs px-2 py-0.5 rounded-full font-medium`}>{cfg.label}</div>
                  <div className="text-4xl font-black">{table.number}</div>
                  <div className="text-xs text-slate-400">{table.name || `โต๊ะ ${table.number}`}</div>
                  <div className="text-xs text-slate-500">👤 {table.capacity} ที่นั่ง</div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
