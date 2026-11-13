import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  buildStructuredDataForRoute,
  DEFAULT_PUBLIC_SITE_URL,
  getRouteConfigByView,
  SITE_BRAND_NAME
} from '../seo/routes';

function getClientPublicBaseUrl(): string {
  const configured = (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  return DEFAULT_PUBLIC_SITE_URL;
}

function upsertMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let meta = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attrName, attrValue);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function upsertCanonical(href: string | null) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!href) {
    if (link) link.remove();
    return;
  }
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export const SeoHead: React.FC = () => {
  const { currentView, subscriptionSettings } = useApp();

  useEffect(() => {
    const route = getRouteConfigByView(currentView);
    const baseUrl = getClientPublicBaseUrl();
    const canonicalUrl = route.isPublicIndexable && baseUrl ? `${baseUrl}${route.path}` : null;

    // 1. Title & Description & Robots
    document.title = route.title;
    upsertMetaTag('name', 'description', route.description);
    upsertMetaTag('name', 'robots', route.robots);

    // 2. Canonical URL (only on public indexable routes)
    upsertCanonical(canonicalUrl);

    // 3. OpenGraph & Twitter Social Cards (strictly non-sensitive, page-accurate)
    upsertMetaTag('property', 'og:type', route.ogType || 'website');
    upsertMetaTag('property', 'og:site_name', SITE_BRAND_NAME);
    upsertMetaTag('property', 'og:locale', 'fr_FR');
    upsertMetaTag('property', 'og:title', route.title);
    upsertMetaTag('property', 'og:description', route.description);
    if (canonicalUrl) {
      upsertMetaTag('property', 'og:url', canonicalUrl);
    } else if (baseUrl) {
      upsertMetaTag('property', 'og:url', `${baseUrl}${route.path}`);
    }

    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
    upsertMetaTag('name', 'twitter:title', route.title);
    upsertMetaTag('name', 'twitter:description', route.description);

    // 4. Schema.org Structured Data (JSON-LD) for public indexable pages
    const existingScript = document.getElementById('seo-structured-data');
    const jsonLd = baseUrl
      ? buildStructuredDataForRoute(route, baseUrl, subscriptionSettings?.proPriceXOF || 1000)
      : null;

    if (jsonLd) {
      const script = (existingScript as HTMLScriptElement | null) || document.createElement('script');
      script.id = 'seo-structured-data';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      if (!existingScript) {
        document.head.appendChild(script);
      }
    } else if (existingScript) {
      existingScript.remove();
    }
  }, [currentView, subscriptionSettings?.proPriceXOF]);

  return null;
};
