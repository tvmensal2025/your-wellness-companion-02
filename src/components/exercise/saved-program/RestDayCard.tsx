// ============================================
// 🌙 REST DAY CARD
// Card para dia de descanso
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Moon } from 'lucide-react';
import type { DayPlan } from './hooks/useSavedProgramLogic';

interface RestDayCardProps {
  day: DayPlan;
}

export const RestDayCard: React.FC<RestDayCardProps> = ({ day }) => (
  <Card className="border-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10">
    <CardContent className="p-5 sm:p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
      >
        <Moon className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
      </motion.div>
      <h3 className="text-lg sm:text-2xl font-bold mb-1.5 sm:mb-2">{day.title}</h3>
      <p className="text-xs sm:text-base text-muted-foreground max-w-md mx-auto">
        Seu corpo precisa de descanso para se recuperar e ficar mais forte. 
        Aproveite para alongar, hidratar e dormir bem! 💤
      </p>
      <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 flex-wrap">
        <Badge variant="secondary" className="text-xs sm:text-sm px-2.5 sm:px-4 py-1 sm:py-2">
          🧘 Alongamentos
        </Badge>
        <Badge variant="secondary" className="text-xs sm:text-sm px-2.5 sm:px-4 py-1 sm:py-2">
          💧 Hidratação
        </Badge>
      </div>
    </CardContent>
  </Card>
);
