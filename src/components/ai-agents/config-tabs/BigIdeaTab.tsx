
import React from 'react';
import { ConfigTabBase } from './ConfigTabBase';
import { Lightbulb } from 'lucide-react';

export const BigIdeaTab: React.FC = () => {
  return (
    <ConfigTabBase
      tabName="big_idea"
      title="Big Idea"
      description="Configure materiais e instruções para desenvolvimento de big ideas"
      icon={Lightbulb}
    />
  );
};
