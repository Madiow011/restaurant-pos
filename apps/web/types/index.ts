export interface Category {
  id: number;
  name: string;
  icon: string | null;
  sortOrder: number;
  _count?: { products: number };
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: number;
  category?: Category;
}

export interface Table {
  id: number;
  number: number;
  name: string | null;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  orders?: Order[];
}

export interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  note: string | null;
  product: Product;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod: string | null;
  tableId: number;
  table?: Table;
  orderItems: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  note?: string;
}
