import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div
      id="toastContainer"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-3"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => {
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 p-3.5 rounded-xl shadow-lg border text-xs font-medium backdrop-blur-md animate-[toastIn_0.25s_ease-out] ${
              t.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                : t.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-500/30 text-rose-800 dark:text-rose-200'
                : 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500/30 text-indigo-800 dark:text-indigo-200'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-indigo-500 shrink-0" />}
            <span className="leading-snug">{t.text}</span>
          </div>
        );
      })}
    </div>
  );
};
