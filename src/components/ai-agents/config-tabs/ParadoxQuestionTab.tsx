
import React from 'react';
import { ConfigTabBase } from './ConfigTabBase';
import { HelpCircle } from 'lucide-react';

export const ParadoxQuestionTab: React.FC = () => {
  return (
    <ConfigTabBase
      tabName="paradox_question"
      title="Pergunta Paradoxal"
      description="Configure materiais e instruções para perguntas paradoxais"
      icon={HelpCircle}
    />
  );
};
