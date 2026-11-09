import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const AiAssistantModal: React.FC = () => {
  const { aiModalOpen, setAiModalOpen, aiModalClient, showToast } = useApp();
  const [actionType, setActionType] = useState<'draft_sms' | 'clinical_summary' | 'occupancy_tips'>('draft_sms');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (aiModalOpen && aiModalClient) {
      if (actionType === 'draft_sms') {
        setCustomPrompt(`Rappeler au patient ${aiModalClient.name} sa consultation de suivi postural prévue et lui demander de confirmer par retour de message.`);
      } else if (actionType === 'clinical_summary') {
        setCustomPrompt(`Rédiger une synthèse clinique pour ${aiModalClient.name} (${aiModalClient.notes})`);
      }
    }
  }, [aiModalOpen, aiModalClient, actionType]);

  if (!aiModalOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedResult('');
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt,
          actionType,
          clientData: aiModalClient
        })
      });

      const data = await res.json();
      if (data.text) {
        setGeneratedResult(data.text);
      } else {
        setGeneratedResult(data.error || 'Aucune réponse générée.');
      }
    } catch (e: any) {
      setGeneratedResult('Erreur de connexion avec le serveur IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedResult) {
      navigator.clipboard.writeText(generatedResult);
      showToast('Texte IA copié dans le presse-papier !');
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#101828] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#14B8A6] flex items-center justify-center text-white font-bold text-sm shadow-inner">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight leading-none">Assistant IA Praticien</h3>
              <p className="text-[11px] text-slate-300 mt-1">Générateur intelligent certifié réserve.me</p>
            </div>
          </div>
          <button 
            onClick={() => setAiModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Action Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Action IA souhaitée</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActionType('draft_sms')}
                className={`py-2 px-2 text-xs font-medium rounded-lg transition-all text-center ${
                  actionType === 'draft_sms'
                    ? 'bg-white text-[#101828] shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rappel SMS
              </button>
              <button
                type="button"
                onClick={() => setActionType('clinical_summary')}
                className={`py-2 px-2 text-xs font-medium rounded-lg transition-all text-center ${
                  actionType === 'clinical_summary'
                    ? 'bg-white text-[#101828] shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Note Clinique
              </button>
              <button
                type="button"
                onClick={() => setActionType('occupancy_tips')}
                className={`py-2 px-2 text-xs font-medium rounded-lg transition-all text-center ${
                  actionType === 'occupancy_tips'
                    ? 'bg-white text-[#101828] shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Conseils Agenda
              </button>
            </div>
          </div>

          {/* Prompt / Details */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Instructions ou données du patient
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] outline-none transition-all resize-none"
              placeholder="Précisez ce que vous souhaitez formuler..."
            />
          </div>

          {/* Action CTA */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#0d9488] text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span>Générer avec Gemini AI</span>
              </>
            )}
          </button>

          {/* Generated Result */}
          {generatedResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#14B8A6] uppercase tracking-wider">Résultat généré</span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-slate-600 hover:text-[#101828] font-medium flex items-center gap-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  <span>Copier</span>
                </button>
              </div>
              <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {generatedResult}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-500">
            Intégration Google Gemini 2.5 • Conforme confidentialité médicale
          </span>
        </div>
      </div>
    </div>
  );
};
