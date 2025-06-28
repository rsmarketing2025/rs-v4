
import React from 'react';
import { ConfigTabBase } from './ConfigTabBase';
import { BookOpen } from 'lucide-react';

export const StorytellingTab: React.FC = () => {
  return (
    <ConfigTabBase
      tabName="storytelling"
      title="Storytelling"
      description="Configure materiais e instruções para storytelling"
      icon={BookOpen}
    />
  );
};
