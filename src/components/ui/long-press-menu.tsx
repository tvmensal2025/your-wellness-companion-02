import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLongPress } from '@/hooks/useLongPress';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  onSelect: () => void;
}

interface LongPressMenuProps {
  children: React.ReactNode;
  items: MenuItem[];
  onOpen?: () => void;
  onClose?: () => void;
  className?: string;
  menuClassName?: string;
  delay?: number;
  disabled?: boolean;
}

export function LongPressMenu({
  children,
  items,
  onOpen,
  onClose,
  className,
  menuClassName,
  delay = 500,
  disabled = false,
}: LongPressMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const { shouldReduceMotion } = useReducedMotion();

  const handleLongPress = () => {
    if (disabled) return;
    setIsOpen(true);
    onOpen?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleItemSelect = (item: MenuItem) => {
    item.onSelect();
    handleClose();
  };

  const { handlers, isPressed, pressProgress } = useLongPress({
    delay,
    onLongPress: handleLongPress,
    onPressStart: () => {},
    hapticFeedback: true,
  });

  // Update position on touch
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setMenuPosition({
      x: touch.clientX,
      y: touch.clientY,
    });
    handlers.onTouchStart(e);
  };

  return (
    <>
      <div
        className={cn("relative select-none", className)}
        {...handlers}
        onTouchStart={handleTouchStart}
      >
        {/* Progress indicator */}
        {isPressed && pressProgress > 0 && !disabled && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-10 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <svg className="absolute inset-0 w-full h-full">
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray={`${pressProgress * 100}% 100%`}
                rx="8"
                className="transition-all"
              />
            </svg>
          </motion.div>
        )}
        
        {/* Scale effect when pressing */}
        <motion.div
          animate={{
            scale: isPressed ? 0.98 : 1,
          }}
          transition={{ duration: 0.1 }}
        >
          {children}
        </motion.div>
      </div>

      {/* Menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Menu */}
            <motion.div
              className={cn(
                "fixed z-50 min-w-[200px] rounded-xl bg-popover border border-border shadow-xl overflow-hidden",
                menuClassName
              )}
              style={{
                left: Math.min(menuPosition.x, window.innerWidth - 220),
                top: Math.min(menuPosition.y, window.innerHeight - (items.length * 48 + 20)),
              }}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -10 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: "spring", duration: 0.2, bounce: 0.3 }}
            >
              {items.map((item, index) => (
                <motion.button
                  key={item.id}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors touch-target",
                    item.destructive
                      ? "text-destructive hover:bg-destructive/10"
                      : "text-foreground hover:bg-muted"
                  )}
                  onClick={() => handleItemSelect(item)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {item.icon && (
                    <span className="w-5 h-5 flex items-center justify-center">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Simple context menu trigger
interface ContextMenuTriggerProps {
  children: React.ReactNode;
  items: MenuItem[];
  className?: string;
}

export function ContextMenuTrigger({ children, items, className }: ContextMenuTriggerProps) {
  return (
    <LongPressMenu items={items} className={className}>
      {children}
    </LongPressMenu>
  );
}
