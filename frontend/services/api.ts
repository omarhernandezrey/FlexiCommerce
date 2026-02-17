import apiClient from '@/lib/api-client';

export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post('/api/auth/login', data),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    apiClient.post('/api/auth/register', data),
};

export const productsApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string }) =>
    apiClient.get('/api/products', { params }),
  getById: (id: string) =>
    apiClient.get(`/api/products/${id}`),
};

export const categoriesApi = {
  getAll: () => apiClient.get('/api/categories'),
  getById: (id: string) => apiClient.get(`/api/categories/${id}`),
};

export const ordersApi = {
  getAll: () => apiClient.get('/api/orders'),
  getById: (id: string) => apiClient.get(`/api/orders/${id}`),
  create: (items: { productId: string; quantity: number }[]) =>
    apiClient.post('/api/orders', { items }),
};

export const reviewsApi = {
  getByProduct: (productId: string) =>
    apiClient.get(`/api/reviews/product/${productId}`),
  create: (data: { productId: string; rating: number; comment?: string }) =>
    apiClient.post('/api/reviews', data),
};

export const usersApi = {
  getProfile: () => apiClient.get('/api/users/me'),
  updateProfile: (data: { firstName?: string; lastName?: string }) =>
    apiClient.put('/api/users/me', data),
};
