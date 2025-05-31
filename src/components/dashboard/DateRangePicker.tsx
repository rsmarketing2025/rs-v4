
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const presetRanges = [
    {
      label: "Últimos 7 dias",
      range: {
        from: subDays(new Date(), 6),
        to: new Date()
      }
    },
    {
      label: "Últimos 30 dias",
      range: {
        from: subDays(new Date(), 29),
        to: new Date()
      }
    },
    {
      label: "Este mês",
      range: {
        from: startOfMonth(new Date()),
        to: new Date()
      }
    },
    {
      label: "Mês passado",
      range: {
        from: startOfMonth(subMonths(new Date(), 1)),
        to: endOfMonth(subMonths(new Date(), 1))
      }
    }
  ];

  const handlePresetSelect = (preset: { from: Date; to: Date }) => {
    onDateRangeChange(preset);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700/50 hover:text-white",
            !dateRange && "text-slate-400"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
              </>
            ) : (
              format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
            )
          ) : (
            <span>Selecionar período</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600" align="start">
        <div className="flex">
          {/* Preset options */}
          <div className="p-3 border-r border-slate-600">
            <p className="text-sm font-medium text-slate-200 mb-2">Períodos</p>
            <div className="space-y-1">
              {presetRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-white"
                  onClick={() => handlePresetSelect(preset.range)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Calendar */}
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={(range: any) => {
              if (range?.from && range?.to) {
                onDateRangeChange({ from: range.from, to: range.to });
                setIsOpen(false);
              }
            }}
            numberOfMonths={2}
            className="bg-slate-800 text-slate-200"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
