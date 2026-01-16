/**
 * Utilitário para converter URLs de vídeo para formato embed
 * Suporta: YouTube, Google Drive, OneDrive, Vimeo e outros formatos diretos
 */

export interface VideoProvider {
  type: 'youtube' | 'google-drive' | 'onedrive' | 'vimeo' | 'direct' | 'unknown';
  embedUrl: string;
}

/**
 * Extrai o ID de um arquivo do Google Drive de diferentes formatos de URL
 */
function extractGoogleDriveFileId(url: string): string | null {
  try {
    // Formato 1: https://drive.google.com/file/d/FILE_ID/view
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      return fileMatch[1];
    }

    // Formato 2: https://drive.google.com/open?id=FILE_ID
    // Formato 3: https://drive.google.com/uc?id=FILE_ID
    const urlObj = new URL(url);
    const idParam = urlObj.searchParams.get('id');
    if (idParam) {
      return idParam;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extrai o ID de um vídeo do YouTube de diferentes formatos de URL
 */
function extractYouTubeVideoId(url: string): string | null {
  try {
    // Formato 1: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
    }

    // Formato 2: https://youtu.be/VIDEO_ID
    if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) return match[1];
    }

    // Formato 3: https://www.youtube.com/embed/VIDEO_ID (já está em formato embed)
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch && embedMatch[1]) return embedMatch[1];

    return null;
  } catch {
    return null;
  }
}

/**
 * Extrai o ID de um vídeo do Vimeo
 */
function extractVimeoVideoId(url: string): string | null {
  try {
    // Formato: https://vimeo.com/VIDEO_ID
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match && match[1]) return match[1];

    // Formato embed: https://player.vimeo.com/video/VIDEO_ID
    const embedMatch = url.match(/player\.vimeo\.com\/video\/(\d+)/);
    if (embedMatch && embedMatch[1]) return embedMatch[1];

    return null;
  } catch {
    return null;
  }
}

/**
 * Extrai informações de um arquivo do OneDrive de diferentes formatos de URL
 * Retorna um objeto com o ID e tipo de URL do OneDrive
 */
