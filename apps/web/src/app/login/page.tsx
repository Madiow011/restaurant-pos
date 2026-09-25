'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePin = (digit: string) => {
    if (pin.length < 4) setPin(p => p + digit);
  };

  const handleClear = () => { setPin(''); setError(''); };

  const handleLogin = async () => {
    if (pin.length !== 4) return;
    setLoading(true);
    setError('');
    try {
      const user = await authApi.login(pin);
      login(user);
      router.push('/');
    } catch {
      setError('PIN ไม่ถูกต้อง กรุณาลองใหม่');
      setPin('');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 rounded-2xl p-8 w-80 border border-slate-700 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🍽️</div>
          <h1 className="text-xl font-bold text-white">Restaurant POS</h1>
          <p className="text-slate-400 text-sm mt-1">กรุณาใส่รหัส PIN 4 หลัก</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-6">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${pin.length > i ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-slate-600 text-slate-600'}`}>
              {pin.length > i ? '●' : '○'}
            </div>
          ))}
        </div>

        {error && <p className="text-rose-400 text-sm text-center mb-4">{error}</p>}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {['1','2','3','4','5','6','7','8','9'].map(d => (
            <button key={d} onClick={() => handlePin(d)}
              className="h-14 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xl font-bold transition-all active:scale-95">
              {d}
            </button>
          ))}
          <button onClick={handleClear}
            className="h-14 rounded-xl bg-rose-900/50 hover:bg-rose-800/50 text-rose-400 text-sm font-bold transition-all active:scale-95">
            ลบ
          </button>
          <button onClick={() => handlePin('0')}
            className="h-14 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xl font-bold transition-all active:scale-95">
            0
          </button>
          <button onClick={handleLogin} disabled={pin.length !== 4 || loading}
            className="h-14 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all active:scale-95 disabled:opacity-40">
            {loading ? '...' : '✓'}
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center">Admin: 1234 | พนักงาน: 1111, 2222</p>
      </div>
    </div>
  );
}
