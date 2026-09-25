import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001', headers: { 'Content-Type': 'application/json' } });

export const categoriesApi = {
  getAll: () => api.get('/categories').then(r => r.data),
  create: (data: any) => api.post('/categories', data).then(r => r.data),
  update: (id: number, data: any) => api.patch(`/categories/${id}`, data).then(r => r.data),
  remove: (id: number) => api.delete(`/categories/${id}`).then(r => r.data),
};

export const productsApi = {
  getAll: (categoryId?: number) => api.get('/products', { params: categoryId ? { categoryId } : {} }).then(r => r.data),
  create: (data: any) => api.post('/products', data).then(r => r.data),
  update: (id: number, data: any) => api.patch(`/products/${id}`, data).then(r => r.data),
  remove: (id: number) => api.delete(`/products/${id}`).then(r => r.data),
};

export const tablesApi = {
  getAll: () => api.get('/tables').then(r => r.data),
  getOne: (id: number) => api.get(`/tables/${id}`).then(r => r.data),
  create: (data: any) => api.post('/tables', data).then(r => r.data),
  update: (id: number, data: any) => api.patch(`/tables/${id}`, data).then(r => r.data),
  remove: (id: number) => api.delete(`/tables/${id}`).then(r => r.data),
  updateStatus: (id: number, status: string) => api.patch(`/tables/${id}/status`, { status }).then(r => r.data),
};

export const ordersApi = {
  getAll: (status?: string) => api.get('/orders', { params: status ? { status } : {} }).then(r => r.data),
  create: (data: any) => api.post('/orders', data).then(r => r.data),
  getOne: (id: number) => api.get(`/orders/${id}`).then(r => r.data),
  addItems: (id: number, data: any) => api.post(`/orders/${id}/items`, data).then(r => r.data),
  checkout: (id: number, paymentMethod: string) => api.patch(`/orders/${id}/checkout`, { paymentMethod }).then(r => r.data),
  cancel: (id: number) => api.patch(`/orders/${id}/cancel`).then(r => r.data),
};

export const authApi = {
  login: (pin: string) => api.post('/auth/login', { pin }).then(r => r.data),
  getUsers: () => api.get('/auth/users').then(r => r.data),
};

export const financeApi = {
  getExpenses: (month?: string) => api.get('/finance/expenses', { params: month ? { month } : {} }).then(r => r.data),
  createExpense: (data: any) => api.post('/finance/expenses', data).then(r => r.data),
  updateExpense: (id: number, data: any) => api.patch(`/finance/expenses/${id}`, data).then(r => r.data),
  deleteExpense: (id: number) => api.delete(`/finance/expenses/${id}`).then(r => r.data),
  getPL: (month: string) => api.get(`/finance/pl/${month}`).then(r => r.data),
  getYearly: (year: number) => api.get(`/finance/yearly/${year}`).then(r => r.data),
};

export const reportsApi = {
  daily: (days = 7) => api.get(`/reports/daily?days=${days}`).then(r => r.data),
  monthly: (months = 6) => api.get(`/reports/monthly?months=${months}`).then(r => r.data),
  topProducts: (limit = 8) => api.get(`/reports/top-products?limit=${limit}`).then(r => r.data),
  summaryToday: () => api.get('/reports/summary/today').then(r => r.data),
  summaryMonth: () => api.get('/reports/summary/month').then(r => r.data),
  categories: () => api.get('/reports/categories').then(r => r.data),
};

export default api;
