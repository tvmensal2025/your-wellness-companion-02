import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Unlock } from 'lucide-react';
import { liberarTodosPesosOcultos, verificarEstatisticasPesos } from '@/utils/liberarPesosOcultos';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const LiberarPesosButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    visiveis: number;
    ocultos: number;
  } | null>(null);

  const handleLoadStats = async () => {
    try {
      const data = await verificarEstatisticasPesos();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleLiberar = async () => {
    setLoading(true);
    try {
      const count = await liberarTodosPesosOcultos();
      // Recarregar estatísticas após atualização
      await handleLoadStats();
      return count;
    } catch (error) {
      console.error('Erro ao liberar pesos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            onClick={handleLoadStats}
            className="w-full"
          >
            <Unlock className="w-4 h-4 mr-2" />
            Liberar Todos os Pesos Ocultos
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Liberar Todos os Pesos Ocultos</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá definir <strong>show_weight_results = true</strong> para todos os usuários,
              tornando todos os gráficos e progressos de peso visíveis na comunidade.
              {stats && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-2">Estatísticas Atuais:</p>
                  <ul className="text-sm space-y-1">
                    <li>Total de perfis: <strong>{stats.total}</strong></li>
                    <li>Pesos visíveis: <strong className="text-green-600">{stats.visiveis}</strong></li>
                    <li>Pesos ocultos: <strong className="text-orange-600">{stats.ocultos}</strong></li>
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLiberar}
              disabled={loading}
              className="bg-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar e Liberar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

