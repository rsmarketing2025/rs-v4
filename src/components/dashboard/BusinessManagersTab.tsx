
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { BusinessManagerForm } from './business-managers/BusinessManagerForm';
import { BusinessManagerList } from './business-managers/BusinessManagerList';

export const BusinessManagersTab: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBusinessManagerCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciamento de Business Managers</h2>
          <p className="text-slate-400">Adicione e gerencie seus Business Managers e contas de anúncio</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)} 
          className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Create Business Manager Form */}
      {showCreateForm && (
        <BusinessManagerForm 
          onClose={() => setShowCreateForm(false)} 
          onBusinessManagerCreated={handleBusinessManagerCreated} 
        />
      )}

      {/* Business Managers List */}
      <BusinessManagerList refreshTrigger={refreshTrigger} />
    </div>
  );
};
