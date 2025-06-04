
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { BMForm } from './bm/BMForm';
import { BMList } from './bm/BMList';

export const BMTab: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBMCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciamento de Business Managers</h2>
          <p className="text-slate-400">Gerencie Business Managers e suas contas de anúncio do Facebook</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Business Manager
        </Button>
      </div>

      {/* Create BM Form */}
      {showCreateForm && (
        <BMForm 
          onClose={() => setShowCreateForm(false)}
          onBMCreated={handleBMCreated}
        />
      )}

      {/* BM List */}
      <BMList refreshTrigger={refreshTrigger} />
    </div>
  );
};
