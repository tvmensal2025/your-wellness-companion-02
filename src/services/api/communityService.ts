/**
 * 📱 Community Service - Feed, Posts, Follows
 * 
 * Centraliza operações da comunidade com:
 * - Paginação infinita
 * - Queries otimizadas
 * - Suporte a bilhões de posts
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════
// 📋 TIPOS
// ═══════════════════════════════════════════════════════════

export interface FeedPost {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  visibility: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  // Dados do autor (join)
  author: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null;
  // Estado do usuário atual
  isLiked: boolean;
  // Dados derivados
  tags: string[];
  userBio: string;
}

export interface FeedPage {
  posts: FeedPost[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface FollowStats {
  followers: number;
  following: number;
}

// ═══════════════════════════════════════════════════════════
// 🔧 FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════

/**
 * Detecta tags automaticamente baseado no conteúdo
 */
function detectTags(content: string): string[] {
  const tags: string[] = [];
  const lowerContent = content.toLowerCase();

  const tagPatterns = [
    { keywords: ['treino', 'academia', 'exercício', 'musculação', 'cardio'], tag: '💪 Treino' },
    { keywords: ['receita', 'cozinhei', 'preparei', 'fit', 'saudável'], tag: '🍳 Receita' },
    { keywords: ['peso', 'balança', 'emagreci', 'perdi', 'kg'], tag: '⚖️ Progresso' },
    { keywords: ['dica', 'conselho', 'aprendi', 'descobri'], tag: '💡 Dica' },
    { keywords: ['motivação', 'força', 'consegui', 'meta', 'objetivo'], tag: '🔥 Motivação' },
    { keywords: ['antes', 'depois', 'transformação', 'resultado'], tag: '📸 Antes/Depois' },
  ];

  for (const pattern of tagPatterns) {
    if (pattern.keywords.some(kw => lowerContent.includes(kw))) {
      tags.push(pattern.tag);
    }
  }

  return tags.slice(0, 2); // Máximo 2 tags
}

/**
 * Gera bio automática baseada no conteúdo
 */
function generateUserBio(content: string, tags: string[], userBio: string | null): string {
  if (userBio) return userBio;

  if (tags.includes('💪 Treino')) return '🏋️ Focado em treinos';
  if (tags.includes('🍳 Receita')) return '👨‍🍳 Amante de receitas fit';
  if (tags.includes('⚖️ Progresso')) return '📈 Em transformação';
  if (tags.includes('🔥 Motivação')) return '💪 Motivador da comunidade';

  return '🌟 Membro ativo';
}

// ═══════════════════════════════════════════════════════════
// 📖 FEED OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Busca feed com paginação por cursor (infinite scroll)
 * 
 * @param cursor - ID do último post (para paginação)
 * @param limit - Quantidade de posts por página
 * @param currentUserId - ID do usuário atual (para verificar likes)
 */
