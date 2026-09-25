import { create } from 'zustand';

interface User { id: number; name: string; role: 'admin' | 'staff'; }
interface AuthStore {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  isAdmin: () => get().user?.role === 'admin',
}));
