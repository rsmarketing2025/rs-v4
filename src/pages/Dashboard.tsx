
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { CreativesTab } from "@/components/dashboard/CreativesTab";
import { SalesTab } from "@/components/dashboard/SalesTab";
import { AffiliatesTab } from "@/components/dashboard/AffiliatesTab";
import { UsersTab } from "@/components/dashboard/UsersTab";
import { useAuth } from "@/hooks/useAuth";
import { BMTab } from "@/components/dashboard/BMTab";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('creatives');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
    to: new Date(),
  })
  const { isAdmin } = useAuth();

  const renderTabContent = () => {
    if (activeTab === 'users' && !isAdmin) {
      return (
        <div className="text-center py-8">
          <p className="text-slate-400">Você não tem permissão para acessar esta área.</p>
        </div>
      );
    }

    // Create a safe date range object with both from and to dates
    const safeDateRange = dateRange?.from && dateRange?.to ? {
      from: dateRange.from,
      to: dateRange.to
    } : {
      from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
      to: new Date()
    };

    switch (activeTab) {
      case 'creatives':
        return <CreativesTab dateRange={safeDateRange} />;
      case 'sales':
        return <SalesTab dateRange={safeDateRange} />;
      case 'affiliates':
        return <AffiliatesTab dateRange={safeDateRange} />;
      case 'users':
        return <UsersTab />;
      case 'bm':
        return <BMTab />;
      default:
        return <CreativesTab dateRange={safeDateRange} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="flex items-center justify-between p-4 md:p-8">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !dateRange?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  `${format(dateRange.from, "dd MMM yyyy")} - ${format(dateRange.to, "dd MMM yyyy")}`
                ) : (
                  format(dateRange.from, "dd MMM yyyy")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              disabled={{ before: new Date('2024-01-01') }}
              numberOfMonths={2}
              pagedNavigation
            />
          </PopoverContent>
        </Popover>
      </header>
      
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'creatives' ? 'default' : 'outline'}
              onClick={() => setActiveTab('creatives')}
              className={activeTab === 'creatives' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
            >
              Criativos
            </Button>
            <Button
              variant={activeTab === 'sales' ? 'default' : 'outline'}
              onClick={() => setActiveTab('sales')}
              className={activeTab === 'sales' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
            >
              Vendas
            </Button>
            <Button
              variant={activeTab === 'affiliates' ? 'default' : 'outline'}
              onClick={() => setActiveTab('affiliates')}
              className={activeTab === 'affiliates' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
            >
              Afiliados
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant={activeTab === 'users' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('users')}
                  className={activeTab === 'users' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
                >
                  Usuários
                </Button>
                <Button
                  variant={activeTab === 'bm' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('bm')}
                  className={activeTab === 'bm' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
                >
                  Business Managers
                </Button>
              </>
            )}
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}

const SidebarTrigger = () => {
  return null;
}
