import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  silent?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

// Erros que indicam problema de cache/chunk - mostramos UI de recovery
const CHUNK_ERRORS = [
  'ChunkLoadError',
  'Loading chunk',
  'dynamically imported module',
  'Failed to fetch',
  'Importing a module script failed',
  'NetworkError when attempting to fetch',
  'Load failed',
  'error loading dynamically imported module'
];

// Erros inofensivos de DOM que podemos ignorar
const HARMLESS_DOM_ERRORS = [
  'removeChild',
  'not a child of this node',
  'NotFoundError',
  'The node to be removed is not a child',
  'ResizeObserver loop'
];

function isChunkError(message: string): boolean {
  return CHUNK_ERRORS.some(pattern => message.includes(pattern));
}

function isHarmlessDomError(message: string): boolean {
  return HARMLESS_DOM_ERRORS.some(pattern => message.includes(pattern));
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const message = error?.message || '';
    
    // Erros inofensivos de DOM - ignorar silenciosamente
    if (isHarmlessDomError(message)) {
      console.warn('[ErrorBoundary] Erro de DOM ignorado:', message);
      return { hasError: false };
    }

    // Qualquer outro erro - mostrar UI de recovery
    return { 
      hasError: true, 
      error,
      errorInfo: message
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const message = error?.message || '';
    
    // Erros inofensivos - apenas log
    if (isHarmlessDomError(message)) {
      console.warn('[ErrorBoundary] Erro de DOM ignorado:', message);
      return;
    }

    console.error('[ErrorBoundary] Erro capturado:', message);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (e) {
        // Ignorar erro no callback
      }
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearCacheAndReload = async () => {
    try {
      // Limpar todos os caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }

      // Desregistrar service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      }

      // Limpar storage de sessão
      sessionStorage.clear();
    } catch (e) {
      console.warn('[ErrorBoundary] Erro ao limpar cache:', e);
    }

    // Forçar reload
    window.location.reload();
  };

  handleCopyError = () => {
    const errorText = `Erro: ${this.state.error?.message || 'Desconhecido'}\n\nStack: ${this.state.error?.stack || 'N/A'}`;
    navigator.clipboard?.writeText(errorText).then(() => {
      alert('Detalhes copiados!');
    }).catch(() => {
      console.log(errorText);
    });
  };

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  componentDidUpdate(prevProps: Props) {
    // Reset quando children mudar
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.resetError();
    }
  }

  render() {
    if (this.state.hasError) {
      // Se for silent, não renderiza nada
      if (this.props.silent) {
        return null;
      }

      // Se tiver fallback customizado, usa ele
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunk = this.state.errorInfo && isChunkError(this.state.errorInfo);

      // UI de recovery padrão - NUNCA tela branca
      return (
        <div className="fixed inset-0 z-[9999] bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">{isChunk ? '🔄' : '⚠️'}</span>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                {isChunk ? 'Atualização Necessária' : 'Algo deu errado'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isChunk 
                  ? 'Uma nova versão está disponível. Limpe o cache para continuar.'
                  : 'Ocorreu um erro inesperado. Tente recarregar a página.'
                }
              </p>
            </div>

            <div className="space-y-2">
              {isChunk ? (
                <button
                  onClick={this.handleClearCacheAndReload}
                  className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition-colors"
                >
                  🔄 Limpar cache e recarregar
                </button>
              ) : (
                <>
                  <button
                    onClick={this.handleReload}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                  >
                    Recarregar página
                  </button>
                  <button
                    onClick={this.handleClearCacheAndReload}
                    className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded-lg transition-colors"
                  >
                    Limpar cache e recarregar
                  </button>
                </>
              )}
              
              <button
                onClick={this.handleCopyError}
                className="w-full py-2 px-4 text-gray-500 hover:text-gray-300 text-xs transition-colors"
              >
                Copiar detalhes do erro
              </button>
            </div>

            {/* Debug info - só mostra em dev */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-3 bg-gray-900 rounded-lg text-left">
                <p className="text-red-400 text-xs font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
