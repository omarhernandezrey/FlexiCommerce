import apiClient from './api-client';

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating?: number;
  stock: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Products API
export const productsAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sort?: string;
  }) => apiClient.get('/api/products', { params }),

  getById: (id: string) => apiClient.get(`/api/products/${id}`),

  create: (data: Partial<Product>) => apiClient.post('/api/products', data),

  update: (id: string, data: Partial<Product>) =>
    apiClient.put(`/api/products/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/products/${id}`),

  search: (query: string) =>
    apiClient.get('/api/products/search', { params: { q: query } }),
};

// Auth API
export const authAPI = {
  login: (credentials: LoginRequest) =>
    apiClient.post<AuthResponse>('/api/auth/login', credentials),

  register: (userData: Omit<User, 'id' | 'role'> & { password: string }) =>
    apiClient.post<AuthResponse>('/api/auth/register', userData),

  logout: () => apiClient.post('/api/auth/logout'),

  getCurrentUser: () => apiClient.get<User>('/api/auth/me'),

  refreshToken: () => apiClient.post('/api/auth/refresh'),
};

// Orders API
export const ordersAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get('/api/orders', { params }),

  getById: (id: string) => apiClient.get(`/api/orders/${id}`),

  create: (data: Partial<Order>) => apiClient.post('/api/orders', data),

  updateStatus: (id: string, status: Order['status']) =>
    apiClient.patch(`/api/orders/${id}`, { status }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiClient.get('/api/categories'),

  getById: (id: string) => apiClient.get(`/api/categories/${id}`),
};

// Reviews API
export const reviewsAPI = {
  getByProduct: (productId: string) =>
    apiClient.get(`/api/reviews?productId=${productId}`),

  create: (data: {
    productId: string;
    rating: number;
    comment: string;
  }) => apiClient.post('/api/reviews', data),
};

// Payments API
export const paymentsAPI = {
  create: (data: { orderId: string; amount: number; method: string }) =>
    apiClient.post('/api/payments', data),

  verify: (paymentId: string) => apiClient.get(`/api/payments/${paymentId}`),
};

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response, // Keep full response
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);
