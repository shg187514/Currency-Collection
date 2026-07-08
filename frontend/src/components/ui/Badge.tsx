import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-gray-900 text-gray-50 hover:bg-gray-900/80 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/80',
    success: 'border-transparent bg-green-500 text-white hover:bg-green-500/80',
    warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80',
    destructive: 'border-transparent bg-red-500 text-white hover:bg-red-500/80 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/80',
    outline: 'text-gray-950 dark:text-gray-50 border-gray-200 dark:border-gray-800',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:focus:ring-gray-300',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
