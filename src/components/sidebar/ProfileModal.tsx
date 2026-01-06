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
      <DialogContent className="w-[92vw] max-w-[360px] sm:max-w-4xl max-h-[85dvh] sm:max-h-[90vh] overflow-y-auto p-0 rounded-xl">
        <DialogHeader className="sticky top-0 z-10 bg-background border-b px-3 py-2.5 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm sm:text-xl font-semibold">Meu Perfil</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 sm:h-8 sm:w-8"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-0">
          <Suspense fallback={<ModalLoader />}>
            <div className="[&_.container]:max-w-none [&_.container]:px-0 [&_.container]:py-0">
              <UserProfile onOpenLayoutPrefs={onOpenLayoutPrefs} />
            </div>
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
};
