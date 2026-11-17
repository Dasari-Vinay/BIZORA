import React, { useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useBizora } from '../context/BizoraContext';
import { formatCurrency } from '../utils/formatters';

const CATEGORY_SUGGESTIONS = [
  'Lighting',
  'Electrical',
  'Hardware',
  'Power Tools',
  'Packaging',
  'Plumbing',
  'Safety Gear',
];

const UNIT_OPTIONS = ['pcs', 'box', 'set', 'pair', 'coil', 'bundle', 'kg', 'litre', 'meter'];

export function AddProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, businessProfile } = useBizora();
  const currency = businessProfile.currency;

  const existingProduct = useMemo(
    () => (id ? products.find((p) => p.id === id) : undefined),
    [id, products]
  );

  const isEditing = Boolean(existingProduct);

  const [name, setName] = useState(existingProduct?.name ?? '');
  const [brand, setBrand] = useState(existingProduct?.brand ?? '');
  const [category, setCategory] = useState(existingProduct?.category ?? 'Lighting');
  const [specification, setSpecification] = useState(existingProduct?.specification ?? '');
  const [colour, setColour] = useState(existingProduct?.colour ?? '');
  const [unit, setUnit] = useState(existingProduct?.unit ?? 'pcs');
  const [purchasePrice, setPurchasePrice] = useState(
    existingProduct ? String(existingProduct.purchasePrice) : ''
  );
  const [sellingPrice, setSellingPrice] = useState(
    existingProduct ? String(existingProduct.sellingPrice) : ''
  );
  const [availableQuantity, setAvailableQuantity] = useState(
    existingProduct ? String(existingProduct.availableQuantity) : ''
  );
  const [minimumStock, setMinimumStock] = useState(
    existingProduct ? String(existingProduct.minimumStock) : '10'
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const marginSummary = useMemo(() => {
    const buy = Number(purchasePrice);
    const sell = Number(sellingPrice);
    if (!Number.isFinite(buy) || !Number.isFinite(sell) || sell <= 0) {
      return null;
    }
    const profit = sell - buy;
    const pct = (profit / sell) * 100;
    return { profit, pct };
  }, [purchasePrice, sellingPrice]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Product name is required.';
    if (!brand.trim()) next.brand = 'Brand is required.';
    if (!category.trim()) next.category = 'Category is required.';
    if (!specification.trim()) next.specification = 'Specification is required.';
    if (!colour.trim()) next.colour = 'Colour is required.';
    if (!unit.trim()) next.unit = 'Unit is required.';

    const buy = Number(purchasePrice);
    const sell = Number(sellingPrice);
    const qty = Number(availableQuantity);
    const min = Number(minimumStock);

    if (purchasePrice === '' || Number.isNaN(buy) || buy < 0) {
      next.purchasePrice = 'Enter a valid purchase price.';
    }
    if (sellingPrice === '' || Number.isNaN(sell) || sell <= 0) {
      next.sellingPrice = 'Selling price must be greater than 0.';
    }
    if (availableQuantity === '' || Number.isNaN(qty) || qty < 0) {
      next.availableQuantity = 'Enter a valid stock quantity (0 or more).';
    }
    if (minimumStock === '' || Number.isNaN(min) || min < 0) {
      next.minimumStock = 'Enter a valid minimum stock threshold.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      brand: brand.trim(),
      category: category.trim(),
      specification: specification.trim(),
      colour: colour.trim(),
      unit: unit.trim(),
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      availableQuantity: Number(availableQuantity),
      minimumStock: Number(minimumStock),
    };

    if (isEditing && existingProduct) {
      updateProduct(existingProduct.id, payload);
    } else {
      addProduct(payload);
    }
    navigate('/inventory');
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/inventory"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#12304A]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inventory</span>
        </Link>
        {isEditing && existingProduct && (
          <span className="font-mono text-xs text-slate-500">SKU: {existingProduct.sku}</span>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6"
      >
        <div>
          <h2 className="font-display text-lg font-bold text-[#12304A]">
            {isEditing ? 'Edit Product Details' : 'Add New Product'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter product specifications, pricing, and stock alert thresholds.
          </p>
        </div>

        {/* Core Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="prod-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Product name
            </label>
            <input
              id="prod-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError('name');
              }}
              placeholder="e.g. LED Panel Light 24W Slim"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="prod-brand" className="block text-sm font-medium text-slate-700 mb-1.5">
              Brand
            </label>
            <input
              id="prod-brand"
              type="text"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                clearFieldError('brand');
              }}
              placeholder="e.g. Philips, Syska Pro"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
            />
            {errors.brand && <p className="mt-1 text-xs text-red-600">{errors.brand}</p>}
          </div>

          <div>
            <label htmlFor="prod-category" className="block text-sm font-medium text-slate-700 mb-1.5">
              Category
            </label>
            <input
              id="prod-category"
              list="bizora-categories"
              type="text"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                clearFieldError('category');
              }}
              placeholder="Select or type category"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
            />
            <datalist id="bizora-categories">
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="prod-spec" className="block text-sm font-medium text-slate-700 mb-1.5">
              Specification
            </label>
            <input
              id="prod-spec"
              type="text"
              value={specification}
              onChange={(e) => {
                setSpecification(e.target.value);
                clearFieldError('specification');
              }}
              placeholder="e.g. 6500K Cool Daylight · 2400 Lumens · Recessed"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
            />
            {errors.specification && (
              <p className="mt-1 text-xs text-red-600">{errors.specification}</p>
            )}
          </div>

          <div>
            <label htmlFor="prod-colour" className="block text-sm font-medium text-slate-700 mb-1.5">
              Colour
            </label>
            <input
              id="prod-colour"
              type="text"
              value={colour}
              onChange={(e) => {
                setColour(e.target.value);
                clearFieldError('colour');
              }}
              placeholder="e.g. Matte White"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
            />
            {errors.colour && <p className="mt-1 text-xs text-red-600">{errors.colour}</p>}
          </div>

          <div>
            <label htmlFor="prod-unit" className="block text-sm font-medium text-slate-700 mb-1.5">
              Unit
            </label>
            <select
              id="prod-unit"
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
                clearFieldError('unit');
              }}
              className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            {errors.unit && <p className="mt-1 text-xs text-red-600">{errors.unit}</p>}
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prod-buy" className="block text-sm font-medium text-slate-700 mb-1.5">
              Purchase price ({currency})
            </label>
            <input
              id="prod-buy"
              type="number"
              min="0"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => {
                setPurchasePrice(e.target.value);
                clearFieldError('purchasePrice');
              }}
              placeholder="0.00"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm tabular-nums focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
            />
            {errors.purchasePrice && (
              <p className="mt-1 text-xs text-red-600">{errors.purchasePrice}</p>
            )}
          </div>

          <div>
            <label htmlFor="prod-sell" className="block text-sm font-medium text-slate-700 mb-1.5">
              Selling price ({currency})
            </label>
            <input
              id="prod-sell"
              type="number"
              min="0"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => {
                setSellingPrice(e.target.value);
                clearFieldError('sellingPrice');
              }}
              placeholder="0.00"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm tabular-nums focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
            />
            {errors.sellingPrice && (
              <p className="mt-1 text-xs text-red-600">{errors.sellingPrice}</p>
            )}
          </div>

          <div>
            <label htmlFor="prod-qty" className="block text-sm font-medium text-slate-700 mb-1.5">
              Available quantity
            </label>
            <input
              id="prod-qty"
              type="number"
              min="0"
              step="1"
              value={availableQuantity}
              onChange={(e) => {
                setAvailableQuantity(e.target.value);
                clearFieldError('availableQuantity');
              }}
              placeholder="0"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm tabular-nums focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
            />
            {errors.availableQuantity && (
              <p className="mt-1 text-xs text-red-600">{errors.availableQuantity}</p>
            )}
          </div>

          <div>
            <label htmlFor="prod-min" className="block text-sm font-medium text-slate-700 mb-1.5">
              Minimum stock
            </label>
            <input
              id="prod-min"
              type="number"
              min="0"
              step="1"
              value={minimumStock}
              onChange={(e) => {
                setMinimumStock(e.target.value);
                clearFieldError('minimumStock');
              }}
              placeholder="10"
              className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm tabular-nums focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
            />
            {errors.minimumStock && (
              <p className="mt-1 text-xs text-red-600">{errors.minimumStock}</p>
            )}
          </div>
        </div>

        {marginSummary && (
          <div className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-600">Estimated unit margin</span>
            <span
              className={`font-semibold tabular-nums ${
                marginSummary.profit >= 0 ? 'text-[#168C83]' : 'text-red-600'
              }`}
            >
              {formatCurrency(marginSummary.profit, currency)} / {unit} ({marginSummary.pct.toFixed(1)}%)
            </span>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/inventory"
            className="min-h-[40px] px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="min-h-[40px] px-5 py-2 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>{isEditing ? 'Save Changes' : 'Save Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
