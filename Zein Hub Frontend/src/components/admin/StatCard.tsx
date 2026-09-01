import React from 'react';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'gold' | 'blue' | 'emerald' | 'purple' | 'rose';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const colorStyles = {
  gold: {
    bg: 'bg-gold-500/10 dark:bg-gold-500/15',
    text: 'text-gold-600 dark:text-gold-400',
    border: 'border-gold-500/20',
  },
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
  },
  rose: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20',
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'gold',
  trend,
}: StatCardProps) {
  const style = colorStyles[color];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-navy-900 dark:text-white font-cairo">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
          )}
        </div>

        <div className={clsx('p-4 rounded-xl border', style.bg, style.text, style.border)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
          <span className={trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-gray-400">مقارنة بالفترة السابقة</span>
        </div>
      )}
    </div>
  );
}
