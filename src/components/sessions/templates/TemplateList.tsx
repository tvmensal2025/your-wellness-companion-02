import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, Database, Zap, Send } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface TemplateListProps {
  templates: Template[];
  isCreating: string | null;
  onUseTemplate: (templateId: string) => void;
  onSelectTemplate: (templateId: string) => void;
  onSendToAll: (templateId: string) => void;
  categoryTags: Record<string, { tags: string[]; bgColor: string; textColor: string }>;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  isCreating,
  onUseTemplate,
  onSelectTemplate,
  onSendToAll,
  categoryTags
}) => {
  return (
    <div className="grid gap-4">
      {templates.map((template, index) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-gradient-card border border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Info do Template */}
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-full ${template.color} text-white shrink-0`}>
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <CardTitle className="text-lg text-foreground">
                        {template.title}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                        {template.questions && `${template.questions} Perguntas`}
                        {template.areas && `${template.areas} ${template.areas === 12 ? 'Áreas' : template.id === '8-pilares' ? 'Pilares' : 'Competências'}`}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>

                {/* Estatísticas e Ações */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:shrink-0">
                  {/* Mini Stats */}
                  <div className="flex gap-2 text-xs">
                    <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md">
                      <Database className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{template.dbCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-md">
                      <Users className="w-3 h-3 text-green-600" />
                      <span className="font-medium text-green-600">{template.assignedCount || 0}</span>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onUseTemplate(template.id)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 px-3"
                      disabled={isCreating === template.id}
                      size="sm"
                    >
                      <Zap className="w-3.5 h-3.5 mr-1" />
                      {isCreating === template.id ? 'Criando...' : 'Usar'}
                    </Button>
                    <Button
                      onClick={() => onSelectTemplate(template.id)}
                      variant="outline"
                      disabled={isCreating === template.id}
                      className="text-xs h-8 px-3"
                      size="sm"
                    >
                      <Users className="w-3.5 h-3.5 mr-1" />
                      Selecionar
                    </Button>
                    <Button
                      onClick={() => onSendToAll(template.id)}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs h-8 px-3"
                      disabled={isCreating === template.id}
                      size="sm"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Todos
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Info e Features */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">{template.duration}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
                <div className="flex gap-2">
                  {template.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {categoryTags[template.id]?.tags.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className={`text-xs ${categoryTags[template.id].bgColor} ${categoryTags[template.id].textColor}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
