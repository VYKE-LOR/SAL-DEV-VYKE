import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'error' | 'primary' | 'secondary';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase tracking-wider",
          {
            'border-transparent bg-cw-surface-2 text-cw-text-primary': variant === 'default',
            'border border-cw-border text-cw-text-secondary': variant === 'outline',
            'border-transparent bg-cw-success/20 text-cw-success': variant === 'success',
            'border-transparent bg-cw-warning/20 text-cw-warning': variant === 'warning',
            'border-transparent bg-cw-error/20 text-cw-error': variant === 'error',
            'border-transparent bg-cw-primary/20 text-cw-primary': variant === 'primary',
            'border-transparent bg-cw-secondary/20 text-cw-secondary': variant === 'secondary',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
