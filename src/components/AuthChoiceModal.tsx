import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Monitor, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const AuthChoiceModal: React.FC<AuthChoiceModalProps> = ({
  isOpen,
  onClose,
  userName
}) => {
  const navigate = useNavigate();

  const handleSofiaChoice = () => {
    navigate('/sofia');
    onClose();
  };

  const handlePlatformChoice = () => {
    navigate('/dashboard');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-5">
        <DialogHeader className="pb-1 sm:pb-2">
          <DialogTitle className="text-center text-lg sm:text-xl font-bold text-primary">
            🎉 Bem-vindo ao Instituto dos Sonhos!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4">
          {/* Mensagem de boas-vindas */}
          <div className="text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              Olá <strong className="text-primary">{userName || 'usuário'}</strong>! 
              Para onde você gostaria de ir hoje?
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Escolha sua experiência personalizada
            </p>
          </div>

          {/* Opções */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Sofia - IA Personalizada */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 group"
              onClick={handleSofiaChoice}
            >
              <CardContent className="p-3 sm:p-4 text-center space-y-2 sm:space-y-3">
                <div className="flex justify-center">
                  <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center justify-center gap-1.5">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                    Sofia - IA Personalizada
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Converse com nossa IA especializada em saúde e bem-estar. 
                    Receba orientações personalizadas, tire dúvidas e acompanhe seu progresso.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-primary font-medium text-xs sm:text-sm pt-1">
                  <span>Conversar com Sofia</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            {/* Plataforma - Dashboard Completo */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 group"
              onClick={handlePlatformChoice}
            >
              <CardContent className="p-3 sm:p-4 text-center space-y-2 sm:space-y-3">
                <div className="flex justify-center">
                  <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <Monitor className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center justify-center gap-1.5">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    Plataforma Completa
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Acesse todos os recursos: pesagem, anamnese, missões diárias, 
                    gráficos de evolução e muito mais.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-primary font-medium text-xs sm:text-sm pt-1">
                  <span>Explorar Plataforma</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações adicionais */}
          <div className="text-center space-y-1 pt-1">
            <p className="text-xs text-muted-foreground">
              💡 Dica: Você pode alternar entre as duas opções a qualquer momento através do menu
            </p>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground h-8"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
