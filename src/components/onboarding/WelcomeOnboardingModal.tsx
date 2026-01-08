import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Stethoscope, Phone, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Sparkles, Check } from 'lucide-react';
import { LayoutPreferences } from '@/hooks/useLayoutPreferences';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface WelcomeOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  preferences: LayoutPreferences;
  menuItems: MenuItem[];
  onSave: (prefs: Partial<LayoutPreferences>) => Promise<boolean>;
  whatsappNumbers?: {
    sofia: string;
    drVital: string;
  };
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  open,
  onOpenChange,
  userName,
  preferences,
  menuItems,
  onSave,
  whatsappNumbers = {
    sofia: '+5511999999999',
    drVital: '+5511888888888'
  }
}) => {
  const [step, setStep] = useState<'welcome' | 'customize'>('welcome');
  const [localOrder, setLocalOrder] = useState<string[]>(preferences.sidebarOrder);
  const [hiddenItems, setHiddenItems] = useState<string[]>(preferences.hiddenSidebarItems);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalOrder(preferences.sidebarOrder);
      setHiddenItems(preferences.hiddenSidebarItems);
      setStep('welcome');
    }
  }, [open, preferences]);

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

  const handleFinish = async () => {
    setSaving(true);
    await onSave({
      sidebarOrder: localOrder,
      hiddenSidebarItems: hiddenItems,
    });
    setSaving(false);
    
    // Marcar que o usuário viu o modal
    localStorage.setItem('hasSeenWelcomeModal', 'true');
    onOpenChange(false);
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenWelcomeModal', 'true');
    onOpenChange(false);
  };

  const getMenuItem = (id: string) => menuItems.find(item => item.id === id);

  // Garantir que todos os itens do menu estão na ordem
  const orderedItems = localOrder.filter(id => menuItems.some(m => m.id === id));
  const missingItems = menuItems.filter(m => !orderedItems.includes(m.id)).map(m => m.id);
  const allItems = [...orderedItems, ...missingItems];

  const openWhatsApp = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={handleSkip}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-center text-lg sm:text-xl font-bold text-primary flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5" />
            Bem-vindo, {userName}!
            <Sparkles className="h-5 w-5" />
          </DialogTitle>
          <DialogDescription className="text-center text-xs sm:text-sm">
            {step === 'welcome' 
              ? 'Conheça nossos recursos e personalize sua experiência'
              : 'Escolha quais seções quer ver no menu'}
          </DialogDescription>
        </DialogHeader>

        {step === 'welcome' ? (
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Seção WhatsApp */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                📱 Assistentes via WhatsApp
              </h3>
              <p className="text-xs text-muted-foreground">
                Você pode conversar com nossos assistentes de IA a qualquer momento!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Sofia Card */}
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all duration-300 border-2 hover:border-emerald-500/50 group"
                  onClick={() => openWhatsApp(whatsappNumbers.sofia)}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full group-hover:scale-110 transition-transform">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Sofia</h4>
                        <p className="text-[10px] text-muted-foreground">Nutricionista IA</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Envie fotos de refeições, tire dúvidas sobre nutrição
                    </p>
                    <div className="flex items-center gap-1 text-emerald-600 text-xs">
                      <Phone className="h-3 w-3" />
                      <span>Conversar</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Dr.Vital Card */}
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all duration-300 border-2 hover:border-blue-500/50 group"
                  onClick={() => openWhatsApp(whatsappNumbers.drVital)}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full group-hover:scale-110 transition-transform">
                        <Stethoscope className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Dr.Vital</h4>
                        <p className="text-[10px] text-muted-foreground">Médico IA</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Envie exames médicos, consulte resultados
                    </p>
                    <div className="flex items-center gap-1 text-blue-600 text-xs">
                      <Phone className="h-3 w-3" />
                      <span>Conversar</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/50" />

            {/* Próximo passo */}
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                💡 Você pode personalizar quais seções aparecem no menu
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3">
            <p className="text-xs text-muted-foreground">
              Os 4 primeiros itens visíveis aparecem na navegação principal:
            </p>

            <div className="space-y-1.5 max-h-[40vh] overflow-y-auto">
              {allItems.map((itemId, index) => {
                const item = getMenuItem(itemId);
                if (!item) return null;
                
                const Icon = item.icon;
                const isHidden = hiddenItems.includes(itemId);
                const isDashboard = itemId === 'dashboard';
                const isFirst = index === 0;
                const isLast = index === allItems.length - 1;
                const visibleIndex = allItems.filter((id, i) => i <= index && !hiddenItems.includes(id)).length;
                const isInBottomNav = visibleIndex <= 4 && !isHidden;

                return (
                  <div
                    key={itemId}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border transition-all",
                      isHidden ? "bg-muted/50 opacity-60" : "bg-card",
                      isInBottomNav && !isHidden && "ring-1 ring-primary/30 bg-primary/5"
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

                    {isInBottomNav && !isHidden && (
                      <span className="text-[10px] text-primary font-medium px-1.5 py-0.5 bg-primary/10 rounded">
                        Menu
                      </span>
                    )}

                    {/* Botões de ordenação */}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => moveItem(itemId, 'up')}
                        disabled={isFirst || isDashboard}
                        className={cn(
                          "p-1 rounded hover:bg-muted transition-colors",
                          (isFirst || isDashboard) && "opacity-30 cursor-not-allowed"
                        )}
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
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 pt-3 border-t mt-3">
          {step === 'welcome' ? (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-1"
                onClick={handleSkip}
              >
                Pular
              </Button>
              <Button 
                size="sm"
                className="flex-1"
                onClick={() => setStep('customize')}
              >
                Personalizar Menu
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => setStep('welcome')}
              >
                Voltar
              </Button>
              <Button 
                size="sm"
                className="flex-1"
                onClick={handleFinish}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Começar!"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
