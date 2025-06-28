
import React from 'react';
import { ConfigTabBase } from './ConfigTabBase';
import { Target } from 'lucide-react';

export const AdsTab: React.FC = () => {
  return (
    <ConfigTabBase
      tabName="ads"
      title="Anúncios"
      description="Configure materiais e instruções para criação de anúncios"
      icon={Target}
    />
  );
};
