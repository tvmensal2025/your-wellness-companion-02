import React, { 
  useState, 
  useRef, 
  useCallback, 
  useEffect, 
  ReactNode,
  useMemo 
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

// ============================================
// VIRTUAL LIST - For large lists with fixed height items
// ============================================

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  containerHeight?: number;
  overscan?: number;
  keyExtractor?: (item: T, index: number) => string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  className,
  containerHeight = 400,
  overscan = 3,
  keyExtractor = (_, index) => String(index),
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { shouldReduceMotion } = useReducedMotion();

  const totalHeight = items.length * itemHeight;
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );
  
  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      originalIndex: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, originalIndex }) => (
          <div
            key={keyExtractor(item, originalIndex)}
            style={{
              position: 'absolute',
              top: originalIndex * itemHeight,
              height: itemHeight,
              width: '100%',
            }}
          >
            {renderItem(item, originalIndex)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// INFINITE SCROLL - For paginated data loading
// ============================================

interface InfiniteScrollProps {
  children: ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void | Promise<void>;
  threshold?: number;
  className?: string;
  loadingComponent?: ReactNode;
  endComponent?: ReactNode;
  direction?: 'down' | 'up';
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 100,
  className,
  loadingComponent,
  endComponent,
  direction = 'down',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const { shouldReduceMotion } = useReducedMotion();

  const handleScroll = useCallback(async () => {
    if (!hasMore || isLoading || loadingRef.current) return;
    
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    
    let shouldLoad = false;
    
    if (direction === 'down') {
      shouldLoad = scrollHeight - scrollTop - clientHeight < threshold;
    } else {
      shouldLoad = scrollTop < threshold;
    }

    if (shouldLoad) {
      loadingRef.current = true;
      try {
        await onLoadMore();
      } finally {
        loadingRef.current = false;
      }
    }
  }, [hasMore, isLoading, onLoadMore, threshold, direction]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Check on mount if we need to load more
  useEffect(() => {
    handleScroll();
  }, []);

  const defaultLoadingComponent = (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center py-4 gap-2 text-muted-foreground"
    >
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Carregando...</span>
    </motion.div>
  );

  const defaultEndComponent = (
    <div className="text-center py-4 text-sm text-muted-foreground">
      Você chegou ao fim
    </div>
  );

  return (
    <div ref={containerRef} className={cn('overflow-auto', className)}>
      {direction === 'up' && isLoading && (loadingComponent || defaultLoadingComponent)}
      {children}
      {direction === 'down' && isLoading && (loadingComponent || defaultLoadingComponent)}
      {!hasMore && !isLoading && (endComponent || defaultEndComponent)}
    </div>
  );
};

// ============================================
// LAZY LIST - Progressive rendering for moderate lists
// ============================================

interface LazyListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  batchSize?: number;
  initialBatch?: number;
  className?: string;
  itemClassName?: string;
  keyExtractor?: (item: T, index: number) => string;
}

export function LazyList<T>({
  items,
  renderItem,
  batchSize = 10,
  initialBatch = 20,
  className,
  itemClassName,
  keyExtractor = (_, index) => String(index),
}: LazyListProps<T>) {
  const [displayCount, setDisplayCount] = useState(initialBatch);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { shouldReduceMotion } = useReducedMotion();

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < items.length) {
          setDisplayCount(prev => Math.min(prev + batchSize, items.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [displayCount, items.length, batchSize]);

  // Reset when items change significantly
  useEffect(() => {
    if (items.length < displayCount * 0.5) {
      setDisplayCount(initialBatch);
    }
  }, [items.length, displayCount, initialBatch]);

  const visibleItems = items.slice(0, displayCount);
  const hasMore = displayCount < items.length;

  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">
        {visibleItems.map((item, index) => (
          <motion.div
            key={keyExtractor(item, index)}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
            transition={{ delay: index > displayCount - batchSize ? (index % batchSize) * 0.05 : 0 }}
            className={itemClassName}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>

      {hasMore && (
        <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

// ============================================
// SKELETON LIST - Loading placeholder
// ============================================

interface SkeletonListProps {
  count: number;
  itemHeight?: number;
  className?: string;
  itemClassName?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count,
  itemHeight = 60,
  className,
  itemClassName,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'bg-muted/50 rounded-lg animate-pulse',
            itemClassName
          )}
          style={{ height: itemHeight }}
        />
      ))}
    </div>
  );
};

// ============================================
// HOOKS
// ============================================

interface UseInfiniteScrollOptions<T> {
  fetchData: (page: number) => Promise<T[]>;
  pageSize?: number;
}

export function useInfiniteScroll<T>({ fetchData, pageSize = 20 }: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newItems = await fetchData(page);
      
      if (newItems.length < pageSize) {
        setHasMore(false);
      }
      
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, page, pageSize, isLoading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    reset();
    setIsLoading(true);
    
    try {
      const newItems = await fetchData(1);
      setItems(newItems);
      setPage(2);
      setHasMore(newItems.length >= pageSize);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, pageSize, reset]);

  return {
    items,
    hasMore,
    isLoading,
    error,
    loadMore,
    reset,
    refresh,
  };
}
