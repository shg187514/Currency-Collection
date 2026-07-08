import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import MDEditor from '@uiw/react-md-editor';
import { useDebouncedCallback } from 'use-debounce';
import { Clock, Plus, Trash2, ChevronLeft, ChevronRight, Edit2, Star, Folder, FileText } from 'lucide-react';
import { fetchTree } from '../../lib/api'; 
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTreeStore } from '../../store/useTreeStore';
import { useNodeMutations } from '../../hooks/useNodeMutations';
import { useAttachmentMutations } from '../../hooks/useAttachmentMutations';
import { Textarea } from '../../components/ui/Textarea';
import { NodeModel } from '../../lib/api';
import { WorkspaceHeader } from './WorkspaceHeader';
import { Dashboard } from '../dashboard/Dashboard';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { useToast } from '../../components/ui/Toast';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { WorkspaceRightSidebar } from './WorkspaceRightSidebar';
import { motion } from 'framer-motion';
import { ContextMenu } from '../../components/ui/ContextMenu';
import { MoveModal } from '../sidebar/NodeActionModals';
import { usePermissions } from '../../hooks/usePermissions';

// Helper to find a node by ID in the tree
const findNodeById = (nodes: NodeModel[], id: string): NodeModel | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findNodePathIds = (nodes: NodeModel[], targetId: string, currentPath: string[] = []): string[] | null => {
  for (const node of nodes) {
    const path = [...currentPath, node.id];
    if (node.id === targetId) {
      return path;
    }
    if (node.children && node.children.length > 0) {
      const found = findNodePathIds(node.children, targetId, path);
      if (found) return found;
    }
  }
  return null;
};

// Helper to find the actual node path
const findNodePath = (nodes: NodeModel[], targetId: string, currentPath: NodeModel[] = []): NodeModel[] | null => {
  for (const node of nodes) {
    const path = [...currentPath, node];
    if (node.id === targetId) {
      return path;
    }
    if (node.children && node.children.length > 0) {
      const found = findNodePath(node.children, targetId, path);
      if (found) return found;
    }
  }
  return null;
};

