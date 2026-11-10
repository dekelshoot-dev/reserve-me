import React, { useEffect, useState } from 'react';

export const AutoUpdateNotifier: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [initialVersion, setInitialVersion] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkVersion = async () => {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.version) {
            const currentVer = String(data.version);
            if (!initialVersion) {
              setInitialVersion(currentVer);
            } else if (currentVer !== initialVersion) {
              if (isMounted) setUpdateAvailable(true);
            }
          }
        }
      } catch (e) {
        // Silently catch fetch errors
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 120000); // Check every 2 minutes

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initialVersion]);

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-[#111c2d] text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/30 flex items-center gap-3 max-w-sm">
        <span className="material-symbols-outlined text-emerald-400 text-xl animate-pulse">system_update</span>
        <div className="flex-1 text-xs">
          <p className="font-bold text-white">Nouvelle version disponible</p>
          <p className="text-slate-300 text-[11px]">Mise à jour prête à être chargée.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 rounded-lg bg-[#006b5f] hover:bg-[#005048] text-white font-bold text-xs transition-colors shrink-0 shadow-xs"
        >
          Mettre à jour
        </button>
      </div>
    </div>
  );
};
