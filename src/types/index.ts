export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  mobile: string;
  avatarUrl?: string;
}

export interface BusinessProfile {
  businessName: string;
  tagline: string;
  gstNumber: string;
  phone: string;
  email: string;
  address: string;
  currency: '₹' | '$';
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  specification: string;
  colour: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  availableQuantity: number;
  minimumStock: number;
  archived: boolean;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  city: string;
  address: string;
  outstandingBalance: number;
  totalOrders: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  mobile: string;
  email: string;
  city: string;
  address: string;
  gstNumber: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  status: PaymentStatus;
  date: string;
  notes?: string;
}

export type PaymentMethod = 'UPI' | 'Cash' | 'Bank Transfer' | 'Card';

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  date: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  quantity: number;
  purchasePrice: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: 'Received' | 'Pending';
  date: string;
  notes?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
