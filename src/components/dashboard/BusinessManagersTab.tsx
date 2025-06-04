
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { BusinessManagerForm } from './business-managers/BusinessManagerForm';
import { BusinessManagerList } from './business-managers/BusinessManagerList';

export const BusinessManagersTab: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBmCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciamento de Business Managers</h2>
          <p className="text-slate-400">Gerencie seus Business Managers e contas de anúncios do Facebook</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Business Manager
        </Button>
      </div>

      {/* Create Business Manager Form */}
      {showCreateForm && (
        <BusinessManagerForm 
          onClose={() => setShowCreateForm(false)}
          onBmCreated={handleBmCreated}
        />
      )}

      {/* Business Managers List */}
      <BusinessManagerList refreshTrigger={refreshTrigger} />
    </div>
  );
};