export async function fetchFeedPage(
  cursor: string | null = null,
  limit: number = 10,
  currentUserId: string | null = null
): Promise<FeedPage> {
  let query = supabase
    .from('health_feed_posts')
    .select(`
      *,
      profiles!health_feed_posts_user_id_fkey (
        user_id,
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(limit + 1); // +1 para verificar se há mais

  // Paginação por cursor
  if (cursor) {
    const { data: cursorPost } = await supabase
      .from('health_feed_posts')
      .select('created_at')
      .eq('id', cursor)
      .single();

    if (cursorPost) {
      query = query.lt('created_at', cursorPost.created_at);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar feed:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return { posts: [], nextCursor: null, hasMore: false };
  }

  // Verificar se há mais posts
  const hasMore = data.length > limit;
  const postsData = hasMore ? data.slice(0, limit) : data;

  // Buscar likes do usuário atual
  let userLikes = new Set<string>();
  if (currentUserId && postsData.length > 0) {
    const postIds = postsData.map(p => p.id);
    const { data: likes } = await supabase
      .from('health_feed_likes')
      .select('post_id')
      .eq('user_id', currentUserId)
      .in('post_id', postIds);

    userLikes = new Set(likes?.map(l => l.post_id) || []);
  }

  // Mapear posts
  const posts: FeedPost[] = postsData.map(post => {
    const author = post.profiles as FeedPost['author'];
    const tags = detectTags(post.content || '');
    const userBio = generateUserBio(post.content || '', tags, author?.bio || null);

    return {
      id: post.id,
      user_id: post.user_id,
      content: post.content || '',
      image_url: post.image_url,
      video_url: post.video_url,
      visibility: post.visibility || 'public',
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author,
      isLiked: userLikes.has(post.id),
      tags,
      userBio,
    };
  });

  const nextCursor = hasMore ? posts[posts.length - 1].id : null;

  return { posts, nextCursor, hasMore };
}

/**
 * Busca posts de um usuário específico
 */
export async function fetchUserPosts(
  userId: string,
  limit: number = 20
): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from('health_feed_posts')
    .select(`
      *,
      profiles!health_feed_posts_user_id_fkey (
        user_id,
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar posts do usuário:', error);
    return [];
  }

  return (data || []).map(post => {
    const author = post.profiles as FeedPost['author'];
    const tags = detectTags(post.content || '');
    const userBio = generateUserBio(post.content || '', tags, author?.bio || null);

    return {
      id: post.id,
      user_id: post.user_id,
      content: post.content || '',
      image_url: post.image_url,
      video_url: post.video_url,
      visibility: post.visibility || 'public',
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author,
      isLiked: false,
      tags,
      userBio,
    };
  });
}

// ═══════════════════════════════════════════════════════════
// ✏️ POST OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Cria um novo post
 */
export async function createPost(
  userId: string,
  content: string,
  imageUrl?: string,
  videoUrl?: string
): Promise<FeedPost | null> {
  const { data, error } = await supabase
    .from('health_feed_posts')
    .insert({
      user_id: userId,
      content,
      image_url: imageUrl || null,
      video_url: videoUrl || null,
      visibility: 'public',
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar post:', error);
    throw error;
  }

  const tags = detectTags(content);
  return {
    ...data,
    author: null,
    isLiked: false,
    tags,
    userBio: '',
  };
}

/**
 * Curte/descurte um post
 */
export async function toggleLike(
  userId: string,
  postId: string,
  isCurrentlyLiked: boolean
): Promise<boolean> {
  if (isCurrentlyLiked) {
    // Remover like
    await supabase
      .from('health_feed_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    // Decrementar contador
    await supabase.rpc('decrement_likes_count', { p_post_id: postId });
    
    return false;
  } else {
    // Adicionar like
    await supabase
      .from('health_feed_likes')
      .insert({ user_id: userId, post_id: postId });

    // Incrementar contador
    await supabase.rpc('increment_likes_count', { p_post_id: postId });
    
    return true;
  }
}

// ═══════════════════════════════════════════════════════════
// 👥 FOLLOW OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Busca estatísticas de follows
 */
export async function fetchFollowStats(userId: string): Promise<FollowStats> {
  const [followersResult, followingResult] = await Promise.all([
    supabase
      .from('health_feed_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId),
    supabase
      .from('health_feed_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId),
  ]);

  return {
    followers: followersResult.count || 0,
    following: followingResult.count || 0,
  };
}

/**
 * Verifica se usuário A segue usuário B
 */
export async function checkIsFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('health_feed_follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  return !!data;
}

/**
 * Seguir/deixar de seguir usuário
 */
export async function toggleFollow(
  followerId: string,
  followingId: string,
  isCurrentlyFollowing: boolean
): Promise<boolean> {
  if (isCurrentlyFollowing) {
    await supabase
      .from('health_feed_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    return false;
  } else {
    await supabase
      .from('health_feed_follows')
      .insert({ follower_id: followerId, following_id: followingId });
    return true;
  }
}
