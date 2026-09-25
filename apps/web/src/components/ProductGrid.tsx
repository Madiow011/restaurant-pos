'use client';
import { Product } from '@/types';

interface Props { products: Product[]; onAddToCart: (product: Product) => void; }

export default function ProductGrid({ products, onAddToCart }: Props) {
  const active = products.filter(p => p.isActive);
  if (!active.length) return (
    <div className="flex items-center justify-center h-40 text-slate-500">
      <p>ไม่มีรายการในหมวดนี้</p>
    </div>
  );
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
      {active.map(product => (
        <button key={product.id} onClick={() => onAddToCart(product)}
          className="group bg-slate-700 hover:bg-slate-600 rounded-xl p-4 text-left transition-all active:scale-95 border border-slate-600 hover:border-indigo-500">
          <div className="w-full aspect-square bg-slate-600 group-hover:bg-slate-500 rounded-lg mb-3 flex items-center justify-center text-3xl">
            {product.category?.icon || '🍴'}
          </div>
          <p className="text-sm font-semibold text-white mb-1 leading-tight">{product.name}</p>
          {product.description && <p className="text-xs text-slate-400 mb-1 truncate">{product.description}</p>}
          <p className="text-base font-bold text-indigo-400">฿{product.price.toFixed(0)}</p>
        </button>
      ))}
    </div>
  );
}
