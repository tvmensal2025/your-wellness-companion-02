import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Image, Video, X, Loader2, FileText, Sparkles, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { uploadCommunityMedia, isVideoFile, validateMediaFile } from '@/lib/communityMedia';
import { MentionInput } from './MentionInput';
import { CreatePollForm } from './PollComponent';
import { usePolls } from '@/hooks/usePolls';

interface FloatingCreateButtonProps {
  userName: string;
  userAvatar?: string;
  onCreatePost: (content: string, tags: string[], mediaUrls?: string[]) => Promise<any>;
  onOpenStoryModal?: () => void;
}

const PREDEFINED_TAGS = [
  'Saúde', 'Exercício', 'Nutrição', 'Bem-estar', 
  'Motivação', 'Progresso', 'Dica', 'Receita'
];

export const FloatingCreateButton: React.FC<FloatingCreateButtonProps> = ({
  userName,
  userAvatar,
  onCreatePost,
  onOpenStoryModal
}) => {
  const { user } = useAuth();
  const { createPoll } = usePolls();
  const [menuOpen, setMenuOpen] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [content, setContent] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pendingPoll, setPendingPoll] = useState<{ question: string; options: string[]; endsAt?: Date } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateMediaFile(file, 50);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const removeMedia = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleContentChange = (value: string, newMentions: string[]) => {
    setContent(value);
    setMentions(newMentions);
  };

  const handleCreatePoll = (question: string, options: string[], endsAt?: Date) => {
    setPendingPoll({ question, options, endsAt });
    setShowPollForm(false);
    toast.success('Enquete adicionada! Publique para ativar.');
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedFile && !pendingPoll) {
      toast.error('Escreva algo, adicione uma mídia ou crie uma enquete');
      return;
    }

    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    setIsSubmitting(true);
    try {
      let mediaUrls: string[] | undefined;

      if (selectedFile) {
        const result = await uploadCommunityMedia(selectedFile, 'posts', user.id);
        mediaUrls = [result.publicUrl];
      }

      const newPost = await onCreatePost(content.trim(), selectedTags, mediaUrls);
      
      // Create poll if pending
      if (pendingPoll && newPost?.id) {
        await createPoll(newPost.id, pendingPoll.question, pendingPoll.options, pendingPoll.endsAt);
      }
      
      // Reset state
      setContent('');
      setMentions([]);
      setSelectedTags([]);
      setPendingPoll(null);
      removeMedia();
      setPostDialogOpen(false);
    } catch (err: any) {
      console.error('Error creating post:', err);
      toast.error(err.message || 'Erro ao criar publicação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePostDialog = () => {
    removeMedia();
    setContent('');
    setMentions([]);
    setSelectedTags([]);
    setPendingPoll(null);
    setShowPollForm(false);
    setPostDialogOpen(false);
  };

  const isVideo = selectedFile && isVideoFile(selectedFile);
  const canSubmit = content.trim() || selectedFile || pendingPoll;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-16 right-0 flex flex-col gap-2 items-end"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setMenuOpen(false);
                  setPostDialogOpen(true);
                }}
                className="flex items-center gap-2 bg-card border border-border shadow-lg rounded-full pl-4 pr-3 py-2"
              >
                <span className="text-sm font-medium">Publicação</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setMenuOpen(false);
                  setPostDialogOpen(true);
                  setShowPollForm(true);
                }}
                className="flex items-center gap-2 bg-card border border-border shadow-lg rounded-full pl-4 pr-3 py-2"
              >
                <span className="text-sm font-medium">Enquete</span>
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
              </motion.button>
              
              {onOpenStoryModal && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenStoryModal();
                  }}
                  className="flex items-center gap-2 bg-card border border-border shadow-lg rounded-full pl-4 pr-3 py-2"
                >
                  <span className="text-sm font-medium">Story</span>
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-accent-foreground" />
                  </div>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: menuOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="w-6 h-6" />
          </motion.div>
        </motion.button>
      </div>

      {/* Post Creation Dialog */}
      <Dialog open={postDialogOpen} onOpenChange={(open) => !open && closePostDialog()}>
        <DialogContent className="max-w-md p-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>
              {showPollForm ? 'Criar Enquete' : 'Nova Publicação'}
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={userAvatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {userName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{userName}</p>
                <p className="text-xs text-muted-foreground">
                  Publicando como <span className="font-medium text-foreground">{userName?.split(' ')[0]}</span>
                </p>
              </div>
            </div>

            {/* Poll Form */}
            {showPollForm && !pendingPoll ? (
              <CreatePollForm
                onCreatePoll={handleCreatePoll}
                onCancel={() => setShowPollForm(false)}
              />
            ) : (
              <>
                {/* Content with Mentions */}
                <MentionInput
                  value={content}
                  onChange={handleContentChange}
                  placeholder="O que você quer compartilhar? Use @ para mencionar"
                  rows={4}
                  maxLength={1000}
                  autoFocus
                />

                {/* Pending Poll Preview */}
                {pendingPoll && (
                  <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Enquete anexada</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingPoll(null)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{pendingPoll.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pendingPoll.options.length} opções
                    </p>
                  </div>
                )}

                {/* Media Preview */}
                {previewUrl && (
                  <div className="relative rounded-lg overflow-hidden bg-muted">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                      onClick={removeMedia}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    
                    {isVideo ? (
                      <video
                        src={previewUrl}
                        className="w-full max-h-[180px] object-contain"
                        controls
                        playsInline
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full max-h-[180px] object-contain"
                      />
                    )}
                  </div>
                )}

                {/* Tags */}
                <div>
                  <p className="text-sm font-medium mb-2">Tags (opcional)</p>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_TAGS.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          {!showPollForm && (
            <div className="border-t p-4 flex items-center justify-between sticky bottom-0 bg-background">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!!selectedFile}
                >
                  <Image className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!!selectedFile}
                >
                  <Video className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPollForm(true)}
                  disabled={!!pendingPoll}
                  className={pendingPoll ? 'text-primary' : ''}
                >
                  <BarChart3 className="w-5 h-5" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={closePostDialog}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Publicar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};