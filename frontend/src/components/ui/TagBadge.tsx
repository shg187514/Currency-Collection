import React from 'react';
import { TagModel } from '../../lib/api';
import { X } from 'lucide-react';

interface TagBadgeProps {
  tag: TagModel;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function TagBadge({ tag, onRemove, onClick, className = '', size = 'md' }: TagBadgeProps) {
  const isSm = size === 'sm';
  const color = tag.color || '#3b82f6'; // default blue

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-medium ${isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-sm'} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      style={{
        backgroundColor: `${color}20`, // 20% opacity background
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
        >
          <X className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </button>
      )}
    </span>
  );
}
