import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

type SmtpState = 'connected' | 'error' | 'unconfigured';
type ProviderType = 'gmail' | 'custom';
type AdminTab = 'smtp-config' | 'vue-d-ensemble' | 'email-templates' | 'abonnements' | 'utilisateurs' | 'webhooks';

interface LogItem {
  id: string;
  code: string;
  type: string;
  recipient: string;
  subject: string;
  status: string;
  responseCode: string;
  timestamp: string;
}

interface TemplateItem {
  id: string;
  code: string;
  name: string;
  category: string;
  subject: string;
  html: string;
  description: string;
  availableVariables: string[];
  isActive: boolean;
  updatedAt: string;
}

export const AdminDashboardView: React.FC = () => {
  const { 
    setCurrentView, 
    firebaseUser, 
    userProfile, 
    logout, 
    showToast,
    subscriptionSettings,
    updateSubscriptionSettings,
    allUsersList,
    manuallySetUserPlan,
    webhookLogsList,
    simulateWebhookPayment,
    fetchWebhookLogs
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('smtp-config');
  const [smtpState, setSmtpState] = useState<SmtpState>('connected');
  const [provider, setProvider] = useState<ProviderType>('gmail');

  // Subscription Edit Form State
  const [editProPrice, setEditProPrice] = useState<number>(subscriptionSettings.proPriceXOF || 1000);
  const [editCheckoutUrl, setEditCheckoutUrl] = useState<string>(subscriptionSettings.checkoutUrl || 'https://pay.reserve-me.io/checkout/pro');
  const [editWebhookSecret, setEditWebhookSecret] = useState<string>(subscriptionSettings.webhookSecret || 'whsec_wWyannB9BkCXJhSxk1D5FbqxoM1IWpHvvLhIphNR');
  const [editWebhookProvider, setEditWebhookProvider] = useState<'custom' | 'maketou'>(
    subscriptionSettings.webhookProvider === 'maketou' || subscriptionSettings.webhookSecret === 'maketou' ? 'maketou' : 'custom'
  );

  // Users & Webhooks State
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [selectedWebhookLog, setSelectedWebhookLog] = useState<any | null>(null);
  const [simCustomerEmail, setSimCustomerEmail] = useState<string>(firebaseUser?.email || 'dekel@dekel-dev.com');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Form State
  const [senderName, setSenderName] = useState('Reserve Me');
  const [senderEmail, setSenderEmail] = useState('notifications@reserve-me.io');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('465');
  const [securityType, setSecurityType] = useState<'ssl' | 'starttls' | 'none'>('ssl');
  const [smtpUser, setSmtpUser] = useState('notifications@reserve-me.io');
  const [smtpPassword, setSmtpPassword] = useState('bkqlqmxkpzgvtldq');
  const [showPassword, setShowPassword] = useState(false);

  // Email Templates State
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);

  // Logs & Drawer State
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [showTestDrawer, setShowTestDrawer] = useState(false);
  const [testRecipient, setTestRecipient] = useState(firebaseUser?.email || 'dekel@dekel-dev.com');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [lastMessageId, setLastMessageId] = useState('');

  // Loading States
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSubSettings, setIsSavingSubSettings] = useState(false);
  const [updatingPlanUid, setUpdatingPlanUid] = useState<string | null>(null);

  // Load existing SMTP config, templates & logs from Backend on mount
  useEffect(() => {
    const fetchSmtpConfig = async () => {
      try {
        const res = await fetch('/api/admin/smtp/config');
        if (res.ok) {
          const data = await res.json();
          if (data.senderName) setSenderName(data.senderName);
          if (data.senderEmail) setSenderEmail(data.senderEmail);
          if (data.smtpHost) {
            const cleanHost = data.smtpHost.replace(/\s+/g, '');
            if (!data.smtpHost.includes('.') || /^[a-zA-Z]{16}$/.test(cleanHost)) {
              setSmtpHost('smtp.gmail.com');
            } else {
              setSmtpHost(data.smtpHost);
            }
          }
          if (data.smtpPort) setSmtpPort(String(data.smtpPort));
          if (data.securityType) setSecurityType(data.securityType);
          if (data.smtpUser) setSmtpUser(data.smtpUser);
          if (data.provider) setProvider(data.provider);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération de la config SMTP:', err);
      }
    };

    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/smtp/logs');
        if (res.ok) setLogs(await res.json());
      } catch (err) {
        console.error('Erreur de récupération des logs:', err);
      }
    };

    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/admin/smtp/templates');
        if (res.ok) setTemplates(await res.json());
      } catch (err) {
        console.error('Erreur de récupération des templates:', err);
      }
    };

    fetchSmtpConfig();
    fetchLogs();
    fetchTemplates();
    fetchWebhookLogs();
  }, []);

  useEffect(() => {
    if (activeTab === 'webhooks' || activeTab === 'abonnements') {
      fetchWebhookLogs();
    }
  }, [activeTab]);

  const handleProviderSelect = (selected: ProviderType) => {
    setProvider(selected);
    if (selected === 'gmail') {
      setSmtpHost('smtp.gmail.com');
      setSmtpPort('465');
      setSecurityType('ssl');
      setSmtpUser('notifications@reserve-me.io');
      showToast('Profil prédéfini Gmail SMTP appliqué.');
    } else {
      setSmtpHost('mail.votre-domaine.com');
      setSmtpPort('587');
      setSecurityType('starttls');
      setSmtpUser('smtp-relay@votre-domaine.com');
      showToast('Profil SMTP personnalisé activé. Veuillez saisir vos identifiants.');
    }
  };

  const handlePortChange = (port: string, sec: 'ssl' | 'starttls' | 'none') => {
    setSmtpPort(port);
    setSecurityType(sec);
  };

  const handleSecurityRadioChange = (sec: 'ssl' | 'starttls' | 'none') => {
    setSecurityType(sec);
    if (sec === 'ssl') setSmtpPort('465');
    else if (sec === 'starttls') setSmtpPort('587');
    else setSmtpPort('25');
  };

  const runConnectionTest = async () => {
    setIsTestingConn(true);
    try {
      const res = await fetch('/api/admin/smtp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          smtpHost,
          smtpPort: parseInt(smtpPort, 10),
          securityType,
          smtpUser,
          smtpPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmtpState('connected');
        showToast(`Handshake SSL réussi : ${data.message} [latence ${data.latencyMs || 38}ms]`);
      } else {
        setSmtpState('error');
        showToast(data.error || 'Échec de connexion au serveur SMTP');
      }
    } catch (err) {
      setSmtpState('error');
      showToast('Erreur de connexion au serveur backend.');
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleDispatchTestEmail = async () => {
    if (!testRecipient) {
      showToast('Veuillez saisir une adresse destinataire valide.');
      return;
    }
    setIsDispatching(true);
    setDispatchSuccess(false);

    try {
      const res = await fetch('/api/admin/smtp/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: testRecipient,
          adminEmail: firebaseUser?.email || 'dekel@dekel-dev.com'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchSuccess(true);
        setLastMessageId(data.messageId || '<20250512-test-4882@gmail.com>');
        showToast(`E-mail témoin transmis avec succès à ${testRecipient} !`);

        const logsRes = await fetch('/api/admin/smtp/logs');
        if (logsRes.ok) setLogs(await logsRes.json());
      } else {
        showToast(`Échec d'envoi de test : ${data.error || 'Erreur SMTP'}`);
      }
    } catch (err) {
      showToast('Erreur lors de la transmission de l\'e-mail de test.');
    } finally {
      setIsDispatching(false);
    }
  };

  const handleToggleTemplate = async (tmpl: TemplateItem) => {
    try {
      const res = await fetch(`/api/admin/smtp/templates/${tmpl.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !tmpl.isActive })
      });
      if (res.ok) {
        setTemplates(prev => prev.map(t => t.id === tmpl.id ? { ...t, isActive: !t.isActive } : t));
        showToast(`Modèle "${tmpl.name}" ${!tmpl.isActive ? 'activé' : 'désactivé'}.`);
      }
    } catch (err) {
      showToast('Erreur lors de la mise à jour du modèle.');
    }
  };

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/smtp/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          senderName,
          senderEmail,
          smtpHost,
          smtpPort: parseInt(smtpPort, 10),
          securityType,
          smtpUser,
          smtpPassword,
          adminEmail: firebaseUser?.email || 'dekel@dekel-dev.com'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Configuration SMTP enregistrée et validée au coffre-fort KMS.');
      } else {
        showToast(data.error || 'Erreur lors de l\'enregistrement de la configuration.');
      }
    } catch (err) {
      showToast('Erreur de communication avec le serveur.');
    } finally {
      setIsSaving(false);
    }
  };

  const adminName = userProfile?.displayName || firebaseUser?.displayName || 'dekel-dev';
  const adminEmail = firebaseUser?.email || 'dekel@dekel-dev.com';

  const categories = ['Tous', 'Authentification et comptes', 'Réservations', 'Gestion des professionnels', 'Sécurité et système'];
  const filteredTemplates = selectedCategory === 'Tous' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#111c2d] antialiased">
      {/* Sidebar Administrateur */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between select-none border-r border-slate-100">
        <div className="flex flex-col">
          {/* Logo Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#141b2c] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-[#111c2d]">Reserve Me</span>
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Admin Portal</span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">v2.4</span>
          </div>

          {/* Navigation principale */}
          <div className="px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
              Navigation principale
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('vue-d-ensemble')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeTab === 'vue-d-ensemble'
                    ? 'bg-slate-200/80 text-[#111c2d] font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#111c2d]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                <span>Vue d'ensemble</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('smtp-config')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeTab === 'smtp-config'
                    ? 'bg-slate-200/80 text-[#111c2d] font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#111c2d]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
                <span>Configuration SMTP</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('abonnements')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeTab === 'abonnements'
                    ? 'bg-slate-200/80 text-[#111c2d] font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#111c2d]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                <span>Abonnements &amp; Tarifs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('utilisateurs')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeTab === 'utilisateurs'
                    ? 'bg-slate-200/80 text-[#111c2d] font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#111c2d]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span>Gestion des Utilisateurs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('webhooks')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeTab === 'webhooks'
                    ? 'bg-slate-200/80 text-[#111c2d] font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#111c2d]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">webhook</span>
                <span>Webhooks &amp; Ventes</span>
              </button>
            </nav>
          </div>

          {/* Futurs modules */}
          <div className="px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
              Futurs modules
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 text-xs font-medium cursor-not-allowed opacity-75">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">group</span>
                  <span>Utilisateurs &amp; Droits</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono">Bientôt</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 text-xs font-medium cursor-not-allowed opacity-75">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">history_toggle_off</span>
                  <span>Journaux d'audit</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono">Bientôt</span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 text-xs font-medium cursor-not-allowed opacity-75">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                  <span>Sécurité &amp; API</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono">Bientôt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Sidebar Profile Admin */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#141b2c] flex items-center justify-center text-white font-semibold text-xs shrink-0">
                DE
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-xs text-[#111c2d] truncate">{adminName}</span>
                <span className="text-[11px] text-slate-500 truncate">{adminEmail}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-rose-600 transition-colors"
              title="Déconnexion"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="pl-72">
        {/* Top Header Navbar */}
        <header className="fixed top-0 left-72 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>/</span>
            <span className="text-[#111c2d] font-semibold">Administration</span>
            <span>/</span>
            <span className="text-[#111c2d]">
              {activeTab === 'smtp-config' ? 'Configuration SMTP' : activeTab === 'email-templates' ? 'Modèles E-mails' : 'Vue d\'ensemble'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[#111c2d] font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#006b5f]"></span>
              <span>Production</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200/70 text-[#111c2d] font-mono text-[11px]">
              <span className="material-symbols-outlined text-[14px] text-[#006b5f]">
                {smtpState === 'connected' ? 'check_circle' : smtpState === 'error' ? 'error' : 'warning'}
              </span>
              <span>
                Service Mail : {smtpState === 'connected' ? 'Opérationnel' : smtpState === 'error' ? 'Erreur (535)' : 'Inactif'}
              </span>
            </div>

            {/* Redirect Switcher Button for dekel@dekel-dev.com */}
            <button
              onClick={() => setCurrentView('pro-accueil')}
              className="px-3 py-1.5 rounded-lg bg-[#141b2c] text-white hover:bg-slate-800 text-xs font-medium transition-all shadow-sm flex items-center gap-1.5"
              title="Basculer vers votre tableau de bord utilisateur/praticien"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-teal-400">space_dashboard</span>
              <span>Dashboard Utilisateur</span>
            </button>

            {/* Utility Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => showToast('Documentation SMTP & API v2.4 ouverte.')}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#111c2d] transition-colors"
                title="Documentation"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">menu_book</span>
              </button>
              <button
                onClick={() => showToast('Aucune alerte système critique non lue.')}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#111c2d] transition-colors relative"
                title="Notifications"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
              </button>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="relative pt-20 bg-[#f9f9ff] w-full px-8 py-6 pb-16">
          <div className="flex flex-col w-full max-w-5xl mx-auto">
            {/* Status Simulation Floating Banner */}
            <div className="mb-6 p-4 rounded-xl bg-slate-100/70 border border-slate-200/60 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-200/50">
                  <span className="material-symbols-outlined text-[18px] text-[#111c2d]">tune</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#111c2d]">Console d'émulation système</p>
                  <p className="text-xs text-slate-500">
                    Basculez entre les états pour tester la réactivité des alertes et du diagnostic SMTP
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-lg bg-white/80 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setSmtpState('connected');
                    showToast('État émulé : Connecté (Code 250 OK)');
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                    smtpState === 'connected'
                      ? 'bg-white text-[#111c2d] shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-[#111c2d]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#006b5f]"></span>
                  <span>Connecté</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSmtpState('error');
                    showToast('État émulé : Échec d\'authentification (Code 535)');
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                    smtpState === 'error'
                      ? 'bg-white text-[#111c2d] shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-[#111c2d]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Erreur (535)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSmtpState('unconfigured');
                    showToast('État émulé : Serveur non configuré');
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                    smtpState === 'unconfigured'
                      ? 'bg-white text-[#111c2d] shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-[#111c2d]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>Non configuré</span>
                </button>
              </div>
            </div>

            {/* TAB 1: CONFIGURATION SMTP */}
            {activeTab === 'smtp-config' && (
              <>
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
                  <div className="max-w-2xl">
                    <h1 className="text-2xl font-bold text-[#111c2d] tracking-tight">Configuration SMTP</h1>
                    <p className="text-sm text-slate-500 mt-1">
                      Configurez votre serveur d'envoi d'e-mails pour permettre à Reserve Me d'envoyer automatiquement des notifications et des messages transactionnels.
                    </p>
                  </div>
                </div>

                {/* Live Diagnostic Alert Box */}
                <div className="mb-6 p-4 rounded-xl border bg-white shadow-xs flex items-start gap-4">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      smtpState === 'connected'
                        ? 'bg-teal-50 text-[#006b5f]'
                        : smtpState === 'error'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {smtpState === 'connected' ? 'check_circle' : smtpState === 'error' ? 'error' : 'info'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-[#111c2d]">
                        {smtpState === 'connected'
                          ? 'Connexion SMTP établie avec succès'
                          : smtpState === 'error'
                          ? 'Échec d\'authentification SMTP (Code 535)'
                          : 'Serveur d\'envoi non configuré'}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                          smtpState === 'connected'
                            ? 'bg-teal-50 text-[#006b5f]'
                            : smtpState === 'error'
                            ? 'bg-rose-100 text-rose-700 font-semibold'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {smtpState === 'connected' ? '38 ms' : smtpState === 'error' ? 'Timeout / 535' : 'Inactif'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {smtpState === 'connected' ? (
                        <>
                          Le serveur <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">{smtpHost}</code> répond promptement sur le port {smtpPort} via {securityType.toUpperCase()}. Les jetons applicatifs sont opérationnels.
                        </>
                      ) : smtpState === 'error' ? (
                        <>
                          Google a rejeté les identifiants : <em>535-5.7.8 Username and Password not accepted</em>. Assurez-vous d'utiliser un <strong>Mot de passe d'application</strong> Google et non votre mot de passe habituel.
                        </>
                      ) : (
                        <>
                          Aucun relais SMTP n'est encore actif. Vos e-mails transactionnels de réservation seront placés dans la file d'attente locale.
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column (8 cols) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Provider Selection Bento */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h2 className="text-lg font-semibold text-[#111c2d]">Fournisseur de messagerie</h2>
                          <p className="text-xs text-slate-500">Sélectionnez le mode d'acheminement de vos flux e-mails sortants</p>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 font-semibold">1 / 2 ÉTAPES</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Gmail Card */}
                        <div
                          onClick={() => handleProviderSelect('gmail')}
                          className={`cursor-pointer p-4 rounded-xl relative overflow-hidden transition-all duration-200 border ${
                            provider === 'gmail'
                              ? 'bg-white shadow-md border-teal-500 ring-2 ring-teal-500/20'
                              : 'bg-slate-50 border-slate-200/70 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center p-2 shrink-0">
                                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm text-[#111c2d]">Gmail SMTP</h3>
                                <span className="text-[11px] font-mono text-[#006b5f] font-medium">Recommandé pour démarrer</span>
                              </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs ${provider === 'gmail' ? 'bg-[#006b5f]' : 'bg-slate-200'}`}>
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#006b5f] text-[10px] font-mono font-semibold uppercase tracking-wider">Actif</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              Protocole sécurisé TLS <span className="material-symbols-outlined text-[14px]">lock</span>
                            </span>
                          </div>
                        </div>

                        {/* Custom SMTP Card */}
                        <div
                          onClick={() => handleProviderSelect('custom')}
                          className={`cursor-pointer p-4 rounded-xl relative overflow-hidden transition-all duration-200 border ${
                            provider === 'custom'
                              ? 'bg-white shadow-md border-teal-500 ring-2 ring-teal-500/20'
                              : 'bg-slate-50 border-slate-200/70 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                                <span className="material-symbols-outlined text-[24px]">dns</span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm text-[#111c2d]">Serveur SMTP personnalisé</h3>
                                <span className="text-[11px] font-mono text-slate-500 font-medium">Infra d'entreprise &amp; Cloud</span>
                              </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 ${provider === 'custom' ? 'bg-[#006b5f]' : 'bg-slate-200'}`}>
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              Personnaliser <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SMTP Configuration Form Card */}
                    <div className="p-6 rounded-xl bg-white shadow-md border border-slate-100 flex flex-col gap-6">
                      {/* Guidance Callout */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-200/80 flex items-center justify-center text-[#111c2d] shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-xs text-[#111c2d]">Paramètres Google Workspace recommandés</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Utilisez le port <strong className="text-[#111c2d]">465 (SSL)</strong> ou <strong className="text-[#111c2d]">587 (TLS)</strong> avec un mot de passe d'application généré depuis la sécurité de votre compte Google.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleSaveConfig} className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Sender Name */}
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="senderName" className="text-xs font-semibold text-[#111c2d] flex items-center justify-between">
                              <span>Nom de l'expéditeur</span>
                              <span className="font-mono text-[11px] text-slate-400 font-normal">En-tête FROM</span>
                            </label>
                            <input
                              id="senderName"
                              type="text"
                              value={senderName}
                              onChange={(e) => setSenderName(e.target.value)}
                              placeholder="ex. Reserve Me Notifications"
                              className="h-10 px-3 rounded-lg bg-slate-50 text-[#111c2d] text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006b5f]/20 focus:border-[#006b5f] transition-all"
                            />
                          </div>

                          {/* Sender Email */}
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="senderEmail" className="text-xs font-semibold text-[#111c2d] flex items-center justify-between">
                              <span>Adresse e-mail expéditeur</span>
                            </label>
                            <input
                              id="senderEmail"
                              type="email"
                              value={senderEmail}
                              onChange={(e) => setSenderEmail(e.target.value)}
                              placeholder="notifications@domaine.com"
                              className="h-10 px-3 rounded-lg bg-slate-50 text-[#111c2d] text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006b5f]/20 focus:border-[#006b5f] transition-all"
                            />
                          </div>

                          {/* SMTP Host */}
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="smtpHost" className="text-xs font-semibold text-[#111c2d] flex items-center justify-between">
                              <span>Hôte SMTP (Host)</span>
                              <span className="material-symbols-outlined text-[16px] text-slate-400" title="Serveur distant de relais SMTP">
                                help_outline
                              </span>
                            </label>
                            <div className="relative">
                              <input
                                id="smtpHost"
                                type="text"
                                value={smtpHost}
                                onChange={(e) => setSmtpHost(e.target.value)}
                                className="w-full h-10 pl-3 pr-10 rounded-lg bg-slate-50 text-[#111c2d] text-xs font-mono border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006b5f]/20 focus:border-[#006b5f] transition-all"
                              />
                              <span className="material-symbols-outlined absolute right-3 top-2.5 text-[18px] text-[#006b5f]">
                                cloud_done
                              </span>
                            </div>
                          </div>

                          {/* SMTP Port */}
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="smtpPort" className="text-xs font-semibold text-[#111c2d] flex items-center justify-between">
                              <span>Port SMTP</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                id="smtpPort"
                                type="number"
                                value={smtpPort}
                                onChange={(e) => setSmtpPort(e.target.value)}
                                className="w-24 h-10 px-3 rounded-lg bg-slate-50 text-[#111c2d] text-xs font-mono border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006b5f]/20 focus:border-[#006b5f] transition-all"
                              />
                              <div className="flex items-center gap-1 flex-1">
                                <button
                                  type="button"
                                  onClick={() => handlePortChange('465', 'ssl')}
                                  className={`px-2.5 py-2 rounded-lg text-xs font-mono flex-1 transition-colors text-center ${
                                    smtpPort === '465'
                                      ? 'bg-[#141b2c] text-white font-semibold shadow-xs'
                                      : 'bg-slate-100 hover:bg-slate-200 text-[#111c2d] font-medium'
                                  }`}
                                >
                                  465 (SSL)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePortChange('587', 'starttls')}
                                  className={`px-2.5 py-2 rounded-lg text-xs font-mono flex-1 transition-colors text-center ${
                                    smtpPort === '587'
                                      ? 'bg-[#141b2c] text-white font-semibold shadow-xs'
                                      : 'bg-slate-100 hover:bg-slate-200 text-[#111c2d] font-medium'
                                  }`}
                                >
                                  587 (TLS)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePortChange('25', 'none')}
                                  className={`px-2.5 py-2 rounded-lg text-xs font-mono flex-1 transition-colors text-center ${
                                    smtpPort === '25'
                                      ? 'bg-[#141b2c] text-white font-semibold shadow-xs'
                                      : 'bg-slate-100 hover:bg-slate-200 text-[#111c2d] font-medium'
                                  }`}
                                >
                                  25
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Security Protocol */}
                          <div className="md:col-span-2 flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[#111c2d]">Protocole de chiffrement des sockets</label>
                            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
                              <button
                                type="button"
                                onClick={() => handleSecurityRadioChange('ssl')}
                                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                                  securityType === 'ssl'
                                    ? 'bg-white text-[#111c2d] shadow-sm font-semibold'
                                    : 'text-slate-600 hover:text-[#111c2d]'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[18px]">lock</span>
                                <span>SSL / TLS (Recommandé)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSecurityRadioChange('starttls')}
                                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                                  securityType === 'starttls'
                                    ? 'bg-white text-[#111c2d] shadow-sm font-semibold'
                                    : 'text-slate-600 hover:text-[#111c2d]'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                                <span>STARTTLS</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSecurityRadioChange('none')}
                                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                                  securityType === 'none'
                                    ? 'bg-white text-[#111c2d] shadow-sm font-semibold'
                                    : 'text-slate-600 hover:text-[#111c2d]'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[18px]">lock_open</span>
                                <span>Aucun (Non sécurisé)</span>
                              </button>
                            </div>
                          </div>

                          {/* SMTP Username */}
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="smtpUser" className="text-xs font-semibold text-[#111c2d] flex items-center justify-between">
                              <span>Identifiant SMTP / Login</span>
                              <span className="font-mono text-[11px] text-slate-400">SASL PLAIN</span>
                            </label>
                            <div className="relative">
                              <input
                                id="smtpUser"
                                type="text"
                                value={smtpUser}
                                onChange={(e) => setSmtpUser(e.target.value)}
                                className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 text-[#111c2d] text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006b5f]/20 focus:border-[#006b5f] transition-all"
                              />
                              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[18px] text-slate-400">
                                alternate_email
                              </span>
                            </div>
                          </div>

                          {/* SMTP Password */}
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="smtpPassword" className="text-xs font-semibold text-[#111c2d] flex items-center justify-between">
                              <span>Mot de passe d'application</span>
                              <a
                                href="https://myaccount.google.com/apppasswords"
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-[11px] text-[#006b5f] hover:underline flex items-center gap-0.5"
                              >
                                <span>Générer un mot de passe Google</span>
                                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                              </a>
                            </label>
                            <div className="relative">
                              <input
                                id="smtpPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={smtpPassword}
                                onChange={(e) => setSmtpPassword(e.target.value)}
                                className="w-full h-10 pl-9 pr-10 rounded-lg bg-slate-50 text-[#111c2d] text-xs font-mono tracking-wider border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006b5f]/20 focus:border-[#006b5f] transition-all"
                              />
                              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[18px] text-slate-400">
                                password
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2.5 top-2 text-slate-400 hover:text-[#111c2d] p-0.5"
                                title="Afficher/Masquer le mot de passe"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {showPassword ? 'visibility' : 'visibility_off'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions Bar */}
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={runConnectionTest}
                              disabled={isTestingConn}
                              className="h-10 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#111c2d] text-xs font-semibold transition-all shadow-2xs flex items-center gap-2 border border-slate-200/80"
                            >
                              <span
                                className={`material-symbols-outlined text-[18px] ${
                                  isTestingConn ? 'animate-spin' : ''
                                }`}
                              >
                                {isTestingConn ? 'progress_activity' : 'network_ping'}
                              </span>
                              <span>{isTestingConn ? 'Négociation TLS...' : 'Tester la connexion'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowTestDrawer(!showTestDrawer)}
                              className="h-10 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 text-[#111c2d] text-xs font-semibold transition-all shadow-2xs flex items-center gap-2 border border-slate-200/60"
                            >
                              <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                              <span>Envoyer un e-mail de test</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="reset"
                              onClick={() => {
                                setSenderName('Reserve Me');
                                setSenderEmail('notifications@reserve-me.io');
                                setSmtpHost('smtp.gmail.com');
                                setSmtpPort('465');
                                setSecurityType('ssl');
                                showToast('Formulaire réinitialisé aux paramètres par défaut.');
                              }}
                              className="h-10 px-3 rounded-lg text-slate-500 hover:text-[#111c2d] hover:bg-slate-100 transition-colors text-xs font-medium"
                            >
                              Réinitialiser
                            </button>
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="h-10 px-5 rounded-lg bg-[#141b2c] text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
                            >
                              <span
                                className={`material-symbols-outlined text-[18px] ${
                                  isSaving ? 'animate-spin' : ''
                                }`}
                              >
                                {isSaving ? 'progress_activity' : 'save'}
                              </span>
                              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer la configuration'}</span>
                            </button>
                          </div>
                        </div>
                      </form>

                      {/* Test Email Drawer Area */}
                      {showTestDrawer && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[20px] text-[#006b5f]">
                                outgoing_mail
                              </span>
                              <h5 className="font-semibold text-xs text-[#111c2d]">Transmission d'un e-mail témoin</h5>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowTestDrawer(false)}
                              className="p-1 text-slate-400 hover:text-[#111c2d]"
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mb-3">
                            Un message gabarit intégrant les styles et variables transactionnelles Reserve Me sera expédié sans délai.
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="email"
                              value={testRecipient}
                              onChange={(e) => setTestRecipient(e.target.value)}
                              placeholder="destinataire@exemple.com"
                              className="flex-1 h-10 px-3 rounded-lg bg-white text-[#111c2d] text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006b5f]/20 focus:border-[#006b5f]"
                            />
                            <button
                              type="button"
                              onClick={handleDispatchTestEmail}
                              disabled={isDispatching}
                              className="h-10 px-4 rounded-lg bg-[#006b5f] text-white text-xs font-medium flex items-center gap-2 hover:bg-[#005048] transition-colors shrink-0 shadow-xs"
                            >
                              <span
                                className={`material-symbols-outlined text-[18px] ${
                                  isDispatching ? 'animate-spin' : ''
                                }`}
                              >
                                {isDispatching ? 'progress_activity' : 'send'}
                              </span>
                              <span>{isDispatching ? 'Envoi...' : 'Expédier maintenant'}</span>
                            </button>
                          </div>
                          {dispatchSuccess && (
                            <div className="mt-2 text-[11px] font-mono text-[#006b5f] flex items-center gap-1 font-semibold">
                              <span className="material-symbols-outlined text-[14px]">done_all</span>
                              <span>E-mail délivré avec le Message-ID {lastMessageId}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Historical Logs Bento Section */}
                    <div className="p-5 rounded-xl bg-white shadow-xs border border-slate-100 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px] text-[#111c2d]">history</span>
                          <h3 className="font-semibold text-sm text-[#111c2d]">Journal des dernières requêtes SMTP</h3>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">Fenêtre glissante (24h)</span>
                      </div>

                      <div className="space-y-2">
                        {logs.map((log) => (
                          <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full ${log.status === 'Sent' ? 'bg-[#006b5f]' : 'bg-rose-500'}`}></span>
                              <span className="font-mono text-[#111c2d] font-semibold text-xs">{log.code || '250 2.0.0 OK'}</span>
                              <span className="text-slate-600">{log.type}</span>
                            </div>
                            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                              <span>{log.recipient}</span>
                              <span>{log.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar Column (4 cols) */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Security & Best Practices Card */}
                    <div className="p-5 rounded-xl bg-white shadow-xs border border-slate-100 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-[#006b5f]">shield</span>
                        <h3 className="font-semibold text-sm text-[#111c2d]">Securité &amp; Conformité</h3>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Les identifiants et jetons SMTP sont chiffrés au repos à l'aide d'une clé KMS symétrique AES-GCM 256 bits.
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="material-symbols-outlined text-[16px] text-[#006b5f]">check_circle</span>
                          <span>Chiffrement AES-GCM-256</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="material-symbols-outlined text-[16px] text-[#006b5f]">check_circle</span>
                          <span>Contrôle d'accès RBAC (dekel@dekel-dev.com)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="material-symbols-outlined text-[16px] text-[#006b5f]">check_circle</span>
                          <span>Audit des requêtes d'envoi 24/7</span>
                        </div>
                      </div>
                    </div>

                    {/* Infrastructure Metrics */}
                    <div className="p-5 rounded-xl bg-white shadow-xs border border-slate-100 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-[#111c2d]">Latence moyenne SMTP</h3>
                        <span className="text-[11px] font-mono font-bold text-[#006b5f]">38 ms</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#006b5f] h-full w-[85%] rounded-full"></div>
                      </div>
                      <span className="text-[11px] text-slate-400">Performances serveur excellentes (SLA 99.9%)</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: MODÈLES E-MAILS */}
            {activeTab === 'email-templates' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#111c2d] tracking-tight">Gestion des Modèles E-mails</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Gérez les templates HTML/Texte et les déclencheurs automatiques des e-mails transactionnels de Reserve Me.
                  </p>
                </div>

                {/* Filter Categories Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/60">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-[#141b2c] text-white font-semibold shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-[#111c2d] font-mono text-[11px] font-bold">
                              {tmpl.id}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-teal-50 text-[#006b5f] font-mono text-[10px] font-semibold uppercase">
                              {tmpl.code}
                            </span>
                          </div>
                          {/* Toggle Active Status */}
                          <button
                            type="button"
                            onClick={() => handleToggleTemplate(tmpl)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 ${
                              tmpl.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${tmpl.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            <span>{tmpl.isActive ? 'Actif' : 'Inactif'}</span>
                          </button>
                        </div>

                        <h3 className="font-bold text-sm text-[#111c2d]">{tmpl.name}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{tmpl.description}</p>
                        
                        <div className="mt-1 p-2 rounded bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-600 truncate">
                          <strong className="text-slate-400">Objet :</strong> {tmpl.subject}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[10px] text-slate-400 font-mono">
                          {tmpl.availableVariables.length} variable(s)
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewTemplate(tmpl)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#111c2d] text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span>Aperçu HTML</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ABONNEMENTS & TARIFS */}
            {activeTab === 'abonnements' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#111c2d] tracking-tight">Paramètres des Abonnements &amp; Tarifs</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Gérez le prix du forfait Pro, l'URL du lien de checkout externe et la clé secrète Webhook.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Configuration Form Card */}
                  <div className="p-6 rounded-xl bg-white shadow-xs border border-slate-200/80 space-y-5">
                    <h3 className="font-bold text-base text-[#111c2d] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#006b5f]">tune</span>
                      Paramètres du Forfait Pro
                    </h3>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#111c2d]">Prix Mensuel du Forfait Pro (FCFA)</label>
                        <input
                          type="number"
                          value={editProPrice}
                          onChange={(e) => setEditProPrice(Number(e.target.value))}
                          className="h-10 px-3 rounded-lg bg-slate-50 text-[#111c2d] text-xs font-bold border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006b5f]/20 focus:border-[#006b5f]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#111c2d]">Lien de Checkout Externe (Stripe / Plateforme Externe)</label>
                        <input
                          type="url"
                          value={editCheckoutUrl}
                          onChange={(e) => setEditCheckoutUrl(e.target.value)}
                          className="h-10 px-3 rounded-lg bg-slate-50 text-[#111c2d] text-xs font-mono border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006b5f]/20 focus:border-[#006b5f]"
                          placeholder="https://checkout.stripe.com/c/pay/..."
                        />
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                        <label className="text-xs font-semibold text-[#111c2d]">Mode de Sécurité &amp; Validation du Webhook</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditWebhookProvider('maketou');
                              setEditWebhookSecret('maketou');
                            }}
                            className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                              editWebhookProvider === 'maketou'
                                ? 'border-[#006b5f] bg-emerald-50/70 ring-2 ring-[#006b5f]/20'
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[#006b5f] text-xl mt-0.5">verified_user</span>
                            <div>
                              <p className="text-xs font-bold text-[#111c2d]">Plateforme Marketo / Maketou</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Validation automatique Ed25519 via X-Cart-Signature (sans clé secrète manuelle)</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditWebhookProvider('custom');
                              if (editWebhookSecret === 'maketou') {
                                setEditWebhookSecret('whsec_wWyannB9BkCXJhSxk1D5FbqxoM1IWpHvvLhIphNR');
                              }
                            }}
                            className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                              editWebhookProvider === 'custom'
                                ? 'border-[#006b5f] bg-emerald-50/70 ring-2 ring-[#006b5f]/20'
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[#006b5f] text-xl mt-0.5">key</span>
                            <div>
                              <p className="text-xs font-bold text-[#111c2d]">Clé Secrète Personnalisée</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Chariow, Webhooks HMAC ou Bearer token</p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {editWebhookProvider === 'maketou' ? (
                        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-emerald-700 text-lg shrink-0 mt-0.5">check_circle</span>
                          <div>
                            <p className="font-bold">Mode Marketo / Maketou Sélectionné</p>
                            <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                              La vérification de signature est effectuée automatiquement via la Clé Publique Ed25519 transmise dans l'en-tête <code className="font-mono bg-emerald-100/80 px-1 rounded">X-Cart-Signature</code>. Aucune clé secrète manuelle n'est requise.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-[#111c2d]">Clé Secrète du Webhook (Signature Verification)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editWebhookSecret}
                              onChange={(e) => setEditWebhookSecret(e.target.value)}
                              className="flex-1 h-10 px-3 rounded-lg bg-slate-50 text-[#111c2d] text-xs font-mono border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006b5f]/20 focus:border-[#006b5f]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(editWebhookSecret);
                                showToast('Secret Webhook copié !');
                              }}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-lg flex items-center gap-1 shrink-0"
                            >
                              <span className="material-symbols-outlined text-base">content_copy</span>
                              <span>Copier</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          disabled={isSavingSubSettings}
                          onClick={async () => {
                            setIsSavingSubSettings(true);
                            try {
                              await updateSubscriptionSettings({
                                proPriceXOF: editProPrice,
                                checkoutUrl: editCheckoutUrl,
                                webhookSecret: editWebhookProvider === 'maketou' ? 'maketou' : editWebhookSecret,
                                webhookProvider: editWebhookProvider
                              });
                            } catch (e) {
                              showToast('Erreur lors de la sauvegarde des paramètres');
                            } finally {
                              setIsSavingSubSettings(false);
                            }
                          }}
                          className="px-5 py-2.5 rounded-lg bg-[#141b2c] hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                        >
                          {isSavingSubSettings ? (
                            <>
                              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                              <span>Sauvegarde en cours...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-base">save</span>
                              <span>Sauvegarder les Paramètres</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Overview & Webhook Endpoint Info */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-white shadow-xs border border-slate-200/80 space-y-4">
                      <h3 className="font-bold text-base text-[#111c2d] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006b5f]">api</span>
                        URL du Point de Terminaison Webhook
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Configurez cette URL dans votre fournisseur de paiement externe pour recevoir les notifications automatiques d'activation des comptes Pro.
                      </p>
                      <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs font-mono text-[#111c2d] break-all select-all flex items-center justify-between">
                        <span>{window.location.origin}/api/webhooks/subscription</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/subscription`);
                            showToast('URL Webhook copiée !');
                          }}
                          className="text-xs font-bold text-[#006b5f] hover:underline shrink-0 ml-2"
                        >
                          Copier
                        </button>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-white shadow-xs border border-slate-200/80 space-y-3">
                      <h3 className="font-bold text-base text-[#111c2d] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006b5f]">checklist</span>
                        Règles applicatives des offres
                      </h3>
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          <span><strong>Forfait Free (0 FCFA) :</strong> Limité à 1 service / prestation active.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span><strong>Forfait Pro ({subscriptionSettings.proPriceXOF.toLocaleString('fr-FR')} FCFA) :</strong> Prestations illimitées + Suivi des codes promo + Email automatique.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: GESTION DES UTILISATEURS */}
            {activeTab === 'utilisateurs' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-[#111c2d] tracking-tight">Gestion des Utilisateurs &amp; Plans</h1>
                    <p className="text-sm text-slate-500 mt-1">
                      Visualisez la liste complète des utilisateurs enregistrés et basculez manuellement leur abonnement.
                    </p>
                  </div>

                  <div className="w-full md:w-72">
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom ou email..."
                      className="w-full h-10 px-3 rounded-lg bg-white text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006b5f]/20 focus:border-[#006b5f]"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Utilisateur</th>
                          <th className="py-3 px-4">E-mail</th>
                          <th className="py-3 px-4">Rôle</th>
                          <th className="py-3 px-4">Plan Actuel</th>
                          <th className="py-3 px-4">Statut Email</th>
                          <th className="py-3 px-4 text-right">Actions Plan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {allUsersList
                          .filter(u => 
                            (u.displayName || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                            (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase())
                          )
                          .map((u) => {
                            const uPlan = u.plan || 'free';
                            return (
                              <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4 font-semibold text-[#111c2d]">
                                  {u.displayName || 'Sans nom'}
                                </td>
                                <td className="py-3.5 px-4 font-mono text-slate-600">
                                  {u.email}
                                </td>
                                <td className="py-3.5 px-4 capitalize text-slate-600">
                                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                    u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                    uPlan === 'pro' 
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                                  }`}>
                                    {uPlan}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`text-[11px] font-medium ${u.emailVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {u.emailVerified ? '✓ Vérifié' : 'En attente'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  {updatingPlanUid === u.uid ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#006b5f] font-semibold">
                                      <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                                      <span>Mise à jour...</span>
                                    </span>
                                  ) : uPlan === 'pro' ? (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        setUpdatingPlanUid(u.uid);
                                        try {
                                          await manuallySetUserPlan(u.uid, 'free', u.email);
                                        } finally {
                                          setUpdatingPlanUid(null);
                                        }
                                      }}
                                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                                    >
                                      Passer en Free
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        setUpdatingPlanUid(u.uid);
                                        try {
                                          await manuallySetUserPlan(u.uid, 'pro', u.email);
                                        } finally {
                                          setUpdatingPlanUid(null);
                                        }
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-[#006b5f] hover:bg-[#005048] text-white text-xs font-bold transition-colors shadow-2xs"
                                    >
                                      Activer Plan Pro
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        {allUsersList.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              Aucun utilisateur trouvé.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: WEBHOOKS & HISTORIQUE DES VENTES */}
            {activeTab === 'webhooks' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#111c2d] tracking-tight">Webhooks &amp; Historique des Ventes</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Historique des événements webhooks reçus des plateformes de paiement extérieures et simulateur de test.
                  </p>
                </div>

                {/* Simulator Box */}
                <div className="p-6 rounded-xl bg-white shadow-xs border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-[#111c2d] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#006b5f]">science</span>
                      Simulateur de Webhook (Test de paiement)
                    </h3>
                    <button
                      type="button"
                      onClick={fetchWebhookLogs}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      <span>Rafraîchir les logs</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Saisissez l'adresse e-mail d'un utilisateur pour simuler la réception d'un événement `payment.success` (1 000 FCFA).
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      type="email"
                      value={simCustomerEmail}
                      onChange={(e) => setSimCustomerEmail(e.target.value)}
                      placeholder="client@exemple.com"
                      className="flex-1 h-10 px-3 rounded-lg bg-slate-50 text-xs text-[#111c2d] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006b5f]/20 focus:border-[#006b5f]"
                    />
                    <button
                      type="button"
                      disabled={isSimulating}
                      onClick={async () => {
                        setIsSimulating(true);
                        await simulateWebhookPayment(simCustomerEmail);
                        setIsSimulating(false);
                      }}
                      className="h-10 px-5 rounded-lg bg-[#006b5f] hover:bg-[#005048] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">send</span>
                      <span>{isSimulating ? 'Traitement...' : 'Simuler le Paiement (1 000 FCFA)'}</span>
                    </button>
                  </div>
                </div>

                {/* Webhooks History Table */}
                <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#111c2d]">Journal des Webhooks &amp; Activations Pro</h3>
                    <span className="text-xs text-slate-400 font-mono">{webhookLogsList.length} log(s)</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Date &amp; Heure</th>
                          <th className="py-3 px-4">Provider / Source</th>
                          <th className="py-3 px-4">Client Email</th>
                          <th className="py-3 px-4">Plan Assigné</th>
                          <th className="py-3 px-4">Montant</th>
                          <th className="py-3 px-4">Statut</th>
                          <th className="py-3 px-4 text-right">Payload</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {webhookLogsList.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-[#111c2d]">
                              {new Date(log.receivedAt).toLocaleString('fr-FR')}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-700">
                              {log.provider || 'Stripe / External'}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-800 font-semibold">
                              {log.userEmail}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {log.planAssigned}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-[#111c2d]">
                              {(log.amountXOF || 1000).toLocaleString('fr-FR')} FCFA
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                log.status === 'Success' 
                                  ? 'bg-emerald-50 text-emerald-700' 
                                  : 'bg-rose-50 text-rose-700'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedWebhookLog(log)}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-semibold"
                              >
                                {`{ } JSON`}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {webhookLogsList.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400">
                              Aucun webhook enregistré pour le moment.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Webhook JSON Modal Inspector */}
      {selectedWebhookLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-sm text-[#111c2d] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006b5f]">terminal</span>
                  <span>Payload Webhook JSON ({selectedWebhookLog.id})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Reçu le {new Date(selectedWebhookLog.receivedAt).toLocaleString('fr-FR')}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWebhookLog(null)}
                className="p-1.5 text-slate-400 hover:text-[#111c2d] rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-900 text-emerald-400 font-mono text-xs rounded-b-xl">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(selectedWebhookLog.payloadJson), null, 2);
                  } catch (e) {
                    return selectedWebhookLog.payloadJson;
                  }
                })()}
              </pre>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-xs text-slate-500">Client: {selectedWebhookLog.userEmail}</span>
              <button
                type="button"
                onClick={() => setSelectedWebhookLog(null)}
                className="px-4 py-2 rounded-lg bg-[#141b2c] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HTML Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-sm text-[#111c2d] flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-[#006b5f] font-mono text-[11px]">
                    {previewTemplate.code}
                  </span>
                  <span>{previewTemplate.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{previewTemplate.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="p-1.5 text-slate-400 hover:text-[#111c2d] rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
              <iframe
                title="Aperçu HTML Template"
                srcDoc={previewTemplate.html}
                className="w-full min-h-[480px] bg-white rounded-xl shadow-xs border border-slate-200/80"
              />
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
              <div className="text-xs text-slate-500 font-mono truncate max-w-md">
                Variables : {previewTemplate.availableVariables.map(v => `{{${v}}}`).join(', ')}
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-lg bg-[#141b2c] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Fermer l'aperçu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
