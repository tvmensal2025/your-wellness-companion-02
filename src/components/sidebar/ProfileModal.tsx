import React, { lazy, Suspense } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UserProfile = lazy(() => import('@/components/UserProfile'));

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenLayoutPrefs?: () => void;
}

const ModalLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const ProfileModal: React.FC<ProfileModalProps> = ({ open, onOpenChange, onOpenLayoutPrefs }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-4xl max-h-[90dvh] overflow-y-auto overflow-x-hidden p-0 rounded-xl left-[50%] translate-x-[-50%]">
        <DialogHeader className="sticky top-0 z-10 bg-background border-b px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-xl font-semibold">Meu Perfil</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-0 overflow-x-hidden">
          <Suspense fallback={<ModalLoader />}>
            <div className="[&_.container]:max-w-none [&_.container]:px-0 [&_.container]:py-0 overflow-x-hidden">
              <UserProfile onOpenLayoutPrefs={onOpenLayoutPrefs} />
            </div>
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
};
