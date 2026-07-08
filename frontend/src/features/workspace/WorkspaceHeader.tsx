import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight as BreadcrumbSeparator, Home } from 'lucide-react';
import { fetchTree, NodeModel } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut } from 'lucide-react';

// Utility to find the path from root to a specific node
const findPathToNode = (nodes: NodeModel[], targetId: string, currentPath: NodeModel[] = []): NodeModel[] | null => {
  for (const node of nodes) {
    const path = [...currentPath, node];
    if (node.id === targetId) {
      return path;
    }
    if (node.children && node.children.length > 0) {
      const foundPath = findPathToNode(node.children, targetId, path);
      if (foundPath) return foundPath;
    }
  }
  return null;
};

export function WorkspaceHeader() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuthStore();
  
  const { data: treeData } = useQuery({ queryKey: ['nodes-tree'], queryFn: fetchTree });

  const breadcrumbs = useMemo(() => {
    if (!treeData || !id) return [];
    return findPathToNode(treeData, id) || [];
  }, [treeData, id]);

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 mb-6 pb-4 gap-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 overflow-x-auto no-scrollbar min-w-0">
        <button 
          onClick={() => navigate('/')}
          className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center shrink-0"
          title="Home"
        >
          <Home className="w-3.5 h-3.5" />
        </button>
        
        {breadcrumbs.map((node, index) => (
          <React.Fragment key={node.id}>
            <BreadcrumbSeparator className="w-3.5 h-3.5 mx-1.5 text-gray-300 dark:text-gray-600 shrink-0" />
            <button
              onClick={() => navigate(`/node/${node.id}`)}
              className={`hover:text-gray-900 dark:hover:text-gray-100 transition-colors truncate max-w-[150px] ${
                index === breadcrumbs.length - 1 ? 'text-gray-900 dark:text-gray-100' : ''
              }`}
            >
              {node.title}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {/* User Info & Logout */}
      {user && (
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-end text-sm hidden sm:flex">
            <span className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">{user.username}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-900 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}
