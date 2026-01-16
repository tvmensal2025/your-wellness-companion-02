import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/utils/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!; // admin para storage/delete
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date();
    const cutoffIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // 1) Buscar documentos finalizados há >24h e ainda com imagens salvas
    const { data: docs, error } = await supabase
      .from('medical_documents')
      .select('id,user_id,created_at,analysis_status,file_url,report_path,report_meta,images_deleted_at')
      .eq('is_submitted', true)
      .eq('analysis_status', 'ready')
      .is('images_deleted_at', null)
      .lt('created_at', cutoffIso)
      .limit(500);

    if (error) {
      throw error;
    }

    // Configurar VPS para MinIO
    const VPS_API_URL = Deno.env.get('VPS_API_URL');
    const VPS_API_KEY = Deno.env.get('VPS_API_KEY');
    
    let totalRemoved = 0;
    let totalDocs = 0;
    
    for (const d of docs || []) {
      totalDocs++;
      const paths: string[] = Array.isArray(d.report_meta?.image_paths)
        ? d.report_meta.image_paths as string[]
        : (d.file_url ? [d.file_url as string] : []);
      
      if (paths.length === 0) {
        // apenas marca que não há imagens
        await supabase.from('medical_documents')
          .update({ images_deleted_at: new Date().toISOString(), file_url: null })
          .eq('id', d.id);
        continue;
      }
      
      // Tentar deletar do MinIO via VPS
      let deleted = false;
      if (VPS_API_URL && VPS_API_KEY) {
        try {
          for (const path of paths) {
            // Extrair path relativo da URL do MinIO
            let relativePath = path;
            if (path.startsWith('http')) {
              const urlObj = new URL(path);
              relativePath = urlObj.pathname.split('/').slice(-3).join('/');
            }
            
            await fetch(`${VPS_API_URL}/storage/delete`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': VPS_API_KEY,
              },
              body: JSON.stringify({ path: relativePath, folder: 'medical-exams' }),
            });
          }
          deleted = true;
          totalRemoved += paths.length;
        } catch (vpsError) {
          console.error('Erro ao deletar do MinIO:', vpsError);
        }
      }
      
      // Fallback: tentar Supabase Storage
      if (!deleted) {
        const { error: delErr } = await supabase.storage.from('medical-documents').remove(paths);
        if (delErr) {
          console.error('Falha ao remover imagens do documento', d.id, delErr.message);
          continue;
        }
        totalRemoved += paths.length;
      }
      
      // Atualiza metadados marcando que imagens foram apagadas
      const newMeta = { ...(d.report_meta || {}), images_deleted: true } as Record<string, unknown>;
      await supabase.from('medical_documents')
        .update({ images_deleted_at: new Date().toISOString(), file_url: null, report_meta: newMeta })
        .eq('id', d.id);
    }

    // 2) Limpar temporários - no MinIO a limpeza é feita pelo próprio serviço
    // Apenas logar que a limpeza foi executada
    console.log('[cleanup-medical-images] Limpeza de documentos concluída');

    return new Response(JSON.stringify({ totalDocs, totalRemoved, source: 'minio' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});


