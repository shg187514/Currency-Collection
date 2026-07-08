import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

interface ContextMenuProps {
  children: React.ReactNode;
  menu: React.ReactNode;
  className?: string;
}

export function ContextMenu({ children, menu, className }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef, () => setIsOpen(false));

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => setIsOpen(false);
    if (isOpen) window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  return (
    <div onContextMenu={handleContextMenu} className="inline-block w-full h-full">
      {children}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: position.y, left: position.x }}
            className={cn(
              'fixed z-50 min-w-[8rem] rounded-md border border-gray-200 bg-white p-1 text-gray-950 shadow-md dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 animate-in fade-in zoom-in-95 duration-100',
              className
            )}
            onClick={() => setIsOpen(false)}
          >
            {menu}
          </div>,
          document.body
        )}
    </div>
  );
}
