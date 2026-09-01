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
      primary: "bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 text-navy-950 font-black hover:from-gold-200 hover:via-gold-400 hover:to-gold-500 active:from-gold-600 active:to-gold-700 shadow-md shadow-gold-500/25 border border-gold-400/40",
      secondary:
        "bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950",
      outline:
        "border border-gold-500/40 bg-transparent text-navy-900 hover:bg-gold-500/10 dark:border-gold-500/40 dark:text-gold-400 dark:hover:bg-navy-800",
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