export function Workspace() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchFocus = location.state?.searchFocus;
  const { id } = useParams<{ id: string }>();
  const { addRecentNode, expandToNode, addDraftNode } = useTreeStore();
  const { data: treeData, isLoading } = useQuery({ queryKey: ['nodes-tree'], queryFn: fetchTree });
  const { updateMutation, createMutation, deleteMutation, toggleFavoriteMutation, archiveMutation, duplicateMutation, moveMutation } = useNodeMutations();
  const { uploadMutation } = useAttachmentMutations();
  const { addToast } = useToast();
  const { hasPermission } = usePermissions();

  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState<string | undefined>('');
  
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const [deleteModalNode, setDeleteModalNode] = useState<{ id: string, title: string, hasChildren: boolean } | null>(null);
  const [moveModalNode, setMoveModalNode] = useState<{ id: string, title: string } | null>(null);

  // Derived active node
  const activeNode = id && treeData ? findNodeById(treeData, id) : null;
  const breadcrumbs = activeNode && treeData ? findNodePath(treeData, activeNode.id) : [];

  // Scroll preservation
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !id) return;

    const handleScroll = () => {
      scrollPositions.current[id] = container.scrollTop;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [id]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !id) return;
    
    // Restore scroll position when navigating to a previously visited node
    requestAnimationFrame(() => {
      if (scrollPositions.current[id] !== undefined) {
        container.scrollTop = scrollPositions.current[id];
      } else {
        container.scrollTop = 0;
      }
    });
  }, [id]);

  // Sync recent nodes and auto-expand sidebar when active node changes
  useEffect(() => {
    if (activeNode) {
      addRecentNode(activeNode.id);
      
      // Auto-expand sidebar to reveal this node
      // We need to find the path to it
      const pathToNode = findNodePathIds(treeData || [], activeNode.id);
      if (pathToNode) {
        expandToNode(pathToNode);
      }
    }
  }, [activeNode, treeData, addRecentNode, expandToNode]);

  // Sync editor state when active node changes
  useEffect(() => {
    if (activeNode) {
      setTitle(activeNode.title);
      setDescription(activeNode.description || '');
      setContent(activeNode.content || '');
    }
  }, [activeNode, activeNode?.title, activeNode?.description, activeNode?.content]); // Only run when the node data changes

  const handleAddChild = React.useCallback(async () => {
    if (!activeNode) return;
    try {
      const newNode = await createMutation.mutateAsync({ title: 'Untitled', parentId: activeNode.id } as any);
      setEditingChildId(newNode.id);
      setEditingTitle('');
    } catch (error: any) {
      console.error('Failed to create child node:', error.response?.data || error);
      const serverDetails = error.response?.data?.details?.map((d: any) => `${d.path}: ${d.message}`).join(', ');
      const serverError = error.response?.data?.error;
      const prismaError = error.response?.data?.message;
      addToast({
        title: 'Error',
        description: serverDetails || serverError || prismaError || error?.message || 'Failed to create child node',
        type: 'error'
      });
    }
  }, [activeNode, createMutation, addToast]);

  // Global hotkeys for workspace
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (activeNode) {
          e.preventDefault();
          handleAddChild();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeNode, handleAddChild]);

  // Handle incoming search focus
  useEffect(() => {
    if (searchFocus?.type === 'description' && descriptionRef.current && description) {
      const textarea = descriptionRef.current;
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      const query = searchFocus.query.toLowerCase();
      const text = description.toLowerCase();
      const index = text.indexOf(query);
      if (index !== -1) {
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(index, index + query.length);
        }, 300);
      }
    }
  }, [searchFocus, activeNode?.id, description]);

  const debouncedUpdate = useDebouncedCallback((field: string, value: string | null) => {
    if (!activeNode) return;
    updateMutation.mutate({
      id: activeNode.id,
      data: { [field]: value },
    });
  }, 500);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    debouncedUpdate('title', e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    debouncedUpdate('description', e.target.value || null);
  };

  const handleContentChange = (val?: string) => {
    setContent(val);
    debouncedUpdate('content', val || null);
  };

  if (isLoading && id) {
    return (
      <div className="flex-1 overflow-hidden bg-white dark:bg-gray-950 flex flex-col lg:flex-row h-full">
        <div className="flex-1 p-8 space-y-8 animate-pulse">
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-10 w-2/3 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
          <div className="h-6 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-6 w-5/6 bg-gray-200 dark:bg-gray-800 rounded"></div>
          
          <div className="mt-12 h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!id || !activeNode) {
    return <Dashboard />;
  }

  return (
    <div className="flex-1 overflow-hidden bg-white dark:bg-gray-950 flex flex-col lg:flex-row h-full">
      <motion.div 
        key={activeNode.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto w-full p-8 pb-32 space-y-8" 
        data-color-mode="light"
      >
        {/* Fix for dark mode MDEditor */}
        <div className="hidden dark:block">
          <style>{`[data-color-mode="light"] { color-scheme: dark; --color-canvas-default: transparent; }`}</style>
        </div>

        <WorkspaceHeader />

        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 font-medium">
            <button onClick={() => navigate('/')} className="hover:text-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">Root</button>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                <button
                  onClick={() => navigate(`/node/${crumb.id}`)}
                  className={`hover:text-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1 ${idx === breadcrumbs.length - 1 ? 'text-gray-900 dark:text-gray-100' : ''}`}
                >
                  {crumb.title || 'Untitled'}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Title */}
        <div className="pt-2">
          {hasPermission('rename') ? (
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled Node"
              className="w-full text-4xl font-bold bg-transparent border-none outline-none focus:ring-0 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-gray-50 mb-2"
            />
          ) : (
            <h1 className="w-full text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2 py-2 min-h-[56px] flex items-center">
              {title || 'Untitled Node'}
            </h1>
          )}
        </div>

        {/* Description */}
        <div>
          {hasPermission('edit_description') ? (
            <Textarea
              ref={descriptionRef}
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Add a short description..."
              className="text-lg bg-transparent border-none shadow-none resize-none focus-visible:ring-0 px-0 min-h-[40px] text-gray-600 dark:text-gray-400 placeholder-gray-300 dark:placeholder-gray-700"
              rows={2}
            />
          ) : (
            description && (
              <p className="text-lg text-gray-600 dark:text-gray-400 min-h-[40px] py-2">
                {description}
              </p>
            )
          )}
        </div>

        {/* Sticky Toolbar */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md py-3 mb-6 border-b border-gray-100 dark:border-gray-800 -mx-8 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeNode.parentId) {
                  navigate(`/node/${activeNode.parentId}`);
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-900 transition-colors rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              title="Go Back"
              aria-label="Go Back"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-1" />
            <PermissionGuard permission="create_child">
              <button 
                onClick={handleAddChild}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                title="Add Child Node (Ctrl+Enter)"
                aria-label="Add Child Node"
              >
                <Plus className="w-4 h-4" />
                Add Child Node
              </button>
            </PermissionGuard>
          </div>
          <div className="flex items-center gap-2">
            <PermissionGuard permission="rename">
              <button
                onClick={() => {
                  if (titleRef.current) {
                    titleRef.current.focus();
                    titleRef.current.select();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-900 transition-colors rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                title="Rename Node"
                aria-label="Rename Node"
              >
                <Edit2 className="w-4 h-4" />
                <span className="hidden sm:inline">Rename</span>
              </button>
            </PermissionGuard>
            <button
              onClick={() => toggleFavoriteMutation.mutate({ id: activeNode.id, isFavorite: !activeNode.isFavorite })}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                activeNode.isFavorite 
                  ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-900'
              }`}
              title="Toggle Favorite"
              aria-label={activeNode.isFavorite ? "Unfavorite Node" : "Favorite Node"}
            >
              <Star className={`w-4 h-4 ${activeNode.isFavorite ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Favorite</span>
            </button>
            <PermissionGuard permission="delete">
              <button
                onClick={() => setDeleteModalNode({ id: activeNode.id, title: activeNode.title, hasChildren: activeNode.children && activeNode.children.length > 0 })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                title="Delete Node"
                aria-label="Delete Node"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </PermissionGuard>
          </div>
        </div>

        {/* Markdown Editor */}
        <div className="prose-container" data-color-mode="light">
          <div className="dark:hidden">
            <MDEditor
              value={content}
              onChange={handleContentChange}
              preview={hasPermission('edit_description') ? "edit" : "preview"}
              hideToolbar={!hasPermission('edit_description')}
              height={500}
              className="border-none shadow-none !bg-transparent"
            />
          </div>
          <div className="hidden dark:block" data-color-mode="dark">
            <MDEditor
              value={content}
              onChange={handleContentChange}
              preview={hasPermission('edit_description') ? "edit" : "preview"}
              hideToolbar={!hasPermission('edit_description')}
              height={500}
              className="border-none shadow-none !bg-transparent"
            />
          </div>
        </div>

        {/* Children Quick List */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md z-10 py-3 -my-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Children</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (activeNode.parentId) {
                    navigate(`/node/${activeNode.parentId}`);
                  } else {
                    navigate('/');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-900 transition-colors rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                title="Go Back"
                aria-label="Go Back"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <PermissionGuard permission="create_child">
                <button 
                  onClick={handleAddChild}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  title="Add Child Node (Ctrl+Enter)"
                  aria-label="Add Child Node"
                >
                  <Plus className="w-4 h-4" />
                  Add Child Node
                </button>
              </PermissionGuard>
            </div>
          </div>
          
          {activeNode.children && activeNode.children.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeNode.children.map(child => (
                <ContextMenu
                  key={child.id}
                  menu={
                    <div className="flex flex-col text-sm w-48">
                      <button className="text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm" onClick={() => navigate(`/node/${child.id}`)}>Open</button>
                      <PermissionGuard permission="create_child">
                        <button className="text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm" onClick={() => addDraftNode(child.id)}>Add Child</button>
                      </PermissionGuard>
                      <PermissionGuard permission="rename">
                        <button className="text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm" onClick={() => { setEditingChildId(child.id); setEditingTitle(child.title); }}>Rename</button>
                      </PermissionGuard>
                      <PermissionGuard permission="move">
                        <button className="text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm" onClick={() => setMoveModalNode({ id: child.id, title: child.title })}>Move...</button>
                      </PermissionGuard>
                      <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
                      <button className="text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm" onClick={() => toggleFavoriteMutation.mutate({ id: child.id, isFavorite: !child.isFavorite })}>
                        {child.isFavorite ? 'Unfavorite' : 'Favorite'}
                      </button>
                      <PermissionGuard permission="create_child">
                        <button className="text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm" onClick={() => duplicateMutation.mutate(child.id)}>Duplicate</button>
                      </PermissionGuard>
                      <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
                      <PermissionGuard permission="archive">
                        <button className="text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm" onClick={() => archiveMutation.mutate(child.id)}>Archive</button>
                      </PermissionGuard>
                      <PermissionGuard permission="delete">
                        <button className="text-left px-2 py-1.5 hover:bg-red-50 text-red-600 dark:hover:bg-red-900/30 dark:text-red-500 rounded-sm" onClick={() => {
                          if (child.children && child.children.length > 0) {
                            setDeleteModalNode({ id: child.id, title: child.title, hasChildren: true });
                          } else {
                            deleteMutation.mutate({ id: child.id, deleteDescendants: false });
                          }
                        }}>
                          Delete
                        </button>
                      </PermissionGuard>
                    </div>
                  }
                >
                  <div 
                    onClick={() => {
                      if (editingChildId !== child.id) navigate(`/node/${child.id}`);
                    }}
                    className="group relative p-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-white dark:bg-gray-900 border border-transparent transition-all duration-200 cursor-pointer flex flex-col h-full"
                  >
                  {editingChildId === child.id ? (
                    <input
                      autoFocus
                      ref={(el) => {
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }}
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                          if (editingTitle.trim() && editingTitle !== child.title) {
                            updateMutation.mutate({ id: child.id, data: { title: editingTitle } });
                          } else if (!editingTitle.trim() && !child.title) {
                            deleteMutation.mutate({ id: child.id });
                          }
                          setEditingChildId(null);
                        } else if (e.key === 'Escape') {
                          e.stopPropagation();
                          if (!editingTitle.trim() && !child.title) {
                            deleteMutation.mutate({ id: child.id });
                          }
                          setEditingChildId(null);
                        }
                      }}
                      onBlur={() => {
                        if (editingTitle.trim() && editingTitle !== child.title) {
                          updateMutation.mutate({ id: child.id, data: { title: editingTitle } });
                        } else if (!editingTitle.trim() && !child.title) {
                          deleteMutation.mutate({ id: child.id });
                        }
                        setEditingChildId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Untitled Node"
                      className="w-full bg-white dark:bg-gray-950 border border-blue-500 rounded px-2 py-1 text-sm outline-none font-medium text-gray-900 dark:text-gray-100"
                    />
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {child.children && child.children.length > 0 ? (
                          <Folder className="w-5 h-5 text-blue-500 dark:text-blue-400 fill-blue-50 dark:fill-blue-900/30" />
                        ) : (
                          <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{child.title || 'Untitled Node'}</h4>
                        <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                          <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
                          <span className="truncate">Updated {new Date(child.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {editingChildId !== child.id && (
                    <PermissionGuard permission="delete">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (child.children && child.children.length > 0) {
                            setDeleteModalNode({ id: child.id, title: child.title, hasChildren: true });
                          } else {
                            deleteMutation.mutate({ id: child.id, deleteDescendants: false });
                          }
                        }}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:opacity-100"
                        title="Delete Child Node"
                        aria-label="Delete Child Node"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </PermissionGuard>
                  )}
                  </div>
                </ContextMenu>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic py-4">No children nodes yet.</div>
          )}
        </div>
      </motion.div>

      {/* Right Sidebar */}
      <WorkspaceRightSidebar activeNode={activeNode} uploadMutation={uploadMutation} searchFocus={searchFocus} />

      {deleteModalNode && (
        <DeleteConfirmationModal 
          isOpen={true}
          nodeTitle={deleteModalNode.title}
          hasChildren={deleteModalNode.hasChildren}
          onClose={() => setDeleteModalNode(null)}
          onConfirm={(deleteDescendants) => {
            deleteMutation.mutate({ id: deleteModalNode.id, deleteDescendants });
            setDeleteModalNode(null);
          }}
        />
      )}

      {moveModalNode && (
        <MoveModal 
          isOpen={true} 
          onClose={() => setMoveModalNode(null)} 
          title={`Move "${moveModalNode.title}"`}
          onConfirm={(newParentId) => moveMutation.mutate({ id: moveModalNode.id, newParentId })}
        />
      )}
    </div>
  );
}
