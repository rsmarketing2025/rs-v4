
import React, { useState } from 'react';
import { MinimalTrainingPanel } from "./training-panel/MinimalTrainingPanel";
import { ExpandedTrainingPanel } from "./training-panel/ExpandedTrainingPanel";

interface AgentTrainingPanelProps {
  className?: string;
  isMinimal?: boolean;
}

export const AgentTrainingPanel: React.FC<AgentTrainingPanelProps> = ({ 
  className, 
  isMinimal = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Full panel mode (not minimal)
  if (!isMinimal) {
    return (
      <ExpandedTrainingPanel 
        className={className}
        isMinimal={false}
      />
    );
  }

  // Minimal mode - show collapsed or expanded based on state
  if (!isExpanded) {
    return (
      <MinimalTrainingPanel 
        className={className}
        onToggleExpanded={toggleExpanded}
      />
    );
  }

  return (
    <ExpandedTrainingPanel 
      className={className}
      onToggleExpanded={toggleExpanded}
      isMinimal={true}
    />
  );
};
