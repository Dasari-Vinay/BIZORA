import React, { createContext, useContext, useState } from 'react';
import {
  DEMO_USER,
  INITIAL_BUSINESS_PROFILE,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_PRODUCTS,
  INITIAL_PURCHASES,
  INITIAL_SUPPLIERS,
} from '../data/mockData';
import {
  BusinessProfile,
  Customer,
  Order,
  OrderItem,
  PaymentMethod,
  PaymentRecord,
  Product,
  PurchaseItem,
  PurchaseOrder,
  Supplier,
  ToastMessage,
  User,
} from '../types';
import { getTodayIso } from '../utils/formatters';

interface BizoraContextValue {
  user: User | null;
  isAuthenticated: boolean;
  businessProfile: BusinessProfile;
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  orders: Order[];
  payments: PaymentRecord[];
  purchases: PurchaseOrder[];
  toasts: ToastMessage[];
  login: (email: string, password: string) => void;
  loginDemo: () => void;
  register: (data: {
    name: string;
    businessName: string;
    email: string;
    mobile: string;
    password: string;
  }) => void;
  logout: () => void;
  addToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'sku' | 'archived' | 'updatedAt'> & { sku?: string }) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  toggleArchiveProduct: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'outstandingBalance' | 'totalOrders' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  createOrder: (payload: {
    customerId: string;
    items: OrderItem[];
    initialPayment: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => Order;
  recordPayment: (payload: {
    orderId: string;
    amount: number;
    method: PaymentMethod;
    reference: string;
  }) => void;
  createPurchase: (payload: {
    supplierId: string;
    items: PurchaseItem[];
    notes?: string;
  }) => PurchaseOrder;
  updateBusinessProfile: (profile: BusinessProfile) => void;
  updateUserAccount: (updates: Partial<User>) => void;
  resetDemoWorkspace: () => void;
}

const BizoraContext = createContext<BizoraContextValue | undefined>(undefined);

const SESSION_USER_KEY = 'bizora_demo_user';

export function BizoraProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_USER_KEY);
      return saved ? (JSON.parse(saved) as User) : null;
    } catch {
      return null;
    }
  });

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(INITIAL_BUSINESS_PROFILE);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(INITIAL_PURCHASES);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = (email: string, _password: string) => {
    const loggedInUser: User = {
      ...DEMO_USER,
      email: email.trim(),
      name: email.trim().toLowerCase() === DEMO_USER.email.toLowerCase()
        ? DEMO_USER.name
        : email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    };
    setUser(loggedInUser);
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(loggedInUser));
    sessionStorage.setItem('bizora_auth_token', 'preview-session-token');
    addToast(`Signed in as ${loggedInUser.name}`);
  };

  const loginDemo = () => {
    setUser(DEMO_USER);
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(DEMO_USER));
    sessionStorage.setItem('bizora_auth_token', 'preview-session-token');
    addToast(`Signed in to demo workspace as ${DEMO_USER.name}`);
  };

  const register = (data: {
    name: string;
    businessName: string;
    email: string;
    mobile: string;
    password: string;
  }) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      role: 'Owner & Administrator',
      mobile: data.mobile.trim(),
      avatarUrl: DEMO_USER.avatarUrl,
    };
    setUser(newUser);
    setBusinessProfile((prev) => ({
      ...prev,
      businessName: data.businessName.trim(),
      email: data.email.trim(),
      phone: data.mobile.trim(),
    }));
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(newUser));
    sessionStorage.setItem('bizora_auth_token', 'preview-session-token');
    addToast(`Workspace created for ${data.businessName.trim()}`);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_USER_KEY);
    sessionStorage.removeItem('bizora_auth_token');
    addToast('Signed out of BIZORA', 'info');
  };

  const addProduct = (
    productData: Omit<Product, 'id' | 'sku' | 'archived' | 'updatedAt'> & { sku?: string }
  ): Product => {
    const nextNum = 101 + products.length;
    const prefix = productData.category.slice(0, 2).toUpperCase() || 'PR';
    const newProduct: Product = {
      ...productData,
      id: `prd-${Date.now()}`,
      sku: productData.sku?.trim() || `BZ-${prefix}-${nextNum}`,
      archived: false,
      updatedAt: getTodayIso(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    addToast(`Added "${newProduct.name}" to inventory`);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: getTodayIso() } : p
      )
    );
    addToast('Product details updated');
  };

  const toggleArchiveProduct = (id: string) => {
    let targetName = '';
    let nextArchived = false;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        targetName = p.name;
        nextArchived = !p.archived;
        return { ...p, archived: nextArchived, updatedAt: getTodayIso() };
      })
    );
    addToast(
      nextArchived ? `Archived "${targetName}"` : `Restored "${targetName}" to active stock`,
      'info'
    );
  };

  const addCustomer = (
    customerData: Omit<Customer, 'id' | 'outstandingBalance' | 'totalOrders' | 'createdAt'>
  ): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      outstandingBalance: 0,
      totalOrders: 0,
      createdAt: getTodayIso(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    addToast(`Added customer "${newCustomer.name}"`);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    addToast('Customer details updated');
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt'>): Supplier => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      createdAt: getTodayIso(),
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    addToast(`Added supplier "${newSupplier.name}"`);
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    addToast('Supplier details updated');
  };

  const createOrder = (payload: {
    customerId: string;
    items: OrderItem[];
    initialPayment: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Order => {
    const customer = customers.find((c) => c.id === payload.customerId);
    if (!customer) {
      throw new Error('Selected customer not found');
    }

    const subtotal = payload.items.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalAmount = subtotal;
    const paidAmount = Math.min(Math.max(0, payload.initialPayment), totalAmount);
    const remainingBalance = Math.max(0, totalAmount - paidAmount);
    const status =
      remainingBalance === 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending';

    const orderNum = `ORD-2026-${1049 + orders.length}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      items: payload.items,
      subtotal,
      taxAmount: 0,
      totalAmount,
      paidAmount,
      remainingBalance,
      status,
      date: getTodayIso(),
      notes: payload.notes,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Deduct sold quantities from inventory
    setProducts((prev) =>
      prev.map((prod) => {
        const line = payload.items.find((i) => i.productId === prod.id);
        if (!line) return prod;
        return {
          ...prod,
          availableQuantity: Math.max(0, prod.availableQuantity - line.quantity),
          updatedAt: getTodayIso(),
        };
      })
    );

    // Update customer totals & outstanding balance
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customer.id
          ? {
              ...c,
              totalOrders: c.totalOrders + 1,
              outstandingBalance: c.outstandingBalance + remainingBalance,
            }
          : c
      )
    );

    if (paidAmount > 0) {
      const paymentRec: PaymentRecord = {
        id: `pay-${Date.now()}`,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        customerId: customer.id,
        customerName: customer.name,
        amount: paidAmount,
        method: payload.paymentMethod,
        reference: `INIT-${orderNum.slice(-4)}`,
        date: getTodayIso(),
      };
      setPayments((prev) => [paymentRec, ...prev]);
    }

    addToast(`Order ${orderNum} confirmed`);
    return newOrder;
  };

  const recordPayment = (payload: {
    orderId: string;
    amount: number;
    method: PaymentMethod;
    reference: string;
  }) => {
    const targetOrder = orders.find((o) => o.id === payload.orderId);
    if (!targetOrder) return;

    const applied = Math.min(Math.max(0, payload.amount), targetOrder.remainingBalance);
    if (applied <= 0) return;

    const newPaid = targetOrder.paidAmount + applied;
    const newRemaining = Math.max(0, targetOrder.totalAmount - newPaid);
    const newStatus = newRemaining === 0 ? 'Paid' : 'Partial';

    setOrders((prev) =>
      prev.map((o) =>
        o.id === targetOrder.id
          ? {
              ...o,
              paidAmount: newPaid,
              remainingBalance: newRemaining,
              status: newStatus,
            }
          : o
      )
    );

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === targetOrder.customerId
          ? {
              ...c,
              outstandingBalance: Math.max(0, c.outstandingBalance - applied),
            }
          : c
      )
    );

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      customerId: targetOrder.customerId,
      customerName: targetOrder.customerName,
      amount: applied,
      method: payload.method,
      reference: payload.reference.trim() || `PAY-${Date.now().toString().slice(-5)}`,
      date: getTodayIso(),
    };
    setPayments((prev) => [newPayment, ...prev]);
    addToast(`Payment recorded for ${targetOrder.orderNumber}`);
  };

  const createPurchase = (payload: {
    supplierId: string;
    items: PurchaseItem[];
    notes?: string;
  }): PurchaseOrder => {
    const supplier = suppliers.find((s) => s.id === payload.supplierId);
    if (!supplier) {
      throw new Error('Selected supplier not found');
    }

    const totalAmount = payload.items.reduce((sum, i) => sum + i.lineTotal, 0);
    const poNumber = `PO-2026-${310 + purchases.length}`;

    const newPurchase: PurchaseOrder = {
      id: `pur-${Date.now()}`,
      purchaseNumber: poNumber,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: payload.items,
      totalAmount,
      status: 'Received',
      date: getTodayIso(),
      notes: payload.notes,
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    // Increase stock and update latest purchase price
    setProducts((prev) =>
      prev.map((prod) => {
        const line = payload.items.find((i) => i.productId === prod.id);
        if (!line) return prod;
        return {
          ...prod,
          availableQuantity: prod.availableQuantity + line.quantity,
          purchasePrice: line.purchasePrice,
          updatedAt: getTodayIso(),
        };
      })
    );

    addToast(`Stock received under ${poNumber}`);
    return newPurchase;
  };

  const updateBusinessProfile = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
    addToast('Business profile saved');
  };

  const updateUserAccount = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(updated));
      return updated;
    });
    addToast('Account details updated');
  };

  const resetDemoWorkspace = () => {
    setBusinessProfile(INITIAL_BUSINESS_PROFILE);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setOrders(INITIAL_ORDERS);
    setPayments(INITIAL_PAYMENTS);
    setPurchases(INITIAL_PURCHASES);
    addToast('Demo workspace data restored to defaults', 'info');
  };

  return (
    <BizoraContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        businessProfile,
        products,
        customers,
        suppliers,
        orders,
        payments,
        purchases,
        toasts,
        login,
        loginDemo,
        register,
        logout,
        addToast,
        dismissToast,
        addProduct,
        updateProduct,
        toggleArchiveProduct,
        addCustomer,
        updateCustomer,
        addSupplier,
        updateSupplier,
        createOrder,
        recordPayment,
        createPurchase,
        updateBusinessProfile,
        updateUserAccount,
        resetDemoWorkspace,
      }}
    >
      {children}
    </BizoraContext.Provider>
  );
}

export function useBizora() {
  const ctx = useContext(BizoraContext);
  if (!ctx) {
    throw new Error('useBizora must be used inside BizoraProvider');
  }
  return ctx;
}
