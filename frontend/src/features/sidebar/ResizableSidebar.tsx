import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface ResizableSidebarProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
}

export function ResizableSidebar({
  children,
  className,
  minWidth = 200,
  maxWidth = 600,
  defaultWidth = 280,
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(defaultWidth);
  const isResizing = useRef(false);

  const startResizing = React.useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
  }, []);

  const stopResizing = React.useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing.current) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setWidth(newWidth);
        }
      }
    },
    [minWidth, maxWidth]
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <aside
      className={cn('relative flex-shrink-0 border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900', className)}
      style={{ width }}
    >
      <div className="h-full w-full overflow-hidden flex flex-col">
        {children}
      </div>
      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 transition-colors z-50"
        onMouseDown={startResizing}
      />
    </aside>
  );
}
