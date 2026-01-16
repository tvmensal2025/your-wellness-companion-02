import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Calendar, Heart, User, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NutritionObjective } from '@/utils/macro-calculator';

/**
 * RecipeCard - Configurações de cardápio do Chef Kitchen
 * 
 * Agrupa: objetivo nutricional, duração, metas, macros e preferências/restrições.
 */

const OBJECTIVES = [
  { value: NutritionObjective.LOSE, label: 'Emagrecer', emoji: '🔥', color: 'from-red-500 to-orange-500' },
  { value: NutritionObjective.MAINTAIN, label: 'Manter', emoji: '⚖️', color: 'from-blue-500 to-cyan-500' },
  { value: NutritionObjective.GAIN, label: 'Ganhar', emoji: '💪', color: 'from-green-500 to-emerald-500' },
  { value: NutritionObjective.LEAN_MASS, label: 'Hipertrofia', emoji: '🏋️', color: 'from-purple-500 to-violet-500' },
];

export interface NutritionalGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface RecipeCardProps {
  selectedObjective: NutritionObjective;
  onSelectObjective: (obj: NutritionObjective) => void;
  selectedDays: number;
  onSelectDays: (days: number) => void;
  nutritionalGoals: NutritionalGoals;
  userWeight?: number;
  hasUserData: boolean;
  showPreferences: boolean;
  onTogglePreferences: () => void;
  localPreferences: string[];
  localRestrictions: string[];
  onAddPreference: () => Promise<void>;
  onRemovePreference: (food: string) => Promise<void>;
  onAddRestriction: () => Promise<void>;
  onRemoveRestriction: (food: string) => Promise<void>;
  newPreference: string;
  onNewPreferenceChange: (value: string) => void;
  newRestriction: string;
  onNewRestrictionChange: (value: string) => void;
  getObjectiveLabel: () => string;
  getObjectiveColor: () => string;
  className?: string;
}

/** Card de input para preferências ou restrições */
const FoodInputCard: React.FC<{
  type: 'preference' | 'restriction';
  items: string[];
  newItem: string;
  onNewItemChange: (value: string) => void;
  onAdd: () => Promise<void>;
  onRemove: (food: string) => Promise<void>;
}> = ({ type, items, newItem, onNewItemChange, onAdd, onRemove }) => {
  const isPref = type === 'preference';
  
  return (
    <div className={cn("rounded-xl p-3 space-y-2 border", isPref ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20")}>
      <div className="flex items-center gap-2">
        <span className="text-base">{isPref ? '❤️' : '🚫'}</span>
        <span className={cn("text-xs font-semibold", isPref ? "text-emerald-500" : "text-red-500")}>{isPref ? 'Preferidos' : 'Restrições'}</span>
      </div>
      <div className="flex gap-1.5">
        <Input 
          placeholder={isPref ? "frango..." : "lactose..."} 
          value={newItem} 
          onChange={(e) => onNewItemChange(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && onAdd()} 
          className={cn("h-8 text-xs bg-background/50", isPref ? "border-emerald-500/30 focus:border-emerald-500" : "border-red-500/30 focus:border-red-500")} 
        />
        <Button onClick={onAdd} size="sm" className={cn("h-8 w-8 p-0", isPref ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600")} disabled={!newItem.trim()}>
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {items.map(f => (
            <Badge key={f} className={cn("text-[10px] gap-0.5 py-0.5 border", isPref ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30" : "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/30")}>
              {f}
              <button onClick={() => onRemove(f)} className={cn("ml-0.5", isPref ? "hover:text-emerald-700" : "hover:text-red-700")}><X className="w-2.5 h-2.5" /></button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export const RecipeCard: React.FC<RecipeCardProps> = ({
  selectedObjective, onSelectObjective, selectedDays, onSelectDays,
  nutritionalGoals, userWeight, hasUserData, showPreferences, onTogglePreferences,
  localPreferences, localRestrictions, onAddPreference, onRemovePreference,
  onAddRestriction, onRemoveRestriction, newPreference, onNewPreferenceChange,
  newRestriction, onNewRestrictionChange, getObjectiveLabel, getObjectiveColor, className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* OBJETIVO */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-foreground">Objetivo</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {OBJECTIVES.map((obj) => (
            <motion.button
              key={obj.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectObjective(obj.value)}
              className={cn(
                "p-3 rounded-xl text-center transition-all border",
                selectedObjective === obj.value
                  ? `bg-gradient-to-br ${obj.color} text-white border-transparent shadow-lg`
                  : "bg-card border-border hover:border-amber-500/50"
              )}
            >
              <span className="text-xl block">{obj.emoji}</span>
              <span className="text-[11px] font-medium block mt-1">{obj.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* DURAÇÃO + META */}
      <div className="flex gap-3">
        <div className="flex-1 bg-muted/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Duração</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 3, 7].map((d) => (
              <button
                key={d}
                onClick={() => onSelectDays(d)}
                className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                  selectedDays === d ? "bg-amber-500 text-white" : "bg-background text-foreground hover:bg-muted"
                )}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        <div className={cn("flex-1 rounded-xl p-3 bg-gradient-to-br", getObjectiveColor())}>
          <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium">
            <User className="w-3.5 h-3.5" /><span>Sua meta</span>
          </div>
          <div className="text-white text-xl font-bold mt-0.5">{nutritionalGoals.calories}</div>
          <div className="text-white/70 text-xs">
            kcal • {getObjectiveLabel()}{userWeight && <span className="ml-1">({userWeight}kg)</span>}
          </div>
        </div>
      </div>

      {/* MACROS */}
      {hasUserData && (
        <div className="flex justify-between text-xs text-muted-foreground bg-muted/30 rounded-lg px-4 py-3">
          <span>🥩 {nutritionalGoals.protein}g prot</span>
          <span>🍚 {nutritionalGoals.carbs}g carb</span>
          <span>🥑 {nutritionalGoals.fat}g gord</span>
          <span>🌾 {nutritionalGoals.fiber}g fibra</span>
        </div>
      )}

      {/* PREFERÊNCIAS E RESTRIÇÕES */}
      <div className="space-y-3">
        <button onClick={onTogglePreferences} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-foreground">Preferências & Restrições</span>
            {(localPreferences.length + localRestrictions.length) > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5">{localPreferences.length + localRestrictions.length}</Badge>
            )}
          </div>
          {showPreferences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <AnimatePresence>
          {showPreferences && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-2 gap-3">
                <FoodInputCard type="preference" items={localPreferences} newItem={newPreference} onNewItemChange={onNewPreferenceChange} onAdd={onAddPreference} onRemove={onRemovePreference} />
                <FoodInputCard type="restriction" items={localRestrictions} newItem={newRestriction} onNewItemChange={onNewRestrictionChange} onAdd={onAddRestriction} onRemove={onRemoveRestriction} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecipeCard;
