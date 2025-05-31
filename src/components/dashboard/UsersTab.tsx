
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { UserForm } from './users/UserForm';
import { UserList } from './users/UserList';

export const UsersTab: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUserCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciamento de Usuários</h2>
          <p className="text-slate-400">Adicione e gerencie usuários do sistema com permissões personalizadas</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <UserForm 
          onClose={() => setShowCreateForm(false)}
          onUserCreated={handleUserCreated}
        />
      )}

      {/* Users List */}
      <UserList refreshTrigger={refreshTrigger} />
    </div>
  );
};
