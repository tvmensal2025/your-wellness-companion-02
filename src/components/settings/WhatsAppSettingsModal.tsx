import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { WhatsAppNotificationSettings } from './WhatsAppNotificationSettings';

interface WhatsAppSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WhatsAppSettingsModal: React.FC<WhatsAppSettingsModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden" accessibleTitle="Configurações de WhatsApp">
        <DialogHeader className="sr-only">
          <DialogTitle>Configurações de WhatsApp</DialogTitle>
          <DialogDescription>Configure suas notificações por WhatsApp</DialogDescription>
        </DialogHeader>
        <WhatsAppNotificationSettings className="border-0 shadow-none" />
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppSettingsModal;
