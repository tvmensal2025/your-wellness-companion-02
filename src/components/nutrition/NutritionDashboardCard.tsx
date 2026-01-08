import React, { useState } from 'react';
import { DailyFoodDiary } from './DailyFoodDiary';
import { QuickMealEntry } from './QuickMealEntry';

export const NutritionDashboardCard: React.FC = () => {
  const [mealEntryOpen, setMealEntryOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'snack' | 'dinner'>('breakfast');

  const handleAddMeal = (mealType: string) => {
    setSelectedMealType(mealType as 'breakfast' | 'lunch' | 'snack' | 'dinner');
    setMealEntryOpen(true);
  };

  return (
    <>
      <DailyFoodDiary 
        onAddMeal={handleAddMeal}
      />
      <QuickMealEntry
        open={mealEntryOpen}
        onOpenChange={setMealEntryOpen}
        mealType={selectedMealType}
      />
    </>
  );
};

export default NutritionDashboardCard;
