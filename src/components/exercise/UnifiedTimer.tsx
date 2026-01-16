/**
 * UnifiedTimer - Re-export from modular structure
 * 
 * This file maintains backward compatibility with existing imports.
 * The actual implementation is in ./unified-timer/
 * 
 * @see ./unified-timer/README.md for documentation
 */

export {
  UnifiedTimer,
  RestTimer,
  InlineRestTimer,
  CompactTimer,
  MiniTimer,
  type UnifiedTimerProps,
} from './unified-timer';

export { default } from './unified-timer';
