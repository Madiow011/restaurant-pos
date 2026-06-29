'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tablesApi } from '@/lib/api';
import { Table } from '@/types';

const STATUS_CONFIG = {
  AVAILABLE:  { label: 'ว่าง',    bg: 'bg-emerald-500', text: 'text-white',      ring: 'ring-emerald-300' },
  OCCUPIED:   { label: 'มีลูกค้า', bg: 'bg-rose-500',    text: 'text-white',      ring: 'ring-rose-300'    },
  RESERVED:   { label: 'จอง',     bg: 'bg-amber-400',   text: 'text-amber-900',  ring: 'ring-amber-200'   },
  CLEANING:   { label: 'ทำความสะอาด', bg: 'bg-slate-400', text: 'text-white',    ring: 'ring-slate-300'   },
};

export default function TableSelectionPage() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTables = async () => {
    try {
      const data = await tablesApi.getAll();
      setTables(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTableClick = (table: Table) => {
    if (table.status === 'CLEANING') return;
    router.push(`/pos/${table.id}`);
  };

  const available = tables.filter(t => t.status === 'AVAILABLE').length;
  const occupied  = tables.filter(t => t.status === 'OCCUPIED').length;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Restaurant POS</h1>
            <p className="text-xs text-slate-400">เลือกโต๊ะเพื่อเริ่มรับออเดอร์</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>ว่าง {available} โต๊ะ</span>
          </div>
          <div className="flex items-center gap-2 bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>มีลูกค้า {occupied} โต๊ะ</span>
          </div>
          <button onClick={fetchTables} className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="รีเฟรช">
            🔄
          </button>
        </div>
      </header>

      {/* Table Grid */}
      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <div className="text-center">
              <div className="text-4xl mb-3 animate-pulse">🍽️</div>
              <p>กำลังโหลด...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map((table) => {
              const config = STATUS_CONFIG[table.status];
              const isDisabled = table.status === 'CLEANING';
              return (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  disabled={isDisabled}
                  className={`
                    relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2
                    ring-2 transition-all duration-200
                    ${config.ring} ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl cursor-pointer'}
                    ${table.status === 'AVAILABLE' ? 'bg-slate-800 hover:bg-slate-750' : 'bg-slate-800'}
                  `}
                >
                  {/* Status badge */}
                  <div className={`absolute top-2 right-2 ${config.bg} ${config.text} text-xs px-2 py-0.5 rounded-full font-medium`}>
                    {config.label}
                  </div>

                  {/* Table number */}
                  <div className="text-4xl font-black text-white">{table.number}</div>
                  <div className="text-xs text-slate-400">{table.name || `โต๊ะ ${table.number}`}</div>

                  {/* Capacity */}
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <span>👤</span>
                    <span>{table.capacity} ที่นั่ง</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
