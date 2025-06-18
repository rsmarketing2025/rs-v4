
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Dashboard Manager
            </h1>
            <p className="text-lg text-muted-foreground">
              Sistema com tema herdado do rs-dashboard-manager
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tema Implementado</CardTitle>
              <CardDescription>
                Paleta neutra HSL com suporte completo para dark/light mode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✅ Fonte Inter carregada via Google Fonts</li>
                <li>✅ Tokens HSL para dark/light theme</li>
                <li>✅ Paleta slate para utilidades diretas</li>
                <li>✅ Border radius e animações configurados</li>
                <li>✅ Container com max-width 1400px</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Página de Teste</CardTitle>
              <CardDescription>
                Demonstração completa de todos os componentes com o tema aplicado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/theme-test">
                <Button className="w-full">
                  Ver Página de Teste do Tema
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App
