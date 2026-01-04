import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelId?: string;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, labelId, id, ...props }, ref) => {
    return (
      <label className="inline-flex items-center cursor-pointer gap-2 group">
        <div className="relative">
          <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            id={id}
            {...props}
          />
          <div className={cn(
            "h-6 w-11 rounded-full bg-cw-surface-2 border border-cw-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cw-primary transition-all peer-checked:bg-cw-primary peer-checked:border-transparent",
            "after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"
          )}></div>
        </div>
        {label && (
          <span 
            id={labelId}
            className="text-sm font-medium text-cw-text-secondary group-hover:text-cw-text-primary transition-colors"
          >
            {label}
          </span>
        )}
      </label>
    );
  }
);
Toggle.displayName = "Toggle";
