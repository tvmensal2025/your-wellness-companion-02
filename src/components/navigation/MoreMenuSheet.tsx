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
  MessageCircle,
  UserCircle2,
  EyeOff,
  TrendingUp,
  Activity,
  Home,
  Settings
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useMenuStyleContextSafe } from '@/contexts/MenuStyleContext';

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
  | 'whatsapp-settings'
  | 'change-character'
  | 'dashboard'
  | 'missions'
  | 'progress';

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
  featureId?: string; // ID da feature para filtrar por estilo
  menuId?: string; // ID do menu para filtrar por personagem
}

// Account items removed - profile accessed via header avatar

const featureItems: MenuItem[] = [
  { id: 'dashboard', icon: Home, label: 'Dashboard', description: 'Painel principal', color: 'text-primary', menuId: 'dashboard' },
  { id: 'missions', icon: Activity, label: 'Missão do Dia', description: 'Tarefas diárias', color: 'text-secondary', menuId: 'missions' },
  { id: 'progress', icon: TrendingUp, label: 'Meu Progresso', description: 'Evolução e estatísticas', color: 'text-cyan-500', menuId: 'progress' },
  { id: 'goals', icon: Target, label: 'Minhas Metas', description: 'Objetivos pessoais', color: 'text-green-500', menuId: 'goals' },
  { id: 'courses', icon: GraduationCap, label: 'Plataforma dos Sonhos', description: 'Cursos e aulas', color: 'text-accent', menuId: 'courses' },
  { id: 'sessions', icon: FileText, label: 'Sessões', description: 'Histórico de sessões', color: 'text-muted-foreground', menuId: 'sessions' },
  { id: 'comunidade', icon: Users, label: 'Comunidade', description: 'Feed e ranking', color: 'text-blue-500', menuId: 'comunidade' },
  { id: 'challenges', icon: Award, label: 'Desafios', description: 'Desafios individuais', color: 'text-orange-500', menuId: 'challenges' },
  { id: 'saboteur-test', icon: Settings, label: 'Teste de Sabotadores', description: 'Autoconhecimento', color: 'text-gray-500', menuId: 'saboteur-test' },
  { id: 'exercicios', icon: Dumbbell, label: 'Exercícios', description: 'Treinos recomendados', color: 'text-orange-600', menuId: 'exercicios' },
  { id: 'dr-vital', icon: Stethoscope, label: 'Dr. Vital', description: 'Assistente de saúde', color: 'text-blue-600', menuId: 'dr-vital' },
];

const systemItems: MenuItem[] = [
  { id: 'change-character', icon: UserCircle2, label: 'Trocar Experiência', description: 'Mudar estilo do app', color: 'text-violet-500' },
  { id: 'whatsapp-settings', icon: MessageCircle, label: 'Notificações WhatsApp', description: 'Configurar mensagens', color: 'text-green-500' },
  { id: 'subscriptions', icon: CreditCard, label: 'Assinaturas', description: 'Planos e pagamentos', color: 'text-purple-600', menuId: 'subscriptions' },
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
  const menuStyle = useMenuStyleContextSafe();
  
  // Filtrar itens baseado no personagem selecionado (usando menuId)
  const filteredFeatureItems = featureItems.filter(item => {
    if (!item.menuId) return true;
    if (!menuStyle) return true; // Se não há contexto, mostrar tudo
    return menuStyle.isMenuEnabled(item.menuId);
  });

  // Itens desabilitados (para mostrar com olho vermelho)
  const disabledFeatureItems = featureItems.filter(item => {
    if (!item.menuId) return false;
    if (!menuStyle) return false;
    return !menuStyle.isMenuEnabled(item.menuId);
  });

  const handleItemClick = (item: MenuItem) => {
    if (item.action === 'customize-menu') {
      onOpenLayoutPrefs?.();
      onOpenChange(false);
      return;
    }
    onNavigate(item.id as MenuSection);
    onOpenChange(false);
  };

  const renderMenuItem = (item: MenuItem, isDisabled: boolean = false) => (
    <button
      key={item.id}
      onClick={() => !isDisabled && handleItemClick(item)}
      disabled={isDisabled}
      className={cn(
        "w-full flex items-center gap-2 p-2.5 rounded-lg transition-all touch-manipulation group",
        isDisabled 
          ? "opacity-50 cursor-not-allowed bg-muted/30" 
          : "hover:bg-muted/50 active:scale-[0.98]"
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
        isDisabled ? "bg-muted/50" : "bg-muted/50 group-hover:bg-muted",
        isDisabled ? "text-muted-foreground" : item.color
      )}>
        <item.icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col flex-1 text-left">
        <span className={cn(
          "text-sm font-medium",
          isDisabled ? "text-muted-foreground" : "text-foreground"
        )}>{item.label}</span>
        {item.description && (
          <span className="text-xs text-muted-foreground">{item.description}</span>
        )}
      </div>
      {isDisabled ? (
        <EyeOff className="w-4 h-4 text-destructive opacity-70" />
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
      )}
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
          {/* Features Section - Habilitados */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1.5">
              Funcionalidades
            </p>
            <div className="space-y-0.5">
              {filteredFeatureItems.map(item => renderMenuItem(item, false))}
            </div>
          </div>

          {/* Features Section - Desabilitados (com olho vermelho) */}
          {disabledFeatureItems.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1.5 flex items-center gap-1">
                  <EyeOff className="w-3 h-3 text-destructive" />
                  Não disponível nesta experiência
                </p>
                <div className="space-y-0.5">
                  {disabledFeatureItems.map(item => renderMenuItem(item, true))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* System Section */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1.5">
              Sistema
            </p>
            <div className="space-y-0.5">
              {systemItems.map(item => renderMenuItem(item, false))}
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
