import React from 'react';
import { 
  GraduationCap, 
  FileText, 
  Users, 
  Award, 
  Target,
  Stethoscope,
  CreditCard,
  Dumbbell,
  LogOut,
  ChevronRight,
  SlidersHorizontal,
  MessageCircle
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export type MenuSection = 
  | 'profile' 
  | 'courses' 
  | 'sessions' 
  | 'comunidade' 
  | 'challenges' 
  | 'goals'
  | 'saboteur-test'
  | 'dr-vital'
  | 'exercicios'
  | 'subscriptions'
  | 'whatsapp-settings';

interface MoreMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (section: MenuSection) => void;
  onLogout: () => void;
  onOpenLayoutPrefs?: () => void;
  userProfile?: {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
  };
}

interface MenuItem {
  id: MenuSection | 'customize-menu';
  icon: React.ElementType;
  label: string;
  description?: string;
  color?: string;
  action?: 'customize-menu' | 'whatsapp-settings';
}

// Account items removed - profile accessed via header avatar

const featureItems: MenuItem[] = [
  { id: 'courses', icon: GraduationCap, label: 'Plataforma dos Sonhos', description: 'Cursos e aulas', color: 'text-accent' },
  { id: 'sessions', icon: FileText, label: 'Sessões', description: 'Histórico de sessões', color: 'text-muted-foreground' },
  { id: 'comunidade', icon: Users, label: 'Comunidade', description: 'Feed e ranking', color: 'text-blue-500' },
  { id: 'challenges', icon: Award, label: 'Desafios', description: 'Desafios individuais', color: 'text-orange-500' },
  { id: 'goals', icon: Target, label: 'Minhas Metas', description: 'Objetivos pessoais', color: 'text-green-500' },
  { id: 'exercicios', icon: Dumbbell, label: 'Exercícios', description: 'Treinos recomendados', color: 'text-orange-600' },
  { id: 'dr-vital', icon: Stethoscope, label: 'Dr. Vital', description: 'Assistente de saúde', color: 'text-blue-600' },
];

const systemItems: MenuItem[] = [
  { id: 'whatsapp-settings', icon: MessageCircle, label: 'Notificações WhatsApp', description: 'Configurar mensagens', color: 'text-green-500' },
  { id: 'subscriptions', icon: CreditCard, label: 'Assinaturas', description: 'Planos e pagamentos', color: 'text-purple-600' },
  { id: 'customize-menu' as any, icon: SlidersHorizontal, label: 'Personalizar Menu', description: 'Reordenar e ocultar itens', color: 'text-gray-500', action: 'customize-menu' },
];

export const MoreMenuSheet: React.FC<MoreMenuSheetProps> = ({
  open,
  onOpenChange,
  onNavigate,
  onLogout,
  onOpenLayoutPrefs,
  userProfile
}) => {
  const handleItemClick = (item: MenuItem) => {
    if (item.action === 'customize-menu') {
      onOpenLayoutPrefs?.();
      onOpenChange(false);
      return;
    }
    onNavigate(item.id as MenuSection);
    onOpenChange(false);
  };

  const renderMenuItem = (item: MenuItem) => (
    <button
      key={item.id}
      onClick={() => handleItemClick(item)}
      className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-muted/50 active:scale-[0.98] transition-all touch-manipulation group"
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors",
        item.color
      )}>
        <item.icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col flex-1 text-left">
        <span className="text-sm font-medium text-foreground">{item.label}</span>
        {item.description && (
          <span className="text-xs text-muted-foreground">{item.description}</span>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
    </button>
  );

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[70vh] rounded-t-3xl px-4 pb-6"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
      >
        <SheetHeader className="pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-2" />
          <SheetTitle className="text-left text-base">Menu</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto h-full pb-12 space-y-3">
          {/* Features Section */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1.5">
              Funcionalidades
            </p>
            <div className="space-y-0.5">
              {featureItems.map(renderMenuItem)}
            </div>
          </div>

          <Separator />

          {/* System Section */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1.5">
              Sistema
            </p>
            <div className="space-y-0.5">
              {systemItems.map(renderMenuItem)}
            </div>
          </div>

          <Separator />

          {/* Logout */}
          <Button
            variant="ghost"
            onClick={() => {
              onLogout();
              onOpenChange(false);
            }}
            className="w-full justify-start gap-2 h-11 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Sair da conta</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MoreMenuSheet;
