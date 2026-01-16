// ============================================
// 🎬 VIDEO BLOCK
// Bloco de vídeo reutilizável para exercícios
// ============================================

import React from 'react';
import { Dumbbell } from 'lucide-react';

interface VideoBlockProps {
  videoId: string | null;
  name: string;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ videoId, name }) => {
  return (
    <div className="rounded-xl overflow-hidden bg-muted/50 shadow-sm">
      {videoId ? (
        <div className="relative w-full pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={`Vídeo: ${name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};
