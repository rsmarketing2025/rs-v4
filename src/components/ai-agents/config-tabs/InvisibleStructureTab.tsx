
import React from 'react';
import { ConfigTabBase } from './ConfigTabBase';
import { Eye } from 'lucide-react';

export const InvisibleStructureTab: React.FC = () => {
  return (
    <ConfigTabBase
      tabName="invisible_structure"
      title="Estrutura Invisível"
      description="Configure materiais e instruções para estrutura invisível de conteúdo"
      icon={Eye}
    />
  );
};
