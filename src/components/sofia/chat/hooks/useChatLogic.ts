import { useState, useRef, useEffect, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImageHandling } from './useImageHandling';
import { useMessageSending } from './useMessageSending';

interface Message {
  id: string;
  type: 'user' | 'sofia';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

interface PendingAnalysis {
  analysisId: string;
  detectedFoods: any[];
  userName: string;
}

interface UseChatLogicProps {
  user: SupabaseUser | null;
}

interface UseChatLogicReturn {
  // State
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  pendingInvites: any[];
  inputMessage: string;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  selectedImage: File | null;
  imagePreview: string | null;
  showConfirmationModal: boolean;
  setShowConfirmationModal: React.Dispatch<React.SetStateAction<boolean>>;
  pendingAnalysis: PendingAnalysis | null;
  setPendingAnalysis: React.Dispatch<React.SetStateAction<PendingAnalysis | null>>;
  voiceEnabled: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  
  // Refs
  fileInputRef: React.RefObject<HTMLInputElement>;
  cameraInputRef: React.RefObject<HTMLInputElement>;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  
  // Handlers
  handleImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendMessage: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleCameraClick: () => void;
  handleGalleryClick: () => void;
  handleMicClick: () => void;
  toggleVoice: () => void;
  handleRemoveImage: () => void;
  acceptInvite: (inviteId: string, goalId: string) => Promise<void>;
  rejectInvite: (inviteId: string) => Promise<void>;
  handleConfirmation: (response: string) => void;
}

export const useChatLogic = ({ user }: UseChatLogicProps): UseChatLogicReturn => {
  const { toast } = useToast();
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<PendingAnalysis | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Image handling hook
  const {
    selectedImage,
    imagePreview,
    fileInputRef,
    cameraInputRef,
    handleImageSelect,
    handleImageUpload,
    handleCameraClick,
    handleGalleryClick,
    handleRemoveImage,
    setSelectedImage,
    setImagePreview,
  } = useImageHandling({ user });

  // Message sending hook
  const { sendTextMessage, sendImageMessage } = useMessageSending({
    user,
    messages,
    setMessages,
    setPendingAnalysis,
    setShowConfirmationModal,
    handleImageUpload,
  });

  // Initialize welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'querido(a)';
      setMessages([{
        id: '1',
        type: 'sofia',
        content: `Oi ${userName}! 👋 Sou a Sofia, sua nutricionista virtual da MaxNutrition!

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

  // Load pending invites
  const loadPendingInvites = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    loadPendingInvites();
  }, [loadPendingInvites]);

  useEffect(() => {
    const interval = setInterval(() => loadPendingInvites(), 30000);
    return () => clearInterval(interval);
  }, [loadPendingInvites]);

  // Accept invite handler
  const acceptInvite = useCallback(async (inviteId: string, goalId: string) => {
    try {
      if (!user) return;
      await (supabase as any).from('user_goal_participants').insert({ 
        goal_id: goalId, 
        user_id: user.id, 
        can_view_progress: true 
      });
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
  }, [user, loadPendingInvites, toast]);

  // Reject invite handler
  const rejectInvite = useCallback(async (inviteId: string) => {
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
  }, [user, loadPendingInvites, toast]);

  // Send message handler
  const handleSendMessage = useCallback(async () => {
    if ((!inputMessage.trim() && !selectedImage) || !user || isLoading) return;

    let imageUrl: string | undefined;

    if (selectedImage) {
      toast({
        title: "📸 Fazendo upload da imagem...",
        description: "Aguarde um momento",
      });
      imageUrl = await handleImageUpload(selectedImage);
      if (!imageUrl) return;
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
      if (imageUrl) {
        await sendImageMessage(imageUrl, currentMessage);
      } else {
        await sendTextMessage(currentMessage);
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
  }, [inputMessage, selectedImage, user, isLoading, toast, handleImageUpload, sendImageMessage, sendTextMessage, setSelectedImage, setImagePreview]);

  // Key press handler
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Mic click handler
  const handleMicClick = useCallback(() => {
    if (voiceEnabled) {
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
  }, [voiceEnabled, isListening, toast]);

  // Toggle voice handler
  const toggleVoice = useCallback(() => {
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
  }, [voiceEnabled, toast]);

  // Confirmation handler
  const handleConfirmation = useCallback((response: string) => {
    const sofiaMessage: Message = {
      id: (Date.now() + 3).toString(),
      type: 'sofia',
      content: response,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, sofiaMessage]);
    setShowConfirmationModal(false);
    setPendingAnalysis(null);
  }, []);

  return {
    // State
    messages,
    setMessages,
    pendingInvites,
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
    isSpeaking,
    
    // Refs
    fileInputRef,
    cameraInputRef,
    scrollAreaRef,
    
    // Handlers
    handleImageSelect,
    handleSendMessage,
    handleKeyPress,
    handleCameraClick,
    handleGalleryClick,
    handleMicClick,
    toggleVoice,
    handleRemoveImage,
    acceptInvite,
    rejectInvite,
    handleConfirmation,
  };
};
