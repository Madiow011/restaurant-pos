import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

export const categoriesApi = {
  getAll: () => api.get('/categories').then(r => r.data),
};

export const productsApi = {
  getAll: (categoryId?: number) =>
    api.get('/products', { params: categoryId ? { categoryId } : {} }).then(r => r.data),
};

export const tablesApi = {
  getAll: () => api.get('/tables').then(r => r.data),
  getOne: (id: number) => api.get(`/tables/${id}`).then(r => r.data),
  updateStatus: (id: number, status: string) =>
    api.patch(`/tables/${id}/status`, { status }).then(r => r.data),
};

export const ordersApi = {
  create: (data: { tableId: number; items: { productId: number; quantity: number; note?: string }[] }) =>
    api.post('/orders', data).then(r => r.data),
  getOne: (id: number) => api.get(`/orders/${id}`).then(r => r.data),
  addItems: (id: number, data: { tableId: number; items: { productId: number; quantity: number }[] }) =>
    api.post(`/orders/${id}/items`, data).then(r => r.data),
  checkout: (id: number, paymentMethod: string) =>
    api.patch(`/orders/${id}/checkout`, { paymentMethod }).then(r => r.data),
  cancel: (id: number) => api.patch(`/orders/${id}/cancel`).then(r => r.data),
};

export default api;
