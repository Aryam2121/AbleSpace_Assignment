import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Navigation {
  id: string;
  title: string;
  slug: string;
  lastScrapedAt?: string;
  categoryCount?: number;
}

export interface Category {
  id: string;
  navigationId: string;
  title: string;
  slug: string;
  productCount: number;
  children?: Category[];
}

export interface Product {
  id: string;
  sourceId: string;
  title: string;
  author?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  sourceUrl: string;
  category?: {
    title: string;
    slug: string;
  };
}

export interface ProductDetail {
  description?: string;
  ratingsAvg?: number;
  reviewsCount: number;
  recommendations?: string[];
  publisher?: string;
  publicationDate?: string;
  isbn?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface ProductWithDetail extends Product {
  detail?: ProductDetail;
  reviews: Review[];
  recommendedProducts?: Product[];
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Navigation API
export const navigationApi = {
  getAll: async (): Promise<Navigation[]> => {
    const { data } = await apiClient.get('/navigation');
    return data;
  },
  
  getBySlug: async (slug: string, includeCategories = false): Promise<any> => {
    const { data } = await apiClient.get(`/navigation/${slug}`, {
      params: { includeCategories },
    });
    return data;
  },
  
  triggerScrape: async (slug: string) => {
    const { data } = await apiClient.post(`/navigation/${slug}/scrape`);
    return data;
  },
};

// Category API
export const categoryApi = {
  getAll: async (navigationId?: string): Promise<Category[]> => {
    const { data } = await apiClient.get('/categories', {
      params: { navigationId },
    });
    return data;
  },
  
  getBySlug: async (slug: string, includeProducts = false, page = 1, limit = 20): Promise<any> => {
    const { data } = await apiClient.get(`/categories/${slug}`, {
      params: { includeProducts, page, limit },
    });
    return data;
  },
  
  triggerScrape: async (slug: string) => {
    const { data } = await apiClient.post(`/categories/${slug}/scrape`);
    return data;
  },
};

// Product API
export const productApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    author?: string;
  }): Promise<PaginatedProducts> => {
    const { data } = await apiClient.get('/products', { params });
    return data;
  },
  
  getById: async (id: string, includeDetail = true): Promise<ProductWithDetail> => {
    const { data } = await apiClient.get(`/products/${id}`, {
      params: { includeDetail },
    });
    return data;
  },
  
  triggerScrape: async (id: string) => {
    const { data } = await apiClient.post(`/products/${id}/scrape`);
    return data;
  },
};

// History API
export const historyApi = {
  create: async (history: {
    sessionId: string;
    userId?: string;
    pathJson: any;
  }) => {
    const { data } = await apiClient.post('/history', history);
    return data;
  },
  
  getBySessionId: async (sessionId: string, limit = 50) => {
    const { data } = await apiClient.get(`/history/session/${sessionId}`, {
      params: { limit },
    });
    return data;
  },
};

export default apiClient;
