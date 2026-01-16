import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, Brain, FileText, Mail, MessageSquare, Heart, Utensils, Target, Phone, Image, Stethoscope, Smile, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AIConfigModal } from '@/components/AIConfigModal';

interface AIConfiguration {
  id: string;
  functionality: string;
  service_name: string;
  model: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
  preset_level: string;
  system_prompt?: string;
  personality?: string;
}

const functionalities = [
  {
    key: 'chat_daily',
    title: 'Chat Diário',
    description: 'Conversas e orientações personalizadas',
    icon: MessageSquare,
    color: 'bg-blue-50 border-blue-200'
  },
  {
    key: 'weekly_report',
    title: 'Relatórios Semanais',
    description: 'Análises e insights semanais automáticos',
    icon: FileText,
    color: 'bg-green-50 border-green-200'
  },
  {
    key: 'monthly_report',
    title: 'Relatórios Mensais',
    description: 'Relatórios mensais completos e detalhados',
    icon: FileText,
    color: 'bg-purple-50 border-purple-200'
  },
  {
    key: 'medical_analysis',
    title: 'Análise Médica',
    description: 'Interpretação inteligente de exames médicos',
    icon: Heart,
    color: 'bg-red-50 border-red-200'
  },
  {
    key: 'preventive_analysis',
    title: 'Análise Preventiva',
    description: 'Identificação precoce de riscos à saúde',
    icon: Brain,
    color: 'bg-orange-50 border-orange-200'
  },
  {
    key: 'food_analysis',
    title: 'Análise Alimentar',
    description: 'Avaliação nutricional de refeições via foto',
    icon: Utensils,
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    key: 'image_analysis',
    title: 'Análise de Imagens',
    description: 'Análise detalhada de imagens com IA',
    icon: Image,
    color: 'bg-cyan-50 border-cyan-200'
  },
  {
    key: 'medical_exam_analysis',
    title: 'Extração de Exames',
    description: 'Extração automática de dados de exames',
    icon: Stethoscope,
    color: 'bg-rose-50 border-rose-200'
  },
  {
    key: 'daily_missions',
    title: 'Missões Diárias',
    description: 'Geração inteligente de tarefas personalizadas',
    icon: Target,
    color: 'bg-indigo-50 border-indigo-200'
  },
  {
    key: 'whatsapp_reports',
    title: 'Relatórios WhatsApp',
    description: 'Envio automático via WhatsApp Business',
    icon: Phone,
    color: 'bg-green-50 border-green-200'
  },
  {
    key: 'email_reports',
    title: 'Relatórios Email',
    description: 'Envio personalizado de relatórios por email',
    icon: Mail,
    color: 'bg-blue-50 border-blue-200'
  },
  {
    key: 'simple_messages',
    title: 'Mensagens Simples (Ollama)',
    description: '💚 GRÁTIS - Saudações e respostas simples',
    icon: Smile,
    color: 'bg-emerald-100 border-emerald-300'
  }
];

