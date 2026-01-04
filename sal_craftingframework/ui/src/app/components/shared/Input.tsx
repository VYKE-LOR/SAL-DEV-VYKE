import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-cw-border bg-cw-surface-1 px-3 py-2 text-sm text-cw-text-primary ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-cw-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cw-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
