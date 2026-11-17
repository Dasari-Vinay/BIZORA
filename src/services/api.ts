import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  BusinessProfile,
  Customer,
  Order,
  PaymentRecord,
  Product,
  PurchaseOrder,
  Supplier,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('bizora_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Unable to reach server. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export function getApiErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}

// Backend-ready endpoint definitions for when the API server is connected.
export const authApi = {
  login: (payload: { email: string; password: string }) =>
    apiClient.post('/auth/login', payload),
  register: (payload: {
    name: string;
    businessName: string;
    email: string;
    mobile: string;
    password: string;
  }) => apiClient.post('/auth/register', payload),
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
};

export const productsApi = {
  list: () => apiClient.get<Product[]>('/products'),
  create: (data: Omit<Product, 'id' | 'updatedAt'>) =>
    apiClient.post<Product>('/products', data),
  update: (id: string, data: Partial<Product>) =>
    apiClient.put<Product>(`/products/${id}`, data),
  archive: (id: string, archived: boolean) =>
    apiClient.patch<Product>(`/products/${id}/archive`, { archived }),
};

export const customersApi = {
  list: () => apiClient.get<Customer[]>('/customers'),
  create: (data: Omit<Customer, 'id' | 'createdAt'>) =>
    apiClient.post<Customer>('/customers', data),
  update: (id: string, data: Partial<Customer>) =>
    apiClient.put<Customer>(`/customers/${id}`, data),
};

export const suppliersApi = {
  list: () => apiClient.get<Supplier[]>('/suppliers'),
  create: (data: Omit<Supplier, 'id' | 'createdAt'>) =>
    apiClient.post<Supplier>('/suppliers', data),
  update: (id: string, data: Partial<Supplier>) =>
    apiClient.put<Supplier>(`/suppliers/${id}`, data),
};

export const ordersApi = {
  list: () => apiClient.get<Order[]>('/orders'),
  create: (data: Omit<Order, 'id' | 'orderNumber'>) =>
    apiClient.post<Order>('/orders', data),
};

export const paymentsApi = {
  list: () => apiClient.get<PaymentRecord[]>('/payments'),
  record: (data: Omit<PaymentRecord, 'id'>) =>
    apiClient.post<PaymentRecord>('/payments', data),
};

export const purchasesApi = {
  list: () => apiClient.get<PurchaseOrder[]>('/purchases'),
  create: (data: Omit<PurchaseOrder, 'id' | 'purchaseNumber'>) =>
    apiClient.post<PurchaseOrder>('/purchases', data),
};

export const settingsApi = {
  updateBusinessProfile: (data: BusinessProfile) =>
    apiClient.put<BusinessProfile>('/settings/business', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.put('/settings/password', data),
};
