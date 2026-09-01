import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary: "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
      secondary:
        "bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950",
      outline:
        "border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800",
      ghost:
        "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs gap-1.5",
      md: "h-11 px-5 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
