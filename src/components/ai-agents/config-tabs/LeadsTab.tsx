
import React from 'react';
import { ConfigTabBase } from './ConfigTabBase';
import { Users } from 'lucide-react';

export const LeadsTab: React.FC = () => {
  return (
    <ConfigTabBase
      tabName="leads"
      title="Leads"
      description="Configure materiais e instruções para geração de leads"
      icon={Users}
    />
  );
};
