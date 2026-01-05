import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GripVertical, Eye, EyeOff, Home, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LayoutPreferences } from '@/hooks/useLayoutPreferences';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface LayoutPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: LayoutPreferences;
  menuItems: MenuItem[];
  onSave: (prefs: Partial<LayoutPreferences>) => Promise<boolean>;
}

export const LayoutPreferencesModal: React.FC<LayoutPreferencesModalProps> = ({
  open,
  onOpenChange,
  preferences,
  menuItems,
  onSave
}) => {
  const { toast } = useToast();
  const [localOrder, setLocalOrder] = useState<string[]>(preferences.sidebarOrder);
  const [hiddenItems, setHiddenItems] = useState<string[]>(preferences.hiddenSidebarItems);
  const [defaultSection, setDefaultSection] = useState<string>(preferences.defaultSection);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalOrder(preferences.sidebarOrder);
    setHiddenItems(preferences.hiddenSidebarItems);
    setDefaultSection(preferences.defaultSection);
  }, [preferences]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const newOrder = [...localOrder];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(targetId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    setLocalOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const toggleVisibility = (itemId: string) => {
    // Não permite esconder o dashboard
    if (itemId === 'dashboard') return;
    
    setHiddenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave({
      sidebarOrder: localOrder,
      hiddenSidebarItems: hiddenItems,
      defaultSection
    });
    setSaving(false);

    if (success) {
      toast({
        title: "Preferências salvas!",
        description: "Suas configurações de layout foram atualizadas.",
      });
      onOpenChange(false);
    } else {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getMenuItem = (id: string) => menuItems.find(item => item.id === id);

  // Garantir que todos os itens do menu estão na ordem
  const orderedItems = localOrder.filter(id => menuItems.some(m => m.id === id));
  const missingItems = menuItems.filter(m => !orderedItems.includes(m.id)).map(m => m.id);
  const allItems = [...orderedItems, ...missingItems];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Personalizar Menu</DialogTitle>
          <DialogDescription>
            Arraste para reordenar e escolha quais itens exibir no menu lateral.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="menu" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu">Menu Lateral</TabsTrigger>
            <TabsTrigger value="default">Tela Inicial</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-2">
              {allItems.map((itemId) => {
                const item = getMenuItem(itemId);
                if (!item) return null;
                
                const Icon = item.icon;
                const isHidden = hiddenItems.includes(itemId);
                const isDashboard = itemId === 'dashboard';

                return (
                  <div
                    key={itemId}
                    draggable={!isDashboard}
                    onDragStart={(e) => handleDragStart(e, itemId)}
                    onDragOver={(e) => handleDragOver(e, itemId)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all",
                      isHidden ? "bg-muted/50 opacity-60" : "bg-card",
                      draggedItem === itemId && "opacity-50 scale-95",
                      !isDashboard && "cursor-grab active:cursor-grabbing"
                    )}
                  >
                    <GripVertical className={cn(
                      "w-4 h-4 text-muted-foreground",
                      isDashboard && "opacity-30"
                    )} />
                    
                    <Icon className={cn("w-5 h-5", item.color)} />
                    
                    <span className={cn(
                      "flex-1 text-sm font-medium",
                      isHidden && "line-through text-muted-foreground"
                    )}>
                      {item.label}
                    </span>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleVisibility(itemId)}
                      disabled={isDashboard}
                      title={isDashboard ? "Dashboard não pode ser oculto" : isHidden ? "Mostrar" : "Ocultar"}
                    >
                      {isHidden ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-primary" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="default" className="flex-1 overflow-y-auto mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Escolha qual seção abrir automaticamente quando você acessar o aplicativo:
            </p>
            
            <div className="space-y-2">
              {allItems.filter(id => !hiddenItems.includes(id)).map((itemId) => {
                const item = getMenuItem(itemId);
                if (!item) return null;
                
                const Icon = item.icon;
                const isDefault = defaultSection === itemId;

                return (
                  <button
                    key={itemId}
                    onClick={() => setDefaultSection(itemId)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                      isDefault 
                        ? "bg-primary/10 border-primary" 
                        : "bg-card hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", item.color)} />
                    
                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>

                    {isDefault && (
                      <div className="flex items-center gap-1 text-primary">
                        <Check className="w-4 h-4" />
                        <span className="text-xs font-medium">Padrão</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t mt-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            className="flex-1"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
