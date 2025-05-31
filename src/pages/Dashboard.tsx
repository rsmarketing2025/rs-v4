
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye, 
  MousePointer, 
  Target,
  Download,
  Filter,
  Calendar,
  BarChart3
} from "lucide-react";
import { CreativesTab } from "@/components/dashboard/CreativesTab";
import { SalesTab } from "@/components/dashboard/SalesTab";
import { AffiliatesTab } from "@/components/dashboard/AffiliatesTab";
import { KPICard } from "@/components/dashboard/KPICard";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("creatives");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  // Mock KPI data - will be replaced with real data from Supabase
  const kpis = {
    totalSpent: 42580.50,
    totalRevenue: 128450.75,
    totalOrders: 456,
    roas: 3.02,
    conversionRate: 4.8,
    avgOrderValue: 281.69
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Premium Analytics Dashboard
            </h1>
            <p className="text-slate-400 text-lg">
              Comprehensive insights for your creative campaigns
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <DateRangePicker 
              dateRange={dateRange} 
              onDateRangeChange={setDateRange} 
            />
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <KPICard
            title="Total Spent"
            value={`R$ ${kpis.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change="+12.5%"
            icon={DollarSign}
            trend="up"
          />
          <KPICard
            title="Total Revenue"
            value={`R$ ${kpis.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change="+18.2%"
            icon={TrendingUp}
            trend="up"
          />
          <KPICard
            title="Total Orders"
            value={kpis.totalOrders.toLocaleString()}
            change="+15.8%"
            icon={Target}
            trend="up"
          />
          <KPICard
            title="ROAS"
            value={`${kpis.roas.toFixed(2)}x`}
            change="+0.3x"
            icon={BarChart3}
            trend="up"
          />
          <KPICard
            title="Conversion Rate"
            value={`${kpis.conversionRate}%`}
            change="+0.8%"
            icon={MousePointer}
            trend="up"
          />
          <KPICard
            title="AOV"
            value={`R$ ${kpis.avgOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change="+5.2%"
            icon={DollarSign}
            trend="up"
          />
        </div>

        {/* Main Content Tabs */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
                <TabsTrigger value="creatives" className="data-[state=active]:bg-slate-700">
                  <Eye className="w-4 h-4 mr-2" />
                  Creatives
                </TabsTrigger>
                <TabsTrigger value="sales" className="data-[state=active]:bg-slate-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Sales
                </TabsTrigger>
                <TabsTrigger value="affiliates" className="data-[state=active]:bg-slate-700">
                  <Users className="w-4 h-4 mr-2" />
                  Affiliates
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="creatives" className="mt-0">
                <CreativesTab dateRange={dateRange} />
              </TabsContent>
              
              <TabsContent value="sales" className="mt-0">
                <SalesTab dateRange={dateRange} />
              </TabsContent>
              
              <TabsContent value="affiliates" className="mt-0">
                <AffiliatesTab dateRange={dateRange} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
