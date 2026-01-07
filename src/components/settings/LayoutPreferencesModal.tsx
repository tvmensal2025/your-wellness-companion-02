import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GripVertical, Check, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
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
  const dragOverItemRef = useRef<string | null>(null);

  useEffect(() => {
    setLocalOrder(preferences.sidebarOrder);
    setHiddenItems(preferences.hiddenSidebarItems);
    setDefaultSection(preferences.defaultSection);
  }, [preferences]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;
    dragOverItemRef.current = targetId;

    const newOrder = [...localOrder];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    setLocalOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    dragOverItemRef.current = null;
  };

  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    const currentIndex = localOrder.indexOf(itemId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= localOrder.length) return;
    
    const newOrder = [...localOrder];
    newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, itemId);
    setLocalOrder(newOrder);
  };

  const toggleVisibility = (itemId: string) => {
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
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">Personalizar Menu</DialogTitle>
          <DialogDescription className="text-xs">
            Use as setas para reordenar e o ícone de olho para mostrar/ocultar.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="menu" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="menu" className="text-xs">Menu Lateral</TabsTrigger>
            <TabsTrigger value="default" className="text-xs">Tela Inicial</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="flex-1 overflow-y-auto mt-3">
            <div className="space-y-1.5">
              {allItems.map((itemId, index) => {
                const item = getMenuItem(itemId);
                if (!item) return null;
                
                const Icon = item.icon;
                const isHidden = hiddenItems.includes(itemId);
                const isDashboard = itemId === 'dashboard';
                const isFirst = index === 0;
                const isLast = index === allItems.length - 1;

                return (
                  <div
                    key={itemId}
                    draggable={!isDashboard}
                    onDragStart={(e) => handleDragStart(e, itemId)}
                    onDragOver={(e) => handleDragOver(e, itemId)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border transition-all",
                      isHidden ? "bg-muted/50 opacity-60" : "bg-card",
                      draggedItem === itemId && "opacity-50 scale-95 border-primary",
                      !isDashboard && "cursor-grab active:cursor-grabbing"
                    )}
                  >
                    <GripVertical className={cn(
                      "w-3.5 h-3.5 text-muted-foreground shrink-0",
                      isDashboard && "opacity-30"
                    )} />
                    
                    <Icon className={cn("w-4 h-4 shrink-0", item.color)} />
                    
                    <span className={cn(
                      "flex-1 text-xs font-medium truncate",
                      isHidden && "line-through text-muted-foreground"
                    )}>
                      {item.label}
                    </span>

                    {/* Botões de ordenação */}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => moveItem(itemId, 'up')}
                        disabled={isFirst || isDashboard}
                        className={cn(
                          "p-1 rounded hover:bg-muted transition-colors",
                          (isFirst || isDashboard) && "opacity-30 cursor-not-allowed"
                        )}
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => moveItem(itemId, 'down')}
                        disabled={isLast || isDashboard}
                        className={cn(
                          "p-1 rounded hover:bg-muted transition-colors",
                          (isLast || isDashboard) && "opacity-30 cursor-not-allowed"
                        )}
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Botão de visibilidade */}
                    <button
                      onClick={() => toggleVisibility(itemId)}
                      disabled={isDashboard}
                      className={cn(
                        "p-1.5 rounded transition-colors",
                        isDashboard 
                          ? "opacity-30 cursor-not-allowed" 
                          : isHidden 
                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-500" 
                            : "bg-green-500/10 hover:bg-green-500/20 text-green-500"
                      )}
                      title={isDashboard ? "Dashboard não pode ser oculto" : isHidden ? "Mostrar" : "Ocultar"}
                    >
                      {isHidden ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="default" className="flex-1 overflow-y-auto mt-3">
            <p className="text-xs text-muted-foreground mb-3">
              Escolha qual seção abrir ao acessar o app:
            </p>
            
            <div className="space-y-1.5">
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
                      "w-full flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
                      isDefault 
                        ? "bg-primary/10 border-primary" 
                        : "bg-card hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", item.color)} />
                    
                    <span className="flex-1 text-xs font-medium">
                      {item.label}
                    </span>

                    {isDefault && (
                      <div className="flex items-center gap-1 text-primary">
                        <Check className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium">Padrão</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-3 border-t mt-3">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            size="sm"
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
