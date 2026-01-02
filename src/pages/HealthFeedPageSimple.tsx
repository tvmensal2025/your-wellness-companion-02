import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  ThumbsUp,
  Smile,
  Image as ImageIcon,
  Video,
  MapPin,
  MoreHorizontal,
  Send,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export function HealthFeedPageSimple() {
  const [newPost, setNewPost] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  // Dados do usuário atual
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      return {
        id: user.id,
        name: userProfile?.full_name || 'Usuário',
        avatar: userProfile?.avatar_url || '',
        level: 'Iniciante',
        points: 0,
        badges: []
      };
    }
  });

  // Posts mock mais realistas estilo Facebook
  const mockPosts = [
    {
      id: '1',
      user: { 
        name: 'Ana Silva', 
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
        level: 'Intermediário' 
      },
      content: 'Consegui correr 5km hoje! 🏃‍♀️ Meta da semana concluída! Estou muito feliz com meu progresso.',
      image: null,
      type: 'conquista',
      reactions: { likes: 12, loves: 5, wows: 2 },
      comments: [
        { id: '1', user: 'Carlos Santos', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', text: 'Parabéns! Continue assim! 👏', time: '1h' },
        { id: '2', user: 'Maria Oliveira', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', text: 'Que inspiração! 🎉', time: '45min' }
      ],
      shares: 3,
      timeAgo: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      user: { 
        name: 'Carlos Santos', 
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
        level: 'Avançado' 
      },
      content: 'Atingi minha meta de beber 2L de água por dia durante toda a semana! 💧 Hidratação é fundamental!',
      image: null,
      type: 'meta',
      reactions: { likes: 8, loves: 3 },
      comments: [
        { id: '3', user: 'Ana Silva', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', text: 'Ótimo trabalho! 💪', time: '30min' }
      ],
      shares: 1,
      timeAgo: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: '3',
      user: { 
        name: 'Maria Oliveira', 
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
        level: 'Iniciante' 
      },
      content: 'Primeira semana de exercícios completa! Estou muito orgulhosa do meu progresso. A comunidade está me ajudando muito! 🙌',
      image: null,
      type: 'progresso',
      reactions: { likes: 15, loves: 8, wows: 3 },
      comments: [
        { id: '4', user: 'Carlos Santos', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', text: 'Continue assim! Você está no caminho certo!', time: '2h' },
        { id: '5', user: 'Ana Silva', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', text: 'Parabéns pela dedicação! 🎊', time: '1h' }
      ],
      shares: 5,
      timeAgo: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ];

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleComment = (postId: string) => {
    const comment = commentTexts[postId];
    if (!comment?.trim()) return;
    
    // Aqui você adicionaria a lógica para salvar o comentário
    console.log('Comentário:', comment, 'Post:', postId);
    setCommentTexts(prev => ({ ...prev, [postId]: '' }));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto">
          <CardContent className="text-center space-y-4">
            <Users className="w-16 h-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">Login necessário</h3>
            <p className="text-muted-foreground">
              Faça login para acessar a comunidade de saúde.
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Fixo Estilo Facebook */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Comunidade dos Sonhos</h1>
                <p className="text-xs text-gray-500">Feed de Saúde</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="w-9 h-9">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Card de Criar Post */}
        <Card className="mb-4 shadow-sm">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-gray-500 hover:bg-gray-100 rounded-full h-10"
                  onClick={() => setShowCreatePost(true)}
                >
                  <span>No que você está pensando, {currentUser?.name}?</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <Button variant="ghost" className="flex-1 gap-2 text-gray-600 hover:bg-gray-100">
                <Video className="w-5 h-5 text-red-500" />
                <span className="text-sm">Vídeo ao vivo</span>
              </Button>
              <Button variant="ghost" className="flex-1 gap-2 text-gray-600 hover:bg-gray-100">
                <ImageIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm">Foto/vídeo</span>
              </Button>
              <Button variant="ghost" className="flex-1 gap-2 text-gray-600 hover:bg-gray-100">
                <Smile className="w-5 h-5 text-yellow-500" />
                <span className="text-sm">Sentimento</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Criar Post */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Criar publicação</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreatePost(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{currentUser?.name}</p>
                    <Button variant="outline" size="sm" className="h-6 text-xs">
                      Público
                    </Button>
                  </div>
                </div>
                <textarea
                  className="w-full min-h-[150px] border-none outline-none resize-none text-lg"
                  placeholder="No que você está pensando?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                />
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MapPin className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button 
                    onClick={() => {
                      if (newPost.trim()) {
                        // Aqui você salvaria o post
                        setNewPost('');
                        setShowCreatePost(false);
                      }
                    }}
                    disabled={!newPost.trim()}
                  >
                    Publicar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feed de Posts */}
        <div className="space-y-4">
          {mockPosts.map((post) => {
            const isLiked = likedPosts.has(post.id);
            const showComments = expandedComments.has(post.id);
            const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0) + (isLiked ? 1 : 0);

            return (
              <Card key={post.id} className="shadow-sm">
                <CardContent className="p-4">
                  {/* Header do Post */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.user.avatar} />
                        <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900 hover:underline cursor-pointer">
                          {post.user.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>
                            {formatDistanceToNow(post.timeAgo, { addSuffix: true, locale: ptBR })}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{post.type}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Conteúdo do Post */}
                  <div className="mb-3">
                    <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* Estatísticas de Reações e Compartilhamentos */}
                  {(totalReactions > 0 || post.shares > 0) && (
                    <div className="flex items-center justify-between py-2 border-b text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <ThumbsUp className="w-3 h-3 text-white" />
                        </div>
                        <span>{totalReactions}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>{post.comments.length} comentários</span>
                        <span>{post.shares} compartilhamentos</span>
                      </div>
                    </div>
                  )}

                  {/* Botões de Ação */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      className={`flex-1 gap-2 ${isLiked ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                      onClick={() => toggleLike(post.id)}
                    >
                      <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="font-medium">Curtir</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 gap-2 text-gray-600 hover:bg-gray-100"
                      onClick={() => toggleComments(post.id)}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">Comentar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 gap-2 text-gray-600 hover:bg-gray-100"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="font-medium">Compartilhar</span>
                    </Button>
                  </div>

                  {/* Seção de Comentários */}
                  {showComments && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {/* Comentários Existentes */}
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.avatar} />
                            <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                            <p className="font-semibold text-sm">{comment.user}</p>
                            <p className="text-sm text-gray-700">{comment.text}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <button className="text-xs text-gray-500 hover:underline">Curtir</button>
                              <button className="text-xs text-gray-500 hover:underline">Responder</button>
                              <span className="text-xs text-gray-400">{comment.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Input de Novo Comentário */}
                      <div className="flex gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={currentUser?.avatar} />
                          <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
                          <input
                            type="text"
                            placeholder="Escreva um comentário..."
                            className="flex-1 bg-transparent border-none outline-none text-sm"
                            value={commentTexts[post.id] || ''}
                            onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleComment(post.id);
                              }
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleComment(post.id)}
                            disabled={!commentTexts[post.id]?.trim()}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HealthFeedPageSimple;
