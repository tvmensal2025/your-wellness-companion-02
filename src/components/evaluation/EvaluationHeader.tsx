import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Plus } from 'lucide-react';

interface UserProfile {
  id?: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

interface EvaluationHeaderProps {
  users: UserProfile[];
  selectedUser: UserProfile | null;
  onUserSelect: (user: UserProfile) => void;
  timeRange: 'week' | 'month' | 'quarter';
  onTimeRangeChange: (range: 'week' | 'month' | 'quarter') => void;
  onNewEvaluation: () => void;
  loading?: boolean;
}

export const EvaluationHeader: React.FC<EvaluationHeaderProps> = ({
  users,
  selectedUser,
  onUserSelect,
  timeRange,
  onTimeRangeChange,
  onNewEvaluation,
  loading = false
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Avaliação Profissional
          </CardTitle>
          <Button onClick={onNewEvaluation} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Avaliação
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seleção de Usuário */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecionar Usuário</label>
            <Select
              value={selectedUser?.user_id || selectedUser?.id || ''}
              onValueChange={(value) => {
                const user = users.find(u => u.user_id === value || u.id === value);
                if (user) onUserSelect(user);
              }}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um usuário..." />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.user_id || user.id} value={user.user_id || user.id || ''}>
                    {user.full_name || 'Sem nome'} ({user.email || 'Sem email'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Período */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Período
            </label>
            <Select
              value={timeRange}
              onValueChange={(value: any) => onTimeRangeChange(value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mês</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Badge de Status */}
        {selectedUser && (
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="outline">
              Usuário selecionado: {selectedUser.full_name || 'Sem nome'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
