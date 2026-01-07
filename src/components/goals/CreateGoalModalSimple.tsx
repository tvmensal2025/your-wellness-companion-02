import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, MessageCircle } from 'lucide-react';

interface CreateGoalModalSimpleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGoalModalSimple({ open, onOpenChange }: CreateGoalModalSimpleProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    target_value: 1,
    unit: 'unidade',
    difficulty: 'facil',
    target_date: ''
  });
  
  const [reminderSettings, setReminderSettings] = useState({
    reminder_enabled: false,
    reminder_frequency: 'weekly',
    reminder_day: 1,
    send_whatsapp: true
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Criar a meta
      const { data: goal, error: goalError } = await supabase
        .from("user_goals")
        .insert({
          ...formData,
          user_id: user.id,
          status: "pendente",
          current_value: 0,
          estimated_points: 100,
        })
        .select('id')
        .single();

      if (goalError) throw goalError;

      // Se lembrete habilitado, criar na tabela goal_reminders
      if (reminderSettings.reminder_enabled && goal) {
        const { error: reminderError } = await supabase
          .from("goal_reminders")
          .insert({
            goal_id: goal.id,
            user_id: user.id,
            reminder_enabled: true,
            reminder_frequency: reminderSettings.reminder_frequency,
            reminder_day: reminderSettings.reminder_day,
            send_whatsapp: reminderSettings.send_whatsapp,
            reminder_time: '09:00'
          });

        if (reminderError) {
          console.error('Erro ao criar lembrete:', reminderError);
        }
      }

      toast({
        title: "Meta criada com sucesso!",
        description: reminderSettings.reminder_enabled 
          ? "Sua meta foi criada e você receberá lembretes via WhatsApp."
          : "Sua meta foi enviada para aprovação administrativa.",
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro ao criar meta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      target_value: 1,
      unit: 'unidade',
      difficulty: 'facil',
      target_date: ''
    });
    setReminderSettings({
      reminder_enabled: false,
      reminder_frequency: 'weekly',
      reminder_day: 1,
      send_whatsapp: true
    });
  };

  const getDayOptions = () => {
    if (reminderSettings.reminder_frequency === 'weekly') {
      return [
        { value: 1, label: 'Segunda-feira' },
        { value: 2, label: 'Terça-feira' },
        { value: 3, label: 'Quarta-feira' },
        { value: 4, label: 'Quinta-feira' },
        { value: 5, label: 'Sexta-feira' },
        { value: 6, label: 'Sábado' },
        { value: 7, label: 'Domingo' },
      ];
    }
    if (reminderSettings.reminder_frequency === 'monthly') {
      return Array.from({ length: 28 }, (_, i) => ({
        value: i + 1,
        label: `Dia ${i + 1}`
      }));
    }
    return [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto" aria-describedby="create-goal-simple-description">
        <DialogHeader>
          <DialogTitle>Criar Nova Meta</DialogTitle>
          <p id="create-goal-simple-description" className="sr-only">
            Formulário simplificado para criar uma nova meta
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Título da meta"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          
          <Textarea
            placeholder="Descrição da meta"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
          
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="saude">Saúde</SelectItem>
              <SelectItem value="exercicio">Exercício</SelectItem>
              <SelectItem value="alimentacao">Alimentação</SelectItem>
              <SelectItem value="bem-estar">Bem-estar</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Valor alvo"
              value={formData.target_value}
              onChange={(e) => setFormData(prev => ({ ...prev, target_value: parseInt(e.target.value) || 1 }))}
              min="1"
            />
            <Input
              placeholder="Unidade"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            />
          </div>
          
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="facil">Fácil</SelectItem>
              <SelectItem value="medio">Médio</SelectItem>
              <SelectItem value="dificil">Difícil</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="date"
            value={formData.target_date}
            onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
          />

          {/* Seção de Lembretes */}
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bell className="h-4 w-4 text-primary" />
              Configurar Lembretes
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reminder_enabled"
                checked={reminderSettings.reminder_enabled}
                onCheckedChange={(checked) => 
                  setReminderSettings(prev => ({ ...prev, reminder_enabled: checked as boolean }))
                }
              />
              <Label htmlFor="reminder_enabled" className="text-sm cursor-pointer">
                Quero receber lembretes desta meta
              </Label>
            </div>

            {reminderSettings.reminder_enabled && (
              <div className="space-y-3 pl-6 animate-in fade-in slide-in-from-top-2">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Frequência</Label>
                  <Select
                    value={reminderSettings.reminder_frequency}
                    onValueChange={(value) => setReminderSettings(prev => ({ 
                      ...prev, 
                      reminder_frequency: value,
                      reminder_day: 1 
                    }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {reminderSettings.reminder_frequency !== 'daily' && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      {reminderSettings.reminder_frequency === 'weekly' ? 'Dia da semana' : 'Dia do mês'}
                    </Label>
                    <Select
                      value={reminderSettings.reminder_day.toString()}
                      onValueChange={(value) => setReminderSettings(prev => ({ 
                        ...prev, 
                        reminder_day: parseInt(value) 
                      }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getDayOptions().map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send_whatsapp"
                    checked={reminderSettings.send_whatsapp}
                    onCheckedChange={(checked) => 
                      setReminderSettings(prev => ({ ...prev, send_whatsapp: checked as boolean }))
                    }
                  />
                  <Label htmlFor="send_whatsapp" className="text-sm cursor-pointer flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                    Receber via WhatsApp
                  </Label>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Criando...' : 'Criar Meta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
