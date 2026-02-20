import { useAuthStore } from '../store/auth';
import apiClient from './api-client';

export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/api/auth/login', { email, password });
    const { data } = response.data;
    useAuthStore.getState().setAuth(data.user, data.token);
    return { user: data.user, token: data.token };
  },

  async register(email: string, password: string, firstName: string, lastName: string) {
    const response = await apiClient.post('/api/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
    const { data } = response.data;
    useAuthStore.getState().setAuth(data.user, data.token);
    return { user: data.user, token: data.token };
  },

  async logout() {
    await apiClient.post('/api/auth/logout');
    useAuthStore.getState().logout();
  },

  async getCurrentUser() {
    const response = await apiClient.get('/api/auth/me');
    return response.data.data;
  },

  async refreshToken() {
    const response = await apiClient.post('/api/auth/refresh');
    const { data } = response.data;
    useAuthStore.getState().setAuth(data.user, data.token);
    return { user: data.user, token: data.token };
  },
};

export const productService = {
  async getProducts(page = 1, limit = 10, category?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (category) params.append('category', category);
    return apiClient.get(`/api/products?${params}`);
  },

  async getProduct(id: string) {
    return apiClient.get(`/api/products/${id}`);
  },

  async searchProducts(query: string) {
    return apiClient.get(`/api/products/search?q=${query}`);
  },
};

export const cartService = {
  async checkout(items: any[]) {
    return apiClient.post('/api/orders', { items });
  },
};

export const orderService = {
  async getOrders() {
    return apiClient.get('/api/orders');
  },

  async getOrder(id: string) {
    return apiClient.get(`/api/orders/${id}`);
  },

  async createOrder(data: { items: unknown[]; address: unknown; paymentMethod: string; total: number }) {
    return apiClient.post('/api/orders', data);
  },
};

export const ordersService = orderService;

export const reviewService = {
  async getReviews(productId: string) {
    return apiClient.get(`/api/reviews/product/${productId}`);
  },

  async createReview(data: { productId: string; rating: number; title?: string; comment?: string }) {
    return apiClient.post('/api/reviews', data);
  },

  async deleteReview(reviewId: string) {
    return apiClient.delete(`/api/reviews/${reviewId}`);
  },

  async getStats(productId: string) {
    return apiClient.get(`/api/reviews/stats/${productId}`);
  },
};

export const recommendationService = {
  async getRecommendations() {
    return apiClient.get('/api/recommendations/personalized');
  },

  async getTrending() {
    return apiClient.get('/api/recommendations/trending');
  },

  async getSimilar(productId: string) {
    return apiClient.get(`/api/recommendations/similar/${productId}`);
  },

  async getCarousels() {
    return apiClient.get('/api/recommendations/carousels');
  },
};
