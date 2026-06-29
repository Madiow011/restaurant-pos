'use client';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { ordersApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Props {
  tableId: number;
  tableName: string;
}

type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'QR_CODE';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: '💵 เงินสด',
  CREDIT_CARD: '💳 บัตรเครดิต',
  QR_CODE: '📱 QR Code',
};

export default function CartPanel({ tableId, tableName }: Props) {
  const router = useRouter();
  const { items, orderId, setOrderId, addItem, removeItem, updateQuantity, clearCart, subtotal, vatAmount, total } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashInput, setCashInput] = useState('');

  const handleConfirmOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const orderItems = items.map(i => ({ productId: i.product.id, quantity: i.quantity, note: i.note }));
      if (orderId) {
        await ordersApi.addItems(orderId, { tableId, items: orderItems });
      } else {
        const order = await ordersApi.create({ tableId, items: orderItems });
        setOrderId(order.id);
      }
      alert('✅ ส่งออเดอร์ไปครัวแล้ว!');
    } catch (e) {
      console.error(e);
      alert('❌ เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!orderId) {
      alert('กรุณาส่งออเดอร์ก่อน');
      return;
    }
    setLoading(true);
    try {
      await ordersApi.checkout(orderId, paymentMethod);
      alert(`✅ ชำระเงินสำเร็จ!\nยอดรวม: ฿${total().toFixed(2)}`);
      clearCart();
      router.push('/');
    } catch (e) {
      console.error(e);
      alert('❌ เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
      setShowPayment(false);
    }
  };

  const cashChange = parseFloat(cashInput || '0') - total();

  return (
    <div className="flex flex-col h-full bg-slate-800 border-l border-slate-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white">รายการสั่ง</h2>
          <p className="text-xs text-slate-400">{tableName}</p>
        </div>
        {orderId && (
          <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded-full">
            #{orderId}
          </span>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-sm">
            <span className="text-3xl mb-2">🛒</span>
            <p>ยังไม่มีรายการ</p>
            <p className="text-xs mt-1">กดเมนูเพื่อเพิ่ม</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.product.id} className="bg-slate-700 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                  <p className="text-xs text-indigo-400">฿{item.product.price.toFixed(0)} / ชิ้น</p>
                </div>
                <button onClick={() => removeItem(item.product.id)} className="text-slate-500 hover:text-rose-400 transition-colors text-lg leading-none">×</button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-bold transition-colors"
                  >−</button>
                  <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-bold transition-colors"
                  >+</button>
                </div>
                <p className="text-sm font-bold text-white">฿{(item.product.price * item.quantity).toFixed(0)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="border-t border-slate-700 px-4 py-3 space-y-1 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>ยอดรวม</span>
            <span>฿{subtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>VAT 7%</span>
            <span>฿{vatAmount().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white font-bold text-base pt-1 border-t border-slate-600">
            <span>รวมทั้งสิ้น</span>
            <span className="text-indigo-400">฿{total().toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="absolute inset-0 bg-black/60 flex items-end z-50">
          <div className="w-full bg-slate-800 rounded-t-2xl p-5 space-y-4">
            <h3 className="text-lg font-bold text-white">ชำระเงิน</h3>
            <p className="text-2xl font-black text-indigo-400">฿{total().toFixed(2)}</p>

            {/* Payment method */}
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map(m => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 px-1 rounded-xl text-xs font-medium transition-all ${paymentMethod === m ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {PAYMENT_LABELS[m]}
                </button>
              ))}
            </div>

            {/* Cash input */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="รับเงินมา..."
                  value={cashInput}
                  onChange={e => setCashInput(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {cashInput && cashChange >= 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">เงินทอน</span>
                    <span className="text-emerald-400 font-bold text-lg">฿{cashChange.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setShowPayment(false)} className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors">
                ยกเลิก
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'กำลังดำเนินการ...' : 'ยืนยันชำระ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-3 space-y-2">
        <button
          onClick={handleConfirmOrder}
          disabled={loading || items.length === 0}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors disabled:opacity-40"
        >
          {loading ? 'กำลังส่ง...' : '📤 ส่งออเดอร์ไปครัว'}
        </button>
        <button
          onClick={() => setShowPayment(true)}
          disabled={!orderId}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-40"
        >
          💳 ชำระเงิน
        </button>
        <button
          onClick={() => router.push('/')}
          className="w-full py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
        >
          ← กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
}
