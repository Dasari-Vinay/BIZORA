import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useBizora } from '../context/BizoraContext';
import { BizoraLogo } from './BizoraLogo';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/orders', label: 'Sales & Orders', icon: ShoppingCart },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/purchases', label: 'Purchases', icon: ShoppingBag },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { businessProfile, logout } = useBizora();

  const navContent = (
    <div className="flex flex-col h-full bg-[#12304A] text-white">
      <div className="px-5 h-16 flex items-center justify-between border-b border-white/10 shrink-0">
        <NavLink to="/dashboard" onClick={onCloseMobile} className="focus-visible:outline-2 focus-visible:outline-[#F4B942] rounded">
          <BizoraLogo variant="light" showTagline />
        </NavLink>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 py-3.5 border-b border-white/10">
        <div className="text-[11px] font-medium text-slate-400">Active Business</div>
        <div className="mt-0.5 text-sm font-medium text-white truncate">
          {businessProfile.businessName}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Primary navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 min-h-[42px] rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#168C83] text-white'
                  : 'text-slate-200 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 shrink-0">
        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            logout();
          }}
          className="w-full flex items-center gap-3 px-3.5 min-h-[42px] rounded-lg text-sm font-medium text-slate-300 hover:bg-white/8 hover:text-white transition-colors whitespace-nowrap"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:flex lg:w-[256px] lg:shrink-0 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 z-30">
        {navContent}
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-[272px] max-w-[85vw] h-full z-50 shadow-xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
