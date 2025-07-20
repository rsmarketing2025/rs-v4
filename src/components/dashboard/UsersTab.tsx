
import React, { useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserList } from "./users/UserList";
import { PermissionWrapper } from "@/components/common/PermissionWrapper";
import { usePermissions } from "@/hooks/usePermissions";

export const UsersTab: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { canManageUsers } = usePermissions();
  
  const handleUserUpdated = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const currentUserRole = canManageUsers() ? 'admin' : 'user';

  return (
    <PermissionWrapper requirePage="users">
      <div className="space-y-4 md:space-y-6">
        <div className="px-1">
          <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">Gerenciamento de Usuários</h2>
          <p className="text-gray-400 text-sm md:text-base">
            Gerencie usuários e suas permissões de acesso
          </p>
        </div>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-3 md:p-6">
            <UserList 
              refreshTrigger={refreshTrigger}
              currentUserRole={currentUserRole}
              onUserUpdated={handleUserUpdated}
            />
          </CardContent>
        </Card>
      </div>
    </PermissionWrapper>
  );
};
