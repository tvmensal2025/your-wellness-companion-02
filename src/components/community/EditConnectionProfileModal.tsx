/**
 * EditConnectionProfileModal - Modal para editar perfil de conexões/relacionamento
 * 
 * Permite editar: foto, nome, idade, cidade, status, objetivos, bio, interesses, buscando
 * Suporta múltiplas seleções e adição de itens personalizados
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Camera, MapPin, Plus, X, Users, TrendingDown, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ThemeSelector } from '@/components/theme/ThemeSelector';

interface EditConnectionProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

const DEFAULT_OBJECTIVES = [
  { value: 'Ganhar massa', emoji: '💪' },
  { value: 'Emagrecer', emoji: '⚖️' },
  { value: 'Condicionamento', emoji: '🏃' },
  { value: 'Bem-estar', emoji: '🧘' },
  { value: 'Definição', emoji: '🎯' },
];

const STATUS_OPTIONS = [
  { value: 'Solteiro(a)', label: '💚 Solteiro(a)' },
  { value: 'Namorando', label: '❤️ Namorando' },
  { value: 'Casado(a)', label: '💍 Casado(a)' },
  { value: 'Não informar', label: '🤐 Não informar' },
];

const DEFAULT_INTERESTS = [
  { value: 'Musculação', emoji: '💪' },
  { value: 'Corrida', emoji: '🏃' },
  { value: 'Alimentação', emoji: '🥗' },
  { value: 'Yoga', emoji: '🧘' },
  { value: 'Natação', emoji: '🏊' },
  { value: 'Ciclismo', emoji: '🚴' },
  { value: 'Funcional', emoji: '🏋️' },
  { value: 'Crossfit', emoji: '💥' },
];

const DEFAULT_LOOKING_FOR = [
  { value: 'Parceiro de treino', emoji: '🤝' },
  { value: 'Amizade', emoji: '👋' },
  { value: 'Relacionamento', emoji: '💕' },
];

export function EditConnectionProfileModal({ open, onOpenChange, onSave }: EditConnectionProfileModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Custom items input
  const [newInterest, setNewInterest] = useState('');
  const [newLookingFor, setNewLookingFor] = useState('');
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [customLookingFor, setCustomLookingFor] = useState<string[]>([]);
  
  // Form state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('Solteiro(a)');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  
  // Privacy settings
  const [autoAcceptFollowers, setAutoAcceptFollowers] = useState(true);
  const [showWeightProgress, setShowWeightProgress] = useState(true);

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
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
        setAvatarUrl(profile.avatar_url);
        setCity((profile as any).city || '');
        setBio(profile.bio || '');
        
        // Campos extras armazenados em social_data (jsonb)
        const socialData = (profile as any).social_data;
        if (socialData) {
          if (socialData.relationship_status) setStatus(socialData.relationship_status);
          if (socialData.objectives) setObjectives(socialData.objectives);
          if (socialData.interests) setInterests(socialData.interests);
          if (socialData.looking_for) setLookingFor(socialData.looking_for);
          if (socialData.custom_interests) setCustomInterests(socialData.custom_interests);
          if (socialData.custom_looking_for) setCustomLookingFor(socialData.custom_looking_for);
          if (typeof socialData.auto_accept_followers === 'boolean') setAutoAcceptFollowers(socialData.auto_accept_followers);
          if (typeof socialData.show_weight_progress === 'boolean') setShowWeightProgress(socialData.show_weight_progress);
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
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio,
          social_data: {
            relationship_status: status,
            objectives,
            interests,
            looking_for: lookingFor,
            custom_interests: customInterests,
            custom_looking_for: customLookingFor,
            auto_accept_followers: autoAcceptFollowers,
            show_weight_progress: showWeightProgress,
          },
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', user.id);

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

  const toggleObjective = (obj: string) => {
    setObjectives(prev => 
      prev.includes(obj) 
        ? prev.filter(o => o !== obj)
        : [...prev, obj]
    );
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

  const addCustomInterest = () => {
    if (newInterest.trim() && !customInterests.includes(newInterest.trim())) {
      const trimmed = newInterest.trim();
      setCustomInterests(prev => [...prev, trimmed]);
      setInterests(prev => [...prev, trimmed]);
      setNewInterest('');
    }
  };

  const removeCustomInterest = (interest: string) => {
    setCustomInterests(prev => prev.filter(i => i !== interest));
    setInterests(prev => prev.filter(i => i !== interest));
  };

  const addCustomLookingFor = () => {
    if (newLookingFor.trim() && !customLookingFor.includes(newLookingFor.trim())) {
      const trimmed = newLookingFor.trim();
      setCustomLookingFor(prev => [...prev, trimmed]);
      setLookingFor(prev => [...prev, trimmed]);
      setNewLookingFor('');
    }
  };

  const removeCustomLookingFor = (item: string) => {
    setCustomLookingFor(prev => prev.filter(i => i !== item));
    setLookingFor(prev => prev.filter(i => i !== item));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden max-h-[90vh] overflow-y-auto bg-card rounded-2xl">
        {/* Header com foto - compacto */}
        <div className="relative h-40 bg-gradient-to-b from-gray-800 to-gray-900">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={fullName}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                  {fullName.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          
          {/* Gradiente overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Botão trocar foto */}
          <button className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/60 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
          
          {/* Info sobre a foto */}
          <div className="absolute bottom-2 left-3 text-white">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold">{fullName || 'Seu Nome'}</span>
              {age && <span className="text-base font-normal">{age}</span>}
            </div>
            {city && (
              <div className="flex items-center gap-1 text-white/80 text-[11px]">
                <MapPin className="w-3 h-3" />
                {city}
              </div>
            )}
          </div>
        </div>

        {/* Formulário - compacto */}
        <div className="p-3 space-y-3">
          {/* Objetivos - Multi-select */}
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
              Objetivos
            </Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {DEFAULT_OBJECTIVES.map(item => (
                <button
                  key={item.value}
                  onClick={() => toggleObjective(item.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                    objectives.includes(item.value)
                      ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                      : "bg-background text-muted-foreground border-border/50 hover:border-primary/20 hover:bg-muted/50"
                  )}
                >
                  {item.emoji} {item.value}
                </button>
              ))}
            </div>
          </div>

          {/* Interesses - Multi-select com custom */}
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
              Interesses
            </Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {DEFAULT_INTERESTS.map(item => (
                <button
                  key={item.value}
                  onClick={() => toggleInterest(item.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                    interests.includes(item.value)
                      ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                      : "bg-background text-muted-foreground border-border/50 hover:border-primary/20 hover:bg-muted/50"
                  )}
                >
                  {item.emoji} {item.value}
                </button>
              ))}
              {/* Custom interests */}
              {customInterests.map(item => (
                <button
                  key={item}
                  onClick={() => removeCustomInterest(item)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-green-500/10 text-green-600 border border-green-500/30 flex items-center gap-1"
                >
                  ✨ {item}
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
            {/* Add custom interest */}
            <div className="flex gap-1.5 mt-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Adicionar interesse..."
                className="h-7 text-[11px] flex-1 border-dashed"
                onKeyDown={(e) => e.key === 'Enter' && addCustomInterest()}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addCustomInterest}
                className="h-7 w-7 p-0 border-dashed"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-0.5 h-7 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sobre mim */}
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
              Sobre mim
            </Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Apaixonado por treinos..."
              className="mt-0.5 resize-none text-[11px] min-h-[50px]"
              rows={2}
            />
          </div>

          {/* Buscando - Multi-select com custom */}
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
              Buscando
            </Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {DEFAULT_LOOKING_FOR.map(item => (
                <button
                  key={item.value}
                  onClick={() => toggleLookingFor(item.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                    lookingFor.includes(item.value)
                      ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                      : "bg-background text-muted-foreground border-border/50 hover:border-primary/20 hover:bg-muted/50"
                  )}
                >
                  {item.emoji} {item.value}
                </button>
              ))}
              {/* Custom looking for */}
              {customLookingFor.map(item => (
                <button
                  key={item}
                  onClick={() => removeCustomLookingFor(item)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-500/10 text-blue-600 border border-blue-500/30 flex items-center gap-1"
                >
                  ✨ {item}
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
            {/* Add custom looking for */}
            <div className="flex gap-1.5 mt-2">
              <Input
                value={newLookingFor}
                onChange={(e) => setNewLookingFor(e.target.value)}
                placeholder="Adicionar..."
                className="h-7 text-[11px] flex-1 border-dashed"
                onKeyDown={(e) => e.key === 'Enter' && addCustomLookingFor()}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addCustomLookingFor}
                className="h-7 w-7 p-0 border-dashed"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Privacidade */}
          <div className="pt-2 border-t border-border/50">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
              Privacidade
            </Label>
            <div className="space-y-2 mt-2">
              {/* Auto accept followers */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-[11px] font-medium">Aceitar seguidores</p>
                    <p className="text-[9px] text-muted-foreground">Aceitar automaticamente</p>
                  </div>
                </div>
                <Switch
                  checked={autoAcceptFollowers}
                  onCheckedChange={setAutoAcceptFollowers}
                  className="scale-75"
                />
              </div>
              
              {/* Show weight progress */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-[11px] font-medium">Mostrar peso</p>
                    <p className="text-[9px] text-muted-foreground">Exibir progresso na comunidade</p>
                  </div>
                </div>
                <Switch
                  checked={showWeightProgress}
                  onCheckedChange={setShowWeightProgress}
                  className="scale-75"
                />
              </div>
            </div>
          </div>

          {/* Personalização - Tema de Cores */}
          <div className="pt-2 border-t border-border/50">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold flex items-center gap-1.5">
              <Palette className="w-3 h-3" />
              Personalização
            </Label>
            <div className="mt-2 p-2 rounded-lg bg-muted/30">
              <p className="text-[11px] font-medium mb-2">Cor do App</p>
              <ThemeSelector variant="compact" showLabel={false} />
            </div>
          </div>

          {/* Botão Salvar */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-9 text-xs rounded-xl shadow-sm"
          >
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EditConnectionProfileModal;
