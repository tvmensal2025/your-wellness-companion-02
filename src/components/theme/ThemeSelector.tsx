import React from 'react';
import { motion } from 'framer-motion';
import { Check, Palette, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { THEME_PRESETS, ThemePresetId, useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ThemeSelectorProps {
  variant?: 'grid' | 'inline' | 'compact';
  showLabel?: boolean;
  onSelect?: (presetId: ThemePresetId) => void;
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  variant = 'grid',
  showLabel = true,
  onSelect,
  className,
}) => {
  const { theme, setPreset, currentPreset } = useTheme();

  const handleSelect = async (presetId: ThemePresetId) => {
    await setPreset(presetId);
    onSelect?.(presetId);
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex gap-1.5 flex-wrap", className)}>
        {THEME_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelect(preset.id)}
            className={cn(
              "w-6 h-6 rounded-full transition-all duration-200",
              `bg-gradient-to-br ${preset.gradient}`,
              theme.presetId === preset.id 
                ? "ring-2 ring-offset-2 ring-offset-background ring-white scale-110" 
                : "hover:scale-105 opacity-70 hover:opacity-100"
            )}
            title={preset.name}
          />
        ))}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn("flex gap-2 items-center", className)}>
        {showLabel && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Palette className="w-3 h-3" />
            Tema:
          </span>
        )}
        <div className="flex gap-1">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset.id)}
              className={cn(
                "w-5 h-5 rounded-full transition-all duration-200",
                `bg-gradient-to-br ${preset.gradient}`,
                theme.presetId === preset.id 
                  ? "ring-2 ring-offset-1 ring-offset-background ring-white" 
                  : "hover:scale-110 opacity-60 hover:opacity-100"
              )}
              title={preset.name}
            />
          ))}
        </div>
      </div>
    );
  }

  // Grid variant (default) - para onboarding e configurações
  return (
    <div className={cn("space-y-4", className)}>
      {showLabel && (
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Escolha sua cor favorita</span>
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-3">
        {THEME_PRESETS.map((preset, index) => (
          <motion.button
            key={preset.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleSelect(preset.id)}
            className={cn(
              "relative aspect-square rounded-xl transition-all duration-300",
              `bg-gradient-to-br ${preset.gradient}`,
              "flex items-center justify-center",
              "shadow-lg hover:shadow-xl",
              theme.presetId === preset.id 
                ? "ring-4 ring-white ring-offset-2 ring-offset-background scale-105" 
                : "hover:scale-105 opacity-80 hover:opacity-100"
            )}
          >
            {theme.presetId === preset.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {showLabel && (
        <p className="text-xs text-center text-muted-foreground">
          {currentPreset.name}
        </p>
      )}
    </div>
  );
};

// Modal para seleção de tema (para usar em configurações)
export const ThemeSelectorModal: React.FC<{ trigger?: React.ReactNode }> = ({ trigger }) => {
  const { currentPreset } = useTheme();
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <div className={cn("w-4 h-4 rounded-full bg-gradient-to-br", currentPreset.gradient)} />
            <span className="text-xs">Tema</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Palette className="w-4 h-4" />
            Personalizar Cores
          </DialogTitle>
        </DialogHeader>
        <ThemeSelector onSelect={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSelector;
