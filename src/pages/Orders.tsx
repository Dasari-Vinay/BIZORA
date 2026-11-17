import React, { useMemo, useState } from 'react';
import { CheckCircle2, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Column, DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { useBizora } from '../context/BizoraContext';
import { Order, OrderItem, PaymentMethod, PaymentStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export function Orders() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isCreating = pathname === '/orders/new';

  const {
    orders,
    customers,
    products,
    createOrder,
    businessProfile,
    addToast,
  } = useBizora();
  const currency = businessProfile.currency;

  // Order history state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Create order builder state
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [productSearch, setProductSearch] = useState('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [initialPayment, setInitialPayment] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const availableProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((p) => {
      if (p.archived) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    });
  }, [products, productSearch]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerMobile.includes(q)
      );
    });
  }, [orders, searchQuery, statusFilter]);

  const orderTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [cartItems]
  );

  const addProductToCart = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    if (prod.availableQuantity <= 0) {
      addToast(`"${prod.name}" is out of stock.`, 'error');
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        if (existing.quantity >= prod.availableQuantity) {
          addToast(`Only ${prod.availableQuantity} ${prod.unit} available in stock.`, 'error');
          return prev;
        }
        return prev.map((i) =>
          i.productId === productId
            ? {
                ...i,
                quantity: i.quantity + 1,
                lineTotal: (i.quantity + 1) * i.unitPrice,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          unit: prod.unit,
          quantity: 1,
          unitPrice: prod.sellingPrice,
          lineTotal: prod.sellingPrice,
        },
      ];
    });
    setFormError('');
  };

  const updateCartQuantity = (productId: string, nextQty: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    if (nextQty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    const clamped = Math.min(nextQty, prod.availableQuantity);
    if (nextQty > prod.availableQuantity) {
      addToast(`Capped at available stock (${prod.availableQuantity} ${prod.unit}).`, 'info');
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: clamped, lineTotal: clamped * i.unitPrice }
          : i
      )
    );
  };

  const removeCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setFormError('Select a customer for this order.');
      return;
    }
    if (cartItems.length === 0) {
      setFormError('Add at least one product to the order.');
      return;
    }

    const paid = initialPayment === '' ? 0 : Number(initialPayment);
    if (Number.isNaN(paid) || paid < 0) {
      setFormError('Enter a valid initial payment amount.');
      return;
    }

    createOrder({
      customerId,
      items: cartItems,
      initialPayment: Math.min(paid, orderTotal),
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    setCartItems([]);
    setInitialPayment('');
    setNotes('');
    setFormError('');
    navigate('/orders');
  };

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Order No.',
      render: (o) => (
        <span className="font-mono text-xs font-semibold text-[#12304A]">{o.orderNumber}</span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o) => (
        <div>
          <div className="font-medium text-slate-900">{o.customerName}</div>
          <div className="text-xs text-slate-500 font-mono">{o.customerMobile}</div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (o) => <span className="text-slate-600 tabular-nums">{formatDate(o.date)}</span>,
    },
    {
      key: 'items',
      header: 'Items',
      align: 'right',
      render: (o) => <span className="text-slate-700">{o.items.length}</span>,
    },
    {
      key: 'total',
      header: 'Total Amount',
      align: 'right',
      render: (o) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(o.totalAmount, currency)}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance Due',
      align: 'right',
      render: (o) => (
        <span className={o.remainingBalance > 0 ? 'font-medium text-amber-700' : 'text-slate-500'}>
          {formatCurrency(o.remainingBalance, currency)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => (
        <span
          className={`text-xs font-semibold ${
            o.status === 'Paid'
              ? 'text-emerald-700'
              : o.status === 'Partial'
              ? 'text-amber-700'
              : 'text-red-700'
          }`}
        >
          {o.status}
        </span>
      ),
    },
  ];

  if (isCreating) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#12304A]">Create Sales Order</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select customer, pick products from live stock, and confirm invoice.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="min-h-[40px] px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View Order History
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Product Picker */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-display text-sm font-semibold text-[#12304A]">
                Search & Add Products
              </h3>
              <SearchBar
                value={productSearch}
                onChange={setProductSearch}
                placeholder="Search SKU, name, brand..."
                ariaLabel="Search products to add to order"
                className="sm:w-64"
              />
            </div>

            <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto border-t border-slate-100">
              {availableProducts.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No matching active products found.
                </p>
              ) : (
                availableProducts.map((prod) => {
                  const inCart = cartItems.find((i) => i.productId === prod.id);
                  const outOfStock = prod.availableQuantity <= 0;
                  return (
                    <div
                      key={prod.id}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#12304A] truncate">
                          {prod.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="font-mono">{prod.sku}</span>
                          <span aria-hidden="true">·</span>
                          <span>{prod.brand}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              prod.availableQuantity <= prod.minimumStock
                                ? 'text-amber-700 font-medium'
                                : 'text-slate-600'
                            }
                          >
                            Stock: {prod.availableQuantity} {prod.unit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(prod.sellingPrice, currency)}
                        </span>
                        <button
                          type="button"
                          disabled={outOfStock}
                          onClick={() => addProductToCart(prod.id)}
                          className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                            outOfStock
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : inCart
                              ? 'bg-[#12304A] text-white hover:bg-[#1B4466]'
                              : 'bg-[#168C83]/10 text-[#168C83] hover:bg-[#168C83] hover:text-white'
                          }`}
                        >
                          {outOfStock ? 'Out of Stock' : inCart ? `Added (${inCart.quantity})` : '+ Add'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Order Cart & Confirmation */}
          <form
            onSubmit={handleConfirmOrder}
            className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-5"
          >
            <div>
              <label htmlFor="order-customer" className="block text-sm font-medium text-slate-700 mb-1.5">
                Select customer
              </label>
              <select
                id="order-customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:border-[#168C83]"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.mobile})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-sm font-semibold text-[#12304A]">
                  Order Items ({cartItems.length})
                </h3>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-8 text-center rounded-lg bg-slate-50 border border-dashed border-slate-200">
                  <ShoppingCart className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    Add products from the catalog on the left.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                  {cartItems.map((item) => {
                    const liveProd = products.find((p) => p.id === item.productId);
                    const maxStock = liveProd?.availableQuantity ?? item.quantity;
                    return (
                      <div key={item.productId} className="py-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-800 truncate">
                              {item.productName}
                            </div>
                            <div className="text-xs text-slate-500 tabular-nums">
                              {formatCurrency(item.unitPrice, currency)} / {item.unit} · Max {maxStock}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCartItem(item.productId)}
                            aria-label={`Remove ${item.productName}`}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-500">Qty:</label>
                            <input
                              type="number"
                              min={1}
                              max={maxStock}
                              value={item.quantity}
                              onChange={(e) =>
                                updateCartQuantity(item.productId, Number(e.target.value))
                              }
                              className="w-20 min-h-[34px] px-2.5 py-1 rounded border border-slate-200 text-sm tabular-nums focus:outline-none focus:border-[#168C83]"
                            />
                          </div>
                          <div className="text-sm font-semibold text-[#12304A] tabular-nums">
                            {formatCurrency(item.lineTotal, currency)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Advance / Paid ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  max={orderTotal}
                  value={initialPayment}
                  onChange={(e) => setInitialPayment(e.target.value)}
                  placeholder="0"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 text-sm tabular-nums focus:outline-none focus:border-[#168C83]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Payment method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#168C83]"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Order notes (optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Delivery instructions or PO reference"
                className="w-full min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Order Total</span>
                <span className="font-display text-xl font-bold text-[#12304A] tabular-nums">
                  {formatCurrency(orderTotal, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Remaining Balance</span>
                <span className="tabular-nums font-medium">
                  {formatCurrency(
                    Math.max(0, orderTotal - (Number(initialPayment) || 0)),
                    currency
                  )}
                </span>
              </div>
            </div>

            {formError && <p className="text-xs text-red-600">{formError}</p>}

            <button
              type="submit"
              className="w-full min-h-[44px] px-5 py-2.5 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Order</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search order number, customer, or mobile..."
            ariaLabel="Search orders"
            className="sm:max-w-xs flex-1"
          />

          <div className="inline-flex items-center p-1 bg-slate-200/70 rounded-lg self-start sm:self-auto">
            {(['All', 'Pending', 'Partial', 'Paid'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white text-[#12304A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/orders/new')}
          className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Create Order</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        keyExtractor={(o) => o.id}
        onRowClick={(o) => setSelectedOrder(o)}
        emptyTitle="No orders match your filter"
        emptyDescription="Create a new sales order or clear the active search filter."
        emptyAction={
          <button
            type="button"
            onClick={() => navigate('/orders/new')}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] text-white text-sm font-medium hover:bg-[#11736B]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </button>
        }
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-[#12304A] font-mono">
                  {selectedOrder.orderNumber}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedOrder.customerName} · {formatDate(selectedOrder.date)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="divide-y divide-slate-100">
                {selectedOrder.items.map((item) => (
                  <div key={item.productId} className="py-2.5 flex items-center justify-between gap-4 text-sm">
                    <div>
                      <div className="font-medium text-slate-800">{item.productName}</div>
                      <div className="text-xs text-slate-500 tabular-nums">
                        {item.quantity} {item.unit} × {formatCurrency(item.unitPrice, currency)}
                      </div>
                    </div>
                    <div className="font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(item.lineTotal, currency)}
                    </div>
                  </div>
                ))}
              </div>

              {selectedOrder.notes && (
                <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-600">
                  Note: {selectedOrder.notes}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Amount</span>
                  <span className="font-semibold text-[#12304A] tabular-nums">
                    {formatCurrency(selectedOrder.totalAmount, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Paid Amount</span>
                  <span className="font-medium text-emerald-700 tabular-nums">
                    {formatCurrency(selectedOrder.paidAmount, currency)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">Remaining Balance</span>
                  <span className="text-amber-700 tabular-nums">
                    {formatCurrency(selectedOrder.remainingBalance, currency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="min-h-[38px] px-4 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {selectedOrder.remainingBalance > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    navigate('/payments');
                  }}
                  className="min-h-[38px] px-4 py-1.5 rounded-lg bg-[#168C83] text-white text-sm font-medium hover:bg-[#11736B]"
                >
                  Record Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
