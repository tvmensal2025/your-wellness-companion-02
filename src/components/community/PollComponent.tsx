import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Check, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  post_id: string;
  question: string;
  options: PollOption[];
  ends_at?: string;
  created_at: string;
}

interface PollComponentProps {
  poll: Poll;
  className?: string;
  onVote?: () => void;
}

export const PollComponent: React.FC<PollComponentProps> = ({ 
  poll, 
  className = '',
  onVote
}) => {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [localPoll, setLocalPoll] = useState(poll);
  
  const totalVotes = localPoll.options.reduce((sum, opt) => sum + opt.votes, 0);
  
  // Check if user already voted - poll votes table was removed
  useEffect(() => {
    // Poll votes table no longer exists - reset state
    setSelectedOption(null);
    setHasVoted(false);
  }, [poll.id, user]);

  // Check if poll has ended
  const isPollEnded = poll.ends_at ? new Date(poll.ends_at) < new Date() : false;

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!poll.ends_at) return null;
    
    const now = new Date();
    const ends = new Date(poll.ends_at);
    const diffMs = ends.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Encerrada';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d restantes`;
    if (hours > 0) return `${hours}h restantes`;
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    return `${minutes}min restantes`;
  };

  const handleVote = async (optionIndex: number) => {
    if (!user) {
      toast.error('Você precisa estar logado para votar');
      return;
    }
    
    if (hasVoted || isPollEnded) return;
    
    setIsVoting(true);
    
    try {
      // Poll votes table was removed - just update local state
      const newOptions = [...localPoll.options];
      newOptions[optionIndex] = {
        ...newOptions[optionIndex],
        votes: newOptions[optionIndex].votes + 1
      };
      
      setLocalPoll(prev => ({ ...prev, options: newOptions }));
      setSelectedOption(optionIndex);
      setHasVoted(true);
      
      onVote?.();
      toast.success('Voto registrado!');
    } catch (err: any) {
      console.error('Error voting:', err);
      toast.error('Erro ao votar');
    } finally {
      setIsVoting(false);
    }
  };

  const timeRemaining = getTimeRemaining();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm text-foreground">Enquete</span>
        </div>
        
        <div className="flex items-center gap-2">
          {timeRemaining && (
            <Badge 
              variant="secondary" 
              className={cn(
                'text-[10px] flex items-center gap-1',
                isPollEnded ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
              )}
            >
              <Clock className="w-3 h-3" />
              {timeRemaining}
            </Badge>
          )}
          
          <Badge variant="outline" className="text-[10px] flex items-center gap-1">
            <Users className="w-3 h-3" />
            {totalVotes} votos
          </Badge>
        </div>
      </div>

      {/* Question */}
      <p className="font-semibold text-foreground mb-4">{localPoll.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {localPoll.options.map((option, index) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isSelected = selectedOption === index;
          const showResults = hasVoted || isPollEnded;
          
          return (
            <motion.button
              key={index}
              whileHover={!hasVoted && !isPollEnded ? { scale: 1.01 } : {}}
              whileTap={!hasVoted && !isPollEnded ? { scale: 0.99 } : {}}
              onClick={() => handleVote(index)}
              disabled={hasVoted || isPollEnded || isVoting}
              className={cn(
                'w-full relative rounded-lg border p-3 text-left transition-all overflow-hidden',
                isSelected && 'border-primary bg-primary/5',
                !isSelected && 'border-border hover:border-primary/50',
                (hasVoted || isPollEnded) && 'cursor-default'
              )}
            >
              {/* Progress bar background */}
              <AnimatePresence>
                {showResults && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-lg',
                      isSelected ? 'bg-primary/20' : 'bg-muted/50'
                    )}
                  />
                )}
              </AnimatePresence>

              {/* Content */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                  <span className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}>
                    {option.text}
                  </span>
                </div>

                {showResults && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-semibold text-muted-foreground"
                  >
                    {percentage}%
                  </motion.span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      {!hasVoted && !isPollEnded && (
        <p className="text-[10px] text-muted-foreground mt-3 text-center">
          Clique em uma opção para votar
        </p>
      )}
    </motion.div>
  );
};

// Create Poll Form Component
interface CreatePollFormProps {
  onCreatePoll: (question: string, options: string[], endsAt?: Date) => void;
  onCancel: () => void;
}

export const CreatePollForm: React.FC<CreatePollFormProps> = ({ onCreatePoll, onCancel }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState<'1h' | '24h' | '7d' | 'none'>('24h');

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (!question.trim()) {
      toast.error('Digite uma pergunta');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast.error('Adicione pelo menos 2 opções');
      return;
    }

    let endsAt: Date | undefined;
    if (duration !== 'none') {
      endsAt = new Date();
      if (duration === '1h') endsAt.setHours(endsAt.getHours() + 1);
      if (duration === '24h') endsAt.setHours(endsAt.getHours() + 24);
      if (duration === '7d') endsAt.setDate(endsAt.getDate() + 7);
    }

    onCreatePoll(question.trim(), validOptions, endsAt);
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-primary/20 bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        <span className="font-medium text-sm">Criar Enquete</span>
      </div>

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Faça uma pergunta..."
        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        maxLength={280}
      />

      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Opção ${index + 1}`}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              maxLength={100}
            />
            {options.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveOption(index)}
                className="text-destructive hover:text-destructive"
              >
                ×
              </Button>
            )}
          </div>
        ))}
      </div>

      {options.length < 4 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          className="w-full"
        >
          + Adicionar opção
        </Button>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Duração:</span>
        {(['1h', '24h', '7d', 'none'] as const).map((d) => (
          <Button
            key={d}
            variant={duration === d ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDuration(d)}
            className="text-xs h-7"
          >
            {d === 'none' ? 'Sem limite' : d}
          </Button>
        ))}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button size="sm" onClick={handleSubmit}>
          Criar Enquete
        </Button>
      </div>
    </div>
  );
};
