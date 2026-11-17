interface BizoraLogoProps {
  variant?: 'light' | 'dark';
  showTagline?: boolean;
}

export function BizoraLogo({ variant = 'dark', showTagline = false }: BizoraLogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#12304A]';
  const subColor = variant === 'light' ? 'text-slate-300' : 'text-slate-500';

  return (
    <div className="flex items-center gap-3 select-none shrink-0">
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="36" height="36" rx="9" fill={variant === 'light' ? '#168C83' : '#12304A'} />
        <path
          d="M11 10H19.5C22.2614 10 24.5 11.9 24.5 14.3C24.5 16.05 23.3 17.4 21.5 17.9C23.7 18.45 25.2 20.05 25.2 22.15C25.2 24.85 22.8 26.8 19.6 26.8H11V10Z"
          stroke="white"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M11 18.2H20.5" stroke="#F4B942" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="26.5" cy="9.5" r="2.5" fill="#F4B942" />
      </svg>
      <div className="min-w-0">
        <div className={`font-display text-lg font-bold tracking-tight leading-none ${textColor} whitespace-nowrap`}>
          BIZORA
        </div>
        {showTagline && (
          <div className={`text-[11px] font-medium mt-1 leading-none ${subColor} whitespace-nowrap`}>
            Har Business, Ek Jagah.
          </div>
        )}
      </div>
    </div>
  );
}
