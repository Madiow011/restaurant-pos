'use client';
import { useEffect, useState, use } from 'react';
import { categoriesApi, productsApi, tablesApi } from '@/lib/api';
import { Category, Product, Table } from '@/types';
import CategoryBar from '@/components/CategoryBar';
import ProductGrid from '@/components/ProductGrid';
import CartPanel from '@/components/CartPanel';
import { useCartStore } from '@/store/cartStore';

export default function POSPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params);
  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { setTable: setCartTable, addItem } = useCartStore();

  useEffect(() => {
    const id = parseInt(tableId);
    setCartTable(id);
    const load = async () => {
      try {
        const [tableData, catsData, prodsData] = await Promise.all([
          tablesApi.getOne(id),
          categoriesApi.getAll(),
          productsApi.getAll(),
        ]);
        setTable(tableData);
        setCategories(catsData);
        setProducts(prodsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tableId]);

  useEffect(() => {
    productsApi.getAll(selectedCategory ?? undefined).then(setProducts);
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🍽️</div>
          <p>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col overflow-hidden">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white">
              {table?.name || `โต๊ะ ${table?.number}`}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              table?.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {table?.status === 'AVAILABLE' ? 'ว่าง' : 'มีลูกค้า'}
            </span>
          </div>
          <p className="text-xs text-slate-400">{table?.capacity} ที่นั่ง</p>
        </div>
        <div className="text-2xl">🍽️</div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-3 pb-2 flex-shrink-0">
            <CategoryBar categories={categories} selectedId={selectedCategory} onSelect={setSelectedCategory} />
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <ProductGrid products={products} onAddToCart={addItem} />
          </div>
        </div>
        <div className="w-72 xl:w-80 flex-shrink-0 relative">
          <CartPanel tableId={parseInt(tableId)} tableName={table?.name || `โต๊ะ ${table?.number}`} />
        </div>
      </div>
    </div>
  );
}
