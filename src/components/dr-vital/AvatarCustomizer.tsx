// =====================================================
// AVATAR CUSTOMIZER COMPONENT
// =====================================================
// Customização do avatar do Dr. Vital
// Requirements: 4.5, 4.6
// =====================================================

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  Shirt, 
  Sparkles, 
  Image,
  Lock,
  Check,
  Save,
} from 'lucide-react';
import { DrVitalAvatar } from './DrVitalAvatar';
import type { AvatarCustomization, AvatarItem } from '@/types/dr-vital-revolution';

// =====================================================
// AVAILABLE ITEMS
// =====================================================

const AVAILABLE_ITEMS: AvatarItem[] = [
  // Outfits
  { id: 'default', name: 'Jaleco Clássico', type: 'outfit', previewUrl: '/avatars/outfit-default.png' },
  { id: 'casual', name: 'Casual', type: 'outfit', previewUrl: '/avatars/outfit-casual.png', unlockRequirement: { type: 'level', value: 3 } },
  { id: 'athlete', name: 'Atleta', type: 'outfit', previewUrl: '/avatars/outfit-athlete.png', unlockRequirement: { type: 'achievement', value: 'workouts_100' } },
  { id: 'chef', name: 'Chef', type: 'outfit', previewUrl: '/avatars/outfit-chef.png', unlockRequirement: { type: 'achievement', value: 'meals_200' } },
  { id: 'warrior', name: 'Guerreiro', type: 'outfit', previewUrl: '/avatars/outfit-warrior.png', unlockRequirement: { type: 'level', value: 5 } },
  { id: 'legend', name: 'Lendário', type: 'outfit', previewUrl: '/avatars/outfit-legend.png', unlockRequirement: { type: 'level', value: 10 } },
  
  // Accessories
  { id: 'stethoscope', name: 'Estetoscópio', type: 'accessory', previewUrl: '/avatars/acc-stethoscope.png' },
  { id: 'glasses', name: 'Óculos', type: 'accessory', previewUrl: '/avatars/acc-glasses.png', unlockRequirement: { type: 'streak', value: 7 } },
  { id: 'medal', name: 'Medalha', type: 'accessory', previewUrl: '/avatars/acc-medal.png', unlockRequirement: { type: 'achievement', value: 'streak_30' } },
  { id: 'crown', name: 'Coroa', type: 'accessory', previewUrl: '/avatars/acc-crown.png', unlockRequirement: { type: 'streak', value: 100 } },
  
  // Backgrounds
  { id: 'clinic', name: 'Clínica', type: 'background', previewUrl: '/avatars/bg-clinic.png' },
  { id: 'nature', name: 'Natureza', type: 'background', previewUrl: '/avatars/bg-nature.png', unlockRequirement: { type: 'level', value: 2 } },
  { id: 'gym', name: 'Academia', type: 'background', previewUrl: '/avatars/bg-gym.png', unlockRequirement: { type: 'achievement', value: 'workouts_20' } },
  { id: 'kitchen', name: 'Cozinha', type: 'background', previewUrl: '/avatars/bg-kitchen.png', unlockRequirement: { type: 'achievement', value: 'meals_50' } },
  { id: 'space', name: 'Espaço', type: 'background', previewUrl: '/avatars/bg-space.png', unlockRequirement: { type: 'level', value: 8 } },
];

// =====================================================
// ITEM CARD
// =====================================================

