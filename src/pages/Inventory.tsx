import { useMemo, useState } from 'react';
import { AlertTriangle, Archive, ArchiveRestore, Edit3, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Column, DataTable } from '../components/DataTable';
import { SearchBar } from '../components/SearchBar';
import { useBizora } from '../context/BizoraContext';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';

export function Inventory() {
  const { products, toggleArchiveProduct, businessProfile } = useBizora();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusView, setStatusView] = useState<'active' | 'archived' | 'low'>('active');

  const currency = businessProfile.currency;

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category))).sort();
    return ['All', ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (statusView === 'active' && p.archived) return false;
      if (statusView === 'archived' && !p.archived) return false;
      if (statusView === 'low' && (p.archived || p.availableQuantity > p.minimumStock)) {
        return false;
      }
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, searchQuery, selectedCategory, statusView]);

  const columns: Column<Product>[] = [
    {
      key: 'product',
      header: 'Product & Brand',
      render: (p) => (
        <div className="min-w-[200px]">
          <div className="font-medium text-[#12304A]">{p.name}</div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span className="font-mono">{p.sku}</span>
            <span aria-hidden="true">·</span>
            <span>{p.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{p.colour}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) => (
        <div>
          <div className="text-slate-800">{p.category}</div>
          <div className="text-xs text-slate-500 max-w-[200px] truncate">{p.specification}</div>
        </div>
      ),
    },
    {
      key: 'purchasePrice',
      header: 'Purchase Price',
      align: 'right',
      render: (p) => (
        <span className="text-slate-600">{formatCurrency(p.purchasePrice, currency)}</span>
      ),
    },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      align: 'right',
      render: (p) => (
        <span className="font-medium text-slate-900">
          {formatCurrency(p.sellingPrice, currency)}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock Quantity',
      align: 'right',
      render: (p) => {
        const isLow = p.availableQuantity <= p.minimumStock;
        return (
          <div className="inline-flex flex-col items-end">
            <span className="font-semibold text-slate-900 tabular-nums">
              {p.availableQuantity} {p.unit}
            </span>
            {isLow ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 mt-0.5">
                <AlertTriangle className="w-3 h-3 text-amber-600" aria-hidden="true" />
                <span>Low stock (Min {p.minimumStock})</span>
              </span>
            ) : (
              <span className="text-xs text-slate-500 mt-0.5">Min {p.minimumStock}</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => navigate(`/inventory/edit/${p.id}`)}
            aria-label={`Edit ${p.name}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#12304A] hover:bg-slate-100 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => toggleArchiveProduct(p.id)}
            aria-label={p.archived ? `Restore ${p.name}` : `Archive ${p.name}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {p.archived ? (
              <>
                <ArchiveRestore className="w-3.5 h-3.5 text-[#168C83]" aria-hidden="true" />
                <span>Restore</span>
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Archive</span>
              </>
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by product name, brand, or SKU..."
            ariaLabel="Search products"
            className="sm:max-w-xs flex-1"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by category"
            className="min-h-[40px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <div className="inline-flex items-center p-1 bg-slate-200/70 rounded-lg self-start sm:self-auto">
            {(
              [
                { id: 'active', label: 'Active' },
                { id: 'low', label: 'Low Stock' },
                { id: 'archived', label: 'Archived' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusView(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  statusView === tab.id
                    ? 'bg-white text-[#12304A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <Link
          to="/inventory/add"
          className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Product Data Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        keyExtractor={(p) => p.id}
        emptyTitle="No matching products"
        emptyDescription="Adjust your search or category filter, or add a new SKU to your inventory."
        emptyAction={
          <Link
            to="/inventory/add"
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] text-white text-sm font-medium hover:bg-[#11736B]"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Product</span>
          </Link>
        }
      />
    </div>
  );
}
