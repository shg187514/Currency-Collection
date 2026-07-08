import { useAuthStore, UserRole } from '../store/useAuthStore';
import { useMemo } from 'react';

export type Permission = 
  | 'create_root' 
  | 'create_child' 
  | 'rename' 
  | 'delete' 
  | 'move' 
  | 'upload' 
  | 'download' 
  | 'edit_description' 
  | 'search' 
  | 'manage_tags'
  | 'archive';

const RolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'create_root', 
    'create_child', 
    'rename', 
    'delete', 
    'move', 
    'upload', 
    'download', 
    'edit_description', 
    'search', 
    'manage_tags',
    'archive'
  ],
  uploader: [
    'upload',
    'download',
    'edit_description',
    'create_child',
    'search'
  ],
  viewer: [
    'download',
    'search'
  ]
};

export function usePermissions() {
  const { user } = useAuthStore();
  
  const permissions = useMemo(() => {
    if (!user) return [];
    return RolePermissions[user.role] || [];
  }, [user]);

  const hasPermission = (permission: Permission) => {
    return permissions.includes(permission);
  };

  return { hasPermission, permissions };
}
