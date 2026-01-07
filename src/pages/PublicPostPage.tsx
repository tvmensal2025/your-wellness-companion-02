import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Post {
  id: string;
  content: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  media_urls?: string[];
  tags?: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export default function PublicPostPage() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError('Post não encontrado');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('health_feed_posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (fetchError) throw fetchError;
        
        // Fetch user profile
        let userName = 'Usuário';
        let userAvatar = undefined;
        
        if (data?.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', data.user_id)
            .single();
            
          if (profile) {
            userName = profile.full_name || 'Usuário';
            userAvatar = profile.avatar_url;
          }
        }
        
        setPost({
          ...data,
          user_name: userName,
          user_avatar: userAvatar
        });
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Post não encontrado ou não disponível');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Carregando post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Post não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              Este post pode ter sido removido ou não está disponível.
            </p>
            <Link to="/auth">
              <Button>Entrar no App</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/6a9f94c5-e38a-4ce6-b597-ba09f8b40304.png" 
              alt="Instituto dos Sonhos" 
              className="h-8 w-auto"
            />
            <span className="font-semibold text-primary">Instituto dos Sonhos</span>
          </div>
          <Link to="/auth">
            <Button size="sm">Entrar</Button>
          </Link>
        </div>
      </header>

      {/* Post Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Post Header */}
            <div className="p-4 flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.user_avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {post.user_name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{post.user_name}</h3>
                <p className="text-xs text-muted-foreground">{timeAgo}</p>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
              <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="px-4 pb-3 flex flex-wrap gap-1">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Media */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="relative">
                <img 
                  src={post.media_urls[0]} 
                  alt="Post media" 
                  className="w-full object-cover max-h-[500px]"
                />
              </div>
            )}

            {/* Stats */}
            <div className="px-4 py-3 border-t flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Heart className="w-5 h-5" />
                <span className="text-sm">{post.likes_count || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{post.comments_count || 0}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="p-4 bg-primary/5 border-t">
              <p className="text-center text-sm text-muted-foreground mb-3">
                Entre no Instituto dos Sonhos para interagir com este post e muito mais!
              </p>
              <Link to="/auth" className="block">
                <Button className="w-full">
                  Criar Conta Gratuita
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Instituto dos Sonhos. Todos os direitos reservados.</p>
        <p className="mt-1">
          <a href="https://institutodossonhos.com.br" className="text-primary hover:underline">
            institutodossonhos.com.br
          </a>
        </p>
      </footer>
    </div>
  );
}
