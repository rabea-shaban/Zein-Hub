import React from 'react';
import { AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  required,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={clsx('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 font-cairo">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
      </div>

      <div>{children}</div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 font-semibold font-cairo mt-1.5 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export const inputClass = (hasError?: boolean) =>
  clsx(
    'w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border text-xs text-navy-900 dark:text-white placeholder-gray-400 focus:outline-none transition-all',
    hasError
      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 bg-rose-50/10'
      : 'border-gray-200 dark:border-navy-800 focus:border-gold-500 dark:focus:border-gold-500'
  );
