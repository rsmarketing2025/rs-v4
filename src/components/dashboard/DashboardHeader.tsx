
import React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";

interface DashboardHeaderProps {
  title: string;
  description: string;
  showDatePicker?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  description,
  showDatePicker = false,
  dateRange,
  onDateRangeChange,
}) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-white dark:text-white light:text-slate-900" />
        <div>
          <h1 className="text-5xl font-bold text-white dark:text-white light:text-slate-900 mb-2">
            {title}
          </h1>
          <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-lg">
            {description}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {showDatePicker && dateRange && onDateRangeChange && (
          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={onDateRangeChange} 
          />
        )}
        <ThemeToggle />
      </div>
    </div>
  );
};
