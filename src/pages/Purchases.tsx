import React, { useMemo, useState } from 'react';
import { CheckCircle2, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Column, DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { useBizora } from '../context/BizoraContext';
import { PurchaseItem, PurchaseOrder } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export function Purchases() {
  const {
    suppliers,
    products,
    purchases,
    createPurchase,
    businessProfile,
  } = useBizora();
  const currency = businessProfile.currency;

  const [mode, setMode] = useState<'history' | 'create'>('history');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? '');
  const [productSearch, setProductSearch] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const filteredProducts = useMemo(() => {
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

  const purchaseTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.lineTotal, 0),
    [items]
  );

  const addProductLine = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? {
                ...i,
                quantity: i.quantity + 10,
                lineTotal: (i.quantity + 10) * i.purchasePrice,
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
          quantity: 10,
          purchasePrice: prod.purchasePrice,
          lineTotal: 10 * prod.purchasePrice,
        },
      ];
    });
    setError('');
  };

  const updateLine = (productId: string, quantity: number, purchasePrice: number) => {
    const safeQty = Math.max(1, quantity);
    const safePrice = Math.max(0, purchasePrice);
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? {
              ...i,
              quantity: safeQty,
              purchasePrice: safePrice,
              lineTotal: safeQty * safePrice,
            }
          : i
      )
    );
  };

  const removeLine = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleConfirmPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      setError('Please select a supplier.');
      return;
    }
    if (items.length === 0) {
      setError('Add at least one product to receive stock.');
      return;
    }

    createPurchase({
      supplierId,
      items,
      notes: notes.trim() || undefined,
    });

    setItems([]);
    setNotes('');
    setError('');
    setMode('history');
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      header: 'Purchase No.',
      render: (po) => (
        <span className="font-mono text-xs font-semibold text-[#12304A]">
          {po.purchaseNumber}
        </span>
      ),
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (po) => <span className="font-medium text-slate-900">{po.supplierName}</span>,
    },
    {
      key: 'date',
      header: 'Received Date',
      render: (po) => <span className="text-slate-600 tabular-nums">{formatDate(po.date)}</span>,
    },
    {
      key: 'items',
      header: 'Products',
      render: (po) => (
        <div className="text-xs text-slate-600">
          {po.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Purchase Total',
      align: 'right',
      render: (po) => (
        <span className="font-semibold text-[#12304A]">
          {formatCurrency(po.totalAmount, currency)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (po) => (
        <span className="text-xs font-semibold text-emerald-700">{po.status}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 bg-slate-200/70 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('history')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              mode === 'history'
                ? 'bg-white text-[#12304A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Purchase History
          </button>
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              mode === 'create'
                ? 'bg-white text-[#12304A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Receive Stock
          </button>
        </div>

        {mode === 'history' && (
          <button
            type="button"
            onClick={() => setMode('create')}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Stock Purchase</span>
          </button>
        )}
      </div>

      {mode === 'history' ? (
        <DataTable
          columns={columns}
          data={purchases}
          keyExtractor={(po) => po.id}
          emptyTitle="No purchases recorded"
          emptyDescription="Create a purchase entry to restock inventory from your suppliers."
          emptyAction={
            <button
              type="button"
              onClick={() => setMode('create')}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] text-white text-sm font-medium hover:bg-[#11736B]"
            >
              <Plus className="w-4 h-4" />
              <span>Receive Stock</span>
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Product Selection */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-sm font-semibold text-[#12304A]">
                  Select Products to Restock
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Low-stock items are highlighted first.
                </p>
              </div>
              <SearchBar
                value={productSearch}
                onChange={setProductSearch}
                placeholder="Search products..."
                ariaLabel="Search products to purchase"
                className="sm:w-56"
              />
            </div>

            <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto border-t border-slate-100">
              {filteredProducts.map((prod) => {
                const isLow = prod.availableQuantity <= prod.minimumStock;
                const added = items.find((i) => i.productId === prod.id);
                return (
                  <div key={prod.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#12304A] truncate">
                        {prod.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono">{prod.sku}</span>
                        <span aria-hidden="true">·</span>
                        <span className={isLow ? 'text-amber-700 font-medium' : ''}>
                          In stock: {prod.availableQuantity} {prod.unit}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => addProductLine(prod.id)}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        added
                          ? 'bg-[#12304A] text-white'
                          : 'bg-[#168C83]/10 text-[#168C83] hover:bg-[#168C83] hover:text-white'
                      }`}
                    >
                      {added ? 'Added' : '+ Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Purchase Receipt Builder */}
          <form
            onSubmit={handleConfirmPurchase}
            className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-5"
          >
            <div>
              <label htmlFor="pur-supplier" className="block text-sm font-medium text-slate-700 mb-1.5">
                Select supplier
              </label>
              <select
                id="pur-supplier"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:border-[#168C83]"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-[#12304A] mb-2">
                Purchase Line Items ({items.length})
              </h3>

              {items.length === 0 ? (
                <div className="py-8 text-center rounded-lg bg-slate-50 border border-dashed border-slate-200">
                  <ShoppingBag className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    Select products from the left list to enter quantities and purchase cost.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                  {items.map((item) => (
                    <div key={item.productId} className="py-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-medium text-slate-800">
                            {item.productName}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">{item.sku}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(item.productId)}
                          aria-label={`Remove ${item.productName}`}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-end">
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">
                            Qty ({item.unit})
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateLine(
                                item.productId,
                                Number(e.target.value),
                                item.purchasePrice
                              )
                            }
                            className="w-full min-h-[36px] px-2.5 py-1 rounded border border-slate-200 text-sm tabular-nums focus:outline-none focus:border-[#168C83]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">
                            Purchase Price ({currency})
                          </label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.purchasePrice}
                            onChange={(e) =>
                              updateLine(
                                item.productId,
                                item.quantity,
                                Number(e.target.value)
                              )
                            }
                            className="w-full min-h-[36px] px-2.5 py-1 rounded border border-slate-200 text-sm tabular-nums focus:outline-none focus:border-[#168C83]"
                          />
                        </div>
                        <div className="text-right pb-1.5">
                          <div className="text-[11px] text-slate-500">Line Total</div>
                          <div className="text-sm font-semibold text-[#12304A] tabular-nums">
                            {formatCurrency(item.lineTotal, currency)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Receiving notes (optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Challan number or warehouse note"
                className="w-full min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Purchase Total</span>
              <span className="font-display text-xl font-bold text-[#12304A] tabular-nums">
                {formatCurrency(purchaseTotal, currency)}
              </span>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full min-h-[44px] px-5 py-2.5 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Received Stock</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
