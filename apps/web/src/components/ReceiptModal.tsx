'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001';
interface Props { orderId: number; onClose: () => void; }

export default function ReceiptModal({ orderId, onClose }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/receipt/${orderId}/data`).then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [orderId]);

  const fmt = (n: number) => n?.toLocaleString('th-TH', { minimumFractionDigits: 2 }) || '0.00';
  const fmtDate = (d: string) => d ? new Date(d).toLocaleString('th-TH') : '-';
  const pmLabel: Record<string, string> = { CASH:'เงินสด', CREDIT_CARD:'บัตรเครดิต', QR_CODE:'พร้อมเพย์' };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="font-bold text-gray-800">ใบเสร็จรับเงิน</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? <p className="text-center text-gray-400 py-8">กำลังโหลด...</p> : data ? (
            <div className="text-sm text-gray-800 space-y-2" style={{ fontFamily: "'Sarabun',sans-serif" }}>
              <div className="text-center">
                <p className="text-lg font-bold">{data.shop.name}</p>
                <p className="text-xs text-gray-500">{data.shop.address}</p>
                <p className="text-xs text-gray-500">โทร: {data.shop.phone}</p>
              </div>
              <hr className="border-dashed"/>
              <div className="text-xs space-y-0.5">
                <div className="flex justify-between"><span>เลขที่:</span><span className="font-bold">{data.order.orderNumber}</span></div>
                <div className="flex justify-between"><span>โต๊ะ:</span><span>{data.order.tableName}</span></div>
                <div className="flex justify-between"><span>วันที่:</span><span>{fmtDate(data.order.createdAt)}</span></div>
                {data.order.paymentMethod && <div className="flex justify-between"><span>ชำระด้วย:</span><span>{pmLabel[data.order.paymentMethod]||data.order.paymentMethod}</span></div>}
              </div>
              <hr className="border-dashed"/>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left py-1">รายการ</th><th className="text-center">จำนวน</th><th className="text-right">รวม</th></tr></thead>
                <tbody>
                  {data.items.map((item: any, i: number) => (
                    <tr key={i}><td className="py-1">{item.name}{item.note && <span className="text-gray-400"> ({item.note})</span>}</td><td className="text-center">{item.quantity}</td><td className="text-right">{fmt(item.subtotal)}</td></tr>
                  ))}
                </tbody>
              </table>
              <hr className="border-dashed"/>
              <div className="text-sm space-y-1">
                <div className="flex justify-between text-gray-500"><span>ก่อน VAT</span><span>{fmt(data.summary.subtotal)} ฿</span></div>
                <div className="flex justify-between text-gray-500"><span>VAT 7%</span><span>{fmt(data.summary.vatAmount)} ฿</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-1"><span>รวม</span><span>{fmt(data.summary.totalAmount)} ฿</span></div>
              </div>
              <p className="text-center text-xs text-gray-400 pt-2">*** ขอบคุณที่ใช้บริการ ***</p>
            </div>
          ) : <p className="text-center text-gray-400 py-8">ไม่พบข้อมูล</p>}
        </div>
        <div className="p-4 border-t flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200">ปิด</button>
          <button onClick={() => window.open(`${API}/receipt/${orderId}/customer`, '_blank')}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500">🖨️ พิมพ์</button>
        </div>
      </div>
    </div>
  );
}
