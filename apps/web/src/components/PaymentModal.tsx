'use client';
import { useState, useEffect } from 'react';
import { ordersApi } from '@/lib/api';
import axios from 'axios';

const API = 'http://localhost:3001';
interface Props { orderId: number; total: number; onSuccess: () => void; onClose: () => void; }
type Tab = 'promptpay' | 'cash' | 'stripe';
const PM_LABELS = { promptpay:'📱 พร้อมเพย์', cash:'💵 เงินสด', stripe:'💳 บัตรเครดิต' };

export default function PaymentModal({ orderId, total, onSuccess, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('promptpay');
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [stripePayment, setStripePayment] = useState<any>(null);
  const [cashInput, setCashInput] = useState('');

  useEffect(() => {
    if (tab === 'promptpay') loadQR();
    else if (tab === 'stripe') loadStripe();
  }, [tab]);

  const loadQR = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/payment/promptpay/${orderId}`);
      const QRCode = (await import('qrcode')).default;
      setQrDataUrl(await QRCode.toDataURL(res.data.qrPayload, { width: 220, margin: 1 }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadStripe = async () => {
    setLoading(true);
    try { const res = await axios.post(`${API}/payment/stripe/create/${orderId}`); setStripePayment(res.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleConfirm = async (method: string) => {
    setLoading(true);
    try {
      if (method === 'stripe' && stripePayment) {
        await axios.post(`${API}/payment/stripe/confirm`, { orderId, paymentIntentId: stripePayment.paymentIntentId });
      } else {
        await ordersApi.checkout(orderId, method === 'cash' ? 'CASH' : 'QR_CODE');
      }
      onSuccess();
    } catch (e) { console.error(e); alert('❌ เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  const cashChange = parseFloat(cashInput || '0') - total;
  const fmt = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div><h2 className="text-lg font-bold text-white">ชำระเงิน</h2><p className="text-2xl font-black text-indigo-400">฿{fmt(total)}</p></div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
        </div>
        <div className="flex border-b border-slate-700">
          {(Object.keys(PM_LABELS) as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${tab === t ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}>
              {PM_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 'promptpay' && (
            <div className="space-y-4 text-center">
              {loading ? <p className="text-slate-400 py-8">กำลังสร้าง QR...</p> :
                qrDataUrl ? <img src={qrDataUrl} alt="QR" className="mx-auto rounded-xl border-4 border-white" width={200}/> : null}
              <p className="text-sm text-slate-400">เบอร์พร้อมเพย์: 081-234-5678</p>
              <p className="text-lg font-black text-indigo-400">฿{fmt(total)}</p>
              <button onClick={() => handleConfirm('promptpay')} disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-40">
                ✅ ยืนยันรับเงินแล้ว
              </button>
            </div>
          )}
          {tab === 'cash' && (
            <div className="space-y-4">
              <div className="text-center"><p className="text-slate-400 text-sm">ยอดที่ต้องชำระ</p><p className="text-3xl font-black text-white">฿{fmt(total)}</p></div>
              <input type="number" placeholder="รับเงินมา (บาท)..." value={cashInput}
                onChange={e => setCashInput(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"/>
              {cashInput && cashChange >= 0 && (
                <div className="flex justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                  <span className="text-slate-400">เงินทอน</span>
                  <span className="text-emerald-400 font-bold text-xl">฿{fmt(cashChange)}</span>
                </div>
              )}
              <button onClick={() => handleConfirm('cash')} disabled={loading || !cashInput}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-40">
                ✅ ยืนยันรับเงินสด
              </button>
            </div>
          )}
          {tab === 'stripe' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <p className="text-amber-400 text-xs font-medium mb-2">🧪 Sandbox — บัตรทดสอบ</p>
                <p className="text-xs font-mono text-slate-300">4242 4242 4242 4242 <span className="text-emerald-400">สำเร็จ</span></p>
                <p className="text-xs font-mono text-slate-300">4000 0000 0000 0002 <span className="text-rose-400">ปฏิเสธ</span></p>
              </div>
              <button onClick={() => handleConfirm('stripe')} disabled={loading || !stripePayment}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-40">
                {loading ? 'กำลังดำเนินการ...' : `💳 ชำระ ฿${fmt(total)}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
