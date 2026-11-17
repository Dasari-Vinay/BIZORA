import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
  IndianRupee,
  Package,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardCard } from '../components/DashboardCard';
import { useBizora } from '../context/BizoraContext';
import { SALES_SERIES_7D, SALES_SERIES_MONTHLY } from '../data/mockData';
import { formatCurrency, formatDate, getTodayIso } from '../utils/formatters';

export function Dashboard() {
  const { products, customers, orders, businessProfile } = useBizora();
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState<'7d' | '6m'>('7d');

  const currency = businessProfile.currency;
  const today = getTodayIso();

  const activeProducts = useMemo(() => products.filter((p) => !p.archived), [products]);

  const lowStockProducts = useMemo(
    () =>
      activeProducts
        .filter((p) => p.availableQuantity <= p.minimumStock)
        .sort((a, b) => a.availableQuantity - b.availableQuantity),
    [activeProducts]
  );

  const todaysSales = useMemo(
    () =>
      orders
        .filter((o) => o.date === today)
        .reduce((sum, o) => sum + o.totalAmount, 0),
    [orders, today]
  );

  const todaysOrderCount = useMemo(
    () => orders.filter((o) => o.date === today).length,
    [orders, today]
  );

  const pendingPaymentsTotal = useMemo(
    () => orders.reduce((sum, o) => sum + o.remainingBalance, 0),
    [orders]
  );

  const pendingInvoicesCount = useMemo(
    () => orders.filter((o) => o.remainingBalance > 0).length,
    [orders]
  );

  const chartData: Array<{ label: string; sales: number }> =
    chartRange === '7d' ? SALES_SERIES_7D : SALES_SERIES_MONTHLY;

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  return (
    <div className="space-y-6">
      {/* KPI Summary Strip */}
      <section aria-label="Business metrics summary" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Products"
          value={activeProducts.length}
          subtitle={`${lowStockProducts.length} items below minimum stock`}
          icon={<Package className="w-4 h-4" />}
          accent="navy"
          onClick={() => navigate('/inventory')}
        />
        <DashboardCard
          title="Total Customers"
          value={customers.length}
          subtitle="Active B2B & retail accounts"
          icon={<Users className="w-4 h-4" />}
          accent="teal"
          onClick={() => navigate('/customers')}
        />
        <DashboardCard
          title="Today's Sales"
          value={formatCurrency(todaysSales, currency)}
          subtitle={`${todaysOrderCount} orders billed today`}
          icon={<IndianRupee className="w-4 h-4" />}
          accent="emerald"
          onClick={() => navigate('/orders')}
        />
        <DashboardCard
          title="Pending Payments"
          value={formatCurrency(pendingPaymentsTotal, currency)}
          subtitle={`Across ${pendingInvoicesCount} open invoices`}
          icon={<CreditCard className="w-4 h-4" />}
          accent="gold"
          onClick={() => navigate('/payments')}
        />
      </section>

      {/* Sales Chart & Low-Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Sales Overview Chart */}
        <section className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display text-base font-semibold text-[#12304A]">
                Sales Overview
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {chartRange === '7d' ? 'Daily gross order volume (Last 7 days)' : 'Monthly sales trajectory (6 months)'}
              </p>
            </div>

            <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setChartRange('7d')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  chartRange === '7d'
                    ? 'bg-white text-[#12304A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setChartRange('6m')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  chartRange === '6m'
                    ? 'bg-white text-[#12304A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                6 Months
              </button>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="bizoraSalesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#168C83" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#168C83" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickFormatter={(val: number) =>
                    val >= 1000 ? `${currency}${Math.round(val / 1000)}k` : `${currency}${val}`
                  }
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value ?? 0), currency), 'Sales']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#168C83"
                  strokeWidth={2.5}
                  fill="url(#bizoraSalesGradient)"
                  activeDot={{ r: 5, fill: '#12304A', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Low-Stock Watchlist */}
        <section className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-[#12304A]">
                Low-Stock Products
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Items at or below reorder level
              </p>
            </div>
            <Link
              to="/purchases"
              className="text-xs font-medium text-[#168C83] hover:text-[#11736B] hover:underline whitespace-nowrap"
            >
              Restock
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <p className="text-sm font-medium text-slate-700">All stock levels healthy</p>
              <p className="text-xs text-slate-500 mt-1">
                No active products are currently below minimum thresholds.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 flex-1">
              {lowStockProducts.slice(0, 5).map((item) => (
                <li key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span className="font-mono">{item.sku}</span>
                      <span aria-hidden="true">·</span>
                      <span>Min {item.minimumStock} {item.unit}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 tabular-nums">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                      <span>
                        {item.availableQuantity} {item.unit}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/inventory"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#12304A] hover:text-[#168C83] transition-colors"
            >
              <span>Review full inventory</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>

      {/* Recent Orders */}
      <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#12304A]">
              Recent Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest customer invoices and settlement status
            </p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-medium text-[#168C83] hover:text-[#11736B] hover:underline whitespace-nowrap"
          >
            View all orders
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="px-5 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap">
                  Order No.
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap">
                  Customer
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap">
                  Date
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right whitespace-nowrap">
                  Total
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-600 text-right whitespace-nowrap">
                  Balance Due
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate('/orders')}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3 font-mono text-xs font-medium text-[#12304A] whitespace-nowrap">
                    {order.orderNumber}
                  </td>
                  <td className="px-5 py-3 text-slate-800 font-medium">
                    {order.customerName}
                  </td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap tabular-nums">
                    {formatDate(order.date)}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-slate-900 tabular-nums whitespace-nowrap">
                    {formatCurrency(order.totalAmount, currency)}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums whitespace-nowrap text-slate-700">
                    {formatCurrency(order.remainingBalance, currency)}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span
                      className={`text-xs font-semibold ${
                        order.status === 'Paid'
                          ? 'text-emerald-700'
                          : order.status === 'Partial'
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
