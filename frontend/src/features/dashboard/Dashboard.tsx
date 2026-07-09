import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  FolderGit2, 
  Paperclip, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  HardDrive, 
  Star,
  Activity
} from 'lucide-react';
import { fetchStats } from '../../lib/api';
import { motion } from 'framer-motion';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchStats,
    refetchInterval: 5000, // Refetch every 5 seconds to keep dashboard somewhat live
  });

  if (isLoading || !stats) {
    return (
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-950 animate-pulse">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded mt-3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[300px] bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="h-[300px] bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Workspace Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Here is what is happening in your My Currency Collection.</p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-lg">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Nodes</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalNodes}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 rounded-lg">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Storage Used</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatBytes(stats.storageUsed)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400 rounded-lg">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Favorites</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.favoriteNodes}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Two Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Media Breakdown */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-gray-400" />
              Attachments Breakdown
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400 rounded-md">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Images</span>
                </div>
                <span className="text-gray-500 font-semibold">{stats.images}</span>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 rounded-md">
                    <Video className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Videos</span>
                </div>
                <span className="text-gray-500 font-semibold">{stats.videos}</span>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-md">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Documents</span>
                </div>
                <span className="text-gray-500 font-semibold">{stats.documents}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950">
                <span className="font-medium text-gray-500">Total Files</span>
                <span className="text-gray-900 dark:text-gray-100 font-bold">{stats.attachments}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Global Activity */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" />
              Recent Global Activity
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm min-h-[300px]">
              {stats.recentActivity.length === 0 ? (
                <div className="text-center text-gray-500 py-12">No recent activity.</div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
                  {stats.recentActivity.map((item) => (
                    <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Timeline Dot */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-900 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                        <Activity className="w-4 h-4" />
                      </div>
                      
                      {/* Event Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-gray-900 dark:text-gray-100">{item.action}</div>
                          <time className="text-xs text-gray-500 font-medium">{format(new Date(item.createdAt), 'MMM d, h:mm a')}</time>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {/* @ts-ignore - node might be populated via include if requested in backend */}
                          Node: <span className="font-semibold">{item.node?.title || 'Unknown Node'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
