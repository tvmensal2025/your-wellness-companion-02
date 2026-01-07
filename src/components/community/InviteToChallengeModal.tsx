import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { createNotification } from '@/lib/notifications';
import { 
  Target, 
  Trophy, 
  Send, 
  Loader2,
  Calendar,
  Users,
  Check
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  duration_days: number | null;
  points_reward: number | null;
}

interface InviteToChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteeId: string;
  inviteeName: string;
}

export function InviteToChallengeModal({ 
  open, 
  onOpenChange, 
  inviteeId, 
  inviteeName 
}: InviteToChallengeModalProps) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && user) {
      fetchMyChallenges();
      fetchSentInvites();
    }
  }, [open, user]);

  const fetchMyChallenges = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get challenges user is participating in
      const { data: participations, error: partError } = await supabase
        .from('challenge_participations')
        .select('challenge_id')
        .eq('user_id', user.id)
        .eq('is_completed', false);

      if (partError) throw partError;

      if (!participations || participations.length === 0) {
        setChallenges([]);
        return;
      }

      const challengeIds = participations.map(p => p.challenge_id);

      // Get active challenges
      const { data: challengeData, error: chalError } = await supabase
        .from('challenges')
        .select('id, title, description, icon, color, duration_days, points_reward')
        .in('id', challengeIds)
        .eq('is_active', true);

      if (chalError) throw chalError;

      setChallenges(challengeData || []);
    } catch (err) {
      console.error('Error fetching challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentInvites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenge_invites')
        .select('challenge_id')
        .eq('inviter_id', user.id)
        .eq('invitee_id', inviteeId)
        .eq('status', 'pending');

      if (error) throw error;

      setSentInvites(new Set(data?.map(i => i.challenge_id) || []));
    } catch (err) {
      console.error('Error fetching sent invites:', err);
    }
  };

  const handleInvite = async (challenge: Challenge) => {
    if (!user) return;

    setSending(challenge.id);
    try {
      // Check if already invited
      const { data: existing } = await supabase
        .from('challenge_invites')
        .select('id')
        .eq('challenge_id', challenge.id)
        .eq('inviter_id', user.id)
        .eq('invitee_id', inviteeId)
        .single();

      if (existing) {
        toast.info('Você já convidou esta pessoa para este desafio');
        return;
      }

      // Create invite
      const { error } = await supabase
        .from('challenge_invites')
        .insert({
          challenge_id: challenge.id,
          inviter_id: user.id,
          invitee_id: inviteeId,
          status: 'pending'
        });

      if (error) throw error;

      // Create notification for invitee
      await createNotification(
        inviteeId,
        'Convite para Desafio! 🎯',
        `Você foi convidado para o desafio: ${challenge.title}`,
        'achievement',
        '/challenges'
      );

      setSentInvites(prev => new Set([...prev, challenge.id]));
      toast.success(`Convite enviado para ${inviteeName}! 🎯`);
    } catch (err) {
      console.error('Error sending invite:', err);
      toast.error('Erro ao enviar convite');
    } finally {
      setSending(null);
    }
  };

  const getIconEmoji = (icon: string | null) => {
    if (!icon) return '🎯';
    // If it's already an emoji, return it
    if (icon.match(/\p{Emoji}/u)) return icon;
    // Otherwise return default
    return '🎯';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Target className="w-5 h-5 text-primary" />
            Convidar para Desafio
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Convide <span className="text-primary font-medium">{inviteeName}</span> para participar de um desafio com você!
        </p>

        <ScrollArea className="max-h-[300px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Você não está participando de nenhum desafio ativo.</p>
              <p className="text-sm mt-2">Entre em um desafio primeiro!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {challenges.map((challenge) => {
                const isSent = sentInvites.has(challenge.id);
                const isSending = sending === challenge.id;
                
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      p-4 rounded-xl border transition-all
                      ${isSent 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-background/50 border-border hover:border-primary/50'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: challenge.color || 'hsl(var(--primary))' }}
                      >
                        {getIconEmoji(challenge.icon)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {challenge.title}
                        </h4>
                        {challenge.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {challenge.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {challenge.duration_days && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {challenge.duration_days} dias
                            </span>
                          )}
                          {challenge.points_reward && (
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3 h-3 text-yellow-500" />
                              {challenge.points_reward} pts
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={isSent ? "secondary" : "default"}
                        disabled={isSent || isSending}
                        onClick={() => handleInvite(challenge)}
                        className="shrink-0"
                      >
                        {isSending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isSent ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Enviado
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            Convidar
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