interface ItemCardProps {
  item: AvatarItem;
  isUnlocked: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

function ItemCard({ item, isUnlocked, isSelected, onSelect }: ItemCardProps) {
  return (
    <button
      onClick={isUnlocked ? onSelect : undefined}
      disabled={!isUnlocked}
      className={cn(
        'relative p-3 rounded-lg border-2 transition-all',
        isUnlocked 
          ? 'cursor-pointer hover:border-primary' 
          : 'cursor-not-allowed opacity-50',
        isSelected 
          ? 'border-primary bg-primary/10' 
          : 'border-border bg-card'
      )}
    >
      {/* Preview */}
      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-2">
        {item.type === 'outfit' && <Shirt className="w-8 h-8 text-muted-foreground" />}
        {item.type === 'accessory' && <Sparkles className="w-8 h-8 text-muted-foreground" />}
        {item.type === 'background' && <Image className="w-8 h-8 text-muted-foreground" />}
      </div>

      {/* Name */}
      <p className="text-xs font-medium truncate">{item.name}</p>

      {/* Lock/Selected indicator */}
      {!isUnlocked && (
        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
          <Lock className="w-3 h-3 text-muted-foreground" />
        </div>
      )}
      {isSelected && isUnlocked && (
        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}

      {/* Unlock requirement */}
      {!isUnlocked && item.unlockRequirement && (
        <p className="text-[10px] text-muted-foreground mt-1">
          {item.unlockRequirement.type === 'level' && `Nível ${item.unlockRequirement.value}`}
          {item.unlockRequirement.type === 'streak' && `${item.unlockRequirement.value} dias streak`}
          {item.unlockRequirement.type === 'achievement' && 'Conquista'}
        </p>
      )}
    </button>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

interface AvatarCustomizerProps {
  currentCustomization: AvatarCustomization;
  onSave: (customization: Partial<AvatarCustomization>) => void;
  healthScore?: number;
  className?: string;
}

export function AvatarCustomizer({
  currentCustomization,
  onSave,
  healthScore,
  className,
}: AvatarCustomizerProps) {
  const [selectedOutfit, setSelectedOutfit] = useState(currentCustomization.currentOutfit);
  const [selectedAccessory, setSelectedAccessory] = useState(currentCustomization.currentAccessory);
  const [selectedBackground, setSelectedBackground] = useState(currentCustomization.currentBackground);
  const [activeTab, setActiveTab] = useState<'outfit' | 'accessory' | 'background'>('outfit');

  const unlockedItems = new Set(currentCustomization.unlockedItems);

  // Filter items by type
  const outfits = AVAILABLE_ITEMS.filter(i => i.type === 'outfit');
  const accessories = AVAILABLE_ITEMS.filter(i => i.type === 'accessory');
  const backgrounds = AVAILABLE_ITEMS.filter(i => i.type === 'background');

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    return selectedOutfit !== currentCustomization.currentOutfit ||
           selectedAccessory !== currentCustomization.currentAccessory ||
           selectedBackground !== currentCustomization.currentBackground;
  }, [selectedOutfit, selectedAccessory, selectedBackground, currentCustomization]);

  const handleSave = () => {
    onSave({
      currentOutfit: selectedOutfit,
      currentAccessory: selectedAccessory,
      currentBackground: selectedBackground,
    });
  };

  const handleReset = () => {
    setSelectedOutfit(currentCustomization.currentOutfit);
    setSelectedAccessory(currentCustomization.currentAccessory);
    setSelectedBackground(currentCustomization.currentBackground);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Personalizar Avatar
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Preview */}
        <div className="flex justify-center py-4">
          <DrVitalAvatar
            healthScore={healthScore}
            size="lg"
            state="idle"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="outfit" className="flex items-center gap-1">
              <Shirt className="w-4 h-4" />
              <span className="hidden sm:inline">Roupa</span>
            </TabsTrigger>
            <TabsTrigger value="accessory" className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Acessório</span>
            </TabsTrigger>
            <TabsTrigger value="background" className="flex items-center gap-1">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Fundo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="outfit" className="mt-4">
            <div className="grid grid-cols-3 gap-3">
              {outfits.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isUnlocked={unlockedItems.has(item.id)}
                  isSelected={selectedOutfit === item.id}
                  onSelect={() => setSelectedOutfit(item.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="accessory" className="mt-4">
            <div className="grid grid-cols-3 gap-3">
              {/* None option */}
              <button
                onClick={() => setSelectedAccessory(undefined)}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all cursor-pointer hover:border-primary',
                  !selectedAccessory 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card'
                )}
              >
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-2">
                  <span className="text-2xl">∅</span>
                </div>
                <p className="text-xs font-medium">Nenhum</p>
              </button>
              
              {accessories.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isUnlocked={unlockedItems.has(item.id)}
                  isSelected={selectedAccessory === item.id}
                  onSelect={() => setSelectedAccessory(item.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="background" className="mt-4">
            <div className="grid grid-cols-3 gap-3">
              {backgrounds.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isUnlocked={unlockedItems.has(item.id)}
                  isSelected={selectedBackground === item.id}
                  onSelect={() => setSelectedBackground(item.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        {hasChanges && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            {unlockedItems.size} de {AVAILABLE_ITEMS.length} itens desbloqueados
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default AvatarCustomizer;
