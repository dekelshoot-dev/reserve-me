export function getFrenchAuthErrorMessage(error: any): string {
  if (!error) return "Une erreur est survenue lors de l'authentification.";
  const code = error.code || error.message || '';

  switch (code) {
    case 'auth/invalid-email':
      return "L'adresse e-mail saisie est invalide.";
    case 'auth/user-not-found':
      return "Aucun compte n'est associé à cette adresse e-mail.";
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return "Adresse e-mail ou mot de passe incorrect.";
    case 'auth/email-already-in-use':
      return "Cette adresse e-mail est déjà associée à un compte existant.";
    case 'auth/weak-password':
      return "Le mot de passe doit contenir au moins 6 caractères.";
    case 'auth/popup-closed-by-user':
      return "La fenêtre de connexion Google a été fermée avant d'avoir terminé.";
    case 'auth/popup-blocked':
      return "Le navigateur a bloqué la pop-up de connexion Google. Veuillez autoriser les fenêtres surgissantes.";
    case 'auth/account-exists-with-different-credential':
      return "Un compte existe déjà avec cette adresse e-mail via un autre fournisseur. Connectez-vous d'abord avec ce fournisseur pour lier vos comptes.";
    case 'auth/too-many-requests':
      return "Nombreux essais infructueux. Veuillez patienter quelques minutes avant de réessayer.";
    case 'auth/network-request-failed':
      return "Connexion Internet indisponible. Vérifiez votre réseau et réessayez.";
    case 'auth/requires-recent-login':
      return "Cette opération nécessite une reconnexion récente. Reconnectez-vous puis réessayez.";
    case 'auth/user-disabled':
      return "Ce compte utilisateur a été désactivé par l'administrateur.";
    default:
      if (typeof error === 'string') return error;
      return error.message || "Une erreur est survenue lors de l'authentification.";
  }
}
