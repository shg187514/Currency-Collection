import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, RefreshCcw, AlertTriangle, X } from 'lucide-react';
import { fetchTrash } from '../../lib/api';
import { useNodeMutations } from '../../hooks/useNodeMutations';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrashModal({ isOpen, onClose }: TrashModalProps) {
  const queryClient = useQueryClient();
  const { data: trashNodes, isLoading } = useQuery({
    queryKey: ['trash'],
    queryFn: fetchTrash,
    enabled: isOpen,
  });

  const { restoreTrashMutation, permanentDeleteMutation, emptyTrashMutation } = useNodeMutations();

  if (!isOpen) return null;

  const handleRestore = async (id: string) => {
    await restoreTrashMutation.mutateAsync(id);
    queryClient.invalidateQueries({ queryKey: ['trash'] });
  };

  const handlePermanentDelete = async (id: string) => {
    await permanentDeleteMutation.mutateAsync(id);
    queryClient.invalidateQueries({ queryKey: ['trash'] });
  };

  const handleEmptyTrash = async () => {
    if (confirm('Are you sure you want to permanently delete all items in the trash? This cannot be undone.')) {
      await emptyTrashMutation.mutateAsync();
      queryClient.invalidateQueries({ queryKey: ['trash'] });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Trash</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : trashNodes?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-medium">Trash is empty</p>
              <p className="text-xs mt-1">Deleted items will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {trashNodes?.map(node => (
                <div key={node.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{node.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">Deleted {format(new Date(node.updatedAt), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRestore(node.id)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900 dark:hover:bg-blue-900/50"
                    >
                      <RefreshCcw className="w-4 h-4 mr-1.5" />
                      Restore
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePermanentDelete(node.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {trashNodes && trashNodes.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
            <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-500">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              Items in trash will be permanently deleted after 30 days.
            </div>
            <Button variant="danger" onClick={handleEmptyTrash}>
              Empty Trash
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
