import { create } from 'zustand';
import { CartItem, Product } from '@/types';

interface CartStore {
  tableId: number | null;
  orderId: number | null;
  items: CartItem[];

  setTable: (tableId: number) => void;
  setOrderId: (orderId: number) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;

  subtotal: () => number;
  vatAmount: () => number;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  tableId: null,
  orderId: null,
  items: [],

  setTable: (tableId) => set({ tableId }),
  setOrderId: (orderId) => set({ orderId }),

  addItem: (product) => {
    const items = get().items;
    const existing = items.find(i => i.product.id === product.id);
    if (existing) {
      set({ items: items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      set({ items: [...items, { product, quantity: 1 }] });
    }
  },

  removeItem: (productId) => set({ items: get().items.filter(i => i.product.id !== productId) }),

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
    } else {
      set({ items: get().items.map(i => i.product.id === productId ? { ...i, quantity } : i) });
    }
  },

  clearCart: () => set({ items: [], orderId: null, tableId: null }),

  subtotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  vatAmount: () => get().subtotal() * 0.07,
  total: () => get().subtotal() + get().vatAmount(),
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
