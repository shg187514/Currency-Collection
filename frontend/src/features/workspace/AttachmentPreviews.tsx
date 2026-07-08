import React from 'react';
import { AttachmentModel } from '../../lib/api';
import { File, Download, X, Calendar, HardDrive } from 'lucide-react';
import { useAttachmentMutations } from '../../hooks/useAttachmentMutations';
import { format } from 'date-fns';
import { usePermissions } from '../../hooks/usePermissions';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

interface AttachmentPreviewsProps {
  attachments: AttachmentModel[];
  searchFocus?: any;
}

export function AttachmentPreviews({ attachments, searchFocus }: AttachmentPreviewsProps) {
  const { removeMutation } = useAttachmentMutations();
  const { hasPermission } = usePermissions();
  const itemRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [highlightedId, setHighlightedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (searchFocus?.type === 'attachment' && searchFocus.itemId) {
      const el = itemRefs.current[searchFocus.itemId];
      if (el) {
        // slight delay to ensure render
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedId(searchFocus.itemId);
        }, 100);
        setTimeout(() => setHighlightedId(null), 2500); // Remove highlight after 2.5s
      }
    }
  }, [searchFocus, attachments]);

  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter(a => a.mimeType.startsWith('image/'));
  const videos = attachments.filter(a => a.mimeType.startsWith('video/'));
  const audios = attachments.filter(a => a.mimeType.startsWith('audio/'));
  const pdfs = attachments.filter(a => a.mimeType === 'application/pdf');
  const others = attachments.filter(a => 
    !a.mimeType.startsWith('image/') && 
    !a.mimeType.startsWith('video/') && 
    !a.mimeType.startsWith('audio/') && 
    a.mimeType !== 'application/pdf'
  );

  const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '';
  const getUrl = (url: string) => `${backendUrl}${url}`;

  return (
    <div className="space-y-6 mt-4">
      
      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Images</h3>
          <div className="grid grid-cols-2 gap-3">
            {images.map(img => (
              <div 
                key={img.id} 
                ref={(el) => (itemRefs.current[img.id] = el)}
                className={`relative group rounded-lg overflow-hidden border ${highlightedId === img.id ? 'ring-4 ring-yellow-400 dark:ring-yellow-500 scale-[1.02] z-10 border-yellow-400' : 'border-gray-200 dark:border-gray-800'} transition-all duration-300 bg-gray-50 dark:bg-gray-900`}
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                  <img src={getUrl(img.url)} alt={img.filename} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-300 truncate w-32" title={img.filename}>{img.filename}</span>
                    <span className="text-[9px] text-gray-400">{formatBytes(img.size)} • {format(new Date(img.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  {hasPermission('download') && (
                    <a href={getUrl(img.url)} download className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors" title="Download">
                      <Download className="w-5 h-5" />
                    </a>
                  )}
                  {hasPermission('delete') && (
                    <button onClick={() => removeMutation.mutate(img.id)} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-colors" title="Delete">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Videos</h3>
          <div className="grid grid-cols-1 gap-3">
            {videos.map(vid => (
              <div 
                key={vid.id} 
                ref={(el) => (itemRefs.current[vid.id] = el)}
                className={`relative rounded-lg overflow-hidden border ${highlightedId === vid.id ? 'ring-4 ring-yellow-400 dark:ring-yellow-500 scale-[1.02] z-10 border-yellow-400' : 'border-gray-200 dark:border-gray-800'} bg-black group transition-all duration-300`}
              >
                {hasPermission('delete') && (
                  <button onClick={() => removeMutation.mutate(vid.id)} className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-all" title="Delete">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <video src={getUrl(vid.url)} controls className="w-full h-auto aspect-video" />
                <div className="p-2 bg-gray-900 flex justify-between items-center">
                  <div className="text-xs text-gray-300 truncate max-w-[60%]" title={vid.filename}>{vid.filename}</div>
                  <div className="text-[10px] text-gray-500 shrink-0">{formatBytes(vid.size)} • {format(new Date(vid.createdAt), 'MMM d, yyyy')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audios */}
      {audios.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Audio</h3>
          <div className="space-y-2">
            {audios.map(aud => (
              <div 
                key={aud.id} 
                ref={(el) => (itemRefs.current[aud.id] = el)}
                className={`flex flex-col gap-2 p-3 rounded-lg border ${highlightedId === aud.id ? 'ring-4 ring-yellow-400 dark:ring-yellow-500 scale-[1.02] z-10 border-yellow-400' : 'border-gray-200 dark:border-gray-800'} bg-gray-50 dark:bg-gray-900 transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col truncate min-w-0 pr-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={aud.filename}>{aud.filename}</span>
                    <span className="text-[10px] text-gray-500">{formatBytes(aud.size)} • {format(new Date(aud.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  {hasPermission('delete') && (
                    <button onClick={() => removeMutation.mutate(aud.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors rounded-md shrink-0" title="Delete">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <audio src={getUrl(aud.url)} controls className="h-8 w-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDFs */}
      {pdfs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">PDFs</h3>
          <div className="space-y-2">
            {pdfs.map(pdf => (
              <div 
                key={pdf.id} 
                ref={(el) => (itemRefs.current[pdf.id] = el)}
                className={`rounded-lg border ${highlightedId === pdf.id ? 'ring-4 ring-yellow-400 dark:ring-yellow-500 scale-[1.02] z-10 border-yellow-400' : 'border-gray-200 dark:border-gray-800'} overflow-hidden flex flex-col bg-gray-50 dark:bg-gray-900 group transition-all duration-300`}
              >
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg shrink-0">
                      <File className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-medium text-sm text-gray-700 dark:text-gray-300 truncate" title={pdf.filename}>{pdf.filename}</span>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                        <span className="flex items-center gap-0.5"><HardDrive className="w-3 h-3" /> {formatBytes(pdf.size)}</span>
                        <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {format(new Date(pdf.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {hasPermission('download') && (
                      <a href={getUrl(pdf.url)} target="_blank" rel="noreferrer" className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    {hasPermission('delete') && (
                      <button onClick={() => removeMutation.mutate(pdf.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Delete">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Files */}
      {others.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Files</h3>
          <div className="grid grid-cols-2 gap-3">
            {others.map(file => (
              <div 
                key={file.id} 
                ref={(el) => (itemRefs.current[file.id] = el)}
                className={`relative group flex flex-col items-center justify-center p-4 rounded-lg border ${highlightedId === file.id ? 'ring-4 ring-yellow-400 dark:ring-yellow-500 scale-[1.02] z-10 border-yellow-400' : 'border-gray-200 dark:border-gray-800'} bg-gray-50 dark:bg-gray-900 hover:border-blue-500 transition-all duration-300`}
              >
                {hasPermission('delete') && (
                  <button onClick={() => removeMutation.mutate(file.id)} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-all z-10" title="Delete">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="p-3 bg-white dark:bg-gray-800 rounded-full mb-3 shadow-sm">
                  <File className="w-8 h-8 text-blue-500" />
                </div>
                <span className="text-xs text-center text-gray-700 dark:text-gray-300 font-medium truncate w-full px-1" title={file.filename}>
                  {file.filename}
                </span>
                <div className="flex items-center justify-center gap-2 text-[9px] text-gray-400 mt-1.5">
                  <span className="uppercase">{file.mimeType.split('/').pop() || 'Unknown'}</span>
                  <span>•</span>
                  <span>{formatBytes(file.size)}</span>
                </div>
                <div className="text-[9px] text-gray-400 mt-0.5">{format(new Date(file.createdAt), 'MMM d, yyyy')}</div>
                
                {hasPermission('download') && (
                  <div className="absolute inset-0 bg-blue-500/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
                    <a href={getUrl(file.url)} download className="flex flex-col items-center gap-2 text-white p-4">
                      <Download className="w-6 h-6" />
                      <span className="text-xs font-semibold">Download</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
