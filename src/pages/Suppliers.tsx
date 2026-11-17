import React, { useMemo, useState } from 'react';
import { Edit3, Mail, MapPin, Phone, Plus, UserCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Column, DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { useBizora } from '../context/BizoraContext';
import { Supplier } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface SupplierFormState {
  name: string;
  contactPerson: string;
  mobile: string;
  email: string;
  city: string;
  address: string;
  gstNumber: string;
}

const EMPTY_FORM: SupplierFormState = {
  name: '',
  contactPerson: '',
  mobile: '',
  email: '',
  city: '',
  address: '',
  gstNumber: '',
};

export function Suppliers() {
  const { suppliers, purchases, addSupplier, updateSupplier, businessProfile } = useBizora();
  const currency = businessProfile.currency;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<SupplierFormState>>({});

  const filteredSuppliers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.mobile.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
    );
  }, [suppliers, searchQuery]);

  const supplierPurchases = useMemo(() => {
    if (!selectedSupplier) return [];
    return purchases.filter((p) => p.supplierId === selectedSupplier.id);
  }, [purchases, selectedSupplier]);

  const openAddModal = () => {
    setEditingSupplier(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (supplier: Supplier, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      mobile: supplier.mobile,
      email: supplier.email,
      city: supplier.city,
      address: supplier.address,
      gstNumber: supplier.gstNumber,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const next: Partial<SupplierFormState> = {};
    if (!form.name.trim()) next.name = 'Supplier name is required.';
    if (!form.contactPerson.trim()) next.contactPerson = 'Contact person is required.';
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

    const clean = {
      name: form.name.trim(),
      contactPerson: form.contactPerson.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      gstNumber: form.gstNumber.trim(),
    };

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, clean);
      if (selectedSupplier?.id === editingSupplier.id) {
        setSelectedSupplier({ ...editingSupplier, ...clean });
      }
    } else {
      addSupplier(clean);
    }
    setModalOpen(false);
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      header: 'Supplier Name',
      render: (s) => (
        <div>
          <div className="font-medium text-[#12304A]">{s.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {s.city}
            {s.gstNumber ? ` · GST ${s.gstNumber}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Details',
      render: (s) => (
        <div>
          <div className="text-slate-800">{s.contactPerson}</div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span className="font-mono">{s.mobile}</span>
            {s.email && (
              <>
                <span aria-hidden="true">·</span>
                <span>{s.email}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'purchasesCount',
      header: 'Purchase Orders',
      align: 'right',
      render: (s) => {
        const count = purchases.filter((p) => p.supplierId === s.id).length;
        return <span className="font-medium text-slate-700">{count}</span>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="inline-flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSupplier(s);
            }}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium text-[#168C83] hover:bg-[#168C83]/10 transition-colors"
          >
            History
          </button>
          <button
            type="button"
            onClick={(e) => openEditModal(s, e)}
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
          placeholder="Search supplier by name, contact person, or city..."
          ariaLabel="Search suppliers"
          className="sm:max-w-sm flex-1"
        />
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Supplier</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredSuppliers}
        keyExtractor={(s) => s.id}
        onRowClick={(s) => setSelectedSupplier(s)}
        emptyTitle="No suppliers found"
        emptyDescription="Add your wholesale distributors or manufacturers to track stock purchases."
        emptyAction={
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] text-white text-sm font-medium hover:bg-[#11736B]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        }
      />

      {/* Supplier Detail & Purchase History Drawer */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#12304A]">
                  {selectedSupplier.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedSupplier.gstNumber ? `GSTIN ${selectedSupplier.gstNumber}` : `Partner since ${formatDate(selectedSupplier.createdAt)}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSupplier(null)}
                aria-label="Close supplier drawer"
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedSupplier.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono">{selectedSupplier.mobile}</span>
                </div>
                {selectedSupplier.email && (
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{selectedSupplier.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2.5 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {selectedSupplier.address ? `${selectedSupplier.address}, ` : ''}
                    {selectedSupplier.city}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm font-semibold text-[#12304A]">
                    Purchase History
                  </h3>
                  <Link
                    to="/purchases"
                    className="text-xs font-medium text-[#168C83] hover:underline"
                  >
                    + New Purchase
                  </Link>
                </div>

                {supplierPurchases.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 border-t border-slate-100">
                    No stock purchases recorded from this supplier yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 border-t border-slate-100">
                    {supplierPurchases.map((po) => (
                      <div key={po.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-mono text-xs font-semibold text-[#12304A]">
                            {po.purchaseNumber}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {formatDate(po.date)} · {po.items.length} item(s)
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-900 tabular-nums">
                            {formatCurrency(po.totalAmount, currency)}
                          </div>
                          <div className="text-xs font-medium text-emerald-700 mt-0.5">
                            {po.status}
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
                onClick={() => openEditModal(selectedSupplier)}
                className="min-h-[40px] px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-[#12304A] hover:bg-slate-50"
              >
                Edit Supplier
              </button>
              <Link
                to="/purchases"
                className="min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] text-white text-sm font-medium hover:bg-[#11736B] inline-flex items-center"
              >
                Record Stock Purchase
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-[#12304A]">
                {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
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
                  Supplier / Distributor name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Apex Luminaires Distributors"
                  className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact person
                  </label>
                  <input
                    type="text"
                    value={form.contactPerson}
                    onChange={(e) => setForm((p) => ({ ...p, contactPerson: e.target.value }))}
                    placeholder="Rajesh Kulkarni"
                    className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
                  />
                  {errors.contactPerson && (
                    <p className="mt-1 text-xs text-red-600">{errors.contactPerson}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mobile number
                  </label>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
                    placeholder="9820112233"
                    className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
                  />
                  {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    GST / Tax ID (optional)
                  </label>
                  <input
                    type="text"
                    value={form.gstNumber}
                    onChange={(e) => setForm((p) => ({ ...p, gstNumber: e.target.value }))}
                    placeholder="27AADCA9921L1Z8"
                    className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-[#168C83]"
                  />
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
                  placeholder="sales@supplier.in"
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
                  placeholder="Warehouse or office address"
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
                  {editingSupplier ? 'Save Changes' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
