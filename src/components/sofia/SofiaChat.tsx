import React, { useState, useRef, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  User as UserIcon, 
  Mic, 
  Camera, 
  Send, 
  Image, 
  X, 
  Loader2, 
  CheckCheck, 
  Volume2, 
  VolumeX,
  MessageCircle,
  Target,
  Flame,
  Trophy,
  BarChart3,
  Activity,
  Sparkles,
  Apple,
  ChefHat,
  Zap,
  Menu,
  Home,
  MessageSquare,
  Camera as CameraIcon,
  Settings,
  Heart,
  Calendar,
  BookOpen,
  Trophy as TrophyIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNutritionTracking } from '@/hooks/useNutritionTracking';
import { DailyMissionsFinal } from '@/components/daily-missions/DailyMissionsFinal';
import { NutritionTracker } from '@/components/nutrition-tracking/NutritionTracker';
import SofiaConfirmationModal from './SofiaConfirmationModal';
import sofiaAvatar from '@/assets/sofia-avatar.png';

interface Message {
  id: string;
  type: 'user' | 'sofia';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

type SofiaSection = 'chat' | 'metas' | 'missao' | 'desafios' | 'historico' | 'estatisticas' | 'analysis' | 'challenges' | 'image-analysis' | 'nutrition' | 'tracking' | 'goals' | 'progress' | 'education' | 'achievements' | 'settings' | 'profile';

interface SofiaChatProps {
  user: SupabaseUser | null;
}

const SofiaChat: React.FC<SofiaChatProps> = ({ user }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<SofiaSection>('chat');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<any>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Hooks
  const { meals, goals, getDailyNutrition } = useNutritionTracking();

  // Criar mensagem inicial quando o usuário estiver disponível
  useEffect(() => {
    if (user && messages.length === 0) {
      const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'querido(a)';
      setMessages([{
        id: '1',
        type: 'sofia',
        content: `Oi ${userName}! 👋 Sou a Sofia, sua nutricionista virtual do Instituto dos Sonhos!

Estou aqui para te ajudar com:
🍽️ Análise de refeições (envie fotos!)
📊 Dicas nutricionais personalizadas
💪 Orientações sobre alimentação saudável
🎯 Apoio na sua jornada de transformação

O que você gostaria de conversar hoje? Pode me enviar uma foto da sua refeição ou fazer qualquer pergunta sobre nutrição! ✨`,
        timestamp: new Date()
      }]);
    }
  }, [user, messages.length]);

  // Buscar convites pendentes (metas em grupo) para este usuário
  async function loadPendingInvites() {
    try {
      if (!user) return;
        const { data, error } = await (supabase as any)
          .from('user_goal_invitations')
          .select('id, goal_id, invitee_name, invitee_email, status, created_at')
          .eq('invitee_user_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
      if (!error) setPendingInvites(data || []);
    } catch (e) {
      console.error('Erro ao carregar convites:', e);
    }
  }

  useEffect(() => { loadPendingInvites(); }, [user]);
  useEffect(() => {
    const i = setInterval(() => loadPendingInvites(), 30000);
    return () => clearInterval(i);
  }, [user]);

  async function acceptInvite(inviteId: string, goalId: string) {
    try {
      if (!user) return;
      // inserir participação
      await (supabase as any).from('user_goal_participants').insert({ goal_id: goalId, user_id: user.id, can_view_progress: true });
      // atualizar convite
      await (supabase as any).from('user_goal_invitations').update({ status: 'approved' }).eq('id', inviteId);
      await loadPendingInvites();
      toast({
        title: "Meta sincronizada!",
        description: "Vocês poderão ver o progresso um do outro.",
      });
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'sofia',
        content: 'Parabéns! 🎉 Sua nova meta compartilhada foi aprovada e sincronizada. Estou aqui para te ajudar nessa jornada!',
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error(e);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar o convite.",
        variant: "destructive",
      });
    }
  }

