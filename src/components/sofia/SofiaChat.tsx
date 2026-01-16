import React, { useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User as UserIcon, 
  MessageCircle,
  Target,
  Trophy,
  BarChart3,
  Apple,
  ChefHat,
  Zap,
  Camera as CameraIcon,
  Settings,
  Heart,
  Calendar,
  BookOpen,
  Trophy as TrophyIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNutritionTracking } from '@/hooks/useNutritionTracking';
import { DailyMissionsLight } from '@/components/daily-missions/DailyMissionsLight';
import { NutritionTracker } from '@/components/nutrition-tracking/NutritionTracker';
import SofiaConfirmationModal from './SofiaConfirmationModal';
import { ChatHeader } from './chat/ChatHeader';
import { MessageList } from './chat/MessageList';
import { MessageInput } from './chat/MessageInput';
import { useChatLogic } from './chat/hooks/useChatLogic';

type SofiaSection = 'chat' | 'metas' | 'missao' | 'desafios' | 'historico' | 'estatisticas' | 'analysis' | 'challenges' | 'image-analysis' | 'nutrition' | 'tracking' | 'goals' | 'progress' | 'education' | 'achievements' | 'settings' | 'profile';

interface SofiaChatProps {
  user: SupabaseUser | null;
}

const SofiaChat: React.FC<SofiaChatProps> = ({ user }) => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState<SofiaSection>('chat');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Chat logic hook
  const {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    selectedImage,
    imagePreview,
    showConfirmationModal,
    setShowConfirmationModal,
    pendingAnalysis,
    setPendingAnalysis,
    voiceEnabled,
    isListening,
    fileInputRef,
    cameraInputRef,
    scrollAreaRef,
    handleImageSelect,
    handleSendMessage,
    handleKeyPress,
    handleCameraClick,
    handleGalleryClick,
    handleMicClick,
    toggleVoice,
    handleRemoveImage,
    handleConfirmation,
  } = useChatLogic({ user });

  // Hooks
  const { meals, goals, getDailyNutrition } = useNutritionTracking();

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleSectionChange = (section: typeof currentSection) => {
    setCurrentSection(section);
    setIsMobileSidebarOpen(false);
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'chat':
        return (
          <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#0a0f14] to-[#0d1318] min-h-0">
            {/* Header estilo WhatsApp moderno */}
            <ChatHeader onHomeClick={handleDashboardClick} />

            {/* Área de mensagens com wallpaper */}
            <MessageList 
              messages={messages}
              isLoading={isLoading}
              scrollAreaRef={scrollAreaRef}
            />

            {/* Barra de entrada estilo WhatsApp */}
            <MessageInput
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              isLoading={isLoading}
              selectedImage={selectedImage}
              imagePreview={imagePreview}
              voiceEnabled={voiceEnabled}
              isListening={isListening}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
              onCameraClick={handleCameraClick}
              onGalleryClick={handleGalleryClick}
              onMicClick={handleMicClick}
              onToggleVoice={toggleVoice}
              onRemoveImage={handleRemoveImage}
            />
          </div>
        );
      
      case 'metas':
        return (
          <div className="space-y-4 p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Metas Nutricionais</h2>
            
            {/* Resumo Nutricional Diário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground">Calorias</h3>
                    <Apple className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                    {getDailyNutrition(new Date().toISOString().split('T')[0]).totalCalories}
                  </div>
                  <div className="text-base sm:text-lg text-muted-foreground">Meta: {goals.calories} kcal</div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground">Proteínas</h3>
                    <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                    {getDailyNutrition(new Date().toISOString().split('T')[0]).totalProtein}g
                  </div>
                  <div className="text-base sm:text-lg text-muted-foreground">Meta: {goals.protein}g</div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground">Carboidratos</h3>
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                    {getDailyNutrition(new Date().toISOString().split('T')[0]).totalCarbs}g
                  </div>
                  <div className="text-base sm:text-lg text-muted-foreground">Meta: {goals.carbs}g</div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground">Gorduras</h3>
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                    {getDailyNutrition(new Date().toISOString().split('T')[0]).totalFat}g
                  </div>
                  <div className="text-base sm:text-lg text-muted-foreground">Meta: {goals.fat}g</div>
                </CardContent>
              </Card>
            </div>

            {/* Rastreador de Nutrição Integrado */}
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30 shadow-lg">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  Rastreador Nutricional
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <NutritionTracker />
              </CardContent>
            </Card>
          </div>
        );

      case 'missao':
        return (
          <div className="p-0">
            <DailyMissionsLight user={user} />
          </div>
        );

      case 'desafios':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Desafios e Conquistas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-purple-700 mb-2">Desafios Ativos</h3>
                  <p className="text-purple-600">Participe de desafios e ganhe pontos!</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-yellow-700 mb-2">Conquistas</h3>
                  <p className="text-yellow-600">Desbloqueie badges e conquistas!</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'historico':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Conversas</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Histórico de conversas em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'analysis':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Análise Interativa</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Análise interativa em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'challenges':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Desafios</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Desafios em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'image-analysis':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Análise de Imagens</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <CameraIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Análise de imagens em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'nutrition':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nutrição</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Seção de nutrição em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'tracking':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Acompanhamento</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Acompanhamento em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'goals':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Metas</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Metas em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'progress':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Progresso</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Progresso em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'education':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Educação</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Educação em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'achievements':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Conquistas</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <TrophyIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Conquistas em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'settings':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Configurações em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'profile':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Perfil</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Perfil em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Página não encontrada</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <p>Esta seção ainda não está disponível.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#0D1117] min-h-0 overflow-hidden">
      {/* Conteúdo Principal - Tela Cheia */}
      <div className="flex-1 flex flex-col bg-[#0D1117] min-w-0 min-h-0">
        {renderContent()}
      </div>

      {/* Hidden file inputs */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleImageSelect} 
        className="hidden" 
      />
      <input 
        ref={cameraInputRef} 
        type="file" 
        accept="image/*" 
        capture="environment" 
        onChange={handleImageSelect} 
        className="hidden" 
      />

      {/* Modal de confirmação obrigatório */}
      {showConfirmationModal && pendingAnalysis && (
        <SofiaConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => { setShowConfirmationModal(false); setPendingAnalysis(null); }}
          analysisId={pendingAnalysis.analysisId}
          detectedFoods={pendingAnalysis.detectedFoods}
          userName={pendingAnalysis.userName}
          userId={user?.id || 'guest'}
          onConfirmation={handleConfirmation}
        />
      )}
    </div>
  );
};

export default SofiaChat;