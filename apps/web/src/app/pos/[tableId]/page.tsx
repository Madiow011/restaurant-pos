'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { categoriesApi, productsApi, tablesApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Category, Product, Table } from '@/types';
import CategoryBar from '@/components/CategoryBar';
import ProductGrid from '@/components/ProductGrid';
import CartPanel from '@/components/CartPanel';

export default function POSPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false); // Mobile: toggle cart
  const { setTable: setCartTable, addItem, itemCount } = useCartStore();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    const id = parseInt(tableId);
    setCartTable(id);
    Promise.all([tablesApi.getOne(id), categoriesApi.getAll(), productsApi.getAll()])
      .then(([t, c, p]) => { setTable(t); setCategories(c); setProducts(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tableId]);

  useEffect(() => {
    productsApi.getAll(selectedCategory ?? undefined).then(setProducts).catch(console.error);
  }, [selectedCategory]);

  if (!user || loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
      <div className="text-center"><div className="text-5xl mb-4 animate-pulse">🍽️</div><p>กำลังโหลด...</p></div>
    </div>
  );

  const count = itemCount();

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => router.push('/')} className="text-slate-400 hover:text-white text-sm">←</button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black">{table?.name || `โต๊ะ ${table?.number}`}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${table?.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {table?.status === 'AVAILABLE' ? 'ว่าง' : 'มีลูกค้า'}
            </span>
          </div>
          <p className="text-xs text-slate-400">{table?.capacity} ที่นั่ง · {user.name}</p>
        </div>
        {/* Mobile cart toggle */}
        <button onClick={() => setShowCart(!showCart)}
          className="relative md:hidden p-2 bg-indigo-600 rounded-xl">
          🛒
          {count > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-xs flex items-center justify-center font-bold">
              {count}
            </span>
          )}
        </button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Menu panel */}
        <div className={`flex-1 flex flex-col overflow-hidden ${showCart ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 pt-3 pb-2 flex-shrink-0">
            <CategoryBar categories={categories} selectedId={selectedCategory} onSelect={setSelectedCategory} />
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <ProductGrid products={products} onAddToCart={addItem} />
          </div>
        </div>

        {/* Cart panel */}
        <div className={`w-72 xl:w-80 flex-shrink-0 ${showCart ? 'flex flex-col w-full md:w-80' : 'hidden md:flex md:flex-col'}`}>
          <CartPanel tableId={parseInt(tableId)} tableName={table?.name || `โต๊ะ ${table?.number}`} />
        </div>
      </div>
    </div>
  );
}
