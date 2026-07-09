import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { Tree, NodeModel as DndNodeModel, MultiBackend, getBackendOptions } from '@minoru/react-dnd-treeview';
import { DndProvider } from 'react-dnd';
import { fetchTree, fetchTags, NodeModel as ApiNodeModel } from '../../lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useTreeStore } from '../../store/useTreeStore';
import { ResizableSidebar } from './ResizableSidebar';
import { SidebarTreeNode } from './SidebarTreeNode';
import { Button } from '../../components/ui/Button';
import { useNodeMutations } from '../../hooks/useNodeMutations';
import { CreateModal } from './NodeActionModals';
import { TrashModal } from './TrashModal';
import { Tag as TagIcon, X, Star, Clock, ChevronDown, ChevronRight, Trash2, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { usePermissions } from '../../hooks/usePermissions';

// Helper to flatten the recursive tree for the drag-and-drop library
const flattenTree = (nodes: ApiNodeModel[]): DndNodeModel<ApiNodeModel>[] => {
  const result: DndNodeModel<ApiNodeModel>[] = [];
  const traverse = (nodeList: ApiNodeModel[], parentId: string | number) => {
    nodeList.forEach((node) => {
      result.push({
        id: node.id,
        parent: parentId,
        text: node.title,
        droppable: true,
        data: node,
      });
      if (node.children && node.children.length > 0) {
        traverse(node.children, node.id);
      }
    });
  };
  traverse(nodes, 0); // 0 is the root parent ID in @minoru/react-dnd-treeview conventions
  return result;
};

export function TreeSidebar() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setIsSearchModalOpen, selectedTagFilterId, setSelectedTagFilterId } = useTreeStore();
  
  const { data: treeData, isLoading, error } = useQuery({
    queryKey: ['nodes-tree'],
    queryFn: fetchTree,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isTrashOpen, setIsTrashOpen] = React.useState(false);
  const { createMutation, moveMutation } = useNodeMutations();
  const treeRef = useRef<any>(null);

  const [isPinnedExpanded, setIsPinnedExpanded] = React.useState(true);
  const [isRecentExpanded, setIsRecentExpanded] = React.useState(true);
  
  const { recentNodes, draftNodes, addDraftNode } = useTreeStore();
  const { logout, user } = useAuthStore();
  const { hasPermission } = usePermissions();

  const dndData = useMemo(() => {
    if (!treeData) return [];
    const result = flattenTree(treeData);
    
    // Inject draft nodes
    draftNodes.forEach(draft => {
      result.push({
        id: draft.id,
        parent: draft.parentId || 0,
        text: '',
        droppable: false,
        data: { id: draft.id, title: '', isDraft: true, parentId: draft.parentId } as unknown as ApiNodeModel
      });
    });

    return result;
  }, [treeData, draftNodes]);

  const flatTree = useMemo(() => {
    if (!treeData) return [];
    // We already have flattenTree utility that returns DndNodeModel format
    // Let's just map it to grab the original data
    return flattenTree(treeData).map(dndNode => dndNode.data as ApiNodeModel);
  }, [treeData]);

  const pinnedNodes = useMemo(() => {
    return flatTree.filter(node => node.isFavorite);
  }, [flatTree]);

  const recentNodesList = useMemo(() => {
    return recentNodes.map(nodeId => flatTree.find(n => n.id === nodeId)).filter(Boolean) as ApiNodeModel[];
  }, [recentNodes, flatTree]);

  const initialOpenIds = useMemo(() => {
    if (!treeData || !id) return [];
    
    // Find path to active node
    const findPathToNode = (nodes: ApiNodeModel[], targetId: string, currentPath: (string | number)[] = []): (string | number)[] | null => {
      for (const node of nodes) {
        if (node.id === targetId) return currentPath;
        if (node.children && node.children.length > 0) {
          const path = findPathToNode(node.children, targetId, [...currentPath, node.id]);
          if (path) return path;
        }
      }
      return null;
    };
    
    // If id is present, find path from treeData
    const path = findPathToNode(treeData, id);
    if (!path) return [];
    // Return all parent IDs
    return path.slice(0, -1);
  }, [treeData, id]);

  useEffect(() => {
    if (treeRef.current && initialOpenIds.length > 0) {
      initialOpenIds.forEach(id => {
        try {
          treeRef.current.open(id);
        } catch { /* ignore errors if node is not found or already open */ }
      });
    }
  }, [initialOpenIds]);

  const handleDrop = (newTree: DndNodeModel<ApiNodeModel>[], options: any) => {
    const { dragSourceId, dropTargetId } = options;
    
    // Validate we're not dropping into ourselves (the library usually handles this, but just in case)
    if (dragSourceId === dropTargetId) return;

    // Get the new ordered array of siblings in the destination
    const siblings = newTree.filter(n => n.parent === dropTargetId);
    const siblingIds = siblings.map(n => n.id as string);
    const newParentId = dropTargetId === 0 ? null : (dropTargetId as string);

    moveMutation.mutate({ id: dragSourceId as string, newParentId, siblingIds });
  };

  if (isLoading) {
    return (
      <ResizableSidebar defaultWidth={300} minWidth={200} maxWidth={800}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-9 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-2" />
          </div>
          <div className="p-4 space-y-4">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse shrink-0" />
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </ResizableSidebar>
    );
  }

  return (
    <ResizableSidebar defaultWidth={300} minWidth={200} maxWidth={800}>
      <div className="flex flex-col h-full">
        {/* Header Actions */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center text-white text-sm font-bold shadow-sm">T</span>
              My Currency Collection
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" title="View Trash" onClick={() => setIsTrashOpen(true)} className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="flex-1 flex items-center justify-start gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:ring-1 hover:ring-blue-500/50 text-gray-500 dark:text-gray-400 rounded-md transition-all text-sm text-left shadow-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Search nodes"
              title="Search nodes (Ctrl+K)"
            >
              <Search className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <span>Search nodes...</span>
            </button>
            
            <div className="relative group">
              <select
                className="appearance-none bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md px-3 py-1.5 pl-8 text-sm outline-none cursor-pointer border-r-8 border-transparent"
                value={selectedTagFilterId || ''}
                onChange={(e) => setSelectedTagFilterId(e.target.value || null)}
                title="Filter by Tag"
              >
                <option value="">All Tags</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
              <TagIcon className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-500 dark:text-gray-400 pointer-events-none" />
              {selectedTagFilterId && (
                <button 
                  onClick={() => setSelectedTagFilterId(null)}
                  className="absolute right-1 top-1.5 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  title="Clear tag filter"
                  aria-label="Clear tag filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tree Container */}
        <div className="flex-1 overflow-y-auto py-2 space-y-4">
          
          {/* Pinned Nodes */}
          {pinnedNodes.length > 0 && (
            <div className="px-2">
              <button 
                onClick={() => setIsPinnedExpanded(!isPinnedExpanded)}
                className="w-full flex items-center px-2 py-1 text-xs font-semibold text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 uppercase tracking-wider group transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                aria-expanded={isPinnedExpanded}
              >
                {isPinnedExpanded ? <ChevronDown className="w-3.5 h-3.5 mr-1" /> : <ChevronRight className="w-3.5 h-3.5 mr-1" />}
                Favorites
              </button>
              {isPinnedExpanded && (
                <div className="mt-1 space-y-0.5">
                  {pinnedNodes.map(node => (
                    <button
                      key={node.id}
                      onClick={() => navigate(`/node/${node.id}`)}
                      className={cn(
                        "w-full flex items-center px-6 py-1.5 text-sm rounded-md transition-colors text-left truncate",
                        id === node.id 
                          ? "bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100 font-medium"
                          : "text-gray-700 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:bg-gray-800/50"
                      )}
                    >
                      <Star className="w-3.5 h-3.5 mr-2 shrink-0 text-yellow-500 fill-yellow-500" />
                      <span className="truncate">{node.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Nodes */}
          {recentNodesList.length > 0 && (
            <div className="px-2">
              <button 
                onClick={() => setIsRecentExpanded(!isRecentExpanded)}
                className="w-full flex items-center px-2 py-1 text-xs font-semibold text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 uppercase tracking-wider group transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                aria-expanded={isRecentExpanded}
              >
                {isRecentExpanded ? <ChevronDown className="w-3.5 h-3.5 mr-1" /> : <ChevronRight className="w-3.5 h-3.5 mr-1" />}
                Recent
              </button>
              {isRecentExpanded && (
                <div className="mt-1 space-y-0.5">
                  {recentNodesList.map(node => (
                    <button
                      key={node.id}
                      onClick={() => navigate(`/node/${node.id}`)}
                      className={cn(
                        "w-full flex items-center px-6 py-1.5 text-sm rounded-md transition-colors text-left truncate",
                        id === node.id 
                          ? "bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100 font-medium"
                          : "text-gray-700 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:bg-gray-800/50"
                      )}
                    >
                      <Clock className="w-3.5 h-3.5 mr-2 shrink-0 text-gray-400" />
                      <span className="truncate">{node.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main Tree */}
          <div className="px-2">
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Workspace
            </div>
            
            {error && (
              <div className="px-4 text-sm text-red-500 py-2">Failed to load tree.</div>
            )}
            {treeData?.length === 0 && (
              <div className="px-4 text-sm text-gray-500 py-2">No nodes found. Create one!</div>
            )}
            
            <DndProvider backend={MultiBackend} options={getBackendOptions()}>
              <Tree
                ref={treeRef}
                tree={dndData}
              rootId={0}
              initialOpen={initialOpenIds}
              onDrop={handleDrop}
              render={(node, { depth, isOpen, onToggle }) => (
                <SidebarTreeNode 
                  node={node.data as ApiNodeModel} 
                  level={depth}
                  isOpen={isOpen}
                  onToggle={onToggle}
                />
              )}
              dragPreviewRender={(monitorProps) => {
                const item = monitorProps.item as any;
                return (
                  <div className="bg-white dark:bg-gray-800 border border-blue-500 text-blue-500 px-3 py-1.5 rounded-md shadow-lg text-sm font-medium">
                    {item.text}
                  </div>
                );
              }}
              classes={{
                root: 'pb-16',
                draggingSource: 'opacity-30',
                placeholder: 'bg-blue-500/20 relative z-10',
              }}
              sort={false}
              insertDroppableFirst={false}
              canDrop={(tree, { dragSource, dropTargetId }) => {
                if (!hasPermission('move')) return false;
                if (dragSource?.id === dropTargetId) {
                  return false;
                }
                return true;
              }}
              dropTargetOffset={10}
              placeholderRender={(node, { depth }) => {
                return (
                  <div 
                    className="absolute left-0 right-0 h-0.5 bg-blue-500 transform -translate-y-1/2 z-20"
                    style={{ left: depth * 16 + 12 }}
                  />
                );
              }}
            />
          </DndProvider>
        </div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
          {hasPermission('create_root') && (
            <button
              onClick={() => addDraftNode(null)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium text-sm rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              title="New Root Node (Ctrl+Alt+N)"
              aria-label="New Root Node"
            >
              <Plus className="w-4 h-4" />
              New Root Node
            </button>
          )}
          
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium text-sm rounded-lg transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            Log Out ({user?.username})
          </button>
        </div>
      </div>
      <CreateModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        title="Create Root Node"
        onConfirm={(title) => {
          createMutation.mutate({ title, parentId: null });
        }}
      />
      <TrashModal 
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
      />
    </ResizableSidebar>
  );
}
