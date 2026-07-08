import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export interface DashboardStats {
  totalNodes: number;
  favoriteNodes: number;
  attachments: number;
  images: number;
  videos: number;
  documents: number;
  storageUsed: number;
  recentActivity: HistoryModel[];
}

export interface AttachmentModel {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  nodeId: string;
  createdAt: string;
}

export interface TagModel {
  id: string;
  name: string;
  color: string | null;
}

export interface HistoryModel {
  id: string;
  action: string;
  changes: string | null;
  nodeId: string;
  createdAt: string;
}

export interface NodeModel {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  parentId: string | null;
  isArchived: boolean;
  isFavorite: boolean;
  isDeleted: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  attachments: AttachmentModel[];
  tags: TagModel[];
  children: NodeModel[];
}

export const fetchTree = async () => {
  try {
    const response = await api.get('/nodes/tree');
    return response.data?.data || [];
  } catch (error) {
    throw error;
  }
};

export const createNode = async (data: { title: string; parentId?: string | null; description?: string | null; content?: string }) => {
  const response = await api.post('/nodes', data);
  return response.data.data;
};

export const updateNode = async (id: string, data: { title?: string; description?: string | null; content?: string | null; tagIds?: string[] }) => {
  const response = await api.put(`/nodes/${id}`, data);
  return response.data.data;
};

export const deleteNode = async (data: { id: string, deleteDescendants?: boolean }) => {
  const params = data.deleteDescendants ? { deleteDescendants: 'true' } : {};
  await api.delete(`/nodes/${data.id}`, { params });
};

export const moveNode = async (id: string, newParentId: string | null, siblingIds: string[] = []) => {
  const response = await api.post(`/nodes/${id}/move`, { newParentId, siblingIds });
  return response.data.data;
};

export const uploadAttachment = async (nodeId: string, file: File, onUploadProgress?: (progressEvent: any) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/nodes/${nodeId}/attachments`, formData, {
    onUploadProgress
  });
  return response.data.data;
};

export const deleteAttachment = async (id: string) => {
  const response = await api.delete(`/attachments/${id}`);
  return response.data;
};

export const duplicateNode = async (id: string) => {
  const response = await api.post(`/nodes/${id}/duplicate`);
  return response.data.data;
};

export const archiveNode = async (id: string) => {
  const response = await api.post(`/nodes/${id}/archive`);
  return response.data.data;
};

export const restoreNode = async (id: string) => {
  const response = await api.post(`/nodes/${id}/archive`, { isArchived: false });
  return response.data.data;
};

// Tag APIs
export const fetchTags = async (): Promise<TagModel[]> => {
  try {
    const response = await api.get('/tags');
    return response.data?.data || [];
  } catch (error) {
    throw error;
  }
};

export const createTag = async (data: { name: string; color?: string }): Promise<TagModel> => {
  const response = await api.post('/tags', data);
  return response.data.data;
};

export const updateTag = async (id: string, data: { name?: string; color?: string }): Promise<TagModel> => {
  const response = await api.put(`/tags/${id}`, data);
  return response.data.data;
};

export const deleteTag = async (id: string): Promise<void> => {
  await api.delete(`/tags/${id}`);
};

export const toggleFavoriteNode = async (id: string, isFavorite: boolean) => {
  const endpoint = isFavorite ? `/nodes/${id}/favorite` : `/nodes/${id}/unfavorite`;
  const response = await api.post(endpoint);
  return response.data.data;
};

export const fetchNodeHistory = async (id: string): Promise<HistoryModel[]> => {
  const response = await api.get(`/nodes/${id}/history`);
  return response.data.data;
};

// Trash APIs
export const fetchTrash = async (): Promise<NodeModel[]> => {
  const response = await api.get('/nodes/trash');
  return response.data.data;
};

export const emptyTrash = async (): Promise<void> => {
  await api.delete('/nodes/trash');
};

export const restoreNodeFromTrash = async (id: string): Promise<NodeModel> => {
  const response = await api.post(`/nodes/${id}/restore-trash`);
  return response.data.data;
};

export const permanentDeleteNode = async (id: string): Promise<void> => {
  await api.delete(`/nodes/${id}/permanent`);
};

export const fetchStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/stats');
    return response.data?.data || {
      totalNodes: 0,
      favoriteNodes: 0,
      attachments: 0,
      images: 0,
      videos: 0,
      documents: 0,
      storageUsed: 0,
      recentActivity: []
    };
  } catch (error) {
    throw error;
  }
};
