import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

export const UserProfileView: React.FC = () => {
  const { firebaseUser, userProfile, user, practitioner, setPractitioner, setUser, logout, setCurrentView, showToast } = useApp();

  // Boutique & Profile Form State
  const [displayName, setDisplayName] = useState(userProfile?.displayName || firebaseUser?.displayName || practitioner.name || '');
  const [companyName, setCompanyName] = useState(userProfile?.companyName || user?.companyName || practitioner.cabinetName || '');
  const [title, setTitle] = useState(practitioner.title || 'Praticien & Spécialiste de Santé');
  const [avatar, setAvatar] = useState(firebaseUser?.photoURL || userProfile?.photoURL || practitioner.avatar || 'https://images.unsplash.com/photo-1594824813571-27a3f060fe36?auto=format&fit=crop&w=400&q=80');
  const [coverImage, setCoverImage] = useState(practitioner.coverImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80');
  const [address, setAddress] = useState(practitioner.address || 'Cabinet Principal, Rue du Port, Dakar');
  const [bio, setBio] = useState(practitioner.bio || 'Bienvenue dans notre espace de consultation et de réservation en ligne.');

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsSaving(true);
    try {
      await updateProfile(auth.currentUser, { 
        displayName, 
        photoURL: avatar 
      });

      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const updatedData = {
        displayName,
        companyName,
        photoURL: avatar,
        title,
        coverImage,
        address,
        bio,
        updatedAt: new Date().toISOString()
      };

      await setDoc(userDocRef, updatedData, { merge: true });

      // Update local state
      if (user) {
        setUser({
          ...user,
          name: displayName,
          companyName,
          avatar
        });
      }

      setPractitioner(prev => ({
        ...prev,
        name: displayName,
        cabinetName: companyName,
        title,
        avatar,
        coverImage,
        address,
        bio
      }));

      setIsEditing(false);
      showToast('Informations du cabinet et profil mis à jour avec succès !');
    } catch (e: any) {
      console.error("Error updating profile:", e);
      showToast('Erreur lors de la mise à jour du profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const isVerified = firebaseUser?.emailVerified || userProfile?.emailVerified;
  const provider = firebaseUser?.providerData[0]?.providerId === 'google.com' ? 'Google SSO' : 'E-mail & Mot de passe';

  return (
    <div className="w-full pt-16 min-h-[calc(100vh-4rem)] bg-[#FAFAFC] py-10 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cover Banner Header */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="h-44 sm:h-52 w-full bg-slate-900 relative">
            <img
              src={coverImage}
              alt="Couverture Cabinet"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          </div>

          <div className="p-6 sm:p-8 relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-5">
              <div className="relative shrink-0">
                <img
                  src={avatar}
                  alt={displayName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white shadow-lg bg-white"
                />
                <span className="absolute bottom-1 right-1 bg-[#14B8A6] text-white p-1 rounded-full shadow-sm flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs">verified</span>
                </span>
              </div>

              <div className="space-y-1 text-slate-900 sm:text-white">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-bold uppercase tracking-wider">
                  Compte Professionnel
                </span>
                <h1 className="text-2xl font-black tracking-tight">{companyName || 'Mon Cabinet Pro'}</h1>
                <p className="text-xs text-slate-300 font-medium">{displayName} • {title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2.5 rounded-xl bg-[#0f766e] text-white hover:bg-[#115e59] font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                <span>{isEditing ? 'Fermer l\'édition' : 'Modifier la boutique'}</span>
              </button>

              <button
                onClick={logout}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors flex items-center gap-1.5 bg-white"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Verification Alert */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
          isVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl">
              {isVerified ? 'verified' : 'mark_email_unread'}
            </span>
            <div>
              <span className="font-bold block text-sm">
                {isVerified ? 'Compte vérifié & sécurisé' : 'Adresse e-mail non vérifiée'}
              </span>
              <span className="text-xs opacity-80">
                {isVerified ? 'Votre boutique et vos prestations sont visibles en ligne.' : 'Veuillez valider votre adresse e-mail.'}
              </span>
            </div>
          </div>

          {!isVerified && (
            <button
              onClick={() => setCurrentView('auth-verify-email')}
              className="px-3.5 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs shrink-0"
            >
              Vérifier l'e-mail
            </button>
          )}
        </div>

        {/* Edit Form or Readonly View */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-[#101828]">Paramètres &amp; Identité du Cabinet</h2>
              <p className="text-xs text-slate-500">
                Ces informations apparaissent directement sur votre page de réservation et sur l'Explorer public.
              </p>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom du Cabinet / Boutique *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Studio Althéa ou Cabinet Santé Dakar"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom complet du Praticien *</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ex: Dr. Sarah Martin"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Slogan / Spécialité / Titre *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Praticienne & Ostéopathe diplômée d'État"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Photo de Profil / Avatar *</label>
                  <input
                    type="url"
                    required
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Photo de Couverture *</label>
                  <input
                    type="url"
                    required
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adresse ou Localisation *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: 14 Rue de la Paix, Paris ou Mermoz Dakar"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bio / Présentation de la boutique</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Décrivez brièvement les services de votre cabinet..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#0f766e] text-white font-bold hover:bg-[#115e59] shadow-md transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>{isSaving ? 'Enregistrement...' : 'Enregistrer la boutique'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nom de la boutique / Cabinet</span>
                  <p className="font-extrabold text-[#101828] text-base">{companyName || 'Non configuré'}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Slogan / Spécialité</span>
                  <p className="font-bold text-slate-800">{title}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Praticien Responsable</span>
                  <p className="font-bold text-slate-800">{displayName}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{firebaseUser?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adresse physique</span>
                  <p className="font-bold text-slate-800">{address}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Présentation</span>
                  <p className="text-slate-600 leading-relaxed">{bio}</p>
                </div>

                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Lien public personnalisé</span>
                  <p className="font-mono text-teal-900 font-bold">
                    reserve.me/{displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
