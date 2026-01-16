import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

interface DocumentStats {
  totalDocuments: number;
  recentUploads: number;
  criticalAlerts: number;
  upcomingExams: number;
  healthScore: number;
  documentTypes: Record<string, number>;
}

interface DocumentStatsCardsProps {
  stats: DocumentStats;
}

export const DocumentStatsCards: React.FC<DocumentStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader className="pb-1 sm:pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
          <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">Total Docs</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="text-lg sm:text-2xl font-bold">{stats.totalDocuments}</div>
          <p className="text-[10px] sm:text-xs opacity-90">Armazenados</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardHeader className="pb-1 sm:pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
          <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">Score Saúde</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="text-lg sm:text-2xl font-bold">{stats.healthScore}/100</div>
          <p className="text-[10px] sm:text-xs opacity-90">Baseado em exames</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardHeader className="pb-1 sm:pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
          <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">Alertas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="text-lg sm:text-2xl font-bold">{stats.criticalAlerts}</div>
          <p className="text-[10px] sm:text-xs opacity-90">Críticos</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardHeader className="pb-1 sm:pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
          <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">Próximos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="text-lg sm:text-2xl font-bold">{stats.upcomingExams}</div>
          <p className="text-[10px] sm:text-xs opacity-90">Agendados</p>
        </CardContent>
      </Card>
    </div>
  );
};
