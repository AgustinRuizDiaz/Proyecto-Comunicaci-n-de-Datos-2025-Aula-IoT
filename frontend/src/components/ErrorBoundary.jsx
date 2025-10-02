import React from 'react';
import { getShadowClasses } from '../utils/theme';

// Error Boundary personalizado
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para mostrar la UI de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log del error (puedes reemplazar esto con tu servicio de logging)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Aquí podrías enviar el error a un servicio de monitoreo
    // reportError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Renderizar UI de error personalizada
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.handleRetry,
          this.handleReload,
          this.state.retryCount
        );
      }

      // UI de error por defecto
      return (
        <DefaultErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          retryCount={this.state.retryCount}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      );
    }

    return this.props.children;
  }
}

// Componente de fallback por defecto
const DefaultErrorFallback = ({
  error,
  onRetry,
  onReload,
  retryCount,
  showDetails = false
}) => {
  return (
    <div className={`min-h-[400px] flex items-center justify-center p-8 ${getShadowClasses('sm')}`}>
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Algo salió mal
          </h2>
          <p className="text-slate-600 mb-6">
            Ha ocurrido un error inesperado. Puedes intentar nuevamente o recargar la página.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Intentar nuevamente
          </button>

          <button
            onClick={onReload}
            className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Recargar página
          </button>
        </div>

        {retryCount > 0 && (
          <p className="text-sm text-slate-500 mt-4">
            Intentos realizados: {retryCount}
          </p>
        )}

        {/* Información de debug en desarrollo */}
        {showDetails && error && (
          <details className="mt-6 text-left">
            <summary className="text-sm font-medium text-slate-700 cursor-pointer hover:text-slate-900">
              Detalles del error (desarrollo)
            </summary>
            <div className="mt-2 p-4 bg-slate-50 rounded-md text-xs font-mono text-slate-600 overflow-auto max-h-40">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              {error.stack && (
                <div className="mb-2">
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

// Hook para errores en componentes funcionales
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error) => {
    setError(error);
  }, []);

  // Componente de error para usar en try-catch
  const ErrorFallback = ({ children }) => {
    if (error) {
      return (
        <DefaultErrorFallback
          error={error}
          onRetry={resetError}
          onReload={() => window.location.reload()}
          retryCount={0}
        />
      );
    }
    return children;
  };

  return {
    error,
    handleError,
    resetError,
    ErrorFallback
  };
};

export default ErrorBoundary;
