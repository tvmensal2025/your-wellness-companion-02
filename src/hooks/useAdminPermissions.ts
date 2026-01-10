import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminPermissions = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      // Usar RPC segura para verificar admin (igual ao useAdminMode)
      const { data: isAdminUser, error } = await supabase.rpc('is_admin_user');
      
      if (error) {
        console.error('Erro ao verificar admin via RPC:', error);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      const adminRole = isAdminUser === true;
      setIsAdmin(adminRole);

      // Para super admin, verificar na tabela user_roles
      if (adminRole) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role, permissions')
          .eq('user_id', user.id)
          .maybeSingle();

        // Super admin se tiver role 'admin' E permissions.super === true
        const superAdminLevel = roleData?.role === 'admin' && 
          (roleData?.permissions as any)?.super === true;
        
        setIsSuperAdmin(superAdminLevel);
      } else {
        setIsSuperAdmin(false);
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAdmin,
    isSuperAdmin,
    loading,
    checkPermissions
  };
};
