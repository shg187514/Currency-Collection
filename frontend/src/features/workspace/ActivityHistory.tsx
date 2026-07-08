import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNodeHistory, HistoryModel } from '../../lib/api';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Plus, 
  Edit2, 
  Move, 
  Trash2, 
  RotateCcw, 
  Paperclip, 
  Star, 
  StarOff,
  Copy,
  FolderGit2,
  Activity
} from 'lucide-react';

interface ActivityHistoryProps {
  nodeId: string;
}

export function ActivityHistory({ nodeId }: ActivityHistoryProps) {
  const { data: history = [], isLoading, error } = useQuery({
    queryKey: ['history', nodeId],
    queryFn: () => fetchNodeHistory(nodeId),
  });

  if (isLoading) {
    return (
      <div className="py-4 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-500 py-4">Failed to load history.</div>;
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
          <Activity className="w-6 h-6 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-sm font-medium">No recent activity</p>
        <p className="text-xs mt-1">Actions on this node will appear here.</p>
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED': return <Plus className="w-4 h-4 text-green-500" />;
      case 'UPDATED': return <Edit2 className="w-4 h-4 text-blue-500" />;
      case 'MOVED': return <Move className="w-4 h-4 text-purple-500" />;
      case 'ARCHIVED': return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'RESTORED': return <RotateCcw className="w-4 h-4 text-green-500" />;
      case 'FAVORITED': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'UNFAVORITED': return <StarOff className="w-4 h-4 text-gray-500" />;
      case 'DUPLICATED_FROM': return <Copy className="w-4 h-4 text-orange-500" />;
      case 'ATTACHMENT_UPLOADED': return <Paperclip className="w-4 h-4 text-blue-500" />;
      case 'ATTACHMENT_DELETED': return <Trash2 className="w-4 h-4 text-red-500" />;
      default: return <FolderGit2 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionText = (item: HistoryModel) => {
    let parsedChanges: any = {};
    if (item.changes) {
      try {
        parsedChanges = JSON.parse(item.changes);
      } catch (_e) {}
    }

    switch (item.action) {
      case 'CREATED': return 'Node created';
      case 'UPDATED': 
        const keys = Object.keys(parsedChanges).filter(k => k !== 'tagIds');
        const hasTags = parsedChanges.tagIds !== undefined;
        let updateText = 'Node updated';
        if (keys.length > 0) updateText = `Updated ${keys.join(', ')}`;
        if (hasTags) updateText += keys.length > 0 ? ' and tags' : 'Updated tags';
        return updateText;
      case 'MOVED': return 'Moved to a new parent';
      case 'ARCHIVED': return 'Node archived';
      case 'RESTORED': return 'Node restored';
      case 'FAVORITED': return 'Added to favorites';
      case 'UNFAVORITED': return 'Removed from favorites';
      case 'DUPLICATED_FROM': return 'Duplicated from another node';
      case 'ATTACHMENT_UPLOADED': return `Uploaded file: ${parsedChanges.filename || 'unknown'}`;
      case 'ATTACHMENT_DELETED': return `Deleted file: ${parsedChanges.filename || 'unknown'}`;
      default: return item.action;
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Activity History</h3>
      
      <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-3 space-y-6">
        {history.map((item) => (
          <div key={item.id} className="relative pl-6">
            <span className="absolute -left-[11px] top-1 bg-white dark:bg-gray-950 rounded-full p-0.5 border border-gray-200 dark:border-gray-700">
              {getActionIcon(item.action)}
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {getActionText(item)}
              </span>
              <span className="text-xs text-gray-400 mt-1 sm:mt-0" title={format(new Date(item.createdAt), 'PPpp')}>
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
