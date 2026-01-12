/**
 * EditConnectionProfileModal - Modal para editar perfil de conexões/relacionamento
 * 
 * Permite editar: foto, nome, idade, cidade, status, objetivo, bio, interesses, buscando
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Camera, MapPin, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface EditConnectionProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

const OBJECTIVES = [
  { value: 'Ganhar massa muscular', label: '💪 Ganhar massa muscular' },
  { value: 'Perder peso', label: '⚖️ Perder peso' },
  { value: 'Melhorar condicionamento', label: '🏃 Melhorar condicionamento' },
  { value: 'Bem-estar e saúde', label: '🧘 Bem-estar e saúde' },
  { value: 'Definição muscular', label: '🎯 Definição muscular' },
];

const STATUS_OPTIONS = [
  { value: 'Solteiro(a)', label: '💚 Solteiro(a)' },
  { value: 'Namorando', label: '❤️ Namorando' },
  { value: 'Casado(a)', label: '💍 Casado(a)' },
  { value: 'Não informar', label: '🤐 Não informar' },
];

const INTERESTS = [
  { value: 'Musculação', emoji: '💪' },
  { value: 'Corrida', emoji: '🏃' },
  { value: 'Alimentação', emoji: '🥗' },
  { value: 'Yoga', emoji: '🧘' },
  { value: 'Natação', emoji: '🏊' },
  { value: 'Ciclismo', emoji: '🚴' },
  { value: 'Funcional', emoji: '🏋️' },
  { value: 'Crossfit', emoji: '💥' },
];

const LOOKING_FOR = [
  { value: 'Parceiro de treino', label: 'Parceiro de treino' },
  { value: 'Amizade', label: 'Amizade' },
  { value: 'Relacionamento', label: '💕 Relacionamento' },
];

export function EditConnectionProfileModal({ open, onOpenChange, onSave }: EditConnectionProfileModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('Solteiro(a)');
  const [objective, setObjective] = useState('Ganhar massa muscular');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>(['Musculação']);
  const [lookingFor, setLookingFor] = useState<string[]>(['Parceiro de treino']);

  // Load existing profile data
  useEffect(() => {
    if (open && user) {
      loadProfile();
    }
  }, [open, user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
        setAvatarUrl(profile.avatar_url);
        setCity(profile.city || '');
        setBio(profile.bio || '');
        
        // Idade do perfil
        if (profile.age) setAge(profile.age);
        
        // Campos extras armazenados em social_data (jsonb) se existir
        const socialData = (profile as any).social_data;
        if (socialData) {
          if (socialData.relationship_status) setStatus(socialData.relationship_status);
          if (socialData.fitness_objective) setObjective(socialData.fitness_objective);
          if (socialData.interests) setInterests(socialData.interests);
          if (socialData.looking_for) setLookingFor(socialData.looking_for);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Salvar dados básicos + social_data como JSON
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          city,
          bio,
          age: age || null,
          social_data: {
            relationship_status: status,
            fitness_objective: objective,
            interests,
            looking_for: lookingFor,
          },
          updated_at: new Date().toISOString(),
        } as any)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado!');
      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleLookingFor = (item: string) => {
    setLookingFor(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden max-h-[95vh] overflow-y-auto bg-card rounded-3xl">
        {/* Header com foto */}
        <div className="relative h-80 bg-gradient-to-b from-gray-800 to-gray-900">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={fullName}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Avatar className="w-40 h-40">
                <AvatarFallback className="text-5xl bg-primary/20 text-primary">
                  {fullName.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          
          {/* Gradiente overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Botão trocar foto */}
          <button className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-black/60 transition-colors">
            <Camera className="w-5 h-5" />
          </button>
          
          {/* Info sobre a foto */}
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{fullName || 'Seu Nome'}</span>
              {age && <span className="text-xl font-normal">{age}</span>}
              <span className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            {city && (
              <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                <MapPin className="w-4 h-4" />
                {city}
              </div>
            )}
          </div>
        </div>

        {/* Formulário */}
        <div className="p-5 space-y-5">
          {/* Interesses */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              Interesses
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {INTERESTS.map(item => (
                <button
                  key={item.value}
                  onClick={() => toggleInterest(item.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                    interests.includes(item.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {item.emoji} {item.value}
                </button>
              ))}
              <button className="px-3 py-1.5 rounded-full text-sm bg-muted text-muted-foreground hover:bg-muted/80">
                + Adicionar
              </button>
            </div>
          </div>

          {/* Objetivo */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              🎯 Objetivo
            </Label>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OBJECTIVES.map(obj => (
                  <SelectItem key={obj.value} value={obj.value}>
                    {obj.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Idade e Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                🎂 Idade
              </Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="28"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                💑 Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cidade */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              🏙️ Cidade
            </Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="São Paulo, SP"
              className="mt-1"
            />
          </div>

          {/* Sobre mim */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              📝 Sobre mim
            </Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Apaixonado por treinos e vida saudável. Buscando pessoas para treinar junto! 💪"
              className="mt-1 resize-none"
              rows={3}
            />
          </div>

          {/* Buscando */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              🔍 Buscando
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {LOOKING_FOR.map(item => (
                <label
                  key={item.value}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all",
                    lookingFor.includes(item.value)
                      ? item.value === 'Relacionamento' 
                        ? "bg-pink-500/20 text-pink-500 border border-pink-500/30"
                        : "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <Checkbox
                    checked={lookingFor.includes(item.value)}
                    onCheckedChange={() => toggleLookingFor(item.value)}
                    className="border-current"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botão Salvar */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-6 text-base"
          >
            {saving ? 'Salvando...' : '✅ Salvar Perfil'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EditConnectionProfileModal;
