import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, Zap, Brain, Cpu } from 'lucide-react';

interface AIConfiguration {
  id: string;
  functionality: string;
  service_name: string;
  model: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
  preset_level: string;
  personality?: string;
  system_prompt?: string;
}

// Personalidades disponíveis
const personalityOptions = [
  { 
    value: 'sofia', 
    label: 'Sofia 🥗', 
    description: 'Nutricionista virtual - empática, motivacional e acolhedora',
    color: 'bg-green-50 border-green-200 text-green-700'
  },
  { 
    value: 'drvital', 
    label: 'Dr. Vital 🩺', 
    description: 'Médico virtual - profissional, seguro e baseado em evidências',
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  { 
    value: 'generico', 
    label: 'Genérico 🤖', 
    description: 'Assistente neutro - versátil para qualquer funcionalidade',
    color: 'bg-gray-50 border-gray-200 text-gray-700'
  }
];

// Níveis de preset
const presetLevelOptions = [
  { 
    value: 'minimo', 
    label: 'Mínimo 💰', 
    description: 'Econômico - respostas curtas (512-1024 tokens)',
    tokens: 1024,
    temperature: 0.5
  },
  { 
    value: 'medio', 
    label: 'Médio ⚖️', 
    description: 'Equilibrado - bom custo/benefício (2048-4096 tokens)',
    tokens: 4096,
    temperature: 0.7
  },
  { 
    value: 'maximo', 
    label: 'Máximo 🚀', 
    description: 'Premium - respostas completas (4096-8192 tokens)',
    tokens: 8192,
    temperature: 0.8
  }
];

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIConfiguration | null;
  onSave: (config: AIConfiguration) => void;
}

// Modelos disponíveis por serviço
interface ModelOption {
  value: string;
  label: string;
  description: string;
  recommended?: boolean;
}

