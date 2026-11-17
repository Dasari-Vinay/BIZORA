import React, { useMemo, useState } from 'react';
import { CheckCircle2, CreditCard, X } from 'lucide-react';
import { Column, DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { useBizora } from '../context/BizoraContext';
import { Order, PaymentMethod, PaymentRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export function Payments() {
  const { orders, payments, recordPayment, businessProfile } = useBizora();
  const currency = businessProfile.currency;

  const [activeTab, setActiveTab] = useState<'due' | 'history'>('due');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  const receivableOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      if (o.remainingBalance <= 0) return false;
      if (!q) return true;
      return (
        o.customerName.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q)
      );
    });
  }, [orders, searchQuery]);

  const filteredPayments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter(
      (p) =>
        p.customerName.toLowerCase().includes(q) ||
        p.orderNumber.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q)
    );
  }, [payments, searchQuery]);

  const totalPending = useMemo(
    () => orders.reduce((sum, o) => sum + o.remainingBalance, 0),
    [orders]
  );

  const totalCollected = useMemo(
    () => payments.reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const openPaymentModal = (order: Order) => {
    setSelectedOrder(order);
    setAmountInput(String(order.remainingBalance));
    setMethod('UPI');
    setReference('');
    setError('');
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const amt = Number(amountInput);
    if (Number.isNaN(amt) || amt <= 0) {
      setError('Enter a payment amount greater than 0.');
      return;
    }
    if (amt > selectedOrder.remainingBalance) {
      setError(
        `Amount cannot exceed remaining balance (${formatCurrency(
          selectedOrder.remainingBalance,
          currency
        )}).`
      );
      return;
    }

    recordPayment({
      orderId: selectedOrder.id,
      amount: amt,
      method,
      reference,
    });
    setSelectedOrder(null);
  };

  const dueColumns: Column<Order>[] = [
    {
      key: 'customer',
      header: 'Customer Name',
      render: (o) => (
        <div>
          <div className="font-medium text-[#12304A]">{o.customerName}</div>
          <div className="text-xs text-slate-500 font-mono">{o.customerMobile}</div>
        </div>
      ),
    },
    {
      key: 'orderNumber',
      header: 'Order Number',
      render: (o) => (
        <div>
          <div className="font-mono text-xs font-semibold text-[#12304A]">
            {o.orderNumber}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{formatDate(o.date)}</div>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      align: 'right',
      render: (o) => (
        <span className="text-slate-800">{formatCurrency(o.totalAmount, currency)}</span>
      ),
    },
    {
      key: 'paidAmount',
      header: 'Paid Amount',
      align: 'right',
      render: (o) => (
        <span className="text-emerald-700 font-medium">
          {formatCurrency(o.paidAmount, currency)}
        </span>
      ),
    },
    {
      key: 'remainingBalance',
      header: 'Remaining Balance',
      align: 'right',
      render: (o) => (
        <span className="font-semibold text-amber-700">
          {formatCurrency(o.remainingBalance, currency)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      render: (o) => (
        <button
          type="button"
          onClick={() => openPaymentModal(o)}
          className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-xs font-semibold transition-colors whitespace-nowrap"
        >
          <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Record Payment</span>
        </button>
      ),
    },
  ];

  const historyColumns: Column<PaymentRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (p) => <span className="text-slate-600 tabular-nums">{formatDate(p.date)}</span>,
    },
    {
      key: 'orderNumber',
      header: 'Order Number',
      render: (p) => (
        <span className="font-mono text-xs font-semibold text-[#12304A]">
          {p.orderNumber}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer Name',
      render: (p) => <span className="font-medium text-slate-800">{p.customerName}</span>,
    },
    {
      key: 'method',
      header: 'Method & Ref',
      render: (p) => (
        <div>
          <div className="text-slate-800">{p.method}</div>
          <div className="text-xs text-slate-500 font-mono">{p.reference}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Received',
      align: 'right',
      render: (p) => (
        <span className="font-semibold text-emerald-700">
          {formatCurrency(p.amount, currency)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500">Outstanding Receivables</div>
            <div className="mt-1 font-display text-2xl font-bold text-amber-700 tabular-nums">
              {formatCurrency(totalPending, currency)}
            </div>
          </div>
          <span className="text-xs text-slate-500 tabular-nums">
            {orders.filter((o) => o.remainingBalance > 0).length} open invoices
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500">Total Collected</div>
            <div className="mt-1 font-display text-2xl font-bold text-emerald-700 tabular-nums">
              {formatCurrency(totalCollected, currency)}
            </div>
          </div>
          <span className="text-xs text-slate-500 tabular-nums">
            {payments.length} recorded transactions
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 bg-slate-200/70 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setActiveTab('due')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'due'
                ? 'bg-white text-[#12304A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending & Partial Balances
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white text-[#12304A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payment History
          </button>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search customer or order number..."
          ariaLabel="Search payments"
          className="sm:w-72"
        />
      </div>

      {activeTab === 'due' ? (
        <DataTable
          columns={dueColumns}
          data={receivableOrders}
          keyExtractor={(o) => o.id}
          emptyTitle="All invoices are settled"
          emptyDescription="There are no pending or partial customer balances matching your search."
        />
      ) : (
        <DataTable
          columns={historyColumns}
          data={filteredPayments}
          keyExtractor={(p) => p.id}
          emptyTitle="No payment records yet"
          emptyDescription="Payments recorded against customer orders will appear here."
        />
      )}

      {/* Record Partial / Full Payment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#12304A]">
                  Record Payment
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedOrder.customerName} ·{' '}
                  <span className="font-mono">{selectedOrder.orderNumber}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close modal"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-2 text-xs mb-5">
              <div>
                <div className="text-slate-500">Order Total</div>
                <div className="font-semibold text-slate-800 mt-0.5 tabular-nums">
                  {formatCurrency(selectedOrder.totalAmount, currency)}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Paid</div>
                <div className="font-semibold text-emerald-700 mt-0.5 tabular-nums">
                  {formatCurrency(selectedOrder.paidAmount, currency)}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Remaining</div>
                <div className="font-semibold text-amber-700 mt-0.5 tabular-nums">
                  {formatCurrency(selectedOrder.remainingBalance, currency)}
                </div>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} noValidate className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Payment amount ({currency})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAmountInput(String(selectedOrder.remainingBalance));
                      setError('');
                    }}
                    className="text-xs font-medium text-[#168C83] hover:underline"
                  >
                    Pay full balance
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  max={selectedOrder.remainingBalance}
                  step="0.01"
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setError('');
                  }}
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-semibold tabular-nums focus:outline-none focus:border-[#168C83]"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Supports partial installments or full settlement.
                </p>
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Payment method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    className="w-full min-h-[40px] px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#168C83]"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reference / Receipt
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="UPI / NEFT Ref"
                    className="w-full min-h-[40px] px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-[#168C83]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="min-h-[40px] px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-sm font-semibold inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
