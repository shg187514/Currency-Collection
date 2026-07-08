import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTag, updateTag, deleteTag } from '../lib/api';

export const useTagMutations = () => {
  const queryClient = useQueryClient();

  const invalidateTags = () => {
    queryClient.invalidateQueries({ queryKey: ['tags'] });
    // Tags are also embedded in nodes-tree, so invalidate that too to be safe
    queryClient.invalidateQueries({ queryKey: ['nodes-tree'] });
  };

  const createMutation = useMutation({
    mutationFn: createTag,
    onSettled: invalidateTags,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; color?: string } }) => updateTag(id, data),
    onSettled: invalidateTags,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSettled: invalidateTags,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
