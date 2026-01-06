import React from 'react';
import { 
  User, 
  Settings, 
  GraduationCap, 
  FileText, 
  Users, 
  Award, 
  Target,
  Stethoscope,
  CreditCard,
  Dumbbell,
  LogOut,
  Moon,
  Sun,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
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
  | 'subscriptions';

interface MoreMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (section: MenuSection) => void;
  onLogout: () => void;
  userProfile?: {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
  };
}

interface MenuItem {
  id: MenuSection;
  icon: React.ElementType;
  label: string;
  description?: string;
  color?: string;
}

const accountItems: MenuItem[] = [
  { id: 'profile', icon: User, label: 'Meu Perfil', description: 'Dados pessoais e preferências' },
];

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
  { id: 'subscriptions', icon: CreditCard, label: 'Assinaturas', description: 'Planos e pagamentos', color: 'text-purple-600' },
];

export const MoreMenuSheet: React.FC<MoreMenuSheetProps> = ({
  open,
  onOpenChange,
  onNavigate,
  onLogout,
  userProfile
}) => {
  const { theme, setTheme } = useTheme();

  const handleItemClick = (id: MenuSection) => {
    onNavigate(id);
    onOpenChange(false);
  };

  const renderMenuItem = (item: MenuItem) => (
    <button
      key={item.id}
      onClick={() => handleItemClick(item.id)}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/80 active:scale-[0.98] transition-all touch-manipulation"
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-xl bg-muted/50",
        item.color
      )}>
        <item.icon className="w-5 h-5" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-foreground">{item.label}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground">{item.description}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
        className="h-[85vh] rounded-t-3xl px-4 pb-8"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)' }}
      >
        <SheetHeader className="pb-2">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-2" />
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto h-full pb-16 space-y-4">
          {/* User Profile Section */}
          <button
            onClick={() => handleItemClick('profile')}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 active:scale-[0.98] transition-all touch-manipulation"
          >
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={userProfile?.avatarUrl} alt={userProfile?.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(userProfile?.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">
                {userProfile?.fullName || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground">
                {userProfile?.email || 'Ver perfil'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <Separator />

          {/* Features Section */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">
              Funcionalidades
            </p>
            <div className="space-y-1">
              {featureItems.map(renderMenuItem)}
            </div>
          </div>

          <Separator />

          {/* System Section */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">
              Sistema
            </p>
            <div className="space-y-1">
              {systemItems.map(renderMenuItem)}
              
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/80 active:scale-[0.98] transition-all touch-manipulation"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted/50">
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-indigo-500" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                  </p>
                  <p className="text-xs text-muted-foreground">Alterar tema do app</p>
                </div>
              </button>
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
            className="w-full justify-start gap-3 h-14 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-destructive/10">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium">Sair da conta</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MoreMenuSheet;
