import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface User {
  user_id: string;
  full_name: string;
  avatar_url?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string, mentions: string[]) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  rows?: number;
  autoFocus?: boolean;
}

// Regex to detect @mentions
const MENTION_REGEX = /@(\w*)$/;
const FULL_MENTION_REGEX = /@(\w+)/g;

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  placeholder = 'Digite algo...',
  className = '',
  maxLength = 1000,
  rows = 3,
  autoFocus = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search users for autocomplete
  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .ilike('full_name', `%${query}%`)
        .limit(5);

      if (!error && data) {
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setSelectedIndex(0);
      }
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    setCursorPosition(cursorPos);

    // Check for @mention pattern
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const match = textBeforeCursor.match(MENTION_REGEX);

    if (match) {
      const query = match[1];
      searchUsers(query);
    } else {
      setShowSuggestions(false);
    }

    // Extract all mentions
    const mentions = extractMentions(newValue);
    onChange(newValue, mentions);
  };

  // Extract user IDs from mentions
  const extractMentions = (text: string): string[] => {
    const matches = text.match(FULL_MENTION_REGEX);
    return matches ? matches.map(m => m.slice(1)) : [];
  };

  // Handle suggestion selection
  const selectSuggestion = (user: User) => {
    if (!textareaRef.current) return;

    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    
    // Find the @ position
    const match = textBeforeCursor.match(MENTION_REGEX);
    if (!match) return;

    const atPosition = textBeforeCursor.lastIndexOf('@');
    const newTextBefore = textBeforeCursor.slice(0, atPosition);
    const mentionText = `@${user.full_name.replace(/\s+/g, '_')} `;
    const newValue = newTextBefore + mentionText + textAfterCursor;

    const mentions = extractMentions(newValue);
    onChange(newValue, mentions);
    setShowSuggestions(false);

    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = newTextBefore.length + mentionText.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        autoFocus={autoFocus}
        className={cn(
          'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50',
          className
        )}
      />

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
          >
            {isLoading ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                Buscando...
              </div>
            ) : (
              suggestions.map((user, index) => (
                <motion.button
                  key={user.user_id}
                  whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
                  onClick={() => selectSuggestion(user)}
                  className={cn(
                    'w-full flex items-center gap-2 p-2 text-left transition-colors',
                    index === selectedIndex && 'bg-muted'
                  )}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user.full_name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{user.full_name.replace(/\s+/g, '_').toLowerCase()}
                    </p>
                  </div>
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character count */}
      {maxLength && (
        <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

// Helper to render text with highlighted mentions
export const renderTextWithMentions = (text: string): React.ReactNode => {
  const parts = text.split(FULL_MENTION_REGEX);
  
  return parts.map((part, index) => {
    // Every odd index is a mention (captured group)
    if (index % 2 === 1) {
      return (
        <span key={index} className="text-primary font-medium hover:underline cursor-pointer">
          @{part}
        </span>
      );
    }
    return part;
  });
};
