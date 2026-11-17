import React, { useMemo, useState } from 'react';
import { Edit3, Mail, MapPin, Phone, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Column, DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { useBizora } from '../context/BizoraContext';
import { Customer } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface CustomerFormState {
  name: string;
  mobile: string;
  email: string;
  city: string;
  address: string;
}

const EMPTY_FORM: CustomerFormState = {
  name: '',
  mobile: '',
  email: '',
  city: '',
  address: '',
};

export function Customers() {
  const { customers, orders, addCustomer, updateCustomer, businessProfile } = useBizora();
  const currency = businessProfile.currency;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<CustomerFormState>>({});

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mobile.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter((o) => o.customerId === selectedCustomer.id);
  }, [orders, selectedCustomer]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (customer: Customer, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingCustomer(customer);
    setForm({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email,
      city: customer.city,
      address: customer.address,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const next: Partial<CustomerFormState> = {};
    if (!form.name.trim()) next.name = 'Customer name is required.';
    if (!form.mobile.trim() || !/^[0-9+\-\s]{8,15}$/.test(form.mobile.trim())) {
      next.mobile = 'Enter a valid mobile number.';
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (!form.city.trim()) next.city = 'City is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
      });
      if (selectedCustomer?.id === editingCustomer.id) {
        setSelectedCustomer({ ...editingCustomer, ...form });
      }
    } else {
      addCustomer({
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
      });
    }
    setModalOpen(false);
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Customer',
      render: (c) => (
        <div>
          <div className="font-medium text-[#12304A]">{c.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">{c.city}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (c) => (
        <div>
          <div className="font-mono text-xs text-slate-800">{c.mobile}</div>
          {c.email && <div className="text-xs text-slate-500 mt-0.5">{c.email}</div>}
        </div>
      ),
    },
    {
      key: 'orders',
      header: 'Orders',
      align: 'right',
      render: (c) => <span className="font-medium text-slate-700">{c.totalOrders}</span>,
    },
    {
      key: 'balance',
      header: 'Outstanding Balance',
      align: 'right',
      render: (c) => (
        <span
          className={`font-semibold ${
            c.outstandingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'
          }`}
        >
          {formatCurrency(c.outstandingBalance, currency)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <div className="inline-flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCustomer(c);
            }}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium text-[#168C83] hover:bg-[#168C83]/10 transition-colors"
          >
            History
          </button>
          <button
            type="button"
            onClick={(e) => openEditModal(c, e)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#12304A] hover:bg-slate-100 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search customer by name or mobile number..."
          ariaLabel="Search customers"
          className="sm:max-w-sm flex-1"
        />
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Customer</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredCustomers}
        keyExtractor={(c) => c.id}
        onRowClick={(c) => setSelectedCustomer(c)}
        emptyTitle="No customers found"
        emptyDescription="Search by another name or mobile number, or add a new customer."
        emptyAction={
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] text-white text-sm font-medium hover:bg-[#11736B]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        }
      />

      {/* Customer Detail & Order History Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#12304A]">
                  {selectedCustomer.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customer since {formatDate(selectedCustomer.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                aria-label="Close customer drawer"
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <div className="text-xs text-slate-500">Outstanding Balance</div>
                  <div
                    className={`mt-1 font-display text-xl font-bold tabular-nums ${
                      selectedCustomer.outstandingBalance > 0
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {formatCurrency(selectedCustomer.outstandingBalance, currency)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Total Orders</div>
                  <div className="mt-1 font-display text-xl font-bold text-[#12304A] tabular-nums">
                    {customerOrders.length}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono">{selectedCustomer.mobile}</span>
                </div>
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2.5 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {selectedCustomer.address ? `${selectedCustomer.address}, ` : ''}
                    {selectedCustomer.city}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm font-semibold text-[#12304A]">
                    Order History
                  </h3>
                  <Link
                    to="/orders/new"
                    className="text-xs font-medium text-[#168C83] hover:underline"
                  >
                    + Create Order
                  </Link>
                </div>

                {customerOrders.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 border-t border-slate-100">
                    No orders recorded for this customer yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 border-t border-slate-100">
                    {customerOrders.map((ord) => (
                      <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-mono text-xs font-semibold text-[#12304A]">
                            {ord.orderNumber}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {formatDate(ord.date)} · {ord.items.length} item(s)
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-900 tabular-nums">
                            {formatCurrency(ord.totalAmount, currency)}
                          </div>
                          <div
                            className={`text-xs font-medium mt-0.5 ${
                              ord.status === 'Paid'
                                ? 'text-emerald-700'
                                : ord.status === 'Partial'
                                ? 'text-amber-700'
                                : 'text-red-700'
                            }`}
                          >
                            {ord.status}
                            {ord.remainingBalance > 0
                              ? ` · Due ${formatCurrency(ord.remainingBalance, currency)}`
                              : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => openEditModal(selectedCustomer)}
                className="min-h-[40px] px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-[#12304A] hover:bg-slate-50"
              >
                Edit Customer
              </button>
              {selectedCustomer.outstandingBalance > 0 && (
                <Link
                  to="/payments"
                  className="min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] text-white text-sm font-medium hover:bg-[#11736B] inline-flex items-center"
                >
                  Record Payment
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-[#12304A]">
                {editingCustomer ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} noValidate className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Customer / Company name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Aarav Interiors & Turnkey"
                  className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mobile number
                  </label>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
                    placeholder="9821044312"
                    className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
                  />
                  {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="Mumbai"
                    className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
                  />
                  {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="accounts@company.in"
                  className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Street, commercial complex, landmark"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-[40px] px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-sm font-semibold"
                >
                  {editingCustomer ? 'Save Changes' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
