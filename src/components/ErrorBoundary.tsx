import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in ErrorBoundary:', error, errorInfo);
    
    // Check if error is due to chunk/bundle mismatch after new deployment
    const errMsg = error?.message || String(error);
    const isChunkError = /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk|404|Unexpected token/i.test(errMsg);

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('app_chunk_reload_time');
      const now = Date.now();
      if (!lastReload || (now - parseInt(lastReload, 10)) > 15000) {
        sessionStorage.setItem('app_chunk_reload_time', now.toString());
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    sessionStorage.removeItem('app_chunk_reload_time');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAFC] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200/80 max-w-md w-full flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#006b5f] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-3xl">system_update</span>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#111c2d]">Mise à jour de l'application</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Une nouvelle version de <strong>réserve.me</strong> a été déployée. Cliquez sur le bouton ci-dessous pour charger immédiatement le nouveau code et accéder à l'application.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              type="button"
              className="w-full py-3 px-5 rounded-xl bg-[#006b5f] hover:bg-[#005048] text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              <span>Charger la nouvelle version</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