  async function rejectInvite(inviteId: string) {
    try {
      if (!user) return;
      await (supabase as any).from('user_goal_invitations').update({ status: 'rejected' }).eq('id', inviteId);
      await loadPendingInvites();
      toast({
        title: "Convite recusado",
        description: "O convite foi recusado com sucesso.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Erro",
        description: "Não foi possível recusar o convite.",
        variant: "destructive",
      });
    }
  }

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para enviar imagens",
          variant: "destructive",
        });
        return null;
      }

      const safeOriginalName = (file.name || 'imagem')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '-');

      const fileName = `${user.id}/${Date.now()}_${safeOriginalName}`;
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        toast({
          title: "Erro",
          description: "Erro ao fazer upload da imagem",
          variant: "destructive",
        });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar imagem",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem",
          variant: "destructive",
        });
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImage) || !user || isLoading) return;

    let imageUrl: string | undefined;

    // Upload da imagem se houver
    if (selectedImage) {
      toast({
        title: "📸 Fazendo upload da imagem...",
        description: "Aguarde um momento",
      });
      imageUrl = await handleImageUpload(selectedImage);
      if (!imageUrl) return; // Para se falhou o upload
    }

    const currentMessage = inputMessage.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
      imageUrl: imageUrl
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsLoading(true);

    try {
      // Preparar histórico de conversa para contexto
      const conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      let data, error;

      if (imageUrl) {
        toast({
          title: "🔍 Sofia está analisando sua imagem...",
          description: "Processando análise nutricional",
        });
        const analysisResult = await supabase.functions.invoke('sofia-image-analysis', {
          body: {
            imageUrl: imageUrl,
            userId: user.id,
            userContext: {
              currentMeal: 'refeicao',
              userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'usuário'
            }
          }
        });

        data = analysisResult.data;
        error = analysisResult.error;

        if (analysisResult.data?.success && Array.isArray(analysisResult.data.detectedFoods) && analysisResult.data.detectedFoods.length > 0) {
          setPendingAnalysis({
            analysisId: analysisResult.data.analysisId,
            detectedFoods: analysisResult.data.detectedFoods,
            userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'usuário'
          });
          setShowConfirmationModal(true);
          toast({
            title: "📸 Análise concluída!",
            description: "Confirme os alimentos no modal.",
          });
          setIsLoading(false);
          return;
        }

        if (analysisResult.data && analysisResult.data.sofia_analysis) {
          const sofiaResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: 'sofia',
            content: analysisResult.data.sofia_analysis.analysis || 'Analisei sua refeição!',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, sofiaResponse]);
          toast({
            title: "✅ Análise da Sofia concluída!",
            description: "Sua refeição foi analisada com sucesso",
          });
        } else {
          error = analysisResult.error;
        }
      } else {
        const chatResult = await supabase.functions.invoke('sofia-enhanced-memory', {
          body: {
            message: currentMessage,
            userId: user.id,
            conversationHistory
          }
        });
        data = chatResult.data;
        error = chatResult.error;
      }

      if (error) {
        console.error('❌ Erro da Edge Function:', error);
        throw new Error(error.message || 'Erro na comunicação com o servidor');
      }

      if (data && (data.response || data.message)) {
        const sofiaResponse: Message = {
          id: (Date.now() + 2).toString(),
          type: 'sofia',
          content: data.response || data.message || 'Oi querido(a)! Como posso te ajudar hoje? 💚',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, sofiaResponse]);
      } else {
        throw new Error('Resposta inválida do servidor');
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem. Tente novamente!",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        type: 'sofia',
        content: 'Ops! Tive um probleminha técnico. Pode tentar novamente? 🤖💭',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleMicClick = () => {
    if (voiceEnabled) {
      // Implementar gravação de áudio
      setIsListening(!isListening);
      toast({
        title: isListening ? "Parando gravação..." : "Iniciando gravação...",
        description: isListening ? "Processando sua mensagem..." : "Fale agora!",
      });
    } else {
      toast({
        title: "Ative a voz primeiro!",
        description: "Clique no botão de voz para ativar o modo áudio",
      });
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      toast({
        title: "Voz ativada!",
        description: "Agora você pode conversar com a Sofia por voz",
      });
    } else {
      setIsListening(false);
      setIsSpeaking(false);
      toast({
        title: "Voz desativada",
        description: "Modo texto ativado",
      });
    }
  };

  const menuItems: { id: string; label: string; icon: React.ElementType; color: string }[] = [];

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleSectionChange = (section: typeof currentSection) => {
    setCurrentSection(section);
    setIsMobileSidebarOpen(false); // Fecha o sidebar no mobile
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'chat':
        return (
          <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#0a0f14] to-[#0d1318] min-h-0">
            {/* Header estilo WhatsApp moderno */}
            <div className="flex items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-[#075E54] to-[#128C7E] shadow-lg z-10 flex-shrink-0">
              {/* Botão Home para Dashboard */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 h-10 w-10 flex-shrink-0"
                onClick={handleDashboardClick}
              >
                <Home className="w-5 h-5" />
              </Button>
              
              {/* Avatar com status online */}
              <div className="relative flex-shrink-0">
                <img 
                  src={sofiaAvatar} 
                  alt="Sofia"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white/30 shadow-md"
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25D366] rounded-full border-2 border-[#075E54]" />
              </div>
              
              {/* Info do contato */}
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-white text-lg sm:text-xl truncate">Sofia</h1>
                <p className="text-sm text-[#a8d8d5] truncate">online</p>
              </div>
            </div>

            {/* Área de mensagens com wallpaper */}
            <div className="flex-1 relative overflow-hidden min-h-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23128C7E' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: '#0a100e'
            }}>
              <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
                <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 relative z-10 pb-4">
                  {messages.map(message => {
                    const time = message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    const isUser = message.type === 'user';
                    return (
                      <motion.div 
                        key={message.id} 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`relative max-w-[85%] sm:max-w-[75%] ${
                          isUser 
                            ? 'bg-[#005C4B] rounded-2xl rounded-tr-md' 
                            : 'bg-[#1F2C33] rounded-2xl rounded-tl-md'
                        } px-4 py-2.5 sm:px-4 sm:py-3 shadow-lg`}>
                          {/* Seta do balão */}
                          <div className={`absolute top-0 ${
                            isUser 
                              ? 'right-0 -mr-2 border-l-[8px] border-l-[#005C4B] border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent' 
                              : 'left-0 -ml-2 border-r-[8px] border-r-[#1F2C33] border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
                          }`} style={{ width: 0, height: 0 }} />
                          
                          {message.imageUrl && (
                            <img 
                              src={message.imageUrl} 
                              alt="Imagem enviada" 
                              className="max-w-[240px] sm:max-w-[280px] h-auto rounded-lg mb-2 object-cover" 
                            />
                          )}
                          <p className="whitespace-pre-wrap text-[15px] sm:text-base leading-relaxed break-words text-white/95">{message.content}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[11px] sm:text-xs text-white/50">{time}</span>
                            {isUser && <CheckCheck className="w-4 h-4 text-[#53BDEB]" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-[#1F2C33] rounded-2xl rounded-tl-md px-4 py-3 shadow-lg">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Preview de imagem */}
            <AnimatePresence>
              {imagePreview && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="px-4 py-2 bg-[#1F2C33] border-t border-[#2a3942]"
                >
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded-lg object-cover" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 hover:bg-red-600 rounded-full text-white"
                      onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Barra de entrada estilo WhatsApp */}
            <div className="px-3 py-2 sm:px-4 sm:py-3 bg-[#1F2C33] border-t border-[#2a3942] flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Botão de Voz Toggle */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full flex-shrink-0 transition-all ${
                    voiceEnabled 
                      ? 'bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30' 
                      : 'text-[#8696A0] hover:bg-white/5'
                  }`}
                  onClick={toggleVoice}
                  title={voiceEnabled ? "Desativar voz" : "Ativar voz"}
                >
                  {voiceEnabled ? <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" /> : <VolumeX className="h-5 w-5 sm:h-6 sm:w-6" />}
                </Button>

                {/* Campo de texto */}
                <div className="flex-1 min-w-0 relative">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="bg-[#2A3942] border-none rounded-full text-white placeholder:text-[#8696A0] text-[15px] sm:text-base h-11 sm:h-12 pl-4 pr-24 focus-visible:ring-1 focus-visible:ring-[#25D366]"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-[#8696A0] hover:bg-white/5 hover:text-white rounded-full" 
                      onClick={handleCameraClick} 
                      disabled={isLoading} 
                      title="Câmera"
                    >
                      <Camera className="h-5 w-5" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-[#8696A0] hover:bg-white/5 hover:text-white rounded-full" 
                      onClick={handleGalleryClick} 
                      disabled={isLoading} 
                      title="Galeria"
                    >
                      <Image className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Botão enviar/microfone */}
                <Button
                  onClick={inputMessage.trim() || selectedImage ? handleSendMessage : handleMicClick}
                  disabled={isLoading}
                  size="icon"
                  className={`rounded-full h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 shadow-lg transition-all ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse hover:bg-red-600' 
                      : 'bg-[#00A884] text-white hover:bg-[#00A884]/90'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                  ) : inputMessage.trim() || selectedImage ? (
                    <Send className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </Button>
              </div>
            </div>

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
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Missão do Dia</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30 shadow-lg">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                  <Flame className="w-5 h-5 text-primary" />
                  Missão do Dia
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DailyMissionsFinal user={user} />
              </CardContent>
            </Card>
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
          onConfirmation={(response: string) => {
            const sofiaMessage: Message = {
              id: (Date.now() + 3).toString(),
              type: 'sofia',
              content: response,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, sofiaMessage]);
            setShowConfirmationModal(false);
            setPendingAnalysis(null);
          }}
        />
      )}
    </div>
  );
};

export default SofiaChat;