import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NodeModel, fetchTags, TagModel } from '../../lib/api';
import { useNodeMutations } from '../../hooks/useNodeMutations';
import { TagBadge } from '../../components/ui/TagBadge';
import { Plus } from 'lucide-react';
import { TagManagerModal } from './TagManagerModal';
import { usePermissions } from '../../hooks/usePermissions';

interface NodeTagsProps {
  node: NodeModel;
}

export function NodeTags({ node }: NodeTagsProps) {
  const { data: globalTags = [] } = useQuery({ queryKey: ['tags'], queryFn: fetchTags });
  const { updateMutation } = useNodeMutations();
  const { hasPermission } = usePermissions();
  
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopoverOpen]);

  const toggleTag = (tag: TagModel) => {
    const currentTagIds = node.tags.map(t => t.id);
    const hasTag = currentTagIds.includes(tag.id);
    
    let newTagIds;
    if (hasTag) {
      newTagIds = currentTagIds.filter(id => id !== tag.id);
    } else {
      newTagIds = [...currentTagIds, tag.id];
    }
    
    updateMutation.mutate({ id: node.id, data: { tagIds: newTagIds } });
  };

  const removeTag = (tagId: string) => {
    const newTagIds = node.tags.map(t => t.id).filter(id => id !== tagId);
    updateMutation.mutate({ id: node.id, data: { tagIds: newTagIds } });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {node.tags.map(tag => (
        <TagBadge key={tag.id} tag={tag} onRemove={hasPermission('manage_tags') ? () => removeTag(tag.id) : undefined} />
      ))}
      
      {hasPermission('manage_tags') && (
        <div className="relative" ref={popoverRef}>
        <button
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-dashed border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Tag</span>
        </button>

        {isPopoverOpen && (
          <div className="absolute top-full mt-1 left-0 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 z-10 overflow-hidden">
            <div className="p-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assign Tags</span>
              <button 
                onClick={() => {
                  setIsPopoverOpen(false);
                  setIsManagerOpen(true);
                }}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium"
              >
                Manage
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto p-2 space-y-1">
              {globalTags.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">No tags created yet.</div>
              ) : (
                globalTags.map(tag => {
                  const hasTag = node.tags.some(t => t.id === tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag)}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center justify-between transition-colors ${
                        hasTag 
                          ? 'bg-gray-100 dark:bg-gray-800/50' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <TagBadge tag={tag} size="sm" />
                      {hasTag && <span className="text-blue-500 text-xs font-medium">Added</span>}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
      )}

      {hasPermission('manage_tags') && <TagManagerModal isOpen={isManagerOpen} onClose={() => setIsManagerOpen(false)} />}
    </div>
  );
}
