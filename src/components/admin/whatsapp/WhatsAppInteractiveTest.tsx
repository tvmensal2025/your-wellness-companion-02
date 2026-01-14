/**
 * WhatsApp Interactive Templates Test Panel
 * Envia templates diretamente via Whapi API (sem adapter-layer)
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Droplets, Scale, HelpCircle, MessageSquare, Send, Loader2,
  CheckCircle, XCircle, Smartphone, TrendingUp, Zap
} from "lucide-react";

interface TestResult {
  success: boolean;
  messageId?: string;
  error?: string;
  templateName: string;
  timestamp: string;
}

// Templates interativos no formato Whapi
const TEMPLATES = {
  // === ÁGUA ===
  water_reminder: {
    category: 'agua',
    name: '💧 Lembrete de Água',
    template: {
      type: 'button',
      header: { text: '💧 Hora de Hidratar!' },
      body: { text: '{{userName}}, já bebeu água? 💦\n\n📊 *Seu progresso hoje:*\n{{progressBar}} {{percentage}}%\n\n💧 Consumido: {{totalToday}}ml\n🎯 Meta: {{goal}}ml\n📉 Faltam: {{remaining}}ml\n\nRegistre agora! 👇' },
      footer: { text: '🌿 Sofia - MaxNutrition' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '💧 Bebi 250ml', id: 'water_250ml' },
          { type: 'quick_reply', title: '💧 Bebi 500ml', id: 'water_500ml' },
          { type: 'quick_reply', title: '❌ Ainda não', id: 'water_not_yet' }
        ]
      }
    }
  },

  water_confirmation: {
    category: 'agua',
    name: '✅ Água Registrada',
    template: {
      type: 'button',
      body: { text: '✅ *+{{amount}}ml registrado!*\n\n💧 *Total hoje:* {{totalToday}}ml / {{goal}}ml\n{{progressBar}} {{percentage}}%\n{{celebrationText}}' },
      footer: { text: '🌿 Sofia' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '💧 +250ml', id: 'water_250ml' },
          { type: 'quick_reply', title: '📊 Ver Semana', id: 'water_view_progress' }
        ]
      }
    }
  },
  water_weekly: {
    category: 'agua',
    name: '📊 Progresso Semanal Água',
    template: {
      type: 'button',
      header: { text: '💧 Seu Progresso Semanal' },
      body: { text: '📊 *Consumo da Semana:*\n\n✅ Seg: 2000ml (80%)\n✅ Ter: 2500ml (100%)\n🟡 Qua: 1800ml (72%)\n✅ Qui: 2200ml (88%)\n✅ Sex: 2400ml (96%)\n🔴 Sáb: 1500ml (60%)\n✅ Dom: 2100ml (84%)\n\n📈 *Média diária:* 2071ml\n🏆 *Melhor dia:* Terça\n\n🎉 Excelente! Continue assim!' },
      footer: { text: '🌿 Sofia - MaxNutrition' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '💧 Registrar agora', id: 'water_250ml' },
          { type: 'quick_reply', title: '📋 Menu', id: 'menu' }
        ]
      }
    }
  },

  // === PESAGEM ===
  weighing_reminder: {
    category: 'pesagem',
    name: '⚖️ Lembrete Pesagem',
    template: {
      type: 'button',
      header: { text: '⚖️ Hora da Pesagem Semanal!' },
      body: { text: '{{userName}}, é dia de atualizar seus dados! 📊\n\n📊 *Última medição:*\n⚖️ Peso: {{lastWeight}}kg\n📏 Cintura: {{lastWaist}}cm\n📅 Há {{daysSince}} dias\n\nAcompanhar seu progresso semanalmente ajuda a:\n• 📈 Identificar tendências\n• 🎯 Ajustar estratégias\n• 💪 Manter motivação\n\nVamos registrar?' },
      footer: { text: '🩺 Dr. Vital - MaxNutrition' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '⚖️ Registrar Agora', id: 'weigh_now' },
          { type: 'quick_reply', title: '⏰ Lembrar Amanhã', id: 'weigh_later' }
        ]
      }
    }
  },

  weighing_prompt_weight: {
    category: 'pesagem',
    name: '📝 Pedir Peso',
    template: {
      type: 'button',
      body: { text: '⚖️ *Qual seu peso atual?*\n\nDigite apenas o número em kg.\n\n_Exemplos:_\n• 72.5\n• 68\n• 85.3\n\n💡 *Dica:* Pese-se sempre no mesmo horário, de preferência pela manhã em jejum.' },
      footer: { text: '🩺 Dr. Vital' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '⏰ Fazer depois', id: 'weigh_later' }
        ]
      }
    }
  },
  weighing_prompt_waist: {
    category: 'pesagem',
    name: '📏 Pedir Cintura',
    template: {
      type: 'button',
      body: { text: '✅ *Peso registrado: 72.5kg*\n\n📏 *Agora a circunferência da cintura!*\n\nMeça na altura do umbigo e digite em cm.\n\n_Exemplos:_\n• 85\n• 92.5\n• 78\n\n💡 *Dica:* Use uma fita métrica flexível, sem apertar.' },
      footer: { text: '🩺 Dr. Vital' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '⏭️ Pular cintura', id: 'weigh_later' }
        ]
      }
    }
  },
  weighing_complete: {
    category: 'pesagem',
    name: '✅ Pesagem Completa',
    template: {
      type: 'button',
      header: { text: '✅ Pesagem Registrada!' },
      body: { text: '✅ *Dados registrados com sucesso!*\n\n⚖️ *Peso:* 72.5kg\n📏 *Cintura:* 85cm\n\n📊 *Variação desde última medição:*\n📉 Peso: -0.5kg\n📉 Cintura: -1cm\n\n🩺 *Dr. Vital diz:*\nÓtimo progresso! Continue mantendo hábitos saudáveis! 💪' },
      footer: { text: '🩺 Dr. Vital - MaxNutrition' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '📊 Ver Evolução', id: 'weigh_view_evolution' },
          { type: 'quick_reply', title: '📋 Menu', id: 'menu' }
        ]
      }
    }
  },
  weighing_evolution: {
    category: 'pesagem',
    name: '📈 Evolução Peso',
    template: {
      type: 'button',
      header: { text: '📈 Sua Evolução' },
      body: { text: '📊 *Últimas 4 semanas:*\n\n📅 14/01: 72.5kg | 📏 85cm\n📅 07/01: 73.0kg | 📏 86cm\n📅 31/12: 73.5kg | 📏 87cm\n📅 24/12: 74.0kg | 📏 88cm\n\n🎉 *Resultado:* Você perdeu 1.5kg\n\n💪 Ótimo progresso! Continue assim!' },
      footer: { text: '🩺 Dr. Vital - MaxNutrition' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '❓ Tirar dúvida', id: 'vital_question' },
          { type: 'quick_reply', title: '📋 Menu', id: 'menu' }
        ]
      }
    }
  },

  // === CHECK-IN ===
  daily_checkin: {
    category: 'checkin',
    name: '☀️ Check-in Diário',
    template: {
      type: 'button',
      header: { text: '☀️ Bom dia!' },
      body: { text: 'Como você está se sentindo hoje?\n\nSeu bem-estar é importante para acompanharmos sua jornada de saúde.' },
      footer: { text: '🌿 MaxNutrition' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '😊 Ótimo!', id: 'feeling_great' },
          { type: 'quick_reply', title: '😐 Normal', id: 'feeling_ok' },
          { type: 'quick_reply', title: '😔 Não muito bem', id: 'feeling_bad' }
        ]
      }
    }
  },
  checkin_great: {
    category: 'checkin',
    name: '🎉 Resposta Ótimo',
    template: {
      type: 'button',
      body: { text: '🎉 *Que maravilha!* Continue assim!\n\nSeu corpo agradece os cuidados que você tem dado a ele.' },
      footer: { text: '🌿 MaxNutrition' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '📸 Registrar Refeição', id: 'sofia_new_photo' },
          { type: 'quick_reply', title: '📋 Menu', id: 'menu' }
        ]
      }
    }
  },
  checkin_ok: {
    category: 'checkin',
    name: '💪 Resposta Normal',
    template: {
      type: 'button',
      body: { text: '💪 *Entendi!* Vamos trabalhar juntos para melhorar seu dia.\n\nQue tal começar com uma boa hidratação?' },
      footer: { text: '🌿 MaxNutrition' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '💧 Beber água', id: 'water_250ml' },
          { type: 'quick_reply', title: '💡 Dicas do Dia', id: 'sofia_tips' }
        ]
      }
    }
  },
  checkin_bad: {
    category: 'checkin',
    name: '💙 Resposta Não Bem',
    template: {
      type: 'button',
      body: { text: '💙 *Sinto muito que não esteja bem.*\n\nEstou aqui se precisar conversar. Lembre-se: dias difíceis passam.\n\nPosso te ajudar com algo?' },
      footer: { text: '🌿 MaxNutrition' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '💬 Conversar', id: 'vital_question' },
          { type: 'quick_reply', title: '📋 Menu', id: 'menu' }
        ]
      }
    }
  },

  // === SOFIA - NUTRIÇÃO ===
  sofia_analysis_complete: {
    category: 'sofia',
    name: '🍽️ Análise Concluída',
    template: {
      type: 'button',
      header: { text: '🍽️ Análise Concluída!' },
      body: { text: '*Alimentos identificados:*\nArroz, Feijão, Frango grelhado, Salada\n\n📊 *Resumo Nutricional:*\n• Calorias: 450 kcal\n• Proteínas: 35g\n• Carboidratos: 45g\n• Gorduras: 12g\n\n🟢 Pontuação: 85/100' },
      footer: { text: '🌿 Sofia - Sua Nutricionista IA' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '✅ Confirmar', id: 'sofia_confirm' },
          { type: 'quick_reply', title: '✏️ Corrigir', id: 'sofia_edit' },
          { type: 'quick_reply', title: '📊 Detalhes', id: 'sofia_details' }
        ]
      }
    }
  },
  sofia_post_confirm: {
    category: 'sofia',
    name: '✅ Análise Salva',
    template: {
      type: 'button',
      body: { text: '✅ *Análise salva com sucesso!*\n\nOs dados foram registrados no seu histórico nutricional.\n\nO que deseja fazer agora?' },
      footer: { text: '🌿 Sofia' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '📸 Nova Foto', id: 'sofia_new_photo' },
          { type: 'quick_reply', title: '💡 Dica do Dia', id: 'sofia_tips' },
          { type: 'quick_reply', title: '📋 Menu', id: 'menu' }
        ]
      }
    }
  },

  // === DR. VITAL - EXAMES ===
  vital_analysis_complete: {
    category: 'vital',
    name: '🔬 Exame Analisado',
    template: {
      type: 'button',
      header: { text: '🩺 Dr. Vital - Resultado' },
      body: { text: '🔬 *Análise de Hemograma Concluída!*\n\n🟢 *Status:* Tudo dentro do esperado\n\n📋 *Resumo:*\nSeus valores estão dentro da normalidade. Continue mantendo hábitos saudáveis.\n\n📌 *Principais achados:*\n• Hemoglobina: 14.5 g/dL (normal)\n• Glicose: 92 mg/dL (normal)\n• Colesterol: 185 mg/dL (normal)' },
      footer: { text: '⚕️ Dr. Vital - Seu Assistente de Saúde' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '✅ Entendi', id: 'vital_understood' },
          { type: 'quick_reply', title: '❓ Perguntar', id: 'vital_question' },
          { type: 'quick_reply', title: '📋 Relatório', id: 'vital_full_report' }
        ]
      }
    }
  },

  // === GERAL ===
  welcome: {
    category: 'geral',
    name: '👋 Boas-vindas',
    template: {
      type: 'button',
      header: { text: '🌿 Bem-vindo ao MaxNutrition!' },
      body: { text: 'Olá! 👋\n\nSou a *Sofia*, sua nutricionista virtual, e estou aqui para te ajudar a ter uma alimentação mais saudável!\n\n📸 *Envie uma foto* da sua refeição e eu analiso os nutrientes\n🩺 *Envie um exame* e o Dr. Vital explica os resultados\n💬 *Pergunte* qualquer dúvida sobre nutrição\n\nPor onde quer começar?' },
      footer: { text: '🌿 MaxNutrition' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '📸 Analisar Refeição', id: 'sofia_new_photo' },
          { type: 'quick_reply', title: '🍽️ Ver Cardápio', id: 'sofia_meal_plan' },
          { type: 'quick_reply', title: '❓ Ajuda', id: 'help' }
        ]
      }
    }
  },
  help: {
    category: 'geral',
    name: '❓ Ajuda',
    template: {
      type: 'button',
      header: { text: '❓ Como posso ajudar?' },
      body: { text: '🌿 *Olá! Sou a Sofia, sua nutricionista virtual.*\n\nPosso te ajudar com:\n\n📸 *Analisar refeições* - Envie uma foto\n🔬 *Interpretar exames* - Envie foto do exame\n🍽️ *Sugerir cardápios* - Personalizado pra você\n💧 *Lembrar de beber água*\n⚖️ *Acompanhar peso semanal*\n\nEnvie uma foto ou escolha uma opção!' },
      footer: { text: '🌿 Sofia - MaxNutrition' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '📸 Enviar Foto', id: 'sofia_new_photo' },
          { type: 'quick_reply', title: '🍽️ Ver Cardápio', id: 'sofia_meal_plan' },
          { type: 'quick_reply', title: '📋 Menu Completo', id: 'menu' }
        ]
      }
    }
  },
  menu_list: {
    category: 'geral',
    name: '📋 Menu (Lista)',
    template: {
      type: 'list',
      header: { text: '🌿 MaxNutrition' },
      body: { text: 'Olá! Como posso te ajudar hoje?\n\nEscolha uma opção abaixo:' },
      footer: { text: 'Sua saúde em primeiro lugar' },
      action: {
        button: 'Ver Menu',
        sections: [
          {
            title: '🍽️ Nutrição com Sofia',
            rows: [
              { id: 'menu_analyze', title: '📸 Analisar Refeição', description: 'Envie foto e receba análise' },
              { id: 'menu_meal_plan', title: '🍽️ Cardápio Semanal', description: 'Sugestões personalizadas' },
              { id: 'menu_tips', title: '💡 Dicas do Dia', description: 'Orientações nutricionais' }
            ]
          },
          {
            title: '🩺 Saúde com Dr. Vital',
            rows: [
              { id: 'menu_exam', title: '🔬 Analisar Exame', description: 'Envie foto do exame médico' },
              { id: 'menu_health_tips', title: '❤️ Dicas de Saúde', description: 'Orientações gerais' }
            ]
          }
        ]
      }
    }
  },

  // === CARDÁPIO ===
  meal_suggestion: {
    category: 'cardapio',
    name: '🍽️ Sugestão Refeição',
    template: {
      type: 'button',
      body: { text: '🍽️ *Sugestão para Almoço*\n\n*Frango Grelhado com Legumes*\n🔥 420 kcal\n\nPeito de frango grelhado com temperos naturais, acompanhado de legumes salteados e arroz integral.\n\n🥗 *Ingredientes:*\n• 150g peito de frango\n• 100g brócolis\n• 80g cenoura\n• 100g arroz integral\n• Azeite e temperos' },
      footer: { text: '🌿 Sofia' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '✅ Aceitar', id: 'meal_accept' },
          { type: 'quick_reply', title: '🔄 Outra opção', id: 'meal_change' },
          { type: 'quick_reply', title: '📝 Receita', id: 'meal_recipe' }
        ]
      }
    }
  },

  // === RELATÓRIO SEMANAL ===
  weekly_report: {
    category: 'relatorio',
    name: '📊 Relatório Semanal',
    template: {
      type: 'button',
      header: { text: '📅 Sua Semana' },
      body: { text: '📊 *Relatório Semanal*\n👤 João\n\n🔥 *Calorias totais:* 12.500 kcal\n📈 *Média diária:* 1.785 kcal\n🍽️ *Refeições registradas:* 18\n🟢 *Pontuação média:* 78/100\n\n🏆 *Alimentos mais consumidos:*\n1. Frango\n2. Arroz\n3. Salada\n\n💡 *Dica da semana:*\nAumente o consumo de vegetais verdes para melhorar a ingestão de fibras!' },
      footer: { text: '🌿 MaxNutrition' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '📊 Ver Detalhes', id: 'report_details' },
          { type: 'quick_reply', title: '🍽️ Novo Cardápio', id: 'sofia_meal_plan' }
        ]
      }
    }
  },

  // === ERROS ===
  error_image: {
    category: 'erro',
    name: '😅 Imagem Não Clara',
    template: {
      type: 'button',
      body: { text: '😅 *Ops! Não consegui ver bem a imagem.*\n\nDicas para uma foto melhor:\n• Boa iluminação\n• Comida centralizada\n• Sem muito desfoque\n\nTente novamente?' },
      footer: { text: '🌿 Sofia' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '📸 Nova Foto', id: 'sofia_new_photo' },
          { type: 'quick_reply', title: '❓ Ajuda', id: 'help' }
        ]
      }
    }
  }
};


const CATEGORIES = [
  { id: 'agua', name: '💧 Água', icon: Droplets },
  { id: 'pesagem', name: '⚖️ Pesagem', icon: Scale },
  { id: 'checkin', name: '☀️ Check-in', icon: CheckCircle },
  { id: 'sofia', name: '🍽️ Sofia', icon: MessageSquare },
  { id: 'vital', name: '🩺 Dr. Vital', icon: HelpCircle },
  { id: 'geral', name: '📋 Geral', icon: MessageSquare },
  { id: 'cardapio', name: '🍽️ Cardápio', icon: MessageSquare },
  { id: 'relatorio', name: '📊 Relatório', icon: TrendingUp },
  { id: 'erro', name: '⚠️ Erros', icon: XCircle },
];

const WhatsAppInteractiveTest = () => {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("agua");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const filteredTemplates = Object.entries(TEMPLATES).filter(
    ([_, t]) => t.category === selectedCategory
  );

  const sendTemplate = async () => {
    if (!phone) {
      toast({ title: "Erro", description: "Digite um número de telefone", variant: "destructive" });
      return;
    }
    if (!selectedTemplate) {
      toast({ title: "Erro", description: "Selecione um template", variant: "destructive" });
      return;
    }

    setLoading(true);
    const templateData = TEMPLATES[selectedTemplate as keyof typeof TEMPLATES];

    try {
      // Chama a edge function que envia direto via Whapi
      const { data: result, error } = await supabase.functions.invoke(
        "whatsapp-test-interactive",
        {
          body: {
            phone,
            type: 'custom',
            customTemplate: templateData.template
          },
        }
      );

      if (error) throw error;

      const testResult: TestResult = {
        success: result.success,
        messageId: result.whapi_response?.message?.id,
        error: result.error || result.details?.message,
        templateName: templateData.name,
        timestamp: new Date().toLocaleTimeString(),
      };

      setResults(prev => [testResult, ...prev.slice(0, 9)]);

      toast({
        title: result.success ? "✅ Enviado!" : "❌ Erro",
        description: result.success 
          ? `${templateData.name} enviado com sucesso`
          : result.error || result.details?.message || "Falha ao enviar",
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Teste de Templates Interativos
          </CardTitle>
          <CardDescription>
            Envie templates diretamente via Whapi API com botões clicáveis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número WhatsApp</Label>
              <Input
                placeholder="5511999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">55 + DDD + número</p>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedTemplate(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template..." />
              </SelectTrigger>
              <SelectContent>
                {filteredTemplates.map(([key, t]) => (
                  <SelectItem key={key} value={key}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-48">
                {JSON.stringify(TEMPLATES[selectedTemplate as keyof typeof TEMPLATES].template, null, 2)}
              </pre>
            </div>
          )}

          <Button 
            onClick={sendTemplate} 
            disabled={loading || !phone || !selectedTemplate}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Enviar Template
          </Button>
        </CardContent>
      </Card>


      {/* Quick Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Envio Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(TEMPLATES).slice(0, 8).map(([key, t]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                disabled={loading || !phone}
                onClick={() => { setSelectedTemplate(key); }}
                className="text-xs"
              >
                {t.name.split(' ').slice(0, 2).join(' ')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Últimos Envios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhum envio ainda</p>
          ) : (
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {r.success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                    <div>
                      <p className="font-medium text-sm">{r.templateName}</p>
                      <p className="text-xs text-muted-foreground">{r.timestamp}</p>
                    </div>
                  </div>
                  {r.messageId && <Badge variant="secondary" className="text-xs">{r.messageId.slice(0, 8)}...</Badge>}
                  {r.error && <Badge variant="destructive" className="text-xs">{r.error.slice(0, 20)}...</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppInteractiveTest;
