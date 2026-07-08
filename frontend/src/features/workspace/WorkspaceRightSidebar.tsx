import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Tag, Paperclip } from 'lucide-react';
import { NodeModel } from '../../lib/api';
import { NodeTags } from '../tags/NodeTags';
import { AttachmentPreviews } from './AttachmentPreviews';
import { ActivityHistory } from './ActivityHistory';
import { useToast } from '../../components/ui/Toast';
import { usePermissions } from '../../hooks/usePermissions';

interface WorkspaceRightSidebarProps {
  activeNode: NodeModel;
  uploadMutation: any;
  searchFocus?: any;
}

export function WorkspaceRightSidebar({ activeNode, uploadMutation, searchFocus }: WorkspaceRightSidebarProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const { addToast } = useToast();
  const { hasPermission } = usePermissions();

  const handleUploadProgress = (progressEvent: any) => {
    if (progressEvent.total) {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      setUploadProgress(percentCompleted);
    }
  };

  const validateFile = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      addToast({ title: 'Upload failed', description: 'File size exceeds the 50MB limit.', type: 'error' });
      return false;
    }
    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!hasPermission('upload')) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!hasPermission('upload')) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setUploadProgress(0);
        uploadMutation.mutate(
          { nodeId: activeNode.id, file, onUploadProgress: handleUploadProgress },
          { onSettled: () => setUploadProgress(null) }
        );
      }
    }
  };

  return (
    <div className="w-full lg:w-80 shrink-0 border-l border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 overflow-y-auto p-6 space-y-8">
      {/* Header Metadata */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Properties</h4>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Created</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {format(new Date(activeNode.createdAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Updated</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {format(new Date(activeNode.updatedAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">
          <Tag className="h-4 w-4" /> Tags
        </div>
        <NodeTags node={activeNode} />
      </div>

      {/* Attachments */}
      <div 
        className={`relative rounded-lg border-2 border-dashed transition-colors ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-transparent'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-50/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg">
            <span className="font-medium text-blue-600 dark:text-blue-400">Drop file to upload</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
            <Paperclip className="h-4 w-4" /> Attachments
          </div>
          {hasPermission('upload') && (
            <label className="cursor-pointer text-xs font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-2 py-1 rounded transition-colors">
              Upload
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && validateFile(file)) {
                    setUploadProgress(0);
                    uploadMutation.mutate(
                      { nodeId: activeNode.id, file, onUploadProgress: handleUploadProgress },
                      { onSettled: () => setUploadProgress(null) }
                    );
                  }
                  e.target.value = ''; // Reset input
                }} 
              />
            </label>
          )}
        </div>
        
        {uploadProgress !== null && (
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-out" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
        
        {activeNode.attachments && activeNode.attachments.length > 0 ? (
          <AttachmentPreviews attachments={activeNode.attachments} searchFocus={searchFocus} />
        ) : (
          <div className="text-sm text-gray-400 italic p-4 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            No files attached.<br/>Drag & drop here.
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <ActivityHistory nodeId={activeNode.id} />
      </div>
    </div>
  );
}
