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
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const ignoredErrors = [
      'removeChild',
      'not a child of this node',
      'NotFoundError',
      'The node to be removed is not a child',
      'Failed to execute',
      'Cannot read properties of null',
      'Cannot read properties of undefined',
      'ResizeObserver loop',
      'Script error',
      'ChunkLoadError',
      'Loading chunk',
      'dynamically imported module'
    ];

    const shouldIgnore = ignoredErrors.some(msg => 
      error?.message?.includes(msg) || error?.name?.includes(msg)
    );

    if (shouldIgnore) {
      console.warn('Erro ignorado:', error?.message);
      return { hasError: false, error: undefined };
    }

    return { hasError: true, error, errorCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const ignoredErrors = [
      'removeChild',
      'not a child of this node',
      'NotFoundError',
      'The node to be removed is not a child',
      'Failed to execute',
      'Cannot read properties of null',
      'Cannot read properties of undefined',
      'ResizeObserver loop',
      'Script error',
      'ChunkLoadError',
      'Loading chunk',
      'dynamically imported module'
    ];

    const shouldIgnore = ignoredErrors.some(msg => 
      error?.message?.includes(msg) || error?.name?.includes(msg)
    );

    if (shouldIgnore) {
      console.warn('Erro ignorado:', error?.message);
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined, errorCount: 0 });
      }, 50);
      return;
    }

    console.error('ErrorBoundary:', error?.message);

    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (e) {
        // Ignorar
      }
    }

    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1
    }));

    setTimeout(() => {
      this.setState({ hasError: false, error: undefined });
    }, 2000);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorCount: 0 });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.silent) {
        return null;
      }

      if (this.state.errorCount > 3) {
        return (
          <div className="p-4 bg-gray-900 rounded-lg">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Conteúdo temporariamente indisponível
              </p>
            </div>
          </div>
        );
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 bg-gray-900/50 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
            <span className="text-sm text-gray-400">Carregando...</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
