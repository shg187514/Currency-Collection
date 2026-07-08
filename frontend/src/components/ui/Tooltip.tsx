import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export function Tooltip({ children, content, className }: { children: React.ReactNode; content: string; className?: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-50 overflow-hidden rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-950 shadow-md animate-in fade-in zoom-in-95 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 whitespace-nowrap',
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
