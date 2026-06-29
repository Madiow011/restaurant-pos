'use client';
import { Category } from '@/types';

interface Props {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export default function CategoryBar({ categories, selectedId, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
          ${selectedId === null
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
      >
        <span>🍽️</span>
        <span>ทั้งหมด</span>
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
            ${selectedId === cat.id
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
        >
          <span>{cat.icon || '🍴'}</span>
          <span>{cat.name}</span>
          {cat._count && (
            <span className="text-xs opacity-60">({cat._count.products})</span>
          )}
        </button>
      ))}
    </div>
  );
}
