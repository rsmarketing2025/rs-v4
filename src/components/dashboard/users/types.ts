
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: 'admin' | 'user';
}

export interface UserPermission {
  page: string;
  can_access: boolean;
}

export interface UserWithPermissions extends User {
  permissions?: UserPermission[];
}

export interface UserDetailModalProps {
  user: UserWithPermissions | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: () => void;
}
