import React from 'react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] transform transition-all duration-300 ease-out flex items-center gap-2.5 bg-[#101828] text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl border border-slate-700/80 animate-bounce-short">
      <span className="material-symbols-outlined text-[#14B8A6] text-[18px]">check_circle</span>
      <span>{toastMessage}</span>
    </div>
  );
};
