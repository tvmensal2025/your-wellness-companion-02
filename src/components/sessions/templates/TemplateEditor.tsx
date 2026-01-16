import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { UserSelector } from '@/components/admin/UserSelector';

interface Template {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
  questions?: number;
  areas?: number;
  dbCount?: number;
  assignedCount?: number;
}

interface TemplateEditorProps {
  selectedTemplate: string | null;
  templates: Template[];
  selectedUsers: string[];
  isCreating: string | null;
  onClose: () => void;
  onSelectionChange: (users: string[]) => void;
  onSendToSelected: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  selectedTemplate,
  templates,
  selectedUsers,
  isCreating,
  onClose,
  onSelectionChange,
  onSendToSelected
}) => {
  const handleCancel = () => {
    onClose();
    onSelectionChange([]);
  };

  return (
    <Dialog open={!!selectedTemplate} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Enviar Template: {templates.find(t => t.id === selectedTemplate)?.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {selectedTemplate && (
            <div className="space-y-4">
              <UserSelector 
                selectedUsers={selectedUsers} 
                onSelectionChange={onSelectionChange} 
              />
              
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={onSendToSelected} 
                  disabled={isCreating === selectedTemplate || selectedUsers.length === 0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isCreating === selectedTemplate 
                    ? 'Enviando...' 
                    : `Enviar para ${selectedUsers.length} usuário(s)`
                  }
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