const serviceModels: Record<string, ModelOption[]> = {
  lovable: [
    { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Balanceado: rápido e eficiente', recommended: true },
    { value: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', description: 'Mais rápido e econômico' },
    { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Mais poderoso para tarefas complexas' },
    { value: 'google/gemini-3-pro-preview', label: 'Gemini 3 Pro Preview', description: 'Nova geração experimental' },
    { value: 'openai/gpt-5', label: 'GPT-5', description: 'Mais preciso e avançado' },
    { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini', description: 'Balanceado custo/performance' },
    { value: 'openai/gpt-5-nano', label: 'GPT-5 Nano', description: 'Rápido e econômico' },
  ],
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o', description: 'Modelo mais recente', recommended: true },
    { value: 'gpt-4', label: 'GPT-4', description: 'Alta precisão' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Rápido e econômico' },
    { value: 'o1-pro', label: 'O1 Pro', description: 'Raciocínio avançado' },
  ],
  gemini: [
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Alta capacidade', recommended: true },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Rápido e eficiente' },
  ],
  ollama: [
    { value: 'llama3.1:8b-instruct-q5_K_M', label: 'Llama 3.1 8B', description: 'Local, sem custo', recommended: true },
    { value: 'deepseek-r1:8b', label: 'DeepSeek R1', description: 'Raciocínio local' },
    { value: 'qwen2.5', label: 'Qwen 2.5', description: 'Multilingue' },
    { value: 'mistral', label: 'Mistral', description: 'Eficiente' },
  ]
};

const serviceInfo = {
  lovable: { 
    icon: Sparkles, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50', 
    borderColor: 'border-purple-200',
    label: 'Lovable AI',
    description: 'IA integrada - sem necessidade de API key'
  },
  openai: { 
    icon: Brain, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200',
    label: 'OpenAI',
    description: 'Requer OPENAI_API_KEY configurada'
  },
  gemini: { 
    icon: Zap, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-200',
    label: 'Google Gemini',
    description: 'Requer GOOGLE_AI_API_KEY configurada'
  },
  ollama: { 
    icon: Cpu, 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-200',
    label: 'Ollama',
    description: 'Modelos locais - sem custo de API'
  }
};

export const AIConfigModal: React.FC<AIConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [localConfig, setLocalConfig] = useState<AIConfiguration | null>(config);

  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!localConfig) return null;

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const handleServiceChange = (service: string) => {
    const models = serviceModels[service as keyof typeof serviceModels] || [];
    const defaultModel = models.find(m => m.recommended)?.value || models[0]?.value || '';
    setLocalConfig({ 
      ...localConfig, 
      service_name: service,
      model: defaultModel
    });
  };

  const getFunctionTitle = (functionality: string) => {
    const titles: Record<string, string> = {
      chat_daily: 'Chat Diário',
      weekly_report: 'Relatórios Semanais', 
      monthly_report: 'Relatórios Mensais',
      medical_analysis: 'Análise Médica',
      preventive_analysis: 'Análise Preventiva',
      food_analysis: 'Análise Alimentar',
      daily_missions: 'Missões Diárias',
      whatsapp_reports: 'Relatórios WhatsApp',
      email_reports: 'Relatórios Email',
      image_analysis: 'Análise de Imagens',
      medical_exam_analysis: 'Extração de Exames',
      simple_messages: 'Mensagens Simples (Ollama)'
    };
    return titles[functionality] || functionality;
  };

  const handlePresetChange = (preset: typeof presetLevelOptions[0]) => {
    setLocalConfig({
      ...localConfig,
      preset_level: preset.value,
      max_tokens: preset.tokens,
      temperature: preset.temperature
    });
  };

  const currentService = serviceInfo[localConfig.service_name as keyof typeof serviceInfo] || serviceInfo.lovable;
  const currentModels = serviceModels[localConfig.service_name as keyof typeof serviceModels] || serviceModels.lovable;
  const ServiceIcon = currentService.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="config-dialog-description">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ServiceIcon className={`h-5 w-5 ${currentService.color}`} />
              Configuração: {getFunctionTitle(localConfig.functionality)}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <div id="config-dialog-description" className="sr-only">
            Modal para configuração avançada de parâmetros da IA
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna Esquerda - Status e Serviço */}
          <div className="space-y-6">
            {/* Status */}
            <div>
              <h3 className="font-semibold mb-4">Status</h3>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Funcionalidade Ativa</span>
                <Switch
                  checked={localConfig.is_active}
                  onCheckedChange={(checked) =>
                    setLocalConfig({ ...localConfig, is_active: checked })
                  }
                />
              </div>
            </div>

            {/* Seleção de Serviço */}
            <div>
              <h3 className="font-semibold mb-4">Serviço de IA</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(serviceInfo).map(([key, info]) => {
                  const Icon = info.icon;
                  const isSelected = localConfig.service_name === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleServiceChange(key)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected 
                          ? `${info.bgColor} ${info.borderColor} ring-2 ring-offset-1 ring-${info.color.replace('text-', '')}`
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-4 w-4 ${isSelected ? info.color : 'text-gray-500'}`} />
                        <span className={`font-medium text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                          {info.label}
                        </span>
                        {key === 'lovable' && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-purple-100 text-purple-700">
                            Recomendado
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{info.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seleção de Modelo */}
            <div>
              <h3 className="font-semibold mb-4">Modelo</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {currentModels.map((model) => (
                  <button
                    key={model.value}
                    onClick={() => setLocalConfig({ ...localConfig, model: model.value })}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      localConfig.model === model.value
                        ? `${currentService.bgColor} ${currentService.borderColor}`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{model.label}</span>
                      {model.recommended && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          Recomendado
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{model.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Seleção de Personalidade */}
            <div>
              <h3 className="font-semibold mb-4">Personalidade</h3>
              <div className="space-y-2">
                {personalityOptions.map((personality) => (
                  <button
                    key={personality.value}
                    onClick={() => setLocalConfig({ ...localConfig, personality: personality.value })}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      localConfig.personality === personality.value
                        ? personality.color + ' ring-2 ring-offset-1'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-sm">{personality.label}</span>
                    <p className="text-xs text-gray-500 mt-1">{personality.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Seleção de Nível */}
            <div>
              <h3 className="font-semibold mb-4">Nível de Resposta</h3>
              <div className="space-y-2">
                {presetLevelOptions.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetChange(preset)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      localConfig.preset_level === preset.value
                        ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-200 ring-offset-1'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{preset.label}</span>
                      <span className="text-xs text-gray-500 font-mono">{preset.tokens} tokens</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Direita - Parâmetros e Prompt */}
          <div className="space-y-6">
            {/* Parâmetros */}
            <div>
              <h3 className="font-semibold mb-4">Parâmetros</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tokens Máximos: <span className="font-mono text-purple-600">{localConfig.max_tokens}</span>
                  </label>
                  <Slider
                    value={[localConfig.max_tokens]}
                    onValueChange={([value]) =>
                      setLocalConfig({ ...localConfig, max_tokens: Math.max(50, value) })
                    }
                    max={8192}
                    min={50}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50 (curto)</span>
                    <span>8192 (longo)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Temperatura: <span className="font-mono text-purple-600">{localConfig.temperature}</span>
                  </label>
                  <Slider
                    value={[localConfig.temperature]}
                    onValueChange={([value]) =>
                      setLocalConfig({ ...localConfig, temperature: Math.round(value * 10) / 10 })
                    }
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.0 (preciso)</span>
                    <span>2.0 (criativo)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo da Configuração */}
            <div className={`p-4 rounded-lg ${currentService.bgColor} ${currentService.borderColor} border`}>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <ServiceIcon className={`h-4 w-4 ${currentService.color}`} />
                Configuração Atual
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Serviço:</span>
                  <span className="font-medium">{currentService.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Modelo:</span>
                  <span className="font-mono text-xs">{localConfig.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Personalidade:</span>
                  <span className="font-medium">
                    {personalityOptions.find(p => p.value === localConfig.personality)?.label || 'Não definida'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nível:</span>
                  <span className="font-medium">
                    {presetLevelOptions.find(p => p.value === localConfig.preset_level)?.label || localConfig.preset_level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tokens:</span>
                  <span className="font-mono">{localConfig.max_tokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Temperatura:</span>
                  <span className="font-mono">{localConfig.temperature}</span>
                </div>
              </div>
            </div>

            {/* Prompt do Sistema */}
            <div>
              <h3 className="font-semibold mb-4">Prompt do Sistema</h3>
              <textarea
                value={localConfig.system_prompt || `Você é um assistente especializado em ${getFunctionTitle(localConfig.functionality).toLowerCase()}. Sua função é fornecer respostas precisas e úteis.`}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, system_prompt: e.target.value })
                }
                className="w-full h-32 p-3 border rounded-md text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Digite o prompt do sistema para esta funcionalidade..."
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            <Sparkles className="h-4 w-4 mr-2" />
            Salvar Configuração
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
