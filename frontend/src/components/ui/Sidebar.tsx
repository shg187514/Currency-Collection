import React from 'react';
import { cn } from '../../lib/utils';

export function Sidebar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <aside className={cn('hidden border-r border-gray-200 bg-white md:block w-64 min-h-screen dark:border-gray-800 dark:bg-gray-950', className)}>
      <div className="flex h-full flex-col gap-2 p-4">
        {children}
      </div>
    </aside>
  );
}

export function SidebarItem({ children, className, active }: { children: React.ReactNode; className?: string; active?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 cursor-pointer',
        active ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' : 'hover:bg-gray-100 dark:hover:bg-gray-800',
        className
      )}
    >
      {children}
    </div>
  );
}
