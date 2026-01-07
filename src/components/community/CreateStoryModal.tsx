import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Type, X, Loader2, Dumbbell, Utensils, Trophy, Sparkles, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { uploadCommunityMedia, isVideoFile, validateMediaFile } from '@/lib/communityMedia';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStory: (mediaUrl: string, mediaType: string, textContent?: string, backgroundColor?: string, category?: string) => Promise<any>;
}

const backgroundColors = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#1f2937', // Dark
];

const storyCategories = [
  { id: 'geral', label: 'Geral', icon: Hash, color: 'bg-gray-500' },
  { id: 'treino', label: 'Treino', icon: Dumbbell, color: 'bg-orange-500' },
  { id: 'alimentacao', label: 'Alimentação', icon: Utensils, color: 'bg-green-500' },
  { id: 'conquista', label: 'Conquista', icon: Trophy, color: 'bg-yellow-500' },
  { id: 'motivacao', label: 'Motivação', icon: Sparkles, color: 'bg-purple-500' },
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  onCreateStory
}) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'select' | 'text' | 'media'>('select');
  const [textContent, setTextContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(backgroundColors[0]);
  const [selectedCategory, setSelectedCategory] = useState('geral');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateMediaFile(file, 50);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Create object URL for preview (no base64!)
    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setMode('media');
  };

  const handleCreateTextStory = async () => {
    if (!textContent.trim()) {
      toast.error('Digite algo para seu story');
      return;
    }

    setUploading(true);
    try {
      await onCreateStory('', 'text', textContent, selectedColor, selectedCategory);
      resetAndClose();
    } catch (err: any) {
      console.error('Error creating text story:', err);
      toast.error(err.message || 'Erro ao criar story');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateMediaStory = async () => {
    if (!selectedFile || !user) {
      toast.error('Selecione um arquivo');
      return;
    }

    setUploading(true);
    try {
      // Upload to storage
      const result = await uploadCommunityMedia(selectedFile, 'stories', user.id);
      const mediaType = isVideoFile(selectedFile) ? 'video' : 'image';
      
      await onCreateStory(result.publicUrl, mediaType, undefined, undefined, selectedCategory);
      resetAndClose();
    } catch (err: any) {
      console.error('Error creating media story:', err);
      toast.error(err.message || 'Erro ao criar story');
    } finally {
      setUploading(false);
    }
  };

  const resetAndClose = () => {
    // Revoke object URL to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setMode('select');
    setTextContent('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedColor(backgroundColors[0]);
    setSelectedCategory('geral');
    onClose();
  };

  const isVideo = selectedFile && isVideoFile(selectedFile);

  // Category selector component
  const CategorySelector = () => (
    <div className="flex gap-2 justify-center flex-wrap">
      {storyCategories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isSelected 
                ? `${cat.color} text-white` 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-md p-0 max-h-[90vh] overflow-y-auto">
        {mode === 'select' && (
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-center">Criar Story</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Image className="w-6 h-6 text-primary" />
                </div>
                <span className="font-medium text-sm">Foto/Vídeo</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('text')}
                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-dashed border-accent/30 hover:border-accent/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Type className="w-6 h-6 text-accent-foreground" />
                </div>
                <span className="font-medium text-sm">Texto</span>
              </motion.button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )}

        {mode === 'text' && (
          <div className="flex flex-col min-h-[400px]">
            {/* Preview */}
            <div 
              className="flex-1 flex items-center justify-center p-8 min-h-[200px]"
              style={{ backgroundColor: selectedColor }}
            >
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Digite seu story..."
                className="bg-transparent border-none text-white text-center text-2xl font-bold placeholder:text-white/50 resize-none focus-visible:ring-0"
                maxLength={200}
              />
            </div>
            
            {/* Color Picker, Category & Actions */}
            <div className="p-4 bg-background border-t sticky bottom-0 space-y-3">
              <div className="flex gap-2 justify-center flex-wrap">
                {backgroundColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      selectedColor === color ? 'scale-110 ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              <CategorySelector />
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={resetAndClose}>
                  Cancelar
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleCreateTextStory}
                  disabled={!textContent.trim() || uploading}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Publicar
                </Button>
              </div>
            </div>
          </div>
        )}

        {mode === 'media' && previewUrl && (
          <div className="flex flex-col min-h-[400px]">
            {/* Preview */}
            <div className="flex-1 relative bg-black min-h-[300px]">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
                onClick={() => {
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setMode('select');
                }}
              >
                <X className="w-5 h-5" />
              </Button>
              
              {isVideo ? (
                <video
                  src={previewUrl}
                  className="w-full h-full object-contain max-h-[400px]"
                  controls
                  playsInline
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain max-h-[400px]"
                />
              )}
            </div>
            
            {/* Category & Actions */}
            <div className="p-4 bg-background border-t sticky bottom-0 space-y-3">
              <CategorySelector />
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={resetAndClose}>
                  Cancelar
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleCreateMediaStory}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Publicar
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
