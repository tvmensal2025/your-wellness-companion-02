/**
 * 📱 useFeedInfinite - Hook de Feed com Infinite Scroll
 * 
 * Substitui:
 * - useFeedPosts
 * - useSmartFeed
 * 
 * Funcionalidades:
 * - Infinite scroll com cursor-based pagination
 * - Cache otimizado
 * - Optimistic updates para likes
 * - Suporte a bilhões de posts
 */

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS, STALE_TIMES, GC_TIMES } from '@/services/cache';
import {
  fetchFeedPage,
  createPost,
  toggleLike,
  type FeedPost,
  type FeedPage,
} from '@/services/api/communityService';

// ═══════════════════════════════════════════════════════════
// 🪝 HOOK PRINCIPAL - FEED INFINITO
// ═══════════════════════════════════════════════════════════

export function useFeedInfinite(currentUserId: string | undefined) {
  const queryClient = useQueryClient();

  // Query infinita com cursor-based pagination
  const query = useInfiniteQuery({
    queryKey: CACHE_KEYS.feedInfinite(),
    queryFn: ({ pageParam }) => fetchFeedPage(pageParam, 10, currentUserId || null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: STALE_TIMES.feed,
    gcTime: GC_TIMES.medium,
  });

  // Mutation para criar post
  const createPostMutation = useMutation({
    mutationFn: ({ content, imageUrl, videoUrl }: { 
      content: string; 
      imageUrl?: string; 
      videoUrl?: string;
    }) => createPost(currentUserId!, content, imageUrl, videoUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.feedInfinite() });
    },
  });

  // Mutation para like com optimistic update
  const likeMutation = useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      toggleLike(currentUserId!, postId, isLiked),
    onMutate: async ({ postId, isLiked }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: CACHE_KEYS.feedInfinite() });

      // Snapshot do estado anterior
      const previousData = queryClient.getQueryData(CACHE_KEYS.feedInfinite());

      // Optimistic update
      queryClient.setQueryData(CACHE_KEYS.feedInfinite(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: FeedPage) => ({
            ...page,
            posts: page.posts.map((post: FeedPost) =>
              post.id === postId
                ? {
                    ...post,
                    isLiked: !isLiked,
                    likes_count: post.likes_count + (isLiked ? -1 : 1),
                  }
                : post
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(CACHE_KEYS.feedInfinite(), context.previousData);
      }
    },
  });

  // Flatten posts de todas as páginas
  const posts = query.data?.pages.flatMap(page => page.posts) || [];

  // Função para invalidar cache
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.feedInfinite() });
  };

  return {
    // Estado da query
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    
    // Dados
    posts,
    
    // Ações
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    invalidate,
    
    // Mutations
    createPost: (content: string, imageUrl?: string, videoUrl?: string) =>
      createPostMutation.mutateAsync({ content, imageUrl, videoUrl }),
    toggleLike: (postId: string, isLiked: boolean) =>
      likeMutation.mutate({ postId, isLiked }),
    
    // Estados das mutations
    isCreatingPost: createPostMutation.isPending,
    isLiking: likeMutation.isPending,
  };
}

// ═══════════════════════════════════════════════════════════
// 🪝 HOOK DE COMPATIBILIDADE
// ═══════════════════════════════════════════════════════════

/**
 * @deprecated Use useFeedInfinite instead
 * 
 * Mantido para compatibilidade. Retorna apenas a primeira página.
 */
export function useFeedPosts(currentUserId: string | undefined) {
  const feed = useFeedInfinite(currentUserId);
  
  return {
    posts: feed.posts,
    isLoading: feed.isLoading,
    error: feed.error,
    refetch: feed.refetch,
    // Adicionar funções que o hook antigo tinha
    likePost: (postId: string) => {
      const post = feed.posts.find(p => p.id === postId);
      if (post) {
        feed.toggleLike(postId, post.isLiked);
      }
    },
  };
}

/**
 * @deprecated Use useFeedInfinite instead
 */
export function useSmartFeed(currentUserId: string | undefined) {
  return useFeedInfinite(currentUserId);
}

export default useFeedInfinite;
