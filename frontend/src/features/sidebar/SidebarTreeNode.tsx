import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, FileText, Star, Plus, Folder, FolderOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NodeModel } from '../../lib/api';
import { useTreeStore } from '../../store/useTreeStore';
import { useNodeMutations } from '../../hooks/useNodeMutations';
import { ContextMenu } from '../../components/ui/ContextMenu';
import { MoveModal } from './NodeActionModals';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { usePermissions } from '../../hooks/usePermissions';

interface SidebarTreeNodeProps {
  node: NodeModel;
  level: number;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const SidebarTreeNode = React.memo(function SidebarTreeNode({ node, level, isOpen = false, onToggle }: SidebarTreeNodeProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedTagFilterId, addDraftNode, removeDraftNode } = useTreeStore();
  const { hasPermission } = usePermissions();
  const { deleteMutation, duplicateMutation, archiveMutation, toggleFavoriteMutation, updateMutation, createMutation, moveMutation } = useNodeMutations();
  
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  const isDraft = (node as any).isDraft;
  const [isInlineRename, setIsInlineRename] = useState(isDraft);
  const [draftTitle, setDraftTitle] = useState(node.title || '');

  const isSelected = id === node.id;
  // If the node has children in its API data, we show the toggle icon (or if we know it's droppable)
  const hasChildren = node.children && node.children.length > 0;
  
  const nodeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSelected && nodeRef.current && !isDraft) {
      nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSelected, isDraft]);

  // Focus input when entering rename mode
  useEffect(() => {
    if (isInlineRename && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      if (nodeRef.current) {
        nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [isInlineRename]);

  const hasSelectedTag = selectedTagFilterId 
    ? node.tags?.some(tag => tag.id === selectedTagFilterId) 
    : true;
  const isDimmed = selectedTagFilterId && !hasSelectedTag;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDraft) return;
    navigate(`/node/${node.id}`);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggle) onToggle();
  };

  const saveRename = () => {
    if (!draftTitle.trim()) {
      cancelRename();
      return;
    }
    
    if (isDraft) {
      // Create new node
      createMutation.mutate({ title: draftTitle, parentId: node.parentId || null } as any);
      removeDraftNode(node.id);
    } else {
      // Update existing
      if (draftTitle !== node.title) {
        updateMutation.mutate({ id: node.id, data: { title: draftTitle } });
      }
      setIsInlineRename(false);
    }
  };

  const cancelRename = () => {
    if (isDraft) {
      removeDraftNode(node.id);
    } else {
      setDraftTitle(node.title);
      setIsInlineRename(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent tree drag n drop interference
    if (e.key === 'Enter') {
      e.preventDefault();
      saveRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelRename();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      saveRename();
      if (e.shiftKey) {
        // Navigate to parent
        if (node.parentId) {
          navigate(`/node/${node.parentId}`);
        }
      } else {
        // Create next sibling
        addDraftNode(node.parentId || null);
      }
    }
  };

  const menuItems = (
    <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg py-1 min-w-[160px] text-sm text-gray-700 dark:text-gray-300">
      <button className="text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm" onClick={() => navigate(`/node/${node.id}`)}>Open</button>
      <PermissionGuard permission="create_child">
        <button className="text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm" onClick={() => { if (!isOpen && onToggle) onToggle(); addDraftNode(node.id); }}>Add Child</button>
      </PermissionGuard>
      <PermissionGuard permission="rename">
        <button className="text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm" onClick={() => setIsInlineRename(true)}>Rename</button>
      </PermissionGuard>
      <PermissionGuard permission="move">
        <button className="text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm" onClick={() => setIsMoveOpen(true)}>Move...</button>
      </PermissionGuard>
      <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
      <button className="text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm" onClick={() => toggleFavoriteMutation.mutate({ id: node.id, isFavorite: !node.isFavorite })}>
        {node.isFavorite ? 'Unfavorite' : 'Favorite'}
      </button>
      <PermissionGuard permission="create_child">
        <button className="text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm" onClick={() => duplicateMutation.mutate(node.id)}>Duplicate</button>
      </PermissionGuard>
      <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
      <PermissionGuard permission="archive">
        <button className="text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm" onClick={() => archiveMutation.mutate(node.id)}>Archive</button>
      </PermissionGuard>
      <PermissionGuard permission="delete">
        <button className="text-left px-2 py-1.5 hover:bg-red-50 text-red-600 dark:hover:bg-red-900/30 dark:text-red-500 rounded-sm" onClick={() => deleteMutation.mutate({ id: node.id })}>
          Delete
        </button>
      </PermissionGuard>
    </div>
  );

  return (
    <>
      <ContextMenu menu={isDraft ? <div/> : menuItems} disabled={isDraft}>
        <div
          ref={nodeRef}
          onClick={handleSelect}
          className={cn(
            'group flex items-center py-1.5 pr-2 cursor-pointer text-sm font-medium transition-colors select-none relative',
            isSelected && !isDraft
              ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100'
              : 'text-gray-700 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:bg-gray-800/50',
            isDimmed && !isSelected && 'opacity-30'
          )}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <button
            aria-label={isOpen ? "Collapse node" : "Expand node"}
            className={cn(
              'flex items-center justify-center h-5 w-5 rounded-sm hover:bg-gray-300/50 dark:hover:bg-gray-700/50 mr-1 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              hasChildren ? 'visible' : 'invisible',
              isOpen && 'rotate-90'
            )}
            onClick={handleToggle}
          >
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </button>
          
          {hasChildren ? (
            isOpen ? (
              <FolderOpen className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400 shrink-0" />
            ) : (
              <Folder className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400 shrink-0 fill-blue-100 dark:fill-blue-900/30" />
            )
          ) : (
            <FileText className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 shrink-0" />
          )}
          
          {isInlineRename ? (
            <input
              ref={inputRef}
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={saveRename}
              className="flex-1 bg-white dark:bg-gray-900 border border-blue-500 dark:border-blue-400 rounded px-1.5 py-0.5 text-sm outline-none text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 w-full min-w-[100px]"
              placeholder="Untitled Node"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate flex-1" onDoubleClick={(e) => { 
              e.stopPropagation(); 
              if (hasPermission('rename')) setIsInlineRename(true); 
            }}>
              {node.title}
            </span>
          )}

          {!isInlineRename && !isDraft && (
            <div className="flex items-center ml-2">
              {node.isFavorite && (
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 shrink-0 mr-1" />
              )}
              {/* Quick Add Child Button */}
              <PermissionGuard permission="create_child">
                <button
                  onClick={(e) => { e.stopPropagation(); if (!isOpen && onToggle) onToggle(); addDraftNode(node.id); }}
                  className="opacity-0 group-hover:opacity-100 flex items-center justify-center h-5 w-5 rounded hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-opacity focus:opacity-100 touch:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  title="Add Child"
                  aria-label="Add Child Node"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </PermissionGuard>
            </div>
          )}
        </div>
      </ContextMenu>

      <MoveModal 
        isOpen={isMoveOpen} 
        onClose={() => setIsMoveOpen(false)} 
        title={`Move "${node.title}"`}
        onConfirm={(newParentId) => moveMutation.mutate({ id: node.id, newParentId })}
      />
    </>
  );
});
