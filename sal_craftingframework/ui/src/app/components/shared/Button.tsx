import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'minimal' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-transparent",
          {
            'bg-cw-primary text-white hover:bg-cw-primary/90': variant === 'primary',
            'bg-cw-secondary text-white hover:bg-cw-secondary/90': variant === 'secondary',
            'bg-cw-error text-white hover:bg-cw-error/90': variant === 'danger',
            'bg-cw-surface-2 text-cw-text-primary hover:bg-cw-surface-2/80 border-cw-border': variant === 'minimal',
            'hover:bg-cw-surface-2 text-cw-text-secondary hover:text-cw-text-primary': variant === 'ghost',
            'h-9 px-4 text-sm': size === 'sm',
            'h-11 px-6 text-base': size === 'md',
            'h-14 px-8 text-lg': size === 'lg',
            'h-9 w-9 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
