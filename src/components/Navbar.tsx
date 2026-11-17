import { Menu, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useBizora } from '../context/BizoraContext';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/inventory': 'Inventory Management',
  '/inventory/add': 'Inventory / Add Product',
  '/customers': 'Customer Management',
  '/suppliers': 'Supplier Management',
  '/orders': 'Sales & Orders',
  '/orders/new': 'Sales & Orders / Create Order',
  '/payments': 'Payment Management',
  '/purchases': 'Purchase Management',
  '/reports': 'Business Reports',
  '/settings': 'Settings & Profile',
};

export function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const { pathname } = useLocation();
  const { user } = useBizora();

  const pageTitle = pathname.startsWith('/inventory/edit')
    ? 'Inventory / Edit Product'
    : ROUTE_TITLES[pathname] ?? 'BIZORA Workspace';

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 -ml-2 rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-[#168C83]"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-display text-base sm:text-lg font-semibold text-[#12304A] truncate">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <Link
          to="/orders/new"
          className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168C83]"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>New Order</span>
        </Link>

        <Link
          to="/settings"
          className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200 hover:opacity-85 transition-opacity shrink-0"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <span className="w-8 h-8 rounded-full bg-[#12304A] text-white text-xs font-semibold flex items-center justify-center">
              {user?.name?.slice(0, 2).toUpperCase() || 'BZ'}
            </span>
          )}
          <span className="text-sm font-medium text-slate-700 max-w-[140px] truncate">
            {user?.name}
          </span>
        </Link>
      </div>
    </header>
  );
}
