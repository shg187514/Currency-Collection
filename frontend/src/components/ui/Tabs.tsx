import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export interface TabsProps {
  tabs: { label: string; value: string; content: React.ReactNode }[];
  defaultValue?: string;
  className?: string;
}

export function Tabs({ tabs, defaultValue, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 flex-1',
              activeTab === tab.value
                ? 'bg-white text-gray-950 shadow-sm dark:bg-gray-950 dark:text-gray-50'
                : 'hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300">
        {tabs.find((tab) => tab.value === activeTab)?.content}
      </div>
    </div>
  );
}
