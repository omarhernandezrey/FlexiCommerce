import { useAuthStore } from '../store/auth';
import apiClient from './api-client';

export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    const { user, token } = response.data;
    useAuthStore.getState().setAuth(user, token);
    return { user, token };
  },

  async register(email: string, password: string, firstName: string, lastName: string) {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
    const { user, token } = response.data;
    useAuthStore.getState().setAuth(user, token);
    return { user, token };
  },

  async logout() {
    useAuthStore.getState().logout();
  },

  async verifyToken() {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  },
};

export const productService = {
  async getProducts(page = 1, limit = 10, category?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (category) params.append('category', category);
    return apiClient.get(`/products?${params}`);
  },

  async getProduct(id: string) {
    return apiClient.get(`/products/${id}`);
  },

  async searchProducts(query: string) {
    return apiClient.get(`/products/search?q=${query}`);
  },
};

export const cartService = {
  async checkout(items: any[]) {
    return apiClient.post('/orders', { items });
  },
};

export const orderService = {
  async getOrders() {
    return apiClient.get('/orders');
  },

  async getOrder(id: string) {
    return apiClient.get(`/orders/${id}`);
  },
};

export const reviewService = {
  async getReviews(productId: string) {
    return apiClient.get(`/reviews/product/${productId}`);
  },

  async createReview(productId: string, rating: number, comment?: string) {
    return apiClient.post('/reviews', {
      productId,
      rating,
      comment,
    });
  },

  async deleteReview(reviewId: string) {
    return apiClient.delete(`/reviews/${reviewId}`);
  },

  async getStats(productId: string) {
    return apiClient.get(`/reviews/stats/${productId}`);
  },
};

export const recommendationService = {
  async getRecommendations() {
    return apiClient.get('/recommendations/personalized');
  },

  async getTrending() {
    return apiClient.get('/recommendations/trending');
  },

  async getSimilar(productId: string) {
    return apiClient.get(`/recommendations/similar/${productId}`);
  },

  async getCarousels() {
    return apiClient.get('/recommendations/carousels');
  },
};
