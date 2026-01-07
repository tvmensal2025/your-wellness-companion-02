import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  User, 
  Globe, 
  Instagram, 
  Heart, 
  Save, 
  X,
  Dumbbell,
  Apple,
  Moon,
  Brain,
  Flame,
  Target
} from 'lucide-react';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

const INTEREST_OPTIONS = [
  { id: 'treino', label: 'Treino', icon: Dumbbell, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'nutricao', label: 'Nutrição', icon: Apple, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { id: 'sono', label: 'Sono', icon: Moon, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'mental', label: 'Saúde Mental', icon: Brain, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { id: 'peso', label: 'Perda de Peso', icon: Flame, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 'metas', label: 'Metas', icon: Target, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
];

export function EditProfileModal({ open, onOpenChange, onSave }: EditProfileModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [showStreak, setShowStreak] = useState(true);
  const [showPoints, setShowPoints] = useState(true);

  useEffect(() => {
    if (open && user) {
      fetchProfile();
    }
  }, [open, user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('bio, website_url, instagram_handle, interests, show_streak, show_points')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setBio(data.bio || '');
        setWebsiteUrl(data.website_url || '');
        setInstagramHandle(data.instagram_handle || '');
        setInterests(data.interests || []);
        setShowStreak(data.show_streak ?? true);
        setShowPoints(data.show_points ?? true);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const toggleInterest = (interestId: string) => {
    setInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(i => i !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: bio.trim() || null,
          website_url: websiteUrl.trim() || null,
          instagram_handle: instagramHandle.replace('@', '').trim() || null,
          interests: interests.length > 0 ? interests : null,
          show_streak: showStreak,
          show_points: showPoints,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado! ✨');
      onSave?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Erro ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <User className="w-5 h-5 text-primary" />
            Editar Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Bio */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Bio (máx. 150 caracteres)
            </Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 150))}
              placeholder="Conte um pouco sobre você e sua jornada de saúde..."
              className="bg-background/50 border-border resize-none h-20"
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/150
            </p>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website / Link
            </Label>
            <Input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://seusite.com"
              className="bg-background/50 border-border"
            />
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              Instagram
            </Label>
            <Input
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              placeholder="@seuusuario"
              className="bg-background/50 border-border"
            />
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">
              Interesses
            </Label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const Icon = interest.icon;
                const isSelected = interests.includes(interest.id);
                return (
                  <motion.button
                    key={interest.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleInterest(interest.id)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all
                      ${isSelected 
                        ? interest.color 
                        : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/50'}
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {interest.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Privacy Options */}
          <div className="space-y-4 pt-4 border-t border-border">
            <Label className="text-sm text-muted-foreground">Privacidade</Label>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Mostrar streak no perfil</span>
              <Switch 
                checked={showStreak} 
                onCheckedChange={setShowStreak}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Mostrar pontos no perfil</span>
              <Switch 
                checked={showPoints} 
                onCheckedChange={setShowPoints}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
