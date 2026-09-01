import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "brand" | "gold" | "outline" | "secondary";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    brand:
      "bg-gold-500/10 text-gold-700 dark:text-gold-400 border border-gold-500/30",
    gold:
      "bg-gold-500/10 text-gold-700 dark:text-gold-400 border border-gold-500/30",
    secondary:
      "bg-navy-100 text-navy-900 dark:bg-navy-800 dark:text-navy-100",
    outline:
      "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