const AIControlPanelUnified = () => {
  const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState<AIConfiguration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activating, setActivating] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<{ ok: boolean; models?: number } | null>(null);

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_configurations')
        .select('*');

      if (error) throw error;

      setConfigurations((data || []).map((config: any) => ({
        ...config,
        service_name: config.service || 'openai',
        is_active: config.is_enabled || false,
        preset_level: config.level || 'maximo',
        personality: config.personality || 'genérico'
      })));
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      setActivating(true);
      const { data, error } = await supabase.functions.invoke('activate-ai');
      if (error) throw error;
      
      const lovableOk = data?.lovable?.ok ? '✅' : '❌';
      const openaiOk = data?.openai?.ok ? '✅' : '❌';
      const googleOk = data?.google?.ok ? '✅' : '❌';
      const ollamaOk = data?.ollama?.ok ? '✅' : '❌';
      
      // Atualizar status do Ollama
      if (data?.ollama) {
        setOllamaStatus({ ok: data.ollama.ok, models: data.ollama.models });
      }
      
      toast.success(`IA ativada: Lovable ${lovableOk} • OpenAI ${openaiOk} • Google ${googleOk} • Ollama ${ollamaOk}`);
      
      if (data?.summary?.recommended_service) {
        toast.info(`Serviço recomendado: ${data.summary.recommended_service.toUpperCase()}`);
      }
      
      await loadConfigurations();
    } catch (err) {
      console.error('Erro ao ativar IA:', err);
      toast.error('Falha ao ativar IA. Verifique os logs.');
    } finally {
      setActivating(false);
    }
  };

  const toggleAI = async (functionality: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_configurations')
        .update({ 
          is_enabled: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('functionality', functionality);

      if (error) throw error;

      setConfigurations(prev =>
        prev.map(config =>
          config.functionality === functionality
            ? { ...config, is_active: !currentStatus }
            : config
        )
      );

      toast.success(`IA ${!currentStatus ? 'ativada' : 'desativada'} com sucesso`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status da IA');
    }
  };

  const openConfigModal = (functionality: string) => {
    let config = configurations.find(c => c.functionality === functionality);
    
    if (!config) {
      // Definir personalidade padrão baseada na funcionalidade
      const defaultPersonality = functionality.includes('medical') || functionality.includes('preventive') 
        ? 'drvital' 
        : functionality === 'simple_messages' 
          ? 'sofia' 
          : 'sofia';
      
      config = {
        id: `temp-${functionality}`,
        functionality,
        service_name: functionality === 'simple_messages' ? 'ollama' : 'lovable',
        model: functionality === 'simple_messages' ? 'llama3.2:3b' : 'google/gemini-2.5-flash',
        max_tokens: 4096,
        temperature: 0.8,
        is_active: false,
        preset_level: 'maximo',
        personality: defaultPersonality,
        system_prompt: `Você é um assistente especializado em ${functionality.replace('_', ' ')}. Sua função é fornecer respostas precisas e úteis.`
      };
    }
    
    setSelectedConfig(config);
    setIsModalOpen(true);
  };

  const saveConfiguration = async (config: AIConfiguration) => {
    try {
      const configData = {
        functionality: config.functionality,
        service: config.service_name,
        model: config.model,
        max_tokens: Math.max(50, config.max_tokens), // Garantir mínimo de 50
        temperature: Math.round(config.temperature * 10) / 10, // Arredondar temperatura
        is_enabled: config.is_active,
        level: config.preset_level,
        system_prompt: config.system_prompt,
        personality: config.personality,
        updated_at: new Date().toISOString()
      };

      // Sempre usar upsert para garantir que a configuração seja criada ou atualizada
      const { error } = await supabase
        .from('ai_configurations')
        .upsert(configData, {
          onConflict: 'functionality'
        });

      if (error) throw error;

      await loadConfigurations();
      toast.success('Configuração salva com sucesso');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  const getConfigForFunctionality = (functionality: string) => {
    return configurations.find(c => c.functionality === functionality);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle Unificado de IA</h1>
            <p className="text-muted-foreground">Gerencie todas as funcionalidades de IA em um só lugar</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleActivate} disabled={activating}>
            {activating ? 'Ativando IA...' : 'Validar chaves e ativar IA'}
          </Button>
          <Button variant="outline" onClick={loadConfigurations}>
            Recarregar
          </Button>
        </div>
      </div>

      {/* Ollama Status Card */}
      {ollamaStatus && (
        <Card className="mb-6 bg-emerald-50 border-emerald-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${ollamaStatus.ok ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <div>
                  <span className="font-semibold text-emerald-800">
                    Ollama {ollamaStatus.ok ? 'Online' : 'Offline'}
                  </span>
                  <span className="text-sm text-emerald-600 ml-2">
                    {ollamaStatus.models ? `${ollamaStatus.models} modelos disponíveis` : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-700 font-medium">
                  Economia: Mensagens simples são processadas gratuitamente
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {functionalities.map((func) => {
          const config = getConfigForFunctionality(func.key);
          const IconComponent = func.icon;
          
          return (
            <Card key={func.key} className={`${func.color} hover:shadow-lg transition-shadow`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <IconComponent className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{func.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{func.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openConfigModal(func.key)}
                    className="h-8 w-8 p-0"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={config?.is_active ? "default" : "secondary"}>
                      {config?.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                    <Switch
                      checked={config?.is_active || false}
                      onCheckedChange={() => toggleAI(func.key, config?.is_active || false)}
                    />
                    {config && (
                       <span className="text-xs text-muted-foreground">
                         {config.service_name || 'openai'} • {config.model || 'gpt-4o'}
                       </span>
                     )}
                  </div>
                </div>
                
                {config && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Tokens: {config.max_tokens}</span>
                      <span>Temp: {config.temperature}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground/70">
                      <span>Nível: {config.preset_level}</span>
                      <span>{config.personality || 'genérico'}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground/50 flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      Edite as configurações acima
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AIConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={selectedConfig}
        onSave={saveConfiguration}
      />
    </div>
  );
};

export default AIControlPanelUnified;