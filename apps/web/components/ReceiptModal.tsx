'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Props {
  orderId: number;
  onClose: () => void;
}

export default function ReceiptModal({ orderId, onClose }: Props) {
  const [receiptData, setReceiptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:3001/receipt/${orderId}/data`)
      .then(r => setReceiptData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = () => {
    window.open(`http://localhost:3001/receipt/${orderId}/html`, '_blank');
  };

  const formatMoney = (n: number) => n?.toLocaleString('th-TH', { minimumFractionDigits: 2 }) || '0.00';
  const formatDate = (d: string) => d ? new Date(d).toLocaleString('th-TH') : '-';
  const pmLabel: Record<string, string> = { CASH: 'เงินสด', CREDIT_CARD: 'บัตรเครดิต', QR_CODE: 'พร้อมเพย์' };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="font-bold text-gray-800">ใบเสร็จรับเงิน</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        {/* Receipt content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p>กำลังโหลด...</p>
            </div>
          ) : receiptData ? (
            <div className="p-5 font-mono text-sm text-gray-800" style={{ fontFamily: "'Sarabun', sans-serif" }}>
              {/* Shop header */}
              <div className="text-center mb-3">
                <p className="text-lg font-bold">{receiptData.shop.name}</p>
                <p className="text-xs text-gray-500">{receiptData.shop.address}</p>
                <p className="text-xs text-gray-500">โทร: {receiptData.shop.phone}</p>
                <p className="text-xs text-gray-400">เลขผู้เสียภาษี: {receiptData.shop.taxId}</p>
              </div>

              <div className="border-t border-dashed border-gray-300 my-2" />

              {/* Order info */}
              <div className="space-y-0.5 mb-2 text-xs">
                <div className="flex justify-between">
                  <span>เลขที่:</span><span className="font-bold">{receiptData.order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>โต๊ะ:</span><span>{receiptData.order.tableName}</span>
                </div>
                <div className="flex justify-between">
                  <span>วันที่:</span><span>{formatDate(receiptData.order.createdAt)}</span>
                </div>
                {receiptData.order.paymentMethod && (
                  <div className="flex justify-between">
                    <span>ชำระด้วย:</span>
                    <span>{pmLabel[receiptData.order.paymentMethod] || receiptData.order.paymentMethod}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-gray-300 my-2" />

              {/* Items */}
              <table className="w-full text-xs mb-2">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1">รายการ</th>
                    <th className="text-center py-1">จำนวน</th>
                    <th className="text-right py-1">ราคา</th>
                    <th className="text-right py-1">รวม</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.items.map((item: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-1">{item.name}{item.note && <span className="text-gray-400 text-xs"> ({item.note})</span>}</td>
                      <td className="text-center py-1">{item.quantity}</td>
                      <td className="text-right py-1">{formatMoney(item.unitPrice)}</td>
                      <td className="text-right py-1">{formatMoney(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-dashed border-gray-300 my-2" />

              {/* Summary */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>ยอดก่อน VAT</span><span>{formatMoney(receiptData.summary.subtotal)} บาท</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT {(receiptData.summary.vatRate * 100).toFixed(0)}%</span>
                  <span>{formatMoney(receiptData.summary.vatAmount)} บาท</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-1">
                  <span>ยอดรวม</span><span>{formatMoney(receiptData.summary.totalAmount)} บาท</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-3" />
              <p className="text-center text-xs text-gray-400">*** ขอบคุณที่ใช้บริการ ***</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400"><p>ไม่พบข้อมูลใบเสร็จ</p></div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
            ปิด
          </button>
          <button onClick={handlePrint} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors">
            🖨️ พิมพ์
          </button>
        </div>
      </div>
    </div>
  );
}
