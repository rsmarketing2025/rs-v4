
import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps<T> {
  items: T[];
  initialItemCount?: number;
  itemsPerPage?: number;
}

export const useInfiniteScroll = <T>({
  items,
  initialItemCount = 20,
  itemsPerPage = 20
}: UseInfiniteScrollProps<T>) => {
  const [displayedItemCount, setDisplayedItemCount] = useState(initialItemCount);
  const [isLoading, setIsLoading] = useState(false);

  const displayedItems = items.slice(0, displayedItemCount);
  const hasMore = displayedItemCount < items.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    // Simular delay de carregamento
    setTimeout(() => {
      setDisplayedItemCount(prev => Math.min(prev + itemsPerPage, items.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, itemsPerPage, items.length]);

  // Reset quando os items mudarem
  useEffect(() => {
    setDisplayedItemCount(initialItemCount);
  }, [items, initialItemCount]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    
    // Carregar mais quando estiver a 100px do final
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMore();
    }
  }, [loadMore]);

  return {
    displayedItems,
    hasMore,
    isLoading,
    loadMore,
    handleScroll,
    totalItems: items.length,
    displayedCount: displayedItems.length
  };
};
