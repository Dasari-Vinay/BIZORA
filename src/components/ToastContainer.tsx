import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useBizora } from '../context/BizoraContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useBizora();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]"
    >
      {toasts.map((toast) => {
        const icon =
          toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-4 h-4 text-[#12304A] shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#168C83] shrink-0" />
          );

        return (
          <div
            key={toast.id}
            role="status"
            className="flex items-center gap-3 bg-white border border-slate-200 shadow-md rounded-lg px-4 py-3 text-sm text-slate-800"
          >
            {icon}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 text-slate-400 hover:text-slate-700 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
