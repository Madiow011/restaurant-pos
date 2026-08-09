'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { ordersApi } from '@/lib/api';
import dynamic from 'next/dynamic';

const PaymentModal = dynamic(() => import('./PaymentModal'), { ssr: false });
const ReceiptModal = dynamic(() => import('./ReceiptModal'), { ssr: false });

interface Props { tableId: number; tableName: string; }

export default function CartPanel({ tableId, tableName }: Props) {
  const router = useRouter();
  const { items, orderId, setOrderId, updateQuantity, removeItem, clearCart, subtotal, vatAmount, total } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paidOrderId, setPaidOrderId] = useState<number | null>(null);

  const handleConfirmOrder = async () => {
    if (!items.length) return;
    setLoading(true);
    try {
      const orderItems = items.map(i => ({ productId: i.product.id, quantity: i.quantity }));
      if (orderId) { await ordersApi.addItems(orderId, { tableId, items: orderItems }); }
      else { const o = await ordersApi.create({ tableId, items: orderItems }); setOrderId(o.id); }
      alert('✅ ส่งออเดอร์ไปครัวแล้ว!');
    } catch (e) { console.error(e); alert('❌ เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setPaidOrderId(orderId);
    setShowReceipt(true);
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    clearCart();
    router.push('/');
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 border-l border-slate-700 relative">
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div><h2 className="font-bold text-white">รายการสั่ง</h2><p className="text-xs text-slate-400">{tableName}</p></div>
        {orderId && <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded-full">#{orderId}</span>}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!items.length ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-sm">
            <span className="text-3xl mb-2">🛒</span><p>ยังไม่มีรายการ</p>
          </div>
        ) : items.map(item => (
          <div key={item.product.id} className="bg-slate-700 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                <p className="text-xs text-indigo-400">฿{item.product.price.toFixed(0)}/ชิ้น</p>
              </div>
              <button onClick={() => removeItem(item.product.id)} className="text-slate-500 hover:text-rose-400 text-lg">×</button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-bold">−</button>
                <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-bold">+</button>
              </div>
              <p className="text-sm font-bold text-white">฿{(item.product.price * item.quantity).toFixed(0)}</p>
            </div>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div className="border-t border-slate-700 px-4 py-3 space-y-1 text-sm">
          <div className="flex justify-between text-slate-400"><span>ยอดก่อน VAT</span><span>฿{subtotal().toFixed(2)}</span></div>
          <div className="flex justify-between text-slate-400"><span>VAT 7%</span><span>฿{vatAmount().toFixed(2)}</span></div>
          <div className="flex justify-between text-white font-bold text-base pt-1 border-t border-slate-600">
            <span>รวมทั้งสิ้น</span><span className="text-indigo-400">฿{total().toFixed(2)}</span>
          </div>
        </div>
      )}
      <div className="p-3 space-y-2">
        <button onClick={handleConfirmOrder} disabled={loading || !items.length}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors disabled:opacity-40">
          {loading ? 'กำลังส่ง...' : '📤 ส่งออเดอร์ไปครัว'}
        </button>
        <button onClick={() => setShowPayment(true)} disabled={!orderId}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-40">
          💳 ชำระเงิน
        </button>
        {paidOrderId && (
          <button onClick={() => setShowReceipt(true)}
            className="w-full py-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium">
            🧾 ดูใบเสร็จ
          </button>
        )}
        <button onClick={() => router.push('/')}
          className="w-full py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 text-sm">
          ← กลับหน้าหลัก
        </button>
      </div>
      {showPayment && orderId && (
        <PaymentModal orderId={orderId} total={total()} onSuccess={handlePaymentSuccess} onClose={() => setShowPayment(false)} />
      )}
      {showReceipt && paidOrderId && (
        <ReceiptModal orderId={paidOrderId} onClose={handleReceiptClose} />
      )}
    </div>
  );
}
