import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createNode,
  updateNode,
  deleteNode,
  duplicateNode,
  moveNode,
  archiveNode,
  restoreNode,
  toggleFavoriteNode,
  restoreNodeFromTrash,
  permanentDeleteNode,
  emptyTrash,
  NodeModel,
} from '../lib/api';

// Helper to recursively update a node in the tree
const updateNodeInTree = (nodes: NodeModel[], id: string, updater: (node: NodeModel) => NodeModel): NodeModel[] => {
  return nodes.map((node) => {
    if (node.id === id) {
      return updater(node);
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: updateNodeInTree(node.children, id, updater) };
    }
    return node;
  });
};

// Helper to recursively remove a node from the tree
const removeNodeFromTree = (nodes: NodeModel[], id: string): NodeModel[] => {
  return nodes.filter(n => n.id !== id).map((node) => {
    if (node.children && node.children.length > 0) {
      return { ...node, children: removeNodeFromTree(node.children, id) };
    }
    return node;
  });
};

export const useNodeMutations = () => {
  const queryClient = useQueryClient();

  const invalidateTree = () => {
    queryClient.invalidateQueries({ queryKey: ['nodes-tree'] });
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; description?: string | null; content?: string | null; tagIds?: string[] } }) =>
      updateNode(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['nodes-tree'] });
      const previousTree = queryClient.getQueryData<NodeModel[]>(['nodes-tree']);
      if (previousTree) {
        queryClient.setQueryData<NodeModel[]>(['nodes-tree'], (old) =>
          old ? updateNodeInTree(old, id, (n) => ({ ...n, ...data })) : []
        );
      }
      return { previousTree };
    },
    onError: (err, variables, context) => {
      if (context?.previousTree) {
        queryClient.setQueryData(['nodes-tree'], context.previousTree);
      }
    },
    onSettled: invalidateTree,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      toggleFavoriteNode(id, isFavorite),
    onMutate: async ({ id, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ['nodes-tree'] });
      const previousTree = queryClient.getQueryData<NodeModel[]>(['nodes-tree']);
      if (previousTree) {
        queryClient.setQueryData<NodeModel[]>(['nodes-tree'], (old) =>
          old ? updateNodeInTree(old, id, (n) => ({ ...n, isFavorite })) : []
        );
      }
      return { previousTree };
    },
    onError: (err, variables, context) => {
      if (context?.previousTree) {
        queryClient.setQueryData(['nodes-tree'], context.previousTree);
      }
    },
    onSettled: invalidateTree,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNode,
    onMutate: async (data: { id: string, deleteDescendants?: boolean }) => {
      await queryClient.cancelQueries({ queryKey: ['nodes-tree'] });
      const previousTree = queryClient.getQueryData<NodeModel[]>(['nodes-tree']);
      if (previousTree) {
        queryClient.setQueryData<NodeModel[]>(['nodes-tree'], (old) =>
          old ? removeNodeFromTree(old, data.id) : []
        );
      }
      return { previousTree };
    },
    onError: (err, variables, context) => {
      if (context?.previousTree) {
        queryClient.setQueryData(['nodes-tree'], context.previousTree);
      }
    },
    onSettled: invalidateTree,
  });

  const archiveMutation = useMutation({
    mutationFn: archiveNode,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['nodes-tree'] });
      const previousTree = queryClient.getQueryData<NodeModel[]>(['nodes-tree']);
      if (previousTree) {
        queryClient.setQueryData<NodeModel[]>(['nodes-tree'], (old) =>
          old ? removeNodeFromTree(old, id) : [] // Archiving hides it from the tree
        );
      }
      return { previousTree };
    },
    onError: (err, variables, context) => {
      if (context?.previousTree) {
        queryClient.setQueryData(['nodes-tree'], context.previousTree);
      }
    },
    onSettled: invalidateTree,
  });

  // Structural changes that are harder to optimistically update accurately on the client
  // so we just invalidate the cache to refetch instantly.
  const createMutation = useMutation({ 
    mutationFn: createNode, 
    onSuccess: (newNode) => {
      queryClient.setQueryData<NodeModel[]>(['nodes-tree'], (old) => {
        if (!old) return [];
        if (!newNode.parentId) {
          return [...old, { ...newNode, children: [] }];
        }
        return updateNodeInTree(old, newNode.parentId, (parent) => ({
          ...parent,
          children: [...(parent.children || []), { ...newNode, children: [] }]
        }));
      });
    },
    onSettled: invalidateTree 
  });
  const duplicateMutation = useMutation({ mutationFn: duplicateNode, onSettled: invalidateTree });
  const moveMutation = useMutation({ 
    mutationFn: ({ id, newParentId, siblingIds }: { id: string; newParentId: string | null; siblingIds?: string[] }) => moveNode(id, newParentId, siblingIds), 
    onSettled: invalidateTree 
  });
  const restoreMutation = useMutation({ mutationFn: restoreNode, onSettled: invalidateTree });

  const restoreTrashMutation = useMutation({ mutationFn: restoreNodeFromTrash, onSettled: invalidateTree });
  const permanentDeleteMutation = useMutation({ mutationFn: permanentDeleteNode, onSettled: invalidateTree });
  const emptyTrashMutation = useMutation({ mutationFn: emptyTrash, onSettled: invalidateTree });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    duplicateMutation,
    moveMutation,
    archiveMutation,
    restoreMutation,
    toggleFavoriteMutation,
    restoreTrashMutation,
    permanentDeleteMutation,
    emptyTrashMutation,
  };
};
