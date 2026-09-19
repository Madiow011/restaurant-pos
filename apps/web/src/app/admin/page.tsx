'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API = 'http://localhost:3001';

interface Category { id: number; name: string; icon: string | null; isActive: boolean; sortOrder: number; _count?: { products: number }; }
interface Product { id: number; name: string; price: number; description: string | null; isActive: boolean; sortOrder: number; categoryId: number; category?: Category; }

const ICONS = ['🍛','🍜','🍝','🍣','🍱','🍔','🍟','🌮','🥗','🥘','🍲','🥩','🍗','🦐','🥚','🍳','🥞','🧀','🍕','🌯','🥪','🍤','🦞','🍦','🍰','🎂','🍮','🍭','☕','🧋','🥤','🍵','🍺','🧃','🥛','🍷'];

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'categories' | 'products'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Category form
  const [catForm, setCatForm] = useState({ name: '', icon: '🍛', sortOrder: 0 });
  const [editCat, setEditCat] = useState<Category | null>(null);

  // Product form
  const [prodForm, setProdForm] = useState({ name: '', price: '', categoryId: '', description: '', sortOrder: 0 });
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [filterCat, setFilterCat] = useState<number | null>(null);

  const [showIconPicker, setShowIconPicker] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        axios.get(`${API}/categories`).then(r => r.data),
        axios.get(`${API}/products`).then(r => r.data),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // ===== Category Actions =====
  const saveCat = async () => {
    if (!catForm.name.trim()) return alert('กรุณาใส่ชื่อหมวดหมู่');
    try {
      if (editCat) {
        await axios.patch(`${API}/categories/${editCat.id}`, catForm);
      } else {
        await axios.post(`${API}/categories`, catForm);
      }
      setCatForm({ name: '', icon: '🍛', sortOrder: 0 });
      setEditCat(null);
      fetchAll();
    } catch (e) { alert('❌ เกิดข้อผิดพลาด'); }
  };

  const deleteCat = async (id: number, name: string) => {
    if (!confirm(`ลบหมวดหมู่ "${name}" ?`)) return;
    try { await axios.delete(`${API}/categories/${id}`); fetchAll(); }
    catch (e) { alert('❌ เกิดข้อผิดพลาด'); }
  };

  const startEditCat = (cat: Category) => {
    setEditCat(cat);
    setCatForm({ name: cat.name, icon: cat.icon || '🍛', sortOrder: cat.sortOrder });
    setTab('categories');
    window.scrollTo(0, 0);
  };

  // ===== Product Actions =====
  const saveProd = async () => {
    if (!prodForm.name.trim()) return alert('กรุณาใส่ชื่อเมนู');
    if (!prodForm.price || isNaN(parseFloat(prodForm.price))) return alert('กรุณาใส่ราคา');
    if (!prodForm.categoryId) return alert('กรุณาเลือกหมวดหมู่');
    try {
      const data = {
        name: prodForm.name,
        price: parseFloat(prodForm.price),
        categoryId: parseInt(prodForm.categoryId),
        description: prodForm.description || undefined,
        sortOrder: prodForm.sortOrder,
      };
      if (editProd) {
        await axios.patch(`${API}/products/${editProd.id}`, data);
      } else {
        await axios.post(`${API}/products`, data);
      }
      setProdForm({ name: '', price: '', categoryId: '', description: '', sortOrder: 0 });
      setEditProd(null);
      fetchAll();
    } catch (e) { alert('❌ เกิดข้อผิดพลาด'); }
  };

  const deleteProd = async (id: number, name: string) => {
    if (!confirm(`ลบเมนู "${name}" ?`)) return;
    try { await axios.delete(`${API}/products/${id}`); fetchAll(); }
    catch (e) { alert('❌ เกิดข้อผิดพลาด'); }
  };

  const toggleProd = async (prod: Product) => {
    try {
      await axios.patch(`${API}/products/${prod.id}`, { isActive: !prod.isActive });
      fetchAll();
    } catch (e) { alert('❌ เกิดข้อผิดพลาด'); }
  };

  const startEditProd = (prod: Product) => {
    setEditProd(prod);
    setProdForm({
      name: prod.name,
      price: prod.price.toString(),
      categoryId: prod.categoryId.toString(),
      description: prod.description || '',
      sortOrder: prod.sortOrder,
    });
    setTab('products');
    window.scrollTo(0, 0);
  };

  const filteredProducts = filterCat ? products.filter(p => p.categoryId === filterCat) : products;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-slate-400 hover:text-white transition-colors">← กลับ</button>
          <span className="text-slate-600">|</span>
          <span className="text-xl">⚙️</span>
          <h1 className="text-xl font-bold">จัดการเมนูอาหาร</h1>
        </div>
        <div className="text-sm text-slate-400">
          {categories.length} หมวดหมู่ · {products.length} รายการ
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700 pb-0">
          {[{ key: 'categories', label: '📂 หมวดหมู่' }, { key: 'products', label: '🍽️ รายการเมนู' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ===== CATEGORIES TAB ===== */}
        {tab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <h2 className="font-bold text-lg mb-4">{editCat ? '✏️ แก้ไขหมวดหมู่' : '➕ เพิ่มหมวดหมู่ใหม่'}</h2>
              <div className="space-y-3">
                {/* Icon picker */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">ไอคอน</label>
                  <button onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-16 h-16 bg-slate-700 rounded-xl text-3xl hover:bg-slate-600 transition-colors">
                    {catForm.icon}
                  </button>
                  {showIconPicker && (
                    <div className="mt-2 bg-slate-700 rounded-xl p-3 grid grid-cols-9 gap-1">
                      {ICONS.map(ic => (
                        <button key={ic} onClick={() => { setCatForm(f => ({ ...f, icon: ic })); setShowIconPicker(false); }}
                          className="w-8 h-8 text-xl hover:bg-slate-600 rounded-lg transition-colors">
                          {ic}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">ชื่อหมวดหมู่ *</label>
                  <input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="เช่น อาหารจานหลัก, เครื่องดื่ม"
                    className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">ลำดับการแสดง</label>
                  <input type="number" value={catForm.sortOrder}
                    onChange={e => setCatForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveCat}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors">
                    {editCat ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
                  </button>
                  {editCat && (
                    <button onClick={() => { setEditCat(null); setCatForm({ name: '', icon: '🍛', sortOrder: 0 }); }}
                      className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors">
                      ยกเลิก
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2">
              <h2 className="font-bold text-lg">หมวดหมู่ทั้งหมด</h2>
              {loading ? <p className="text-slate-400">กำลังโหลด...</p> :
                categories.map(cat => (
                  <div key={cat.id} className={`bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-3 border ${cat.isActive ? 'border-slate-700' : 'border-rose-800/50 opacity-60'}`}>
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-xs text-slate-400">{cat._count?.products || 0} รายการ · ลำดับ {cat.sortOrder} {!cat.isActive && '· ปิดใช้งาน'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditCat(cat)}
                        className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs transition-colors">✏️ แก้ไข</button>
                      <button onClick={() => deleteCat(cat.id, cat.name)}
                        className="px-3 py-1 rounded-lg bg-rose-900/50 hover:bg-rose-800/50 text-rose-400 text-xs transition-colors">🗑️ ลบ</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ===== PRODUCTS TAB ===== */}
        {tab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <h2 className="font-bold text-lg mb-4">{editProd ? '✏️ แก้ไขเมนู' : '➕ เพิ่มเมนูใหม่'}</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">ชื่อเมนู *</label>
                  <input value={prodForm.name} onChange={e => setProdForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="เช่น ข้าวผัดกุ้ง"
                    className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">ราคา (บาท) *</label>
                  <input type="number" value={prodForm.price} onChange={e => setProdForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0"
                    className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">หมวดหมู่ *</label>
                  <select value={prodForm.categoryId} onChange={e => setProdForm(f => ({ ...f, categoryId: e.target.value }))}
                    className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">-- เลือกหมวดหมู่ --</option>
                    {categories.filter(c => c.isActive).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">คำอธิบาย (ไม่บังคับ)</label>
                  <input value={prodForm.description} onChange={e => setProdForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="รายละเอียดเพิ่มเติม"
                    className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">ลำดับการแสดง</label>
                  <input type="number" value={prodForm.sortOrder}
                    onChange={e => setProdForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveProd}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors">
                    {editProd ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู'}
                  </button>
                  {editProd && (
                    <button onClick={() => { setEditProd(null); setProdForm({ name: '', price: '', categoryId: '', description: '', sortOrder: 0 }); }}
                      className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors">
                      ยกเลิก
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-lg flex-1">รายการเมนู</h2>
                <select value={filterCat || ''} onChange={e => setFilterCat(e.target.value ? parseInt(e.target.value) : null)}
                  className="bg-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none">
                  <option value="">ทุกหมวดหมู่</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {loading ? <p className="text-slate-400">กำลังโหลด...</p> :
                  filteredProducts.map(prod => (
                    <div key={prod.id} className={`bg-slate-800 rounded-xl px-4 py-3 border ${prod.isActive ? 'border-slate-700' : 'border-rose-800/50 opacity-60'}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">{prod.category?.icon || '🍴'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{prod.name}</p>
                            {!prod.isActive && <span className="text-xs bg-rose-900/50 text-rose-400 px-2 py-0.5 rounded-full">ปิด</span>}
                          </div>
                          <p className="text-indigo-400 font-bold">฿{prod.price.toFixed(0)}</p>
                          <p className="text-xs text-slate-500">{prod.category?.name}</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button onClick={() => startEditProd(prod)}
                            className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs transition-colors">✏️</button>
                          <button onClick={() => toggleProd(prod)}
                            className={`px-3 py-1 rounded-lg text-xs transition-colors ${prod.isActive ? 'bg-amber-900/50 hover:bg-amber-800/50 text-amber-400' : 'bg-emerald-900/50 hover:bg-emerald-800/50 text-emerald-400'}`}>
                            {prod.isActive ? '🔴' : '🟢'}
                          </button>
                          <button onClick={() => deleteProd(prod.id, prod.name)}
                            className="px-3 py-1 rounded-lg bg-rose-900/50 hover:bg-rose-800/50 text-rose-400 text-xs transition-colors">🗑️</button>
                        </div>
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
