import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard as KeyboardIcon, ChevronUp, Send } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

// ============================================
// KEYBOARD AWARE VIEW - Adjusts for virtual keyboard
// ============================================

interface KeyboardAwareViewProps {
  children: ReactNode;
  className?: string;
  extraPadding?: number;
}

export const KeyboardAwareView: React.FC<KeyboardAwareViewProps> = ({
  children,
  className,
  extraPadding = 0,
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      // On iOS, window.innerHeight changes when keyboard opens
      if (typeof window !== 'undefined' && 'visualViewport' in window) {
        const viewport = window.visualViewport;
        if (viewport) {
          const keyboardOpen = window.innerHeight - viewport.height > 100;
          setKeyboardHeight(keyboardOpen ? window.innerHeight - viewport.height : 0);
        }
      }
    };

    if (typeof window !== 'undefined' && 'visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', handleResize);
      window.visualViewport?.addEventListener('scroll', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined' && 'visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', handleResize);
        window.visualViewport?.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        paddingBottom: keyboardHeight > 0 ? keyboardHeight + extraPadding : undefined,
        transition: 'padding-bottom 0.2s ease-out',
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// USE KEYBOARD STATE HOOK
// ============================================

export const useKeyboardState = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && 'visualViewport' in window) {
        const viewport = window.visualViewport;
        if (viewport) {
          const heightDiff = window.innerHeight - viewport.height;
          const isOpen = heightDiff > 100;
          setIsKeyboardOpen(isOpen);
          setKeyboardHeight(isOpen ? heightDiff : 0);
        }
      }
    };

    // Also detect focus on input elements
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Small delay to allow keyboard to open
        setTimeout(handleResize, 300);
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        if (document.activeElement?.tagName !== 'INPUT' && 
            document.activeElement?.tagName !== 'TEXTAREA') {
          setIsKeyboardOpen(false);
          setKeyboardHeight(0);
        }
      }, 100);
    };

    if (typeof window !== 'undefined') {
      if ('visualViewport' in window) {
        window.visualViewport?.addEventListener('resize', handleResize);
      }
      document.addEventListener('focusin', handleFocus);
      document.addEventListener('focusout', handleBlur);
    }

    return () => {
      if (typeof window !== 'undefined') {
        if ('visualViewport' in window) {
          window.visualViewport?.removeEventListener('resize', handleResize);
        }
        document.removeEventListener('focusin', handleFocus);
        document.removeEventListener('focusout', handleBlur);
      }
    };
  }, []);

  const dismissKeyboard = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  return {
    isKeyboardOpen,
    keyboardHeight,
    dismissKeyboard,
  };
};

// ============================================
// MOBILE INPUT - Enhanced input for mobile
// ============================================

interface MobileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onSubmit'> {
  onSubmit?: (value: string) => void;
  showSubmitButton?: boolean;
  submitIcon?: ReactNode;
  wrapperClassName?: string;
}

export const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(({
  onSubmit,
  showSubmitButton = true,
  submitIcon,
  wrapperClassName,
  className,
  ...props
}, ref) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim() && onSubmit) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn('relative flex items-center gap-2', wrapperClassName)}>
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-border',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
          'text-base', // Prevents iOS zoom on focus
          className
        )}
        enterKeyHint="send"
        {...props}
      />
      
      {showSubmitButton && (
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className={cn(
            'p-3 rounded-xl bg-primary text-primary-foreground',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all active:scale-95'
          )}
        >
          {submitIcon || <Send className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
});

MobileInput.displayName = 'MobileInput';

// ============================================
// MOBILE TEXTAREA - Enhanced textarea for mobile
// ============================================

interface MobileTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
  onSubmit?: (value: string) => void;
  showSubmitButton?: boolean;
  maxHeight?: number;
  wrapperClassName?: string;
}

export const MobileTextarea = React.forwardRef<HTMLTextAreaElement, MobileTextareaProps>(({
  onSubmit,
  showSubmitButton = true,
  maxHeight = 150,
  wrapperClassName,
  className,
  ...props
}, ref) => {
  const [value, setValue] = useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [value, maxHeight]);

  const handleSubmit = () => {
    if (value.trim() && onSubmit) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const setRefs = useCallback((node: HTMLTextAreaElement | null) => {
    textareaRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  return (
    <div className={cn('relative flex items-end gap-2', wrapperClassName)}>
      <textarea
        ref={setRefs}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={cn(
          'flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-border resize-none',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
          'text-base min-h-[48px]', // Prevents iOS zoom
          className
        )}
        rows={1}
        style={{ maxHeight }}
        enterKeyHint="send"
        {...props}
      />
      
      {showSubmitButton && (
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className={cn(
            'p-3 rounded-xl bg-primary text-primary-foreground mb-0.5',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all active:scale-95'
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      )}
    </div>
  );
});

MobileTextarea.displayName = 'MobileTextarea';

// ============================================
// KEYBOARD DISMISS AREA - Tap to dismiss keyboard
// ============================================

interface KeyboardDismissAreaProps {
  children: ReactNode;
  className?: string;
}

export const KeyboardDismissArea: React.FC<KeyboardDismissAreaProps> = ({
  children,
  className,
}) => {
  const { isKeyboardOpen, dismissKeyboard } = useKeyboardState();
  const { shouldReduceMotion } = useReducedMotion();

  return (
    <div className={cn('relative', className)}>
      {children}
      
      <AnimatePresence>
        {isKeyboardOpen && (
          <motion.button
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? {} : { opacity: 0 }}
            onClick={dismissKeyboard}
            className={cn(
              'fixed bottom-4 right-4 z-50 p-3 rounded-full',
              'bg-background/90 backdrop-blur-sm border border-border shadow-lg',
              'active:scale-95 transition-transform'
            )}
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
