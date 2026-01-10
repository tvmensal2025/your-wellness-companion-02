import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface UseVirtualListOptions {
  itemHeight: number;
  overscan?: number;
  containerHeight?: number;
}

interface VirtualListResult<T> {
  virtualItems: Array<{ index: number; item: T; style: React.CSSProperties }>;
  totalHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
  scrollToIndex: (index: number) => void;
}

/**
 * Hook para virtualização de listas grandes
 * Renderiza apenas os itens visíveis + overscan
 * 
 * @param items - Array de itens
 * @param options - Configurações (itemHeight obrigatório)
 * @returns Itens virtualizados com estilos de posicionamento
 * 
 * @example
 * const { virtualItems, totalHeight, containerRef } = useVirtualList(items, { itemHeight: 50 });
 * 
 * return (
 *   <div ref={containerRef} style={{ height: 400, overflow: 'auto' }}>
 *     <div style={{ height: totalHeight, position: 'relative' }}>
 *       {virtualItems.map(({ index, item, style }) => (
 *         <div key={index} style={style}>{item.name}</div>
 *       ))}
 *     </div>
 *   </div>
 * );
 */
export function useVirtualList<T>(
  items: T[],
  options: UseVirtualListOptions
): VirtualListResult<T> {
  const { itemHeight, overscan = 3, containerHeight: fixedHeight } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(fixedHeight || 400);

  // Atualiza altura do container
  useEffect(() => {
    if (fixedHeight) {
      setContainerHeight(fixedHeight);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [fixedHeight]);

  // Handler de scroll com throttle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollTop(container.scrollTop);
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Calcula itens visíveis
  const virtualItems = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const result: Array<{ index: number; item: T; style: React.CSSProperties }> = [];

    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        index: i,
        item: items[i],
        style: {
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        },
      });
    }

    return result;
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  const totalHeight = items.length * itemHeight;

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (!container) return;

      const targetTop = index * itemHeight;
      container.scrollTo({ top: targetTop, behavior: 'smooth' });
    },
    [itemHeight]
  );

  return {
    virtualItems,
    totalHeight,
    containerRef,
    scrollToIndex,
  };
}

export default useVirtualList;
