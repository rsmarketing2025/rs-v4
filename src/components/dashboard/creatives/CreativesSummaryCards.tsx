
import React from 'react';
import { PermissionWrapper } from "@/components/common/PermissionWrapper";

interface TotalMetrics {
  spent: number;
  views: number;
  sales: number;
  revenue: number;
}

interface CreativesSummaryCardsProps {
  totalMetrics: TotalMetrics;
  avgROI: number;
}

export const CreativesSummaryCards: React.FC<CreativesSummaryCardsProps> = ({
  totalMetrics,
  avgROI
}) => {
  return (
    <PermissionWrapper requirePage="creatives">
      <div className="grid grid-cols-1 gap-4">
        {/* ROI card removed as requested */}
      </div>
    </PermissionWrapper>
  );
};
