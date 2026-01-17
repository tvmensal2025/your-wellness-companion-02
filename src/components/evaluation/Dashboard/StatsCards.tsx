import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Activity, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardsProps {
  totalClients: number;
  totalEvaluations: number;
  accuracy: number;
  trend: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalClients,
  totalEvaluations,
  accuracy,
  trend
}) => {
  const stats = [
    { icon: Users, label: 'Clientes', value: totalClients, color: 'text-blue-500' },
    { icon: Activity, label: 'Avaliações', value: totalEvaluations, color: 'text-green-500' },
    { icon: Target, label: 'Precisão', value: `${accuracy}%`, color: 'text-purple-500' },
    { icon: TrendingUp, label: 'Crescimento', value: `+${trend}%`, color: 'text-orange-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
