import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useBizora } from '../context/BizoraContext';
import { SALES_SERIES_7D, SALES_SERIES_MONTHLY } from '../data/mockData';
import { exportToCsv, formatCurrency, formatDate } from '../utils/formatters';

type ReportTab = 'daily' | 'monthly' | 'inventory' | 'low-stock' | 'outstanding';

export function Reports() {
  const { products, orders, customers, businessProfile, addToast } = useBizora();
  const currency = businessProfile.currency;

  const [activeTab, setActiveTab] = useState<ReportTab>('daily');

  const activeProducts = useMemo(() => products.filter((p) => !p.archived), [products]);

  const lowStockProducts = useMemo(
    () => activeProducts.filter((p) => p.availableQuantity <= p.minimumStock),
    [activeProducts]
  );

  const outstandingOrders = useMemo(
    () => orders.filter((o) => o.remainingBalance > 0),
    [orders]
  );

  const inventoryTotals = useMemo(() => {
    const units = activeProducts.reduce((sum, p) => sum + p.availableQuantity, 0);
    const costValue = activeProducts.reduce(
      (sum, p) => sum + p.availableQuantity * p.purchasePrice,
      0
    );
    const retailValue = activeProducts.reduce(
      (sum, p) => sum + p.availableQuantity * p.sellingPrice,
      0
    );
    return { units, costValue, retailValue };
  }, [activeProducts]);

  const handleExportCsv = () => {
    if (activeTab === 'daily') {
      exportToCsv(
        'bizora-daily-sales.csv',
        ['Date', 'Orders', 'Sales Amount'],
        SALES_SERIES_7D.map((d) => [d.label, d.orders, d.sales])
      );
    } else if (activeTab === 'monthly') {
      exportToCsv(
        'bizora-monthly-sales.csv',
        ['Month', 'Sales', 'Purchases'],
        SALES_SERIES_MONTHLY.map((m) => [m.label, m.sales, m.purchases])
      );
    } else if (activeTab === 'inventory') {
      exportToCsv(
        'bizora-inventory-valuation.csv',
        ['SKU', 'Product', 'Category', 'Qty', 'Unit', 'Purchase Price', 'Selling Price', 'Stock Cost Value'],
        activeProducts.map((p) => [
          p.sku,
          p.name,
          p.category,
          p.availableQuantity,
          p.unit,
          p.purchasePrice,
          p.sellingPrice,
          p.availableQuantity * p.purchasePrice,
        ])
      );
    } else if (activeTab === 'low-stock') {
      exportToCsv(
        'bizora-low-stock.csv',
        ['SKU', 'Product', 'Available Qty', 'Minimum Stock', 'Deficit'],
        lowStockProducts.map((p) => [
          p.sku,
          p.name,
          p.availableQuantity,
          p.minimumStock,
          Math.max(0, p.minimumStock - p.availableQuantity),
        ])
      );
    } else {
      exportToCsv(
        'bizora-outstanding-payments.csv',
        ['Order No', 'Customer', 'Date', 'Total', 'Paid', 'Remaining Balance'],
        outstandingOrders.map((o) => [
          o.orderNumber,
          o.customerName,
          o.date,
          o.totalAmount,
          o.paidAmount,
          o.remainingBalance,
        ])
      );
    }
    addToast('Report exported as CSV');
  };

  return (
    <div className="space-y-6">
      {/* Report Navigation + Export */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start">
          {(
            [
              { id: 'daily', label: 'Daily Sales' },
              { id: 'monthly', label: 'Monthly Sales' },
              { id: 'inventory', label: 'Inventory' },
              { id: 'low-stock', label: 'Low-Stock Products' },
              { id: 'outstanding', label: 'Outstanding Payments' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-[#12304A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#12304A] text-sm font-medium transition-colors whitespace-nowrap self-start lg:self-auto"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Report Body */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-[#12304A] mb-1">
              Daily Sales Breakdown
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Gross sales volume across the past 7 business days
            </p>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SALES_SERIES_7D}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    tickFormatter={(v: number) => `${currency}${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(val) => [formatCurrency(Number(val ?? 0), currency), 'Sales']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Bar dataKey="sales" fill="#168C83" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600">Date</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right">Orders</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right">Gross Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SALES_SERIES_7D.map((d) => (
                  <tr key={d.label} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-medium text-[#12304A]">{d.label}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">{d.orders}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-slate-900">
                      {formatCurrency(d.sales, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-[#12304A] mb-1">
              Monthly Sales vs. Purchases
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              6-month comparison of revenue billed and stock purchased
            </p>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SALES_SERIES_MONTHLY}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    tickFormatter={(v: number) => `${currency}${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(val, name) => [
                      formatCurrency(Number(val ?? 0), currency),
                      name === 'sales' ? 'Sales' : 'Purchases',
                    ]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="sales" name="Sales" fill="#12304A" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="purchases" name="Purchases" fill="#F4B942" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600">Month</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right">Sales</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right">Purchases</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right">Net Spread</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SALES_SERIES_MONTHLY.map((m) => (
                  <tr key={m.label} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-medium text-[#12304A]">{m.label} 2026</td>
                    <td className="px-5 py-3 text-right tabular-nums font-medium text-slate-900">
                      {formatCurrency(m.sales, currency)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {formatCurrency(m.purchases, currency)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-[#168C83]">
                      {formatCurrency(m.sales - m.purchases, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
              <div className="text-xs font-medium text-slate-500">Total Stock Units</div>
              <div className="mt-1 font-display text-2xl font-bold text-[#12304A] tabular-nums">
                {inventoryTotals.units.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
              <div className="text-xs font-medium text-slate-500">Inventory Cost Value</div>
              <div className="mt-1 font-display text-2xl font-bold text-[#12304A] tabular-nums">
                {formatCurrency(inventoryTotals.costValue, currency)}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
              <div className="text-xs font-medium text-slate-500">Potential Retail Value</div>
              <div className="mt-1 font-display text-2xl font-bold text-[#168C83] tabular-nums">
                {formatCurrency(inventoryTotals.retailValue, currency)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600">Product</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right">Stock</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right">Cost Value</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right">Retail Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="font-medium text-[#12304A]">{p.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{p.sku}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{p.category}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-800">
                      {p.availableQuantity} {p.unit}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {formatCurrency(p.availableQuantity * p.purchasePrice, currency)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-slate-900">
                      {formatCurrency(p.availableQuantity * p.sellingPrice, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'low-stock' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-display text-base font-semibold text-[#12304A]">
              Low-Stock Alert Report ({lowStockProducts.length} items)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Products at or below their configured minimum reorder quantity
            </p>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              All active inventory items are above minimum stock levels.
            </p>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600">Product</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right">Available</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right">Minimum</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right">Reorder Deficit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="font-medium text-[#12304A]">{p.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{p.sku} · {p.brand}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{p.category}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-amber-700">
                      {p.availableQuantity} {p.unit}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {p.minimumStock} {p.unit}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-red-700">
                      {Math.max(0, p.minimumStock - p.availableQuantity)} {p.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'outstanding' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#12304A]">
                Outstanding Payments Report
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Open customer receivables across {customers.filter((c) => c.outstandingBalance > 0).length} accounts
              </p>
            </div>
            <div className="font-display text-lg font-bold text-amber-700 tabular-nums">
              {formatCurrency(
                outstandingOrders.reduce((s, o) => s + o.remainingBalance, 0),
                currency
              )}
            </div>
          </div>
          {outstandingOrders.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No outstanding customer balances.
            </p>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600">Order No.</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600">Customer</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600">Date</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right">Total</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right">Paid</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {outstandingOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-[#12304A]">
                      {o.orderNumber}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800">{o.customerName}</td>
                    <td className="px-5 py-3 text-slate-500 tabular-nums">{formatDate(o.date)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {formatCurrency(o.totalAmount, currency)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-emerald-700">
                      {formatCurrency(o.paidAmount, currency)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-amber-700">
                      {formatCurrency(o.remainingBalance, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
