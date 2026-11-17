import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: 'navy' | 'teal' | 'gold' | 'amber' | 'emerald';
  onClick?: () => void;
}

export function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  accent = 'navy',
  onClick,
}: DashboardCardProps) {
  const iconColorMap = {
    navy: 'bg-[#12304A]/8 text-[#12304A]',
    teal: 'bg-[#168C83]/10 text-[#168C83]',
    gold: 'bg-[#F4B942]/15 text-[#9A6B0A]',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 transition-colors ${
        onClick
          ? 'hover:border-[#168C83]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168C83] cursor-pointer'
          : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-slate-500 leading-snug">{title}</span>
        {icon && (
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${iconColorMap[accent]}`}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-2xl font-bold tracking-tight text-[#12304A] tabular-nums">
        {value}
      </div>
      {subtitle && (
        <div className="mt-1.5 text-xs text-slate-500 leading-normal">{subtitle}</div>
      )}
    </Wrapper>
  );
}
