import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserWithPermissions } from './types';

export interface UserDetailModalProps {
  user?: UserWithPermissions;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ 
  user, 
  isOpen, 
  onClose,
  onUserUpdate
}) => {
  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right text-slate-300">
              Nome
            </label>
            <Input
              type="text"
              id="name"
              value={user.full_name || 'N/A'}
              className="col-span-3 bg-neutral-700 border-neutral-700 text-slate-300"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="email" className="text-right text-slate-300">
              Email
            </label>
            <Input
              type="email"
              id="email"
              value={user.email || 'N/A'}
              className="col-span-3 bg-neutral-700 border-neutral-700 text-slate-300"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-right text-slate-300">
              Username
            </label>
            <Input
              type="text"
              id="username"
              value={user.username || 'N/A'}
              className="col-span-3 bg-neutral-700 border-neutral-700 text-slate-300"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="role" className="text-right text-slate-300">
              Função
            </label>
            <Input
              type="text"
              id="role"
              value={user.role || 'N/A'}
              className="col-span-3 bg-neutral-700 border-neutral-700 text-slate-300"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-slate-300">
              Permissões
            </label>
            <div className="col-span-3 space-y-2">
              {user.user_page_permissions.map((permission) => (
                <div key={permission.page} className="flex items-center space-x-2">
                  <Badge className={permission.can_access ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}>
                    {permission.page}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
