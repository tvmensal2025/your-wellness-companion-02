import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSofiaProactive } from '@/hooks/useSofiaProactive';
import sofiaAvatar from '@/assets/sofia-avatar.png';

export const SofiaProactiveCard: React.FC = () => {
  const { insights, dismissInsight } = useSofiaProactive();
  const navigate = useNavigate();

  if (insights.length === 0) return null;

  const topInsight = insights[0];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'from-rose-500/20 to-orange-500/20 border-rose-500/30';
      case 'medium':
        return 'from-amber-500/20 to-yellow-500/20 border-amber-500/30';
      default:
        return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`relative overflow-hidden bg-gradient-to-br ${getPriorityColor(topInsight.priority)} border`}>
          <CardContent className="p-4">
            {/* Close button */}
            <button
              onClick={() => dismissInsight(topInsight.id)}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-background/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="flex gap-3">
              {/* Sofia Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={sofiaAvatar}
                  alt="Sofia"
                  className="w-12 h-12 rounded-full object-cover border-2 border-background shadow-md"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{topInsight.icon}</span>
                  <h4 className="font-semibold text-sm text-foreground">{topInsight.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {topInsight.message}
                </p>

                {/* Action button */}
                {topInsight.actionable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(topInsight.actionable!.route)}
                    className="mt-2 -ml-2 text-primary hover:text-primary/80"
                  >
                    {topInsight.actionable.label}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>

            {/* Insights count indicator */}
            {insights.length > 1 && (
              <div className="flex gap-1 justify-center mt-3">
                {insights.slice(0, 3).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === 0 ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default SofiaProactiveCard;
