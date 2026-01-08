import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeightData {
  peso_kg: number;
  measurement_date: string;
}

interface WeightChartProps {
  data: WeightData[];
}

export const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  // Se não houver dados, mostrar seta animada
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-muted-foreground text-sm font-medium">
          Registre seu peso para ver sua evolução
        </p>
        <p className="text-muted-foreground/60 text-xs mt-1">
          Acompanhe seu progresso ao longo do tempo
        </p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center text-emerald-600"
          >
            <span className="text-xs font-medium mb-1">Registre seu peso</span>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const formatData = data.map(item => ({
    ...item,
    date: new Date(item.measurement_date).toLocaleDateString('pt-BR'),
    weight: item.peso_kg
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={formatData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="date" 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <YAxis 
          stroke="#9CA3AF"
          fontSize={12}
          domain={['dataMin - 2', 'dataMax + 2']}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            border: 'none', 
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="weight" 
          stroke="#3B82F6" 
          strokeWidth={2}
          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};