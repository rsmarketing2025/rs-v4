
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: 'admin' | 'user' | 'business_manager';
}

export interface UserPermission {
  page: string;
  can_access: boolean;
}

export interface UserWithPermissions extends User {
  permissions?: {
    creatives: boolean;
    sales: boolean;
    affiliates: boolean;
    revenue: boolean;
    users: boolean;
    'business-managers': boolean;
    subscriptions: boolean;
  };
}

export interface UserDetailModalProps {
  user: UserWithPermissions | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: () => void;
  currentUserRole?: string | null;
  onUserUpdated?: () => void;
  onUpdate?: () => void;
}
