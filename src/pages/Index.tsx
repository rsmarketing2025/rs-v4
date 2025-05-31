
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Premium Analytics Dashboard
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
            Gerencie e analise o desempenho dos seus criativos, vendas e afiliados com insights avançados e relatórios em tempo real.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/dashboard')}
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            Acessar Dashboard
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Eye className="h-8 w-8 text-blue-400" />
                <CardTitle className="text-white">Análise de Criativos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Monitore o desempenho dos seus criativos com métricas detalhadas de CTR, Hook Rate, Body Rate e muito mais.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-green-400" />
                <CardTitle className="text-white">Gestão de Vendas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Acompanhe todas as vendas, métodos de pagamento, status dos pedidos e receita em tempo real.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-purple-400" />
                <CardTitle className="text-white">Rede de Afiliados</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Gerencie sua rede de afiliados com relatórios de performance, comissões e taxas de conversão.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Preview */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Dados em Tempo Real</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl font-bold text-blue-400 mb-2">20+</div>
              <div className="text-slate-300">Criativos Ativos</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl font-bold text-green-400 mb-2">R$ 128K</div>
              <div className="text-slate-300">Receita Mensal</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl font-bold text-purple-400 mb-2">5</div>
              <div className="text-slate-300">Afiliados Ativos</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl font-bold text-orange-400 mb-2">3.02x</div>
              <div className="text-slate-300">ROAS Médio</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
