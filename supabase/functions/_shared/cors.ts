/**
 * CORS Configuration for Edge Functions
 * 
 * Em produção, restringe origens permitidas.
 * Em desenvolvimento, permite todas as origens.
 */

// Origens permitidas em produção
const ALLOWED_ORIGINS = [
  'https://maxnutrition.com.br',
  'https://www.maxnutrition.com.br',
  'https://app.maxnutrition.com.br',
  // Lovable preview URLs
  'https://lovable.dev',
  // Adicione outros domínios conforme necessário
];

// Verifica se estamos em ambiente de desenvolvimento
const isDevelopment = () => {
  const env = Deno.env.get('ENVIRONMENT') || Deno.env.get('DENO_ENV') || '';
  return env === 'development' || env === 'local';
};

/**
 * Retorna headers CORS apropriados para a origem da requisição
 */
export const getCorsHeaders = (requestOrigin?: string | null): Record<string, string> => {
  const baseHeaders = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 horas
  };

  // Em desenvolvimento, permite todas as origens
  if (isDevelopment()) {
    return {
      ...baseHeaders,
      'Access-Control-Allow-Origin': '*',
    };
  }

  // Em produção, verifica se a origem é permitida
  if (requestOrigin && ALLOWED_ORIGINS.some(allowed => 
    requestOrigin === allowed || requestOrigin.endsWith('.lovable.app')
  )) {
    return {
      ...baseHeaders,
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Credentials': 'true',
    };
  }

  // Fallback: permite a primeira origem da lista (para requests sem Origin header)
  return {
    ...baseHeaders,
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  };
};

/**
 * Headers CORS permissivos (usar apenas quando necessário)
 * @deprecated Prefira getCorsHeaders() para segurança
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Handler para requisições OPTIONS (preflight)
 */
export const handleCorsPreflightRequest = (req: Request): Response | null => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin');
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }
  return null;
};

/**
 * Wrapper para adicionar CORS headers a uma Response
 */
export const withCors = (response: Response, requestOrigin?: string | null): Response => {
  const corsHeaders = getCorsHeaders(requestOrigin);
  
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
};

/**
 * Cria uma Response JSON com CORS headers
 */
export const jsonResponse = (
  data: unknown,
  status = 200,
  requestOrigin?: string | null
): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(requestOrigin),
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Cria uma Response de erro com CORS headers
 */
export const errorResponse = (
  message: string,
  status = 500,
  requestOrigin?: string | null
): Response => {
  return jsonResponse({ error: message }, status, requestOrigin);
};

export default {
  getCorsHeaders,
  corsHeaders,
  handleCorsPreflightRequest,
  withCors,
  jsonResponse,
  errorResponse,
};
