import { ViewMode } from '../types';

export interface RouteSeoConfig {
  view: ViewMode;
  path: string;
  aliases?: string[];
  title: string;
  description: string;
  isPublicIndexable: boolean;
  robots: 'index, follow' | 'noindex, nofollow';
  changefreq?: 'daily' | 'weekly' | 'monthly';
  priority?: string;
  ogType?: 'website' | 'article';
  ssrSummaryHtml?: string;
}

export const SITE_BRAND_NAME = 'réserve.me';
export const DEFAULT_PUBLIC_SITE_URL = 'https://reserve-me.dekel-dev.com';

export const ROUTE_CONFIGS: RouteSeoConfig[] = [
  {
    view: 'public-landing',
    path: '/',
    title: 'réserve.me — Réservation instantanée & Gestion de calendrier SaaS',
    description:
      'Trouvez des professionnels certifiés, consultez leurs disponibilités en temps réel et réservez votre créneau en ligne avec réserve.me.',
    isPublicIndexable: true,
    robots: 'index, follow',
    changefreq: 'daily',
    priority: '1.0',
    ogType: 'website',
    ssrSummaryHtml: `
      <header>
        <nav aria-label="Navigation principale">
          <a href="/">réserve.me</a>
          <a href="/explorer">Explorer</a>
          <a href="/reserver">Réserver</a>
          <a href="/connexion">Connexion</a>
          <a href="/inscription">Inscription</a>
        </nav>
      </header>
      <main>
        <section>
          <h1>Trouvez votre prochain créneau. Réservez en quelques clics.</h1>
          <p>Découvrez des professionnels certifiés, consultez leurs disponibilités synchronisées en temps réel et réservez instantanément au moment qui vous convient.</p>
          <a href="/explorer">Trouver un créneau</a>
          <a href="/reserver">Découvrir l'espace réservation</a>
        </section>
        <section>
          <h2>Explorez par catégorie</h2>
          <ul>
            <li>Coaching &amp; Consultations en ligne</li>
            <li>Beauté, Coiffure &amp; Soins personnels</li>
            <li>Restaurants &amp; Tables d'exception</li>
            <li>Santé &amp; Médecine douce</li>
            <li>Activités, Événements &amp; Loisirs</li>
            <li>Espaces de coworking &amp; Salles privatisables</li>
          </ul>
        </section>
        <section>
          <h2>Comment ça marche ?</h2>
          <p>Trouvez un professionnel ou un service, choisissez un créneau disponible synchronisé en temps réel, puis confirmez et payez en toute sécurité.</p>
        </section>
        <section id="tarification">
          <h2>Des tarifs simples pour développer votre activité</h2>
          <p>Forfait Free (0 FCFA / mois, 1 prestation active) et Forfait Pro (1 000 FCFA / mois, prestations et services illimités, codes promo, rappels automatisés et tableau de bord financier).</p>
        </section>
      </main>
      <footer>
        <p>© 2025-2026 réserve.me — Plateforme SaaS de réservation universelle.</p>
      </footer>
    `
  },
  {
    view: 'public-explorer',
    path: '/explorer',
    title: 'Explorer les offres et professionnels disponibles — réserve.me',
    description:
      'Parcourez les offres et prestations publiées par les professionnels sur réserve.me. Filtrez par spécialité, localisation, tarif et format en ligne.',
    isPublicIndexable: true,
    robots: 'index, follow',
    changefreq: 'daily',
    priority: '0.9',
    ogType: 'website',
    ssrSummaryHtml: `
      <header>
        <nav aria-label="Navigation principale">
          <a href="/">réserve.me</a>
          <a href="/explorer">Explorer</a>
          <a href="/reserver">Réserver</a>
        </nav>
      </header>
      <main>
        <h1>Offres &amp; Prestations des Professionnels sur réserve.me</h1>
        <p>Recherchez un praticien, un coach, un soin ou un espace disponible par mot-clé, ville, modalité en ligne ou plafond tarifaire.</p>
        <a href="/reserver">Réserver un créneau</a>
      </main>
    `
  },
  {
    view: 'public-booking',
    path: '/reserver',
    aliases: ['/booking'],
    title: 'Réserver un créneau en ligne — réserve.me',
    description:
      'Sélectionnez votre prestation, choisissez la date et l’horaire disponibles dans l’agenda en temps réel et confirmez votre rendez-vous sur réserve.me.',
    isPublicIndexable: true,
    robots: 'index, follow',
    changefreq: 'weekly',
    priority: '0.8',
    ogType: 'website',
    ssrSummaryHtml: `
      <header>
        <nav aria-label="Navigation principale">
          <a href="/">réserve.me</a>
          <a href="/explorer">Explorer</a>
          <a href="/reserver">Réserver</a>
        </nav>
      </header>
      <main>
        <h1>Espace Réservation Officiel — réserve.me</h1>
        <p>Choisissez le type de prestation, sélectionnez une date et un créneau horaire disponible puis confirmez votre réservation en ligne.</p>
      </main>
    `
  },
  // Transactional / Auth pages (Publicly reachable, NOT indexable)
  {
    view: 'public-checkout',
    path: '/checkout',
    title: 'Finaliser votre abonnement Pro — réserve.me',
    description: 'Page de paiement sécurisé pour l’activation de l’abonnement Pro sur réserve.me.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'auth-signin',
    path: '/connexion',
    aliases: ['/login', '/signin'],
    title: 'Connexion — réserve.me',
    description: 'Connectez-vous à votre espace réserve.me pour gérer vos rendez-vous et prestations.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'auth-signup',
    path: '/inscription',
    aliases: ['/signup', '/register'],
    title: 'Créer un compte — réserve.me',
    description: 'Créez votre compte sur réserve.me pour réserver des services ou gérer votre agenda professionnel.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'auth-verify-email',
    path: '/verifier-email',
    aliases: ['/auth/verify'],
    title: 'Vérification de l’adresse e-mail — réserve.me',
    description: 'Confirmez votre adresse e-mail pour sécuriser votre compte réserve.me.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'auth-forgot-password',
    path: '/mot-de-passe-oublie',
    aliases: ['/auth/reset-password'],
    title: 'Réinitialiser le mot de passe — réserve.me',
    description: 'Recevez un lien de réinitialisation pour votre compte réserve.me.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  // Private / Authenticated User, Pro & Admin pages (NEVER indexed)
  {
    view: 'user-profile',
    path: '/profil',
    title: 'Profil & Paramètres du compte — réserve.me',
    description: 'Espace privé de gestion du profil et des paramètres de compte.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'pro-accueil',
    path: '/pro',
    title: 'Tableau de bord Professionnel — réserve.me',
    description: 'Espace professionnel privé de gestion des réservations et de l’activité.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'pro-calendrier',
    path: '/pro/calendrier',
    title: 'Calendrier Professionnel — réserve.me',
    description: 'Agenda privé des rendez-vous professionnels.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'pro-reservations',
    path: '/pro/reservations',
    title: 'Gestion des Réservations — réserve.me',
    description: 'Espace privé de suivi des réservations clients.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'pro-services',
    path: '/pro/services',
    title: 'Mes Prestations & Services — réserve.me',
    description: 'Espace privé de gestion des services proposés.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'pro-service-editor',
    path: '/pro/services/editeur',
    title: 'Éditeur de Prestation — réserve.me',
    description: 'Espace privé d’édition de prestation.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'pro-disponibilites',
    path: '/pro/disponibilites',
    title: 'Horaires & Disponibilités — réserve.me',
    description: 'Configuration privée des plages horaires et disponibilités.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'pro-clients',
    path: '/pro/clients',
    title: 'Fichier Clients — réserve.me',
    description: 'Espace privé de gestion de la clientèle.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'pro-facturation',
    path: '/pro/facturation',
    title: 'Facturation & Paiements — réserve.me',
    description: 'Espace privé de suivi financier et facturation.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'pro-promocodes',
    path: '/pro/codes-promo',
    title: 'Codes Promo — réserve.me',
    description: 'Espace privé de gestion des codes promotionnels.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'pro-subscription',
    path: '/pro/abonnement',
    aliases: ['/pro-subscription', '/prosubscribe'],
    title: 'Mon Abonnement — réserve.me',
    description: 'Gestion privée de l’abonnement et confirmation de souscription.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'admin-dashboard',
    path: '/admin',
    title: 'Administration — réserve.me',
    description: 'Espace d’administration interne réservé.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  },
  {
    view: 'not-found',
    path: '/404',
    title: 'Page introuvable (404) — réserve.me',
    description: 'La page demandée n’existe pas ou a été déplacée.',
    isPublicIndexable: false,
    robots: 'noindex, nofollow'
  }
];

export const PUBLIC_INDEXABLE_ROUTES = ROUTE_CONFIGS.filter((r) => r.isPublicIndexable);

export function normalizePathname(pathname: string): string {
  if (!pathname) return '/';
  const cleaned = pathname.split('?')[0].split('#')[0];
  if (cleaned.length > 1 && cleaned.endsWith('/')) {
    return cleaned.slice(0, -1);
  }
  return cleaned || '/';
}

export function getRouteConfigByView(view: ViewMode): RouteSeoConfig {
  return ROUTE_CONFIGS.find((r) => r.view === view) || ROUTE_CONFIGS[0];
}

export function resolveRouteByPath(pathname: string): RouteSeoConfig {
  const normalized = normalizePathname(pathname).toLowerCase();
  const exact = ROUTE_CONFIGS.find(
    (r) =>
      r.path.toLowerCase() === normalized ||
      (r.aliases && r.aliases.some((alias) => alias.toLowerCase() === normalized))
  );
  if (exact) return exact;

  // Return not-found for unknown paths
  return ROUTE_CONFIGS.find((r) => r.view === 'not-found')!;
}

/**
 * Generates strict Schema.org JSON-LD only for public indexable pages,
 * matching real visible information on the page without invented claims.
 */
export function buildStructuredDataForRoute(
  route: RouteSeoConfig,
  baseUrl: string,
  proPriceXOF: number = 1000
): Record<string, unknown> | null {
  if (!route.isPublicIndexable) return null;

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const canonicalUrl = `${cleanBase}${route.path}`;

  if (route.view === 'public-landing') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${cleanBase}/#organization`,
          name: SITE_BRAND_NAME,
          url: cleanBase,
          description:
            'Plateforme SaaS de réservation instantanée, gestion de calendrier et facturation pour professionnels indépendants, praticiens et établissements.'
        },
        {
          '@type': 'WebSite',
          '@id': `${cleanBase}/#website`,
          url: cleanBase,
          name: SITE_BRAND_NAME,
          inLanguage: 'fr-FR',
          publisher: { '@id': `${cleanBase}/#organization` }
        },
        {
          '@type': 'SoftwareApplication',
          name: SITE_BRAND_NAME,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          url: canonicalUrl,
          description: route.description,
          offers: [
            {
              '@type': 'Offer',
              name: 'Forfait Free',
              price: '0',
              priceCurrency: 'XOF'
            },
            {
              '@type': 'Offer',
              name: 'Forfait Pro',
              price: String(proPriceXOF),
              priceCurrency: 'XOF'
            }
          ]
        }
      ]
    };
  }

  if (route.view === 'public-explorer') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: route.title,
      description: route.description,
      url: canonicalUrl,
      inLanguage: 'fr-FR',
      isPartOf: {
        '@type': 'WebSite',
        name: SITE_BRAND_NAME,
        url: cleanBase
      }
    };
  }

  if (route.view === 'public-booking') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: route.title,
      description: route.description,
      url: canonicalUrl,
      inLanguage: 'fr-FR',
      isPartOf: {
        '@type': 'WebSite',
        name: SITE_BRAND_NAME,
        url: cleanBase
      }
    };
  }

  return null;
}
