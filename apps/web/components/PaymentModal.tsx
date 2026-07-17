'use client';
import { useState, useEffect } from 'react';
import { ordersApi } from '@/lib/api';
import axios from 'axios';
import QRCode from 'qrcode';

interface Props {
  orderId: number;
  total: number;
  onSuccess: () => void;
  onClose: () => void;
}

type Tab = 'promptpay' | 'stripe';

const STRIPE_TEST_CARDS = [
  { number: '4242 4242 4242 4242', desc: 'บัตรสำเร็จ', color: 'text-emerald-400' },
  { number: '4000 0000 0000 0002', desc: 'บัตรถูกปฏิเสธ', color: 'text-rose-400' },
  { number: '4000 0025 0000 3155', desc: 'ต้องยืนยัน 3DS', color: 'text-amber-400' },
];

export default function PaymentModal({ orderId, total, onSuccess, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('promptpay');
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrPayload, setQrPayload] = useState('');
  const [stripePayment, setStripePayment] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cashInput, setCashInput] = useState('');

  useEffect(() => {
    if (tab === 'promptpay') loadPromptPay();
    else if (tab === 'stripe') loadStripe();
  }, [tab]);

  const loadPromptPay = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:3001/payment/promptpay/${orderId}`);
      setQrPayload(res.data.qrPayload);
      const url = await QRCode.toDataURL(res.data.qrPayload, { width: 240, margin: 1 });
      setQrDataUrl(url);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadStripe = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:3001/payment/stripe/create/${orderId}`);
      setStripePayment(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handlePromptPayConfirm = async () => {
    setLoading(true);
    try {
      await ordersApi.checkout(orderId, 'QR_CODE');
      onSuccess();
    } catch (e) { console.error(e); alert('❌ เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  const handleStripeConfirm = async () => {
    if (!stripePayment) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/payment/stripe/confirm', {
        orderId, paymentIntentId: stripePayment.paymentIntentId,
      });
      if (res.data.success) { onSuccess(); }
      else { alert('❌ ชำระเงินไม่สำเร็จ'); }
    } catch (e) { console.error(e); alert('❌ เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  const cashChange = parseFloat(cashInput || '0') - total;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white">ชำระเงิน</h2>
            <p className="text-2xl font-black text-indigo-400">฿{total.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {[
            { key: 'promptpay', label: '📱 พร้อมเพย์ QR' },
            { key: 'stripe', label: '💳 บัตรเครดิต' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as Tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t.key ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* PromptPay Tab */}
          {tab === 'promptpay' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-48 text-slate-400">
                  <div className="text-center"><div className="text-3xl mb-2 animate-pulse">📱</div><p>กำลังสร้าง QR Code...</p></div>
                </div>
              ) : qrDataUrl ? (
                <div className="text-center space-y-3">
                  <img src={qrDataUrl} alt="PromptPay QR" className="mx-auto rounded-xl border-4 border-white" width={220} />
                  <p className="text-sm text-slate-400">สแกนด้วยแอปธนาคารใดก็ได้</p>
                  <div className="bg-slate-700 rounded-xl p-3 text-left">
                    <p className="text-xs text-slate-400 mb-1">ยอดที่ต้องโอน</p>
                    <p className="text-xl font-bold text-emerald-400">฿{total.toFixed(2)}</p>
                    <p className="text-xs text-slate-400 mt-1">เบอร์พร้อมเพย์: 081-234-5678</p>
                  </div>
                  {/* Cash input (ถ้ารับเงินสด) */}
                  <div className="border-t border-slate-600 pt-3 space-y-2">
                    <p className="text-xs text-slate-400">หรือรับเงินสด</p>
                    <input
                      type="number"
                      placeholder="รับเงินมา (บาท)..."
                      value={cashInput}
                      onChange={e => setCashInput(e.target.value)}
                      className="w-full bg-slate-700 text-white rounded-xl px-4 py-2 text-base outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {cashInput && cashChange >= 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">เงินทอน</span>
                        <span className="text-emerald-400 font-bold">฿{cashChange.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              <button
                onClick={handlePromptPayConfirm}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-40 transition-colors"
              >
                ✅ ยืนยันรับเงินแล้ว
              </button>
            </div>
          )}

          {/* Stripe Tab */}
          {tab === 'stripe' && (
            <div className="space-y-4">
              {/* Sandbox Notice */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <p className="text-amber-400 text-xs font-medium mb-2">🧪 Sandbox Mode — ใช้บัตรทดสอบ</p>
                {STRIPE_TEST_CARDS.map(card => (
                  <div key={card.number} className="flex items-center justify-between py-1">
                    <button
                      onClick={() => setCardNumber(card.number)}
                      className="text-xs font-mono text-slate-300 hover:text-white"
                    >
                      {card.number}
                    </button>
                    <span className={`text-xs ${card.color}`}>{card.desc}</span>
                  </div>
                ))}
              </div>
              {/* Card form */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">หมายเลขบัตร</label>
                  <input
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full bg-slate-700 text-white rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">MM/YY</label>
                    <input
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      placeholder="12/27"
                      className="w-full bg-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">CVV</label>
                    <input
                      value={cvv}
                      onChange={e => setCvv(e.target.value)}
                      placeholder="123"
                      className="w-full bg-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleStripeConfirm}
                disabled={loading || !stripePayment}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-40 transition-colors"
              >
                {loading ? 'กำลังดำเนินการ...' : `💳 ชำระ ฿${total.toFixed(2)}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
