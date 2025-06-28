
import React from 'react';
import { ConfigTabBase } from './ConfigTabBase';
import { Package } from 'lucide-react';

export const OfferTab: React.FC = () => {
  return (
    <ConfigTabBase
      tabName="offer"
      title="Oferta"
      description="Configure materiais e instruções para criação de ofertas"
      icon={Package}
    />
  );
};
