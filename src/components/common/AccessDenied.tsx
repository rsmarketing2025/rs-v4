import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldOff, ArrowLeft, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showContactAdmin?: boolean;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = "Acesso Negado",
  message = "Você não tem permissão para acessar esta página.",
  showBackButton = true,
  showContactAdmin = true
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="bg-slate-900 border-slate-700 max-w-md w-full">
        <CardContent className="p-6 text-center">
          <div className="mb-6">
            <ShieldOff className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
              {title}
            </h1>
            <p className="text-slate-300 text-sm md:text-base">
              {message}
            </p>
          </div>

          <div className="space-y-3">
            {showBackButton && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleGoBack}
                  variant="outline" 
                  className="flex-1 border-slate-600 text-slate-100 hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleGoHome}
                  className="flex-1"
                >
                  Início
                </Button>
              </div>
            )}

            {showContactAdmin && (
              <div className="pt-3 border-t border-slate-700">
                <p className="text-slate-400 text-xs mb-2">
                  Precisa de acesso? Entre em contato com um administrador.
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                  onClick={() => window.location.href = 'mailto:admin@empresa.com'}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contatar Admin
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};