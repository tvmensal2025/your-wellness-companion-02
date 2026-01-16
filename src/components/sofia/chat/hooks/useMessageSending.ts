import { useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface UseMessageSendingProps {
  user: SupabaseUser | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setPendingAnalysis: React.Dispatch<React.SetStateAction<PendingAnalysis | null>>;
  setShowConfirmationModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleImageUpload: (file: File) => Promise<string | null>;
}

interface UseMessageSendingReturn {
  sendTextMessage: (message: string) => Promise<void>;
  sendImageMessage: (imageUrl: string, message: string) => Promise<void>;
}

export const useMessageSending = ({
  user,
  messages,
  setMessages,
  setPendingAnalysis,
  setShowConfirmationModal,
  handleImageUpload,
}: UseMessageSendingProps): UseMessageSendingReturn => {
  const { toast } = useToast();

  // Send text message
  const sendTextMessage = useCallback(async (message: string) => {
    if (!user) return;

    const conversationHistory = messages.slice(-5).map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const chatResult = await supabase.functions.invoke('sofia-enhanced-memory', {
      body: {
        message,
        userId: user.id,
        conversationHistory
      }
    });

    if (chatResult.error) {
      console.error('❌ Erro da Edge Function:', chatResult.error);
      throw new Error(chatResult.error.message || 'Erro na comunicação com o servidor');
    }

    if (chatResult.data && (chatResult.data.response || chatResult.data.message)) {
      const sofiaResponse: Message = {
        id: (Date.now() + 2).toString(),
        type: 'sofia',
        content: chatResult.data.response || chatResult.data.message || 'Oi querido(a)! Como posso te ajudar hoje? 💚',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, sofiaResponse]);
    } else {
      throw new Error('Resposta inválida do servidor');
    }
  }, [user, messages, setMessages]);

  // Send image message (food or medical)
  const sendImageMessage = useCallback(async (imageUrl: string, message: string) => {
    if (!user) return;

    toast({
      title: "🔍 Analisando tipo de imagem...",
      description: "Identificando o conteúdo",
    });

    let imageType = 'FOOD';
    let imageConfidence = 0.5;
    let imageDetails = '';

    try {
      const detectResult = await supabase.functions.invoke('detect-image-type', {
        body: { imageUrl }
      });

      if (detectResult.data && !detectResult.error) {
        imageType = detectResult.data.type || 'FOOD';
        imageConfidence = detectResult.data.confidence || 0.5;
        imageDetails = detectResult.data.details || '';
        console.log('🎯 Tipo de imagem detectado:', { imageType, imageConfidence, imageDetails });
      }
    } catch (detectError) {
      console.warn('⚠️ Erro na detecção de tipo, assumindo FOOD:', detectError);
    }

    if (imageType === 'FOOD') {
      toast({
        title: "🥗 Sofia está analisando sua refeição...",
        description: "Calculando nutrientes e dando dicas",
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

      console.log('📊 Sofia Image Analysis Response:', {
        success: analysisResult.data?.success,
        requires_confirmation: analysisResult.data?.requires_confirmation,
        foods_count: analysisResult.data?.food_detection?.foods_detected?.length,
        error: analysisResult.error,
      });

      if (analysisResult.data?.success && analysisResult.data?.requires_confirmation) {
        const foodsForModal = (analysisResult.data.food_detection?.foods_detected && analysisResult.data.food_detection.foods_detected.length > 0)
          ? analysisResult.data.food_detection.foods_detected
          : (analysisResult.data.sofia_analysis?.foods_detected && analysisResult.data.sofia_analysis.foods_detected.length > 0)
            ? analysisResult.data.sofia_analysis.foods_detected
            : (analysisResult.data.alimentos_identificados || []);

        if (Array.isArray(foodsForModal) && foodsForModal.length > 0) {
          setPendingAnalysis({
            analysisId: String(analysisResult.data.analysis_id || analysisResult.data.analysisId || ''),
            detectedFoods: foodsForModal,
            userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'usuário'
          });
          setShowConfirmationModal(true);
          toast({
            title: "📸 Análise concluída!",
            description: "Confirme as gramas no modal para calcular os nutrientes.",
          });
          return;
        }
        if (analysisResult.data?.sofia_analysis?.analysis) {
          const sofiaResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: 'sofia',
            content: analysisResult.data.sofia_analysis.analysis,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, sofiaResponse]);
        }
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
        return;
      } else if (analysisResult.error) {
        throw new Error(analysisResult.error.message || 'Erro na análise da imagem');
      }

    } else if (imageType === 'MEDICAL') {
      toast({
        title: "🩺 Dr. Vital está analisando seu exame...",
        description: "Preparando relatório detalhado",
      });

      const processingMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: `🩺 *Recebi seu exame!*\n\nOlá! Sou o Dr. Vital. Detectei que você enviou um documento médico/exame.\n\n⏳ Estou analisando cuidadosamente cada resultado para te dar um relatório completo e humanizado.\n\nAguarde um momento... 💙`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, processingMessage]);

      try {
        const examResult = await supabase.functions.invoke('analyze-medical-exam', {
          body: {
            imageUrl: imageUrl,
            userId: user.id,
            userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'usuário'
          }
        });

        console.log('🩺 Dr. Vital Exam Analysis Response:', {
          success: examResult.data?.success,
          error: examResult.error,
        });

        if (examResult.data && !examResult.error) {
          const analysisContent = examResult.data.analysis || 
            examResult.data.resultado?.analise_formatada || 
            examResult.data.resultado?.summary ||
            'Análise do exame concluída. Consulte seu médico para mais detalhes.';

          const drVitalResponse: Message = {
            id: (Date.now() + 2).toString(),
            type: 'sofia',
            content: `🩺 *Relatório do Dr. Vital*\n\n${analysisContent}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, drVitalResponse]);

          toast({
            title: "✅ Análise médica concluída!",
            description: "Dr. Vital analisou seu exame",
          });
        } else {
          throw new Error(examResult.error?.message || 'Erro na análise do exame');
        }
      } catch (examError) {
        console.error('❌ Erro na análise do exame:', examError);
        const errorResponse: Message = {
          id: (Date.now() + 2).toString(),
          type: 'sofia',
          content: `🩺 Desculpe, tive dificuldade em analisar este exame. Por favor, tente enviar uma foto mais nítida ou em melhor iluminação.\n\nSe o problema persistir, você pode me enviar os valores digitados que faço a análise! 💙`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorResponse]);
      }
      
      return;

    } else {
      const otherResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: `🥗💚 Oi amor! Recebi sua imagem, mas não consegui identificar se é uma foto de *comida* ou de um *exame médico*.\n\n📸 Se for uma *refeição*, tente tirar uma foto mais de cima mostrando bem os alimentos!\n\n🩺 Se for um *exame*, certifique-se que a foto está nítida e mostra os resultados claramente.\n\nOu se preferir, me conta o que você gostaria de saber! Estou aqui para ajudar! ✨`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, otherResponse]);
      return;
    }
  }, [user, setMessages, setPendingAnalysis, setShowConfirmationModal, toast]);

  return {
    sendTextMessage,
    sendImageMessage,
  };
};
