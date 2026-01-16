import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { invalidateUserDataCache } from '@/hooks/useUserDataCache';
import { uploadToVPS } from '@/lib/vpsApi';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  city: string;
  state: string;
  avatarUrl: string;
  bio: string;
  goals: string[];
  achievements: string[];
}

export const useUserProfile = (user: User | null) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    city: '',
    state: '',
    avatarUrl: '',
    bio: '',
    goals: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar dados do perfil
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Buscar da tabela profiles unificada
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone, birth_date, city, state, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        // Usar dados da tabela profiles
        setProfileData({
          fullName: data.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: data.phone || user.user_metadata?.phone || '',
          birthDate: data.birth_date || user.user_metadata?.birth_date || '',
          city: data.city || user.user_metadata?.city || '',
          state: user.user_metadata?.state || '',
          avatarUrl: data.avatar_url || user.user_metadata?.avatar_url || '',
          bio: user.user_metadata?.bio || 'Transformando minha vida através da saúde e bem-estar.',
          goals: user.user_metadata?.goals || ['Perder peso', 'Melhorar condicionamento', 'Adotar hábitos saudáveis'],
          achievements: user.user_metadata?.achievements || ['Primeira semana completa', 'Primeira pesagem registrada']
        });
      } else {
        // Dados padrão se não existir perfil (não deve acontecer com o trigger)
        setProfileData({
          fullName: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          birthDate: user.user_metadata?.birth_date || '',
          city: user.user_metadata?.city || '',
          state: user.user_metadata?.state || '',
          avatarUrl: user.user_metadata?.avatar_url || '',
          bio: user.user_metadata?.bio || 'Transformando minha vida através da saúde e bem-estar.',
          goals: user.user_metadata?.goals || ['Perder peso', 'Melhorar condicionamento', 'Adotar hábitos saudáveis'],
          achievements: user.user_metadata?.achievements || ['Primeira semana completa', 'Primeira pesagem registrada']
        });
      }

      if (error && error.code && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', error);
      }
    } catch (error) {
      // Rede off/ERR_CONNECTION_RESET: não quebrar a página
      console.warn('Falha de rede ao carregar perfil. Usando dados locais.', error);
      setProfileData(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || prev.fullName,
        email: user.email || prev.email,
        avatarUrl: user.user_metadata?.avatar_url || prev.avatarUrl,
      }));
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (newData: Partial<ProfileData>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      setSaving(true);

      const updatedData = { ...profileData, ...newData };

      const rawAvatarUrl = typeof updatedData.avatarUrl === 'string' ? updatedData.avatarUrl : '';
      const hasDataUriAvatar = rawAvatarUrl.startsWith('data:image');

      // Nunca persistir data-uri gigante em metadata (isso incha o token e quebra requests)
      let avatarUrlToSave = rawAvatarUrl;

      // Se vier data-uri, tenta converter para upload via MinIO (Edge Function)
      if (hasDataUriAvatar) {
        try {
          const blob = await (await fetch(rawAvatarUrl)).blob();
          const ext = blob.type?.split('/')[1] || 'png';
          const file = new File([blob], `${Date.now()}_avatar.${ext}`, { type: blob.type || 'image/png' });

          // Upload via MinIO (Edge Function com fallback para Supabase)
          console.log('[useUserProfile] Enviando avatar para MinIO via Edge Function...');
          const uploadResult = await uploadToVPS(file, 'avatars');
          avatarUrlToSave = uploadResult.url;
          console.log(`[useUserProfile] Upload sucesso via ${uploadResult.source}: ${avatarUrlToSave}`);
        } catch (e) {
          console.warn('Falha ao converter avatar base64 para URL. Limpando avatar na metadata.', e);
          avatarUrlToSave = '';
        }
      }

      console.log('🔄 Atualizando perfil...', {
        user_id: user.id,
        avatar_url_length: avatarUrlToSave?.length || 0,
        avatar_is_data_uri: hasDataUriAvatar,
      });

      // Atualizar na tabela profiles (upsert para criar se não existir)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: updatedData.fullName,
          phone: updatedData.phone,
          birth_date: updatedData.birthDate,
          city: updatedData.city,
          state: updatedData.state,
          avatar_url: avatarUrlToSave,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('❌ Erro ao salvar perfil:', error);
        throw error;
      }

      // Atualizar estado local
      setProfileData({ ...updatedData, avatarUrl: avatarUrlToSave });

      // Atualizar metadata do usuário (NUNCA enviar data-uri)
      const authData: Record<string, any> = {
        full_name: updatedData.fullName,
        phone: updatedData.phone,
        birth_date: updatedData.birthDate,
        city: updatedData.city,
        state: updatedData.state,
        bio: updatedData.bio,
        goals: updatedData.goals,
        achievements: updatedData.achievements,
        avatar_url: avatarUrlToSave || '',
      };

      await supabase.auth.updateUser({ data: authData });
      await supabase.auth.refreshSession();

      // Invalidar cache global para atualizar header imediatamente
      invalidateUserDataCache();

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return null;

    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Apenas arquivos de imagem são permitidos');
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo 5MB permitido');
      }

      console.log('🔄 Iniciando upload do avatar via MinIO...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      // Upload via MinIO (Edge Function com fallback para Supabase)
      const uploadResult = await uploadToVPS(file, 'avatars');
      const avatarUrl = uploadResult.url;
      
      console.log(`✅ Avatar enviado via ${uploadResult.source}: ${avatarUrl}`);

      if (!avatarUrl) {
        throw new Error('Não foi possível gerar URL pública do avatar');
      }

      const result = await updateProfile({ avatarUrl });
      if (result.success) {
        console.log('✅ Avatar atualizado com sucesso');
        return avatarUrl;
      }

      throw new Error('Falha ao atualizar avatar no perfil');
    } catch (error) {
      console.error('❌ Erro ao fazer upload do avatar:', error);
      throw error;
    }
  };

  return {
    profileData,
    loading,
    saving,
    updateProfile,
    uploadAvatar,
    loadProfile
  };
}; 