function extractOneDriveInfo(url: string): { embedUrl: string | null; directUrl: string | null } {
  try {
    // Formato 1: OneDrive Personal (onedrive.live.com)
    // https://onedrive.live.com/?id=ROOT%2FVIDEO.mp4&cid=CID#cid=CID&id=ROOT%2FVIDEO.mp4
    if (url.includes('onedrive.live.com')) {
      const urlObj = new URL(url);
      const idParam = urlObj.searchParams.get('id');
      const cidParam = urlObj.searchParams.get('cid') || urlObj.hash.match(/cid=([^&]+)/)?.[1];
      
      if (idParam && cidParam) {
        // Converter para formato de embed/view
        const decodedId = decodeURIComponent(idParam);
        const embedUrl = `https://onedrive.live.com/embed?cid=${encodeURIComponent(cidParam)}&resid=${encodeURIComponent(cidParam)}%21${encodeURIComponent(decodedId.split('/').pop() || '')}&authkey=!AUTHKEY&em=2`;
        // Para embed real, precisamos usar o formato de compartilhamento direto
        return { 
          embedUrl: null, // OneDrive não suporta embed direto
          directUrl: url // Usar URL original
        };
      }
    }

    // Formato 2: OneDrive/SharePoint Business (sharepoint.com)
    // https://[tenant].sharepoint.com/:v:/g/personal/.../VIDEO.mp4
    // ou https://[tenant].sharepoint.com/:v:/r/...
    if (url.includes('sharepoint.com')) {
      // Tentar converter para formato de visualização
      const sharepointMatch = url.match(/(https:\/\/[^/]+\.sharepoint\.com\/[^:]+:v:[^/]+\/[^?]+)/);
      if (sharepointMatch) {
        const baseUrl = sharepointMatch[1];
        // Converter para formato de visualização
        const viewUrl = baseUrl.replace(':v:', ':v:/').replace(/\/r\//, '/').replace(/\/g\//, '/');
        return {
          embedUrl: null, // SharePoint precisa de autenticação para embed
          directUrl: url // Usar URL original ou redirecionar
        };
      }
    }

    // Formato 3: Link curto do OneDrive (1drv.ms)
    // Este formato precisa ser expandido primeiro
    if (url.includes('1drv.ms')) {
      return {
        embedUrl: null,
        directUrl: url // Link curto precisa ser expandido
      };
    }

    // Formato 4: Link de compartilhamento direto do OneDrive
    // https://1drv.ms/v/s!...
    if (url.includes('1drv.ms/v/')) {
      // Este link pode ser usado diretamente, mas precisa ser acessível publicamente
      return {
        embedUrl: null,
        directUrl: url
      };
    }

    return { embedUrl: null, directUrl: null };
  } catch {
    return { embedUrl: null, directUrl: null };
  }
}

/**
 * Verifica se uma URL do OneDrive pode ser embedada diretamente
 */
export function canEmbedOneDrive(url: string): boolean {
  // OneDrive pode ser embedado usando iframe, mas requer configurações específicas
  // SharePoint geralmente não permite embed sem autenticação
  if (url.includes('sharepoint.com')) {
    return false; // SharePoint geralmente requer autenticação
  }
  
  // OneDrive Personal pode funcionar se estiver compartilhado publicamente
  return url.includes('onedrive.live.com') || url.includes('1drv.ms');
}

/**
 * Converte URL do OneDrive para formato que pode ser usado em iframe
 * OneDrive suporta embed usando iframe, mas requer URL formatada corretamente
 */
function getOneDriveEmbedUrl(url: string): string {
  try {
    // Formato 1: SharePoint (geralmente não funciona bem em embed)
    if (url.includes('sharepoint.com')) {
      // Tenta converter para formato de visualização embed
      // Formato: https://[tenant].sharepoint.com/sites/[site]/_layouts/15/embed.aspx?UniqueId=[id]
      const embedMatch = url.match(/(https:\/\/[^/]+\.sharepoint\.com\/[^:]+:v:[^/]+\/[^?]+)/);
      if (embedMatch) {
        // Adiciona parâmetros para embed
        const baseUrl = embedMatch[1].replace(':v:/', '/').replace(':v:', '/');
        return `${baseUrl}?action=embedview&wdStartOn=1`;
      }
      // Retorna URL original para tentar em iframe
      return url;
    }

    // Formato 2: OneDrive Personal (onedrive.live.com)
    if (url.includes('onedrive.live.com')) {
      // Tenta converter para formato de embed
      // Formato de embed: https://onedrive.live.com/embed?cid=...&resid=...&authkey=...
      const urlObj = new URL(url);
      const idParam = urlObj.searchParams.get('id');
      const cidParam = urlObj.searchParams.get('cid') || urlObj.hash.match(/cid=([^&]+)/)?.[1];
      
      if (idParam && cidParam) {
        // Tenta construir URL de embed
        // Nota: Pode precisar de authkey que vem do link de compartilhamento
        return url.replace(/\?.*$/, '') + '?embed=1&em=2';
      }
    }

    // Formato 3: Link curto (1drv.ms) - precisa ser expandido
    if (url.includes('1drv.ms')) {
      // Links curtos podem ser usados, mas o melhor é obter o link completo
      return url;
    }

    // Retorna URL original para tentar em iframe
    // O navegador pode conseguir carregar se o vídeo estiver compartilhado publicamente
    return url;
  } catch {
    return url;
  }
}

/**
 * Obtém URL direta de download do OneDrive (quando possível)
 * Útil para usar em player HTML5 <video>
 */
export function getOneDriveDirectUrl(url: string): string | null {
  try {
    // Para OneDrive, converter para URL de download direto é complexo
    // Geralmente requer autenticação ou chave de acesso
    // Retorna null para usar o método de embed/link
    return null;
  } catch {
    return null;
  }
}

/**
 * Converte uma URL de vídeo para formato embed apropriado
 * @param rawUrl - URL original do vídeo
 * @param options - Opções de configuração (autoplay, etc)
 * @returns URL formatada para embed em iframe
 */
export function getVideoEmbedUrl(
  rawUrl?: string,
  options: {
    autoplay?: boolean;
    allowFullscreen?: boolean;
  } = {}
): string {
  const { autoplay = true, allowFullscreen = true } = options;
  const fallback = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';

  if (!rawUrl) return fallback;

  try {
    // Google Drive
    if (rawUrl.includes('drive.google.com')) {
      const fileId = extractGoogleDriveFileId(rawUrl);
      if (fileId) {
        // Use preview mode para vídeos do Google Drive
        // IMPORTANTE: O arquivo precisa estar configurado como "Qualquer pessoa com o link pode visualizar"
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    // OneDrive
    if (rawUrl.includes('onedrive.live.com') || rawUrl.includes('sharepoint.com') || rawUrl.includes('1drv.ms')) {
      return getOneDriveEmbedUrl(rawUrl);
    }

    // YouTube
    if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
      const videoId = extractYouTubeVideoId(rawUrl);
      if (videoId) {
        const params = new URLSearchParams();
        if (autoplay) params.set('autoplay', '1');
        params.set('rel', '0'); // Não mostrar vídeos relacionados
        if (allowFullscreen) params.set('fs', '1');
        return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
      }
    }

    // Vimeo
    if (rawUrl.includes('vimeo.com')) {
      const videoId = extractVimeoVideoId(rawUrl);
      if (videoId) {
        const params = new URLSearchParams();
        if (autoplay) params.set('autoplay', '1');
        params.set('title', '0');
        params.set('byline', '0');
        params.set('portrait', '0');
        return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
      }
    }

    // Se já está em formato embed ou é uma URL direta, retorna como está
    if (rawUrl.includes('/embed/') || rawUrl.match(/^https?:\/\/.*\.(mp4|webm|ogg)$/i)) {
      return rawUrl;
    }

    // Fallback: retorna URL original
    return rawUrl;
  } catch (error) {
    console.error('Erro ao processar URL de vídeo:', error);
    return fallback;
  }
}

/**
 * Detecta o tipo de provedor de vídeo baseado na URL
 */
export function detectVideoProvider(rawUrl?: string): VideoProvider {
  if (!rawUrl) {
    return { type: 'unknown', embedUrl: '' };
  }

  try {
    if (rawUrl.includes('drive.google.com')) {
      const fileId = extractGoogleDriveFileId(rawUrl);
      if (fileId) {
        return {
          type: 'google-drive',
          embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        };
      }
    }

    if (rawUrl.includes('onedrive.live.com') || rawUrl.includes('sharepoint.com') || rawUrl.includes('1drv.ms')) {
      return {
        type: 'onedrive',
        embedUrl: getOneDriveEmbedUrl(rawUrl),
      };
    }

    if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
      const videoId = extractYouTubeVideoId(rawUrl);
      if (videoId) {
        return {
          type: 'youtube',
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
        };
      }
    }

    if (rawUrl.includes('vimeo.com')) {
      const videoId = extractVimeoVideoId(rawUrl);
      if (videoId) {
        return {
          type: 'vimeo',
          embedUrl: `https://player.vimeo.com/video/${videoId}`,
        };
      }
    }

    // Verifica se é um arquivo de vídeo direto
    if (rawUrl.match(/^https?:\/\/.*\.(mp4|webm|ogg)$/i)) {
      return { type: 'direct', embedUrl: rawUrl };
    }

    // Se já está em formato embed
    if (rawUrl.includes('/embed/') || rawUrl.includes('/preview')) {
      return { type: 'direct', embedUrl: rawUrl };
    }

    return { type: 'unknown', embedUrl: rawUrl };
  } catch {
    return { type: 'unknown', embedUrl: rawUrl };
  }
}

