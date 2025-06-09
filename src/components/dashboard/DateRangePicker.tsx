import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from "date-fns";
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
  const [showCustom, setShowCustom] = React.useState(false);
  const [tempFromDate, setTempFromDate] = React.useState<Date | undefined>(undefined);

  const predefinedRanges = [
    {
      label: "Hoje",
      range: {
        from: startOfDay(new Date()),
        to: endOfDay(new Date())
      }
    },
    {
      label: "Ontem",
      range: {
        from: startOfDay(subDays(new Date(), 1)),
        to: endOfDay(subDays(new Date(), 1))
      }
    },
    {
      label: "Esta semana",
      range: {
        from: startOfWeek(new Date(), { locale: ptBR, weekStartsOn: 1 }),
        to: endOfWeek(new Date(), { locale: ptBR, weekStartsOn: 1 })
      }
    },
    {
      label: "Este mês",
      range: {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
      }
    },
    {
      label: "Este ano",
      range: {
        from: startOfYear(new Date()),
        to: endOfYear(new Date())
      }
    }
  ];

  const handlePredefinedRange = (range: { from: Date; to: Date }) => {
    onDateRangeChange(range);
    setIsOpen(false);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    if (!tempFromDate) {
      // First click - select start date
      setTempFromDate(selectedDate);
    } else {
      // Second click - select end date and complete the range
      const fromDate = tempFromDate;
      const toDate = selectedDate;
      
      // Ensure the range is in correct order
      const finalRange = {
        from: fromDate <= toDate ? fromDate : toDate,
        to: fromDate <= toDate ? toDate : fromDate
      };
      
      onDateRangeChange(finalRange);
      setTempFromDate(undefined);
      setIsOpen(false);
      setShowCustom(false);
    }
  };

  const resetCustomSelection = () => {
    setTempFromDate(undefined);
    setShowCustom(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[300px] justify-start text-left font-normal bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-800",
            !dateRange && "text-muted-foreground"
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
      <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700" align="start">
        {!showCustom ? (
          <div className="p-4 space-y-2">
            {predefinedRanges.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => handlePredefinedRange(item.range)}
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => setShowCustom(true)}
            >
              Personalizado
            </Button>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-sm font-medium text-white">Período personalizado</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {!tempFromDate 
                    ? "Clique para selecionar a data inicial" 
                    : "Clique para selecionar a data final"
                  }
                </p>
                {tempFromDate && (
                  <p className="text-xs text-blue-400 mt-1">
                    Início: {format(tempFromDate, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {tempFromDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTempFromDate(undefined)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Resetar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetCustomSelection}
                  className="text-slate-400 hover:text-white"
                >
                  Voltar
                </Button>
              </div>
            </div>
            <Calendar
              initialFocus
              mode="single"
              defaultMonth={dateRange?.from}
              selected={tempFromDate}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              className="bg-slate-900 text-white pointer-events-auto"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
