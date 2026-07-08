import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadAttachment, deleteAttachment } from '../lib/api';
import { useToast } from '../components/ui/Toast';

export function useAttachmentMutations() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const invalidateTree = () => {
    queryClient.invalidateQueries({ queryKey: ['nodes-tree'] });
  };

  const uploadMutation = useMutation({
    mutationFn: ({ nodeId, file, onUploadProgress }: { nodeId: string; file: File; onUploadProgress?: (progressEvent: any) => void }) => uploadAttachment(nodeId, file, onUploadProgress),
    onSettled: invalidateTree,
    onSuccess: () => {
      addToast({ title: 'Success', description: 'File uploaded successfully', type: 'success' });
    },
    onError: (error: any) => {
      const detailedError = error.response?.data?.message || error.message || 'Unknown error occurred';
      console.error('Upload failed details:', error.response?.data || error);
      addToast({ title: 'Upload failed', description: detailedError, type: 'error' });
    }
  });

  const removeMutation = useMutation({
    mutationFn: deleteAttachment,
    onSettled: invalidateTree,
    onSuccess: () => {
      addToast({ title: 'Success', description: 'File removed successfully', type: 'success' });
    },
    onError: (error: any) => {
      const detailedError = error.response?.data?.message || error.message || 'Unknown error occurred';
      console.error('Delete attachment failed details:', error.response?.data || error);
      addToast({ title: 'Failed to remove file', description: detailedError, type: 'error' });
    }
  });

  return { uploadMutation, removeMutation };
}
