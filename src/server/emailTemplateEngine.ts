export interface EmailTemplate {
  id: string;
  code: string;
  name: string;
  category: 'Authentification et comptes' | 'Réservations' | 'Gestion des professionnels' | 'Sécurité et système';
  subject: string;
  html: string;
  text: string;
  description: string;
  availableVariables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Master HTML Layout Builder
function wrapInBaseLayout(title: string, bodyContent: string, actionButtonHtml: string = ''): string {
  const appUrl = process.env.APP_URL || 'https://rezeserve.me';
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Header Logo Bar -->
          <tr>
            <td style="background-color: #141b2c; padding: 24px 32px; text-align: left;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #006b5f; border-radius: 8px; width: 32px; height: 32px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: bold; font-size: 16px;">
                    RM
                  </td>
                  <td style="padding-left: 12px; color: #ffffff; font-size: 18px; font-weight: 700; tracking-tight: -0.02em;">
                    Reserve<span style="color: #4fdbc8;">.me</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding: 36px 32px; color: #1e293b; font-size: 15px; line-height: 1.6;">
              <h1 style="color: #0f172a; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 20px; tracking-tight: -0.02em;">
                ${title}
              </h1>

              ${bodyContent}

              ${
                actionButtonHtml
                  ? `<div style="margin: 28px 0; text-align: center;">${actionButtonHtml}</div>`
                  : ''
              }

              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 14px;">
                Cordialement,<br>
                <strong style="color: #0f172a;">L'équipe Reserve Me</strong>
              </div>
            </td>
          </tr>

          <!-- Professional Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 6px 0;">Cet e-mail automatique a été envoyé par <strong>Reserve Me</strong>.</p>
              <p style="margin: 0;">
                <a href="${appUrl}" style="color: #006b5f; text-decoration: none; font-weight: 600;">Accéder à Reserve Me</a> &bull; 
                <a href="mailto:support@reserve-me.io" style="color: #006b5f; text-decoration: none;">Support Client</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Master Templates Initial Repository
export const initialEmailTemplates: EmailTemplate[] = [
  // --- CATÉGORIE A: AUTHENTIFICATION ET COMPTES ---
  {
    id: 'A01',
    code: 'WELCOME',
    name: 'Bienvenue sur Reserve Me',
    category: 'Authentification et comptes',
    description: 'Envoyé immédiatement après la création réussie d\'un compte utilisateur ou praticien.',
    availableVariables: ['firstName', 'lastName', 'fullName', 'email', 'appUrl'],
    isActive: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
    subject: 'Bienvenue sur Reserve Me, {{firstName}} !',
    html: wrapInBaseLayout(
      'Bienvenue sur Reserve Me !',
      `<p>Bonjour {{firstName}},</p>
      <p>Nous sommes ravis de vous accueillir sur <strong>Reserve Me</strong>, votre plateforme intuitive de réservation et de gestion de rendez-vous.</p>
      <p>Votre compte est désormais actif et vous permet de rechercher des professionnels, réserver des prestations en quelques clics ou gérer votre propre cabinet.</p>`,
      `<a href="{{appUrl}}" style="display: inline-block; background-color: #141b2c; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Découvrir Reserve Me</a>`
    ),
    text: `Bonjour {{firstName}},\n\nBienvenue sur Reserve Me !\n\nVotre compte est désormais configuré et prêt à l'emploi.\n\nAccédez à la plateforme : {{appUrl}}\n\nCordialement,\nL'équipe Reserve Me`
  },
  {
    id: 'A02',
    code: 'VERIFY_EMAIL',
    name: 'Vérification de l\'adresse e-mail',
    category: 'Authentification et comptes',
    description: 'Envoyé lors de la création d\'un compte pour valider l\'adresse électronique.',
    availableVariables: ['firstName', 'email', 'verificationLink'],
    isActive: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
    subject: 'Vérifiez votre adresse e-mail — Reserve Me',
    html: wrapInBaseLayout(
      'Vérifiez votre adresse e-mail',
      `<p>Bonjour {{firstName}},</p>
      <p>Une demande de création de compte Reserve Me a été effectuée avec l'adresse <strong>{{email}}</strong>.</p>
      <p>Veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse e-mail et finaliser votre inscription. Ce lien est valide pendant 24 heures.</p>`,
      `<a href="{{verificationLink}}" style="display: inline-block; background-color: #006b5f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Vérifier mon adresse e-mail</a>`
    ),
    text: `Bonjour {{firstName}},\n\nVeuillez vérifier votre adresse e-mail en cliquant sur le lien ci-dessous :\n{{verificationLink}}\n\nCe lien expire dans 24 heures.\n\nCordialement,\nL'équipe Reserve Me`
  },
  {
    id: 'A03',
    code: 'RESET_PASSWORD',
    name: 'Réinitialisation du mot de passe',
    category: 'Authentification et comptes',
    description: 'Envoyé lorsqu\'un utilisateur demande la réinitialisation de son mot de passe.',
    availableVariables: ['firstName', 'email', 'resetPasswordLink'],
    isActive: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
    subject: 'Réinitialisation de votre mot de passe — Reserve Me',
    html: wrapInBaseLayout(
      'Réinitialisation du mot de passe',
      `<p>Bonjour {{firstName}},</p>
      <p>Nous avons reçu une demande de réinitialisation de mot de passe pour le compte associé à <strong>{{email}}</strong>.</p>
      <p>Pour choisir un nouveau mot de passe sécurisé, cliquez sur le bouton ci-dessous :</p>`,
      `<a href="{{resetPasswordLink}}" style="display: inline-block; background-color: #141b2c; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Réinitialiser mon mot de passe</a>`
    ),
    text: `Bonjour {{firstName}},\n\nCliquez sur le lien suivant pour réinitialiser votre mot de passe :\n{{resetPasswordLink}}\n\nSi vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.\n\nCordialement,\nL'équipe Reserve Me`
  },
  {
    id: 'A04',
    code: 'PASSWORD_CHANGED',
    name: 'Mot de passe modifié',
    category: 'Authentification et comptes',
    description: 'Envoyé pour confirmer la modification réussie d\'un mot de passe.',
    availableVariables: ['firstName', 'email', 'currentDate'],
    isActive: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
    subject: 'Votre mot de passe a été modifié',
    html: wrapInBaseLayout(
      'Mot de passe mis à jour',
      `<p>Bonjour {{firstName}},</p>
      <p>Nous vous confirmons que le mot de passe de votre compte Reserve Me ({{email}}) a été modifié le <strong>{{currentDate}}</strong>.</p>
      <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 14px; border-radius: 6px; font-size: 13px; color: #9a3412; margin: 16px 0;">
        Si vous n'avez pas effectué cette modification, veuillez contacter immédiatement notre support de sécurité.
      </div>`
    ),
    text: `Bonjour {{firstName}},\n\nVotre mot de passe Reserve Me a été modifié avec succès le {{currentDate}}.\n\nSi vous n'êtes pas à l'origine de cette action, contactez notre support.\n\nCordialement,\nL'équipe Reserve Me`
  },

  // --- CATÉGORIE B: RÉSERVATIONS ---
  {
    id: 'B01',
    code: 'RESERVATION_CREATED_CLIENT',
    name: 'Nouvelle réservation créée (Client)',
    category: 'Réservations',
    description: 'Envoyé au client immédiatement après la soumission d\'une réservation.',
    availableVariables: ['clientName', 'reservationId', 'establishmentName', 'reservationDate', 'reservationTime', 'peopleCount', 'serviceTitle', 'status', 'establishmentAddress', 'bookingUrl', 'appUrl'],
    isActive: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
    subject: 'Votre réservation sur Reserve Me a bien été enregistrée !',
    html: wrapInBaseLayout(
      'Votre réservation est bien enregistrée !',
      `<p>Bonjour {{clientName}},</p>
      <p>Votre demande de réservation chez <strong>{{establishmentName}}</strong> a été prise en compte avec succès.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #334155;">
          <tr><td width="40%"><strong>N° de réservation :</strong></td><td><strong style="color: #006b5f;">#{{reservationId}}</strong></td></tr>
          <tr><td><strong>Établissement / Pro :</strong></td><td>{{establishmentName}}</td></tr>
          <tr><td><strong>Prestation :</strong></td><td>{{serviceTitle}}</td></tr>
          <tr><td><strong>Date & Heure :</strong></td><td>{{reservationDate}} à {{reservationTime}}</td></tr>
          <tr><td><strong>Nombre de personnes :</strong></td><td>{{peopleCount}}</td></tr>
          <tr><td><strong>Lieu / Adresse :</strong></td><td>{{establishmentAddress}}</td></tr>
          <tr><td><strong>Statut actuel :</strong></td><td><span style="background-color: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">{{status}}</span></td></tr>
        </table>
      </div>
      <p style="font-size: 13px; color: #64748b; font-style: italic;">Note : Si votre réservation est en attente, l'établissement vous enverra un e-mail de confirmation dès la validation de son agenda.</p>`,
      `<a href="{{bookingUrl}}" style="display: inline-block; background-color: #006b5f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Consulter ma réservation</a>`
    ),
    text: `Bonjour {{clientName}},\n\nVotre réservation #{{reservationId}} chez {{establishmentName}} pour {{serviceTitle}} le {{reservationDate}} à {{reservationTime}} a bien été enregistrée.\n\nStatut : {{status}}\nAdresse : {{establishmentAddress}}\n\nLien : {{bookingUrl}}\n\nCordialement,\nL'équipe Reserve Me`
  },
  {
    id: 'B02',
    code: 'RESERVATION_CREATED_PRO',
    name: 'Nouvelle réservation reçue (Professionnel)',
    category: 'Réservations',
    description: 'Envoyé au professionnel/cabinet lorsqu\'un client effectue une nouvelle réservation.',
    availableVariables: ['professionalName', 'clientName', 'clientEmail', 'clientPhone', 'reservationId', 'reservationDate', 'reservationTime', 'peopleCount', 'serviceTitle', 'clientNotes', 'status', 'manageUrl', 'appUrl'],
    isActive: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
    subject: 'Nouvelle réservation reçue sur Reserve Me !',
    html: wrapInBaseLayout(
      'Nouvelle réservation reçue !',
      `<p>Bonjour {{professionalName}},</p>
      <p>Vous avez reçu une nouvelle réservation dans votre espace <strong>Reserve Me</strong>.</p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; color: #166534;">
        <h3 style="margin-top: 0; font-size: 16px; color: #14532d; border-b: 1px solid #dcfce7; padding-bottom: 8px;">Détails de la réservation #{{reservationId}}</h3>
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #166534;">
          <tr><td width="40%"><strong>Client :</strong></td><td><strong>{{clientName}}</strong></td></tr>
          <tr><td><strong>E-mail client :</strong></td><td><a href="mailto:{{clientEmail}}" style="color: #006b5f;">{{clientEmail}}</a></td></tr>
          <tr><td><strong>Téléphone client :</strong></td><td>{{clientPhone}}</td></tr>
          <tr><td><strong>Prestation :</strong></td><td>{{serviceTitle}}</td></tr>
          <tr><td><strong>Date & Heure :</strong></td><td>{{reservationDate}} à {{reservationTime}}</td></tr>
          <tr><td><strong>Nombre de personnes :</strong></td><td>{{peopleCount}}</td></tr>
          <tr><td><strong>Statut :</strong></td><td><span style="background-color: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">{{status}}</span></td></tr>
          <tr><td><strong>Infos complémentaires :</strong></td><td>{{clientNotes}}</td></tr>
        </table>
      </div>`,
      `<a href="{{manageUrl}}" style="display: inline-block; background-color: #141b2c; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Consulter cette réservation</a>`
    ),
    text: `Bonjour {{professionalName}},\n\nNouvelle réservation #{{reservationId}} reçue de {{clientName}} ({{clientEmail}}, {{clientPhone}}) pour {{serviceTitle}} le {{reservationDate}} à {{reservationTime}}.\n\nStatut : {{status}}\nNotes : {{clientNotes}}\n\nGérer la réservation : {{manageUrl}}`
  },
  {
    id: 'B03',
    code: 'RESERVATION_CONFIRMED',
    name: 'Réservation confirmée',
    category: 'Réservations',
    description: 'Envoyé au client lorsque le professionnel valide la réservation.',
    availableVariables: ['clientName', 'establishmentName', 'establishmentAddress', 'serviceTitle', 'reservationDate', 'reservationTime', 'reservationId', 'appUrl'],
    isActive: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
    subject: 'Votre réservation est confirmée !',
    html: wrapInBaseLayout(
      'Réservation confirmée !',
      `<p>Bonjour {{clientName}},</p>
      <p>Excellente nouvelle ! Votre rendez-vous chez <strong>{{establishmentName}}</strong> est officiellement confirmé.</p>
      <div style="background-color: #f8fafc; border-left: 4px solid #006b5f; padding: 18px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-[#0f172a];"><strong>Prestation :</strong> {{serviceTitle}}</p>
        <p style="margin: 0 0 6px 0;"><strong>Date &amp; Heure :</strong> {{reservationDate}} à {{reservationTime}}</p>
        <p style="margin: 0;"><strong>Adresse :</strong> {{establishmentAddress}}</p>
      </div>`,
      `<a href="{{appUrl}}" style="display: inline-block; background-color: #006b5f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Voir ma réservation</a>`
    ),
    text: `Bonjour {{clientName}},\n\nVotre réservation #{{reservationId}} chez {{establishmentName}} le {{reservationDate}} à {{reservationTime}} est désormais confirmée.\n\nAdresse : {{establishmentAddress}}\n\nCordialement,\nL'équipe Reserve Me`
  },
  {
    id: 'B05',
    code: 'RESERVATION_CANCELLED_CLIENT',
    name: 'Réservation annulée par le client',
    category: 'Réservations',
    description: 'Envoyé au professionnel lors de l\'annulation d\'un rendez-vous par un client.',
    availableVariables: ['professionalName', 'clientName', 'serviceTitle', 'reservationDate', 'reservationTime', 'reservationId'],
    isActive: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
    subject: 'Une réservation a été annulée',
    html: wrapInBaseLayout(
      'Réservation annulée',
      `<p>Bonjour {{professionalName}},</p>
      <p>Le client <strong>{{clientName}}</strong> a annulé sa réservation #{{reservationId}} pour <strong>{{serviceTitle}}</strong> prévue le {{reservationDate}} à {{reservationTime}}.</p>
      <p>Le créneau horaire a été libéré automatiquement dans votre agenda.</p>`
    ),
    text: `Bonjour {{professionalName}},\n\nLe client {{clientName}} a annulé le rendez-vous #{{reservationId}} du {{reservationDate}} à {{reservationTime}}.\n\nLe créneau est à nouveau disponible.`
  },
  {
    id: 'B09',
    code: 'RESERVATION_REMINDER',
    name: 'Rappel avant réservation',
    category: 'Réservations',
    description: 'Envoyé au client 24h ou quelques heures avant le rendez-vous.',
    availableVariables: ['clientName', 'establishmentName', 'establishmentAddress', 'serviceTitle', 'reservationDate', 'reservationTime', 'appUrl'],
    isActive: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
    subject: 'Rappel : votre réservation approche !',
    html: wrapInBaseLayout(
      'Rappel de votre rendez-vous',
      `<p>Bonjour {{clientName}},</p>
      <p>Nous vous rappelons votre rendez-vous à venir chez <strong>{{establishmentName}}</strong> :</p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 18px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0;"><strong>Prestation :</strong> {{serviceTitle}}</p>
        <p style="margin: 0 0 6px 0;"><strong>Quand :</strong> {{reservationDate}} à {{reservationTime}}</p>
        <p style="margin: 0;"><strong>Où :</strong> {{establishmentAddress}}</p>
      </div>`,
      `<a href="{{appUrl}}" style="display: inline-block; background-color: #141b2c; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Consulter mon rendez-vous</a>`
    ),
    text: `Bonjour {{clientName}},\n\nRappel de votre rendez-vous {{serviceTitle}} chez {{establishmentName}} le {{reservationDate}} à {{reservationTime}}.\n\nAdresse : {{establishmentAddress}}`
  },

  // --- CATÉGORIE C: GESTION DES PROFESSIONNELS ---
  {
    id: 'C01',
    code: 'PRO_WELCOME',
    name: 'Création d\'un espace professionnel',
    category: 'Gestion des professionnels',
    description: 'Envoyé lors de l\'activation d\'un compte professionnel/cabinet.',
    availableVariables: ['professionalName', 'companyName', 'appUrl'],
    isActive: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
    subject: 'Bienvenue dans votre espace professionnel Reserve Me',
    html: wrapInBaseLayout(
      'Bienvenue Espace Pro !',
      `<p>Bonjour {{professionalName}},</p>
      <p>Bienvenue sur votre espace professionnel Reserve Me dédié au cabinet <strong>{{companyName}}</strong>.</p>
      <p>Vous pouvez dès à présent paramétrer vos prestations, vos horaires de disponibilité et commencer à recevoir des réservations en ligne.</p>`,
      `<a href="{{appUrl}}" style="display: inline-block; background-color: #006b5f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Accéder au tableau de bord Pro</a>`
    ),
    text: `Bonjour {{professionalName}},\n\nBienvenue dans votre espace professionnel Reserve Me pour {{companyName}}.\n\nAccédez à votre tableau de bord : {{appUrl}}`
  },
  {
    id: 'C02',
    code: 'PRO_SUBSCRIPTION',
    name: 'Activation de l\'abonnement Plan Pro',
    category: 'Gestion des professionnels',
    description: 'Envoyé automatiquement lorsqu\'un utilisateur valide son abonnement Plan Pro via Webhook.',
    availableVariables: ['firstName', 'fullName', 'email', 'priceXOF', 'appUrl'],
    isActive: true,
    createdAt: '2026-11-06T10:00:00Z',
    updatedAt: new Date().toISOString(),
    subject: '🎉 Félicitations {{firstName}} ! Votre Plan Pro Reserve Me est désormais activé',
    html: wrapInBaseLayout(
      'Votre Plan Pro est maintenant actif !',
      `<p>Bonjour {{firstName}},</p>
      <p>Nous avons le plaisir de vous informer que votre abonnement au <strong>Plan Pro Reserve Me</strong> a été validé et activé avec succès !</p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; color: #166534;">
        <h3 style="margin-top: 0; color: #14532d; font-size: 16px;">🚀 Vos fonctionnalités Pro débloquées :</h3>
        <ul style="margin: 0; padding-left: 20px; color: #15803d; line-height: 1.8; font-size: 14px;">
          <li><strong>Prestations &amp; Offres illimitées</strong> (sans restriction de limite)</li>
          <li><strong>Notifications par e-mail automatiques via SMTP</strong></li>
          <li><strong>Système de codes de réduction &amp; offres promotionnelles</strong></li>
          <li><strong>Tableau de bord de gestion &amp; suivi financier avancé</strong></li>
        </ul>
      </div>
      <p>Votre compte (<strong>{{email}}</strong>) bénéficie dès à présent de l'accès Pro complet.</p>`,
      `<a href="{{appUrl}}" style="display: inline-block; background-color: #006b5f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Accéder à mon Espace Pro</a>`
    ),
    text: `Bonjour {{firstName}},\n\nFélicitations ! Votre abonnement au Plan Pro Reserve Me est désormais activé.\n\nVous bénéficiez de prestations illimitées, notifications e-mail et outils avancés.\n\nAccéder à votre compte : {{appUrl}}`
  },
  {
    id: 'C03',
    code: 'PLAN_DOWNGRADED_FREE',
    name: 'Expiration ou passage au Plan Gratuit (Free)',
    category: 'Gestion des professionnels',
    description: 'Envoyé automatiquement lorsque l\'abonnement Pro d\'un utilisateur expire ou est repassé au plan Free par un administrateur.',
    availableVariables: ['firstName', 'fullName', 'email', 'appUrl'],
    isActive: true,
    createdAt: '2026-11-10T10:00:00Z',
    updatedAt: new Date().toISOString(),
    subject: 'Mise à jour de votre abonnement Reserve Me — Passage au Plan Gratuit',
    html: wrapInBaseLayout(
      'Information sur votre abonnement',
      `<p>Bonjour {{firstName}},</p>
      <p>Nous vous informons que votre abonnement au <strong>Plan Pro Reserve Me</strong> pour le compte (<strong>{{email}}</strong>) a pris fin ou a été réajusté vers le <strong>Plan Gratuit</strong>.</p>
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 20px 0; color: #991b1b;">
        <h3 style="margin-top: 0; color: #7f1d1d; font-size: 16px;">ℹ️ Ce que cela signifie pour votre compte :</h3>
        <ul style="margin: 0; padding-left: 20px; color: #991b1b; line-height: 1.8; font-size: 14px;">
          <li>Vous conservez l'accès à votre espace professionnel et à vos données existantes.</li>
          <li>Votre catalogue est réajusté à la limite du plan Gratuit.</li>
          <li>Vous pouvez souscrire à nouveau à tout moment pour retrouver les prestations illimitées.</li>
        </ul>
      </div>
      <p>Pour continuer de bénéficier des avantages Pro sans restriction, vous pouvez réactiver votre abonnement Pro depuis votre espace administrateur.</p>`,
      `<a href="{{appUrl}}" style="display: inline-block; background-color: #006b5f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Réactiver mon Plan Pro</a>`
    ),
    text: `Bonjour {{firstName}},\n\nVotre abonnement Reserve Me pour le compte {{email}} est désormais sur le Plan Gratuit.\n\nVous pouvez réactiver votre Plan Pro à tout moment sur : {{appUrl}}`
  },

  // --- CATÉGORIE D: SÉCURITÉ ET SYSTÈME ---
  {
    id: 'D01',
    code: 'SECURITY_ALERT',
    name: 'Alerte de sécurité',
    category: 'Sécurité et système',
    description: 'Envoyé en cas de détection d\'activité suspecte ou de tentative de connexion anormale.',
    availableVariables: ['firstName', 'email', 'currentDate'],
    isActive: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
    subject: 'Alerte de sécurité — Activité sur votre compte Reserve Me',
    html: wrapInBaseLayout(
      'Alerte de sécurité',
      `<p>Bonjour {{firstName}},</p>
      <p>Une activité a été enregistrée sur votre compte Reserve Me ({{email}}) le {{currentDate}}.</p>
      <p>Si vous êtes à l'origine de cette action, aucune mesure supplémentaire n'est requise. Dans le cas contraire, nous vous recommandons de réinitialiser immédiatement votre mot de passe.</p>`
    ),
    text: `Bonjour {{firstName}},\n\nUne activité a été enregistrée sur votre compte le {{currentDate}}.\n\nEn cas de doute, veuillez réinitialiser votre mot de passe.`
  }
];

// In-memory Template Cache
let activeTemplates: EmailTemplate[] = [...initialEmailTemplates];

export function getAllTemplates(): EmailTemplate[] {
  return activeTemplates;
}

export function getTemplateByCode(code: string): EmailTemplate | undefined {
  if (!code) return undefined;
  const upperCode = code.toUpperCase().trim();
  
  // Code alias mappings to support all specifications
  const aliasMap: Record<string, string> = {
    'WELCOME': 'WELCOME',
    'WELCOME_USER': 'WELCOME',
    'VERIFY_EMAIL': 'VERIFY_EMAIL',
    'RESET_PASSWORD': 'RESET_PASSWORD',
    'PASSWORD_CHANGED': 'PASSWORD_CHANGED',
    'RESERVATION_CREATED': 'RESERVATION_CREATED_CLIENT',
    'RESERVATION_CREATED_CLIENT': 'RESERVATION_CREATED_CLIENT',
    'NEW_RESERVATION_NOTIFICATION': 'RESERVATION_CREATED_PRO',
    'RESERVATION_CREATED_PRO': 'RESERVATION_CREATED_PRO',
    'RESERVATION_CONFIRMED': 'RESERVATION_CONFIRMED',
    'RESERVATION_CANCELLED': 'RESERVATION_CANCELLED_CLIENT',
    'RESERVATION_CANCELLED_CLIENT': 'RESERVATION_CANCELLED_CLIENT',
    'RESERVATION_CANCELLED_PRO': 'RESERVATION_CANCELLED_PRO',
    'RESERVATION_REMINDER': 'RESERVATION_REMINDER',
    'PRO_WELCOME': 'PRO_WELCOME',
    'PRO_SUBSCRIPTION': 'PRO_SUBSCRIPTION',
    'SUBSCRIPTION_ACTIVATED': 'PRO_SUBSCRIPTION',
    'PLAN_DOWNGRADED_FREE': 'PLAN_DOWNGRADED_FREE',
    'PRO_EXPIRED': 'PLAN_DOWNGRADED_FREE',
    'SUBSCRIPTION_EXPIRED': 'PLAN_DOWNGRADED_FREE',
    'PLAN_FREE': 'PLAN_DOWNGRADED_FREE',
    'SECURITY_ALERT': 'SECURITY_ALERT'
  };

  const targetCode = aliasMap[upperCode] || upperCode;
  return activeTemplates.find((t) => (t.code === targetCode || t.id === targetCode) && t.isActive);
}

export function updateTemplate(id: string, updates: Partial<EmailTemplate>): EmailTemplate | undefined {
  const idx = activeTemplates.findIndex((t) => t.id === id);
  if (idx !== -1) {
    activeTemplates[idx] = {
      ...activeTemplates[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return activeTemplates[idx];
  }
  return undefined;
}

/**
 * Dynamic Variable Interpolation Engine
 */
export function renderEmailTemplate(
  template: EmailTemplate,
  variables: Record<string, any> = {}
): { subject: string; html: string; text: string } {
  let subject = template.subject;
  let html = template.html;
  let text = template.text;

  const appUrl = process.env.APP_URL || 'https://rezeserve.me';

  const defaultVars: Record<string, any> = {
    appName: 'Reserve Me',
    appUrl,
    supportEmail: 'support@reserve-me.io',
    currentDate: new Date().toLocaleDateString('fr-FR'),
    currentYear: new Date().getFullYear().toString(),
    ...variables,
  };

  // Replace placeholders
  Object.keys(defaultVars).forEach((key) => {
    const rawVal = defaultVars[key];
    const val = rawVal !== undefined && rawVal !== null ? String(rawVal) : '';
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    subject = subject.replace(regex, val);
    html = html.replace(regex, val);
    text = text.replace(regex, val);
  });

  // Clean unreplaced optional variables gracefully
  subject = subject.replace(/{{\s*[\w.]+\s*}}/g, '');
  html = html.replace(/{{\s*[\w.]+\s*}}/g, '');
  text = text.replace(/{{\s*[\w.]+\s*}}/g, '');

  return { subject, html, text };
}
