
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  AlertCircle, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  DollarSign,
  Activity
} from "lucide-react";

export const ThemeTest = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl p-8">
        {/* Header com toggle de tema */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard Manager - Teste de Tema
            </h1>
            <p className="text-muted-foreground">
              Demonstração do sistema de tema herdado do projeto rs-dashboard-manager
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Grid de componentes de teste */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1 - KPI */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Assinaturas Ativas
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,350</div>
              <p className="text-xs text-muted-foreground">
                +12.5% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          {/* Card 2 - Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +8.3% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          {/* Card 3 - Growth */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Crescimento
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.8%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seção de botões */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Componentes de Interface</CardTitle>
            <CardDescription>
              Demonstração dos principais componentes com o tema aplicado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Botões */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Botões</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Primário</Button>
                <Button variant="secondary">Secundário</Button>
                <Button variant="destructive">Destrutivo</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Inputs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Nome completo" />
                <Input placeholder="Email" type="email" />
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            {/* Status Icons */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Status</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Ativo</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Atenção</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Processando</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Todos os componentes utilizam as variáveis CSS HSL para suporte automático aos temas dark/light.
            </p>
          </CardFooter>
        </Card>

        {/* Informações sobre o tema */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Tema</CardTitle>
            <CardDescription>
              Detalhes da implementação do sistema de tema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Características:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Fonte Inter (400/500/600/700)</li>
                  <li>• Paleta neutra em tokens HSL</li>
                  <li>• Border radius: 0.5rem</li>
                  <li>• Animações suaves</li>
                  <li>• Container máximo: 1400px</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Temas suportados:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dark (padrão)</li>
                  <li>• Light</li>
                  <li>• System (detecta preferência do OS)</li>
                  <li>• Troca dinâmica via toggle</li>
                  <li>• Persistência no localStorage</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
