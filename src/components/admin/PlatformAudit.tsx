import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';

export function PlatformAudit() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Auditoria da Plataforma
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Sistema de Autenticação</span>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600">
              Ativo
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Banco de Dados</span>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600">
              Conectado
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Edge Functions</span>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600">
              Operacional
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Configurações Pendentes</span>
            </div>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600">
              4 itens
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PlatformAudit;
