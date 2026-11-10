// server.ts
import express from "express";
import dotenv from "dotenv";
import path2 from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

// src/server/smtpBackend.ts
import { Router } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

// src/server/emailTemplateEngine.ts
function wrapInBaseLayout(title, bodyContent, actionButtonHtml = "") {
  const appUrl = process.env.APP_URL || "https://rezeserve.me";
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

              ${actionButtonHtml ? `<div style="margin: 28px 0; text-align: center;">${actionButtonHtml}</div>` : ""}

              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 14px;">
                Cordialement,<br>
                <strong style="color: #0f172a;">L'\xE9quipe Reserve Me</strong>
              </div>
            </td>
          </tr>

          <!-- Professional Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 6px 0;">Cet e-mail automatique a \xE9t\xE9 envoy\xE9 par <strong>Reserve Me</strong>.</p>
              <p style="margin: 0;">
                <a href="${appUrl}" style="color: #006b5f; text-decoration: none; font-weight: 600;">Acc\xE9der \xE0 Reserve Me</a> &bull; 
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
var initialEmailTemplates = [
  // --- CATÉGORIE A: AUTHENTIFICATION ET COMPTES ---
  {
    id: "A01",
    code: "WELCOME",
    name: "Bienvenue sur Reserve Me",
    category: "Authentification et comptes",
    description: "Envoy\xE9 imm\xE9diatement apr\xE8s la cr\xE9ation r\xE9ussie d'un compte utilisateur ou praticien.",
    availableVariables: ["firstName", "lastName", "fullName", "email", "appUrl"],
    isActive: true,
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    subject: "Bienvenue sur Reserve Me, {{firstName}} !",
    html: wrapInBaseLayout(
      "Bienvenue sur Reserve Me !",
      `<p>Bonjour {{firstName}},</p>
      <p>Nous sommes ravis de vous accueillir sur <strong>Reserve Me</strong>, votre plateforme intuitive de r\xE9servation et de gestion de rendez-vous.</p>
      <p>Votre compte est d\xE9sormais actif et vous permet de rechercher des professionnels, r\xE9server des prestations en quelques clics ou g\xE9rer votre propre cabinet.</p>`,
      `<a href="{{appUrl}}" style="display: inline-block; background-color: #141b2c; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">D\xE9couvrir Reserve Me</a>`
    ),
    text: `Bonjour {{firstName}},

Bienvenue sur Reserve Me !

Votre compte est d\xE9sormais configur\xE9 et pr\xEAt \xE0 l'emploi.

Acc\xE9dez \xE0 la plateforme : {{appUrl}}

Cordialement,
L'\xE9quipe Reserve Me`
  },
  {
    id: "A02",
    code: "VERIFY_EMAIL",
    name: "V\xE9rification de l'adresse e-mail",
    category: "Authentification et comptes",
    description: "Envoy\xE9 lors de la cr\xE9ation d'un compte pour valider l'adresse \xE9lectronique.",
    availableVariables: ["firstName", "email", "verificationLink"],
    isActive: true,
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    subject: "V\xE9rifiez votre adresse e-mail \u2014 Reserve Me",
    html: wrapInBaseLayout(
      "V\xE9rifiez votre adresse e-mail",
      `<p>Bonjour {{firstName}},</p>
      <p>Une demande de cr\xE9ation de compte Reserve Me a \xE9t\xE9 effectu\xE9e avec l'adresse <strong>{{email}}</strong>.</p>
      <p>Veuillez cliquer sur le bouton ci-dessous pour v\xE9rifier votre adresse e-mail et finaliser votre inscription. Ce lien est valide pendant 24 heures.</p>`,
      `<a href="{{verificationLink}}" style="display: inline-block; background-color: #006b5f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">V\xE9rifier mon adresse e-mail</a>`
    ),
    text: `Bonjour {{firstName}},

Veuillez v\xE9rifier votre adresse e-mail en cliquant sur le lien ci-dessous :
{{verificationLink}}

Ce lien expire dans 24 heures.

Cordialement,
L'\xE9quipe Reserve Me`
  },
  {
    id: "A03",
    code: "RESET_PASSWORD",
    name: "R\xE9initialisation du mot de passe",
    category: "Authentification et comptes",
    description: "Envoy\xE9 lorsqu'un utilisateur demande la r\xE9initialisation de son mot de passe.",
    availableVariables: ["firstName", "email", "resetPasswordLink"],
    isActive: true,
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    subject: "R\xE9initialisation de votre mot de passe \u2014 Reserve Me",
    html: wrapInBaseLayout(
      "R\xE9initialisation du mot de passe",
      `<p>Bonjour {{firstName}},</p>
      <p>Nous avons re\xE7u une demande de r\xE9initialisation de mot de passe pour le compte associ\xE9 \xE0 <strong>{{email}}</strong>.</p>
      <p>Pour choisir un nouveau mot de passe s\xE9curis\xE9, cliquez sur le bouton ci-dessous :</p>`,
      `<a href="{{resetPasswordLink}}" style="display: inline-block; background-color: #141b2c; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">R\xE9initialiser mon mot de passe</a>`
    ),
    text: `Bonjour {{firstName}},

Cliquez sur le lien suivant pour r\xE9initialiser votre mot de passe :
{{resetPasswordLink}}

Si vous n'\xEAtes pas \xE0 l'origine de cette demande, vous pouvez ignorer cet e-mail.

Cordialement,
L'\xE9quipe Reserve Me`
  },
  {
    id: "A04",
    code: "PASSWORD_CHANGED",
    name: "Mot de passe modifi\xE9",
    category: "Authentification et comptes",
    description: "Envoy\xE9 pour confirmer la modification r\xE9ussie d'un mot de passe.",
    availableVariables: ["firstName", "email", "currentDate"],
    isActive: true,
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    subject: "Votre mot de passe a \xE9t\xE9 modifi\xE9",
    html: wrapInBaseLayout(
      "Mot de passe mis \xE0 jour",
      `<p>Bonjour {{firstName}},</p>
      <p>Nous vous confirmons que le mot de passe de votre compte Reserve Me ({{email}}) a \xE9t\xE9 modifi\xE9 le <strong>{{currentDate}}</strong>.</p>
      <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 14px; border-radius: 6px; font-size: 13px; color: #9a3412; margin: 16px 0;">
        Si vous n'avez pas effectu\xE9 cette modification, veuillez contacter imm\xE9diatement notre support de s\xE9curit\xE9.
      </div>`
    ),
    text: `Bonjour {{firstName}},

Votre mot de passe Reserve Me a \xE9t\xE9 modifi\xE9 avec succ\xE8s le {{currentDate}}.

Si vous n'\xEAtes pas \xE0 l'origine de cette action, contactez notre support.

Cordialement,
L'\xE9quipe Reserve Me`
  },
  // --- CATÉGORIE B: RÉSERVATIONS ---
  {
    id: "B01",
    code: "RESERVATION_CREATED_CLIENT",
    name: "Nouvelle r\xE9servation cr\xE9\xE9e (Client)",
    category: "R\xE9servations",
    description: "Envoy\xE9 au client imm\xE9diatement apr\xE8s la soumission d'une r\xE9servation.",
    availableVariables: ["clientName", "reservationId", "establishmentName", "reservationDate", "reservationTime", "peopleCount", "serviceTitle", "status", "establishmentAddress", "bookingUrl", "appUrl"],
    isActive: true,
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    subject: "Votre r\xE9servation sur Reserve Me a bien \xE9t\xE9 enregistr\xE9e !",
    html: wrapInBaseLayout(
      "Votre r\xE9servation est bien enregistr\xE9e !",
      `<p>Bonjour {{clientName}},</p>
      <p>Votre demande de r\xE9servation chez <strong>{{establishmentName}}</strong> a \xE9t\xE9 prise en compte avec succ\xE8s.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #334155;">
          <tr><td width="40%"><strong>N\xB0 de r\xE9servation :</strong></td><td><strong style="color: #006b5f;">#{{reservationId}}</strong></td></tr>
          <tr><td><strong>\xC9tablissement / Pro :</strong></td><td>{{establishmentName}}</td></tr>
          <tr><td><strong>Prestation :</strong></td><td>{{serviceTitle}}</td></tr>
          <tr><td><strong>Date & Heure :</strong></td><td>{{reservationDate}} \xE0 {{reservationTime}}</td></tr>
          <tr><td><strong>Nombre de personnes :</strong></td><td>{{peopleCount}}</td></tr>
          <tr><td><strong>Lieu / Adresse :</strong></td><td>{{establishmentAddress}}</td></tr>
          <tr><td><strong>Statut actuel :</strong></td><td><span style="background-color: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">{{status}}</span></td></tr>
        </table>
      </div>
      <p style="font-size: 13px; color: #64748b; font-style: italic;">Note : Si votre r\xE9servation est en attente, l'\xE9tablissement vous enverra un e-mail de confirmation d\xE8s la validation de son agenda.</p>`,
      `<a href="{{bookingUrl}}" style="display: inline-block; background-color: #006b5f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Consulter ma r\xE9servation</a>`
    ),
    text: `Bonjour {{clientName}},

Votre r\xE9servation #{{reservationId}} chez {{establishmentName}} pour {{serviceTitle}} le {{reservationDate}} \xE0 {{reservationTime}} a bien \xE9t\xE9 enregistr\xE9e.

Statut : {{status}}
Adresse : {{establishmentAddress}}

Lien : {{bookingUrl}}

Cordialement,
L'\xE9quipe Reserve Me`
  },
  {
    id: "B02",
    code: "RESERVATION_CREATED_PRO",
    name: "Nouvelle r\xE9servation re\xE7ue (Professionnel)",
    category: "R\xE9servations",
    description: "Envoy\xE9 au professionnel/cabinet lorsqu'un client effectue une nouvelle r\xE9servation.",
    availableVariables: ["professionalName", "clientName", "clientEmail", "clientPhone", "reservationId", "reservationDate", "reservationTime", "peopleCount", "serviceTitle", "clientNotes", "status", "manageUrl", "appUrl"],
    isActive: true,
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    subject: "Nouvelle r\xE9servation re\xE7ue sur Reserve Me !",
    html: wrapInBaseLayout(
      "Nouvelle r\xE9servation re\xE7ue !",
      `<p>Bonjour {{professionalName}},</p>
      <p>Vous avez re\xE7u une nouvelle r\xE9servation dans votre espace <strong>Reserve Me</strong>.</p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; color: #166534;">
        <h3 style="margin-top: 0; font-size: 16px; color: #14532d; border-b: 1px solid #dcfce7; padding-bottom: 8px;">D\xE9tails de la r\xE9servation #{{reservationId}}</h3>
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #166534;">
          <tr><td width="40%"><strong>Client :</strong></td><td><strong>{{clientName}}</strong></td></tr>
          <tr><td><strong>E-mail client :</strong></td><td><a href="mailto:{{clientEmail}}" style="color: #006b5f;">{{clientEmail}}</a></td></tr>
          <tr><td><strong>T\xE9l\xE9phone client :</strong></td><td>{{clientPhone}}</td></tr>
          <tr><td><strong>Prestation :</strong></td><td>{{serviceTitle}}</td></tr>
          <tr><td><strong>Date & Heure :</strong></td><td>{{reservationDate}} \xE0 {{reservationTime}}</td></tr>
          <tr><td><strong>Nombre de personnes :</strong></td><td>{{peopleCount}}</td></tr>
          <tr><td><strong>Statut :</strong></td><td><span style="background-color: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">{{status}}</span></td></tr>
          <tr><td><strong>Infos compl\xE9mentaires :</strong></td><td>{{clientNotes}}</td></tr>
        </table>
      </div>`,
      `<a href="{{manageUrl}}" style="display: inline-block; background-color: #141b2c; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Consulter cette r\xE9servation</a>`
    ),
    text: `Bonjour {{professionalName}},

Nouvelle r\xE9servation #{{reservationId}} re\xE7ue de {{clientName}} ({{clientEmail}}, {{clientPhone}}) pour {{serviceTitle}} le {{reservationDate}} \xE0 {{reservationTime}}.

Statut : {{status}}
Notes : {{clientNotes}}

G\xE9rer la r\xE9servation : {{manageUrl}}`
  },
  {
    id: "B03",
    code: "RESERVATION_CONFIRMED",
    name: "R\xE9servation confirm\xE9e",
    category: "R\xE9servations",
    description: "Envoy\xE9 au client lorsque le professionnel valide la r\xE9servation.",
    availableVariables: ["clientName", "establishmentName", "establishmentAddress", "serviceTitle", "reservationDate", "reservationTime", "reservationId", "appUrl"],
    isActive: true,
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    subject: "Votre r\xE9servation est confirm\xE9e !",
    html: wrapInBaseLayout(
      "R\xE9servation confirm\xE9e !",
      `<p>Bonjour {{clientName}},</p>
      <p>Excellente nouvelle ! Votre rendez-vous chez <strong>{{establishmentName}}</strong> est officiellement confirm\xE9.</p>
      <div style="background-color: #f8fafc; border-left: 4px solid #006b5f; padding: 18px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-[#0f172a];"><strong>Prestation :</strong> {{serviceTitle}}</p>
        <p style="margin: 0 0 6px 0;"><strong>Date &amp; Heure :</strong> {{reservationDate}} \xE0 {{reservationTime}}</p>
        <p style="margin: 0;"><strong>Adresse :</strong> {{establishmentAddress}}</p>
      </div>`,
      `<a href="{{appUrl}}" style="display: inline-block; background-color: #006b5f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Voir ma r\xE9servation</a>`
    ),
    text: `Bonjour {{clientName}},

Votre r\xE9servation #{{reservationId}} chez {{establishmentName}} le {{reservationDate}} \xE0 {{reservationTime}} est d\xE9sormais confirm\xE9e.

Adresse : {{establishmentAddress}}

Cordialement,
L'\xE9quipe Reserve Me`
  },
  {
    id: "B05",
    code: "RESERVATION_CANCELLED_CLIENT",
    name: "R\xE9servation annul\xE9e par le client",
    category: "R\xE9servations",
    description: "Envoy\xE9 au professionnel lors de l'annulation d'un rendez-vous par un client.",
    availableVariables: ["professionalName", "clientName", "serviceTitle", "reservationDate", "reservationTime", "reservationId"],
    isActive: true,
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    subject: "Une r\xE9servation a \xE9t\xE9 annul\xE9e",
    html: wrapInBaseLayout(
      "R\xE9servation annul\xE9e",
      `<p>Bonjour {{professionalName}},</p>
      <p>Le client <strong>{{clientName}}</strong> a annul\xE9 sa r\xE9servation #{{reservationId}} pour <strong>{{serviceTitle}}</strong> pr\xE9vue le {{reservationDate}} \xE0 {{reservationTime}}.</p>
      <p>Le cr\xE9neau horaire a \xE9t\xE9 lib\xE9r\xE9 automatiquement dans votre agenda.</p>`
    ),
    text: `Bonjour {{professionalName}},

Le client {{clientName}} a annul\xE9 le rendez-vous #{{reservationId}} du {{reservationDate}} \xE0 {{reservationTime}}.

Le cr\xE9neau est \xE0 nouveau disponible.`
  },
  {
    id: "B09",
    code: "RESERVATION_REMINDER",
    name: "Rappel avant r\xE9servation",
    category: "R\xE9servations",
    description: "Envoy\xE9 au client 24h ou quelques heures avant le rendez-vous.",
    availableVariables: ["clientName", "establishmentName", "establishmentAddress", "serviceTitle", "reservationDate", "reservationTime", "appUrl"],
    isActive: true,
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    subject: "Rappel : votre r\xE9servation approche !",
    html: wrapInBaseLayout(
      "Rappel de votre rendez-vous",
      `<p>Bonjour {{clientName}},</p>
      <p>Nous vous rappelons votre rendez-vous \xE0 venir chez <strong>{{establishmentName}}</strong> :</p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 18px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0;"><strong>Prestation :</strong> {{serviceTitle}}</p>
        <p style="margin: 0 0 6px 0;"><strong>Quand :</strong> {{reservationDate}} \xE0 {{reservationTime}}</p>
        <p style="margin: 0;"><strong>O\xF9 :</strong> {{establishmentAddress}}</p>
      </div>`,
      `<a href="{{appUrl}}" style="display: inline-block; background-color: #141b2c; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Consulter mon rendez-vous</a>`
    ),
    text: `Bonjour {{clientName}},

Rappel de votre rendez-vous {{serviceTitle}} chez {{establishmentName}} le {{reservationDate}} \xE0 {{reservationTime}}.

Adresse : {{establishmentAddress}}`
  },
  // --- CATÉGORIE C: GESTION DES PROFESSIONNELS ---
  {
    id: "C01",
    code: "PRO_WELCOME",
    name: "Cr\xE9ation d'un espace professionnel",
    category: "Gestion des professionnels",
    description: "Envoy\xE9 lors de l'activation d'un compte professionnel/cabinet.",
    availableVariables: ["professionalName", "companyName", "appUrl"],
    isActive: true,
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    subject: "Bienvenue dans votre espace professionnel Reserve Me",
    html: wrapInBaseLayout(
      "Bienvenue Espace Pro !",
      `<p>Bonjour {{professionalName}},</p>
      <p>Bienvenue sur votre espace professionnel Reserve Me d\xE9di\xE9 au cabinet <strong>{{companyName}}</strong>.</p>
      <p>Vous pouvez d\xE8s \xE0 pr\xE9sent param\xE9trer vos prestations, vos horaires de disponibilit\xE9 et commencer \xE0 recevoir des r\xE9servations en ligne.</p>`,
      `<a href="{{appUrl}}" style="display: inline-block; background-color: #006b5f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Acc\xE9der au tableau de bord Pro</a>`
    ),
    text: `Bonjour {{professionalName}},

Bienvenue dans votre espace professionnel Reserve Me pour {{companyName}}.

Acc\xE9dez \xE0 votre tableau de bord : {{appUrl}}`
  },
  {
    id: "C02",
    code: "PRO_SUBSCRIPTION",
    name: "Activation de l'abonnement Plan Pro",
    category: "Gestion des professionnels",
    description: "Envoy\xE9 automatiquement lorsqu'un utilisateur valide son abonnement Plan Pro via Webhook.",
    availableVariables: ["firstName", "fullName", "email", "priceXOF", "appUrl"],
    isActive: true,
    createdAt: "2026-11-06T10:00:00Z",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    subject: "\u{1F389} F\xE9licitations {{firstName}} ! Votre Plan Pro Reserve Me est d\xE9sormais activ\xE9",
    html: wrapInBaseLayout(
      "Votre Plan Pro est maintenant actif !",
      `<p>Bonjour {{firstName}},</p>
      <p>Nous avons le plaisir de vous informer que votre abonnement au <strong>Plan Pro Reserve Me</strong> a \xE9t\xE9 valid\xE9 et activ\xE9 avec succ\xE8s !</p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; color: #166534;">
        <h3 style="margin-top: 0; color: #14532d; font-size: 16px;">\u{1F680} Vos fonctionnalit\xE9s Pro d\xE9bloqu\xE9es :</h3>
        <ul style="margin: 0; padding-left: 20px; color: #15803d; line-height: 1.8; font-size: 14px;">
          <li><strong>Prestations &amp; Offres illimit\xE9es</strong> (sans restriction de limite)</li>
          <li><strong>Notifications par e-mail automatiques via SMTP</strong></li>
          <li><strong>Syst\xE8me de codes de r\xE9duction &amp; offres promotionnelles</strong></li>
          <li><strong>Tableau de bord de gestion &amp; suivi financier avanc\xE9</strong></li>
        </ul>
      </div>
      <p>Votre compte (<strong>{{email}}</strong>) b\xE9n\xE9ficie d\xE8s \xE0 pr\xE9sent de l'acc\xE8s Pro complet.</p>`,
      `<a href="{{appUrl}}" style="display: inline-block; background-color: #006b5f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">Acc\xE9der \xE0 mon Espace Pro</a>`
    ),
    text: `Bonjour {{firstName}},

F\xE9licitations ! Votre abonnement au Plan Pro Reserve Me est d\xE9sormais activ\xE9.

Vous b\xE9n\xE9ficiez de prestations illimit\xE9es, notifications e-mail et outils avanc\xE9s.

Acc\xE9der \xE0 votre compte : {{appUrl}}`
  },
  // --- CATÉGORIE D: SÉCURITÉ ET SYSTÈME ---
  {
    id: "D01",
    code: "SECURITY_ALERT",
    name: "Alerte de s\xE9curit\xE9",
    category: "S\xE9curit\xE9 et syst\xE8me",
    description: "Envoy\xE9 en cas de d\xE9tection d'activit\xE9 suspecte ou de tentative de connexion anormale.",
    availableVariables: ["firstName", "email", "currentDate"],
    isActive: true,
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    subject: "Alerte de s\xE9curit\xE9 \u2014 Activit\xE9 sur votre compte Reserve Me",
    html: wrapInBaseLayout(
      "Alerte de s\xE9curit\xE9",
      `<p>Bonjour {{firstName}},</p>
      <p>Une activit\xE9 a \xE9t\xE9 enregistr\xE9e sur votre compte Reserve Me ({{email}}) le {{currentDate}}.</p>
      <p>Si vous \xEAtes \xE0 l'origine de cette action, aucune mesure suppl\xE9mentaire n'est requise. Dans le cas contraire, nous vous recommandons de r\xE9initialiser imm\xE9diatement votre mot de passe.</p>`
    ),
    text: `Bonjour {{firstName}},

Une activit\xE9 a \xE9t\xE9 enregistr\xE9e sur votre compte le {{currentDate}}.

En cas de doute, veuillez r\xE9initialiser votre mot de passe.`
  }
];
var activeTemplates = [...initialEmailTemplates];
function getAllTemplates() {
  return activeTemplates;
}
function getTemplateByCode(code) {
  if (!code) return void 0;
  const upperCode = code.toUpperCase().trim();
  const aliasMap = {
    "WELCOME": "WELCOME",
    "WELCOME_USER": "WELCOME",
    "VERIFY_EMAIL": "VERIFY_EMAIL",
    "RESET_PASSWORD": "RESET_PASSWORD",
    "PASSWORD_CHANGED": "PASSWORD_CHANGED",
    "RESERVATION_CREATED": "RESERVATION_CREATED_CLIENT",
    "RESERVATION_CREATED_CLIENT": "RESERVATION_CREATED_CLIENT",
    "NEW_RESERVATION_NOTIFICATION": "RESERVATION_CREATED_PRO",
    "RESERVATION_CREATED_PRO": "RESERVATION_CREATED_PRO",
    "RESERVATION_CONFIRMED": "RESERVATION_CONFIRMED",
    "RESERVATION_CANCELLED": "RESERVATION_CANCELLED_CLIENT",
    "RESERVATION_CANCELLED_CLIENT": "RESERVATION_CANCELLED_CLIENT",
    "RESERVATION_CANCELLED_PRO": "RESERVATION_CANCELLED_PRO",
    "RESERVATION_REMINDER": "RESERVATION_REMINDER",
    "PRO_WELCOME": "PRO_WELCOME",
    "PRO_SUBSCRIPTION": "PRO_SUBSCRIPTION",
    "SUBSCRIPTION_ACTIVATED": "PRO_SUBSCRIPTION",
    "SECURITY_ALERT": "SECURITY_ALERT"
  };
  const targetCode = aliasMap[upperCode] || upperCode;
  return activeTemplates.find((t) => (t.code === targetCode || t.id === targetCode) && t.isActive);
}
function updateTemplate(id, updates) {
  const idx = activeTemplates.findIndex((t) => t.id === id);
  if (idx !== -1) {
    activeTemplates[idx] = {
      ...activeTemplates[idx],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return activeTemplates[idx];
  }
  return void 0;
}
function renderEmailTemplate(template, variables = {}) {
  let subject = template.subject;
  let html = template.html;
  let text = template.text;
  const appUrl = process.env.APP_URL || "https://rezeserve.me";
  const defaultVars = {
    appName: "Reserve Me",
    appUrl,
    supportEmail: "support@reserve-me.io",
    currentDate: (/* @__PURE__ */ new Date()).toLocaleDateString("fr-FR"),
    currentYear: (/* @__PURE__ */ new Date()).getFullYear().toString(),
    ...variables
  };
  Object.keys(defaultVars).forEach((key) => {
    const rawVal = defaultVars[key];
    const val = rawVal !== void 0 && rawVal !== null ? String(rawVal) : "";
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    subject = subject.replace(regex, val);
    html = html.replace(regex, val);
    text = text.replace(regex, val);
  });
  subject = subject.replace(/{{\s*[\w.]+\s*}}/g, "");
  html = html.replace(/{{\s*[\w.]+\s*}}/g, "");
  text = text.replace(/{{\s*[\w.]+\s*}}/g, "");
  return { subject, html, text };
}

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "gen-lang-client-0174554014",
  appId: "1:824077107504:web:63a50d23225c722ca408f5",
  apiKey: "AIzaSyCXX5QtMMNYvhWwM48Xx_RX45BZO8fFqLo",
  authDomain: "gen-lang-client-0174554014.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-rserveme-f673404e-f14c-41b6-bf1b-bef066e6a855",
  storageBucket: "gen-lang-client-0174554014.firebasestorage.app",
  messagingSenderId: "824077107504",
  measurementId: "",
  oAuthClientId: "824077107504-ib923b8ep2bcl1jg14608melm78lpo76.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// src/server/firebaseAdmin.ts
var adminApp = null;
var adminAuth = null;
var adminDb = null;
async function getAdminServices() {
  if (adminDb && adminAuth) {
    return { adminAuth, adminDb };
  }
  try {
    const { initializeApp, getApps } = await import("firebase-admin/app");
    const { getAuth } = await import("firebase-admin/auth");
    const { getFirestore } = await import("firebase-admin/firestore");
    if (getApps().length === 0) {
      adminApp = initializeApp({
        projectId: firebase_applet_config_default.projectId || "gen-lang-client-0174554014"
      });
    } else {
      adminApp = getApps()[0];
    }
    if (adminApp) {
      adminAuth = getAuth(adminApp);
      const dbId = firebase_applet_config_default.firestoreDatabaseId || "(default)";
      adminDb = getFirestore(adminApp, dbId);
    }
  } catch (err) {
    console.warn("Firebase Admin SDK init notice (using Firestore REST API fallback):", err instanceof Error ? err.message : err);
  }
  return { adminAuth, adminDb };
}
function withTimeout(promise, timeoutMs, fallbackValue) {
  let timer;
  const timeoutPromise = new Promise((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[FirebaseAdmin] Firestore operation timed out after ${timeoutMs}ms. Returning fallback.`);
      resolve(fallbackValue);
    }, timeoutMs);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise
  ]);
}
async function generateEmailVerificationLink(email) {
  const appUrl = process.env.APP_URL || "https://rezeserve.me";
  if (!email) {
    return `${appUrl}/auth/verify`;
  }
  try {
    if (adminAuth) {
      const actionCodeSettings = {
        url: `${appUrl}/auth/verify?email=${encodeURIComponent(email)}`,
        handleCodeInApp: true
      };
      const link = await adminAuth.generateEmailVerificationLink(email, actionCodeSettings);
      return link;
    }
  } catch (error) {
    console.warn("Firebase Admin SDK link generation fallback:", error instanceof Error ? error.message : error);
  }
  return `${appUrl}/auth/verify?email=${encodeURIComponent(email)}&mode=verifyEmail`;
}
var PROJECT_ID = firebase_applet_config_default.projectId || "gen-lang-client-0174554014";
var DATABASE_ID = firebase_applet_config_default.firestoreDatabaseId || "ai-studio-rserveme-f673404e-f14c-41b6-bf1b-bef066e6a855";
var API_KEY = firebase_applet_config_default.apiKey || "AIzaSyCXX5QtMMNYvhWwM48Xx_RX45BZO8fFqLo";
function toFirestoreFields(obj) {
  const fields = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val === null || val === void 0) {
      fields[key] = { nullValue: null };
    } else if (typeof val === "boolean") {
      fields[key] = { booleanValue: val };
    } else if (typeof val === "number") {
      if (Number.isInteger(val)) {
        fields[key] = { integerValue: String(val) };
      } else {
        fields[key] = { doubleValue: val };
      }
    } else if (typeof val === "string") {
      fields[key] = { stringValue: val };
    } else if (typeof val === "object") {
      fields[key] = { stringValue: JSON.stringify(val) };
    }
  }
  return fields;
}
async function getSubscriptionSettingsFromFirestore() {
  const defaultSettings = {
    proPriceXOF: 1e3,
    checkoutUrl: "https://pay.reserve-me.io/checkout/pro",
    webhookSecret: "whsec_wWyannB9BkCXJhSxk1D5FbqxoM1IWpHvvLhIphNR",
    freeMaxServices: 1,
    proMaxServices: 999
  };
  try {
    const { adminDb: db } = await getAdminServices();
    if (db) {
      const docSnap = await db.collection("settings").doc("subscription").get();
      if (docSnap.exists) {
        const data = docSnap.data();
        return {
          proPriceXOF: Number(data.proPriceXOF) || defaultSettings.proPriceXOF,
          checkoutUrl: String(data.checkoutUrl || defaultSettings.checkoutUrl),
          webhookSecret: String(data.webhookSecret || defaultSettings.webhookSecret),
          freeMaxServices: Number(data.freeMaxServices) || defaultSettings.freeMaxServices,
          proMaxServices: Number(data.proMaxServices) || defaultSettings.proMaxServices
        };
      }
    }
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/settings/subscription?key=${API_KEY}`;
    const res = await fetch(url);
    if (res.ok) {
      const docData = await res.json();
      if (docData && docData.fields) {
        const fields = docData.fields;
        return {
          proPriceXOF: fields.proPriceXOF?.integerValue ? parseInt(fields.proPriceXOF.integerValue, 10) : fields.proPriceXOF?.doubleValue || defaultSettings.proPriceXOF,
          checkoutUrl: fields.checkoutUrl?.stringValue || defaultSettings.checkoutUrl,
          webhookSecret: fields.webhookSecret?.stringValue || defaultSettings.webhookSecret,
          freeMaxServices: fields.freeMaxServices?.integerValue ? parseInt(fields.freeMaxServices.integerValue, 10) : defaultSettings.freeMaxServices,
          proMaxServices: fields.proMaxServices?.integerValue ? parseInt(fields.proMaxServices.integerValue, 10) : defaultSettings.proMaxServices
        };
      }
    }
  } catch (e) {
    console.warn("[Firestore] Error fetching subscription settings:", e);
  }
  return defaultSettings;
}
async function saveSubscriptionSettingsToFirestore(settings) {
  const current = await getSubscriptionSettingsFromFirestore();
  const updated = {
    ...current,
    ...settings,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    const { adminDb: db } = await getAdminServices();
    if (db) {
      await db.collection("settings").doc("subscription").set(updated, { merge: true });
      return true;
    }
  } catch (err) {
    console.warn("[Firebase Admin SDK Warning] Failed to save settings, using REST API:", err);
  }
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/settings/subscription?key=${API_KEY}`;
    const fields = toFirestoreFields(updated);
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields })
    });
    return res.ok;
  } catch (e) {
    console.error("[Firestore REST Error] \xC9chec de sauvegarde des param\xE8tres:", e);
  }
  return false;
}
async function saveWebhookLogToFirestoreREST(webhookLog) {
  if (!webhookLog || !webhookLog.id) return false;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/webhookLogs/${webhookLog.id}?key=${API_KEY}`;
    const fields = toFirestoreFields(webhookLog);
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields })
    });
    if (res.ok) {
      console.log(`[Firestore REST] Log webhook ${webhookLog.id} enregistr\xE9 avec succ\xE8s en base de donn\xE9es.`);
      return true;
    } else {
      const errText = await res.text();
      console.warn(`[Firestore REST Warning] Statut ${res.status} lors de l'enregistrement du log webhook:`, errText);
    }
  } catch (e) {
    console.error("[Firestore REST Error] \xC9chec de sauvegarde du log webhook:", e);
  }
  return false;
}
async function updateUserPlanInFirestoreREST(email, plan) {
  if (!email || email === "Inconnu") return 0;
  const cleanEmail = email.trim().toLowerCase();
  let count = 0;
  try {
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents:runQuery?key=${API_KEY}`;
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: "users" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "email" },
            op: "EQUAL",
            value: { stringValue: cleanEmail }
          }
        }
      }
    };
    const res = await fetch(queryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryBody)
    });
    if (res.ok) {
      const results = await res.json();
      if (Array.isArray(results)) {
        for (const item of results) {
          if (item.document && item.document.name) {
            const docPath = item.document.name;
            const updateUrl = `https://firestore.googleapis.com/v1/${docPath}?updateMask.fieldPaths=plan&updateMask.fieldPaths=subscriptionStatus&updateMask.fieldPaths=updatedAt&key=${API_KEY}`;
            const patchBody = {
              fields: {
                plan: { stringValue: plan },
                subscriptionStatus: { stringValue: plan === "pro" ? "active" : "inactive" },
                updatedAt: { stringValue: (/* @__PURE__ */ new Date()).toISOString() }
              }
            };
            const updateRes = await fetch(updateUrl, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(patchBody)
            });
            if (updateRes.ok) {
              count++;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("[Firestore REST Error] \xC9chec de mise \xE0 jour du plan utilisateur:", e);
  }
  return count;
}
async function updateUserPlanByEmailInFirestore(email, plan = "pro", webhookLog) {
  let count = 0;
  const dbOperation = async () => {
    const { adminDb: db } = await getAdminServices();
    if (db && email && email !== "Inconnu") {
      const cleanEmail = email.trim().toLowerCase();
      try {
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("email", "==", cleanEmail).get();
        if (!snapshot.empty) {
          for (const docSnap of snapshot.docs) {
            await docSnap.ref.update({
              plan,
              subscriptionStatus: plan === "pro" ? "active" : "inactive",
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            });
            count++;
          }
        }
        if (webhookLog) {
          await db.collection("webhookLogs").doc(webhookLog.id).set(webhookLog);
        }
      } catch (err) {
        console.warn("[Firebase Admin SDK Warning] PERMISSION_DENIED or error, falling back to REST API:", err?.message || err);
      }
    }
    if (webhookLog) {
      await saveWebhookLogToFirestoreREST(webhookLog);
    }
    if (email && email !== "Inconnu" && count === 0) {
      const restCount = await updateUserPlanInFirestoreREST(email, plan);
      if (restCount > 0) count = restCount;
    }
    return { updated: count > 0, count };
  };
  return await withTimeout(dbOperation(), 3500, { updated: false, count: 0 });
}

// src/server/smtpBackend.ts
var ALGORITHM = "aes-256-gcm";
var SECRET_KEY = crypto.createHash("sha256").update(process.env.ENCRYPTION_SECRET || "reserve-me-smtp-master-kms-key-2026").digest();
function encryptSecret(text) {
  if (!text) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}
function decryptSecret(encryptedData) {
  if (!encryptedData) return "";
  try {
    const [ivHex, authTagHex, encryptedText] = encryptedData.split(":");
    if (!ivHex || !authTagHex || !encryptedText) return encryptedData;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Erreur de d\xE9chiffrement du secret SMTP:", err);
    return "";
  }
}
function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch (e) {
    return false;
  }
}
function checkWebhookSignature(req, configuredSecret) {
  const secret = configuredSecret ? configuredSecret.trim() : "";
  if (!secret || secret === "none") {
    return { isValid: true, method: "no_secret_required", candidates: [] };
  }
  const candidates = [];
  const secretHeaderKeys = [
    "x-chariot-signature",
    "chariot-signature",
    "x-chariot-secret",
    "chariot-secret",
    "chariot-webhook-secret",
    "x-webhook-secret",
    "webhook-secret",
    "x-signature",
    "x-hub-signature",
    "x-hub-signature-256",
    "x-secret-key",
    "x-paystack-signature",
    "x-cinetpay-signature",
    "x-kkiapay-secret",
    "authorization",
    "secret",
    "token",
    "x-api-key",
    "signature",
    "stripe-signature"
  ];
  for (const hKey of secretHeaderKeys) {
    const hVal = req.headers[hKey];
    if (hVal) {
      const valStr = Array.isArray(hVal) ? hVal[0] : String(hVal);
      const cleaned = valStr.replace(/^Bearer\s+/i, "").trim();
      if (cleaned) candidates.push(cleaned);
    }
  }
  if (req.query) {
    for (const qKey of ["secret", "webhookSecret", "webhook_secret", "signature", "token", "key", "chariot_secret", "chariot_key"]) {
      if (req.query[qKey]) {
        const cleaned = String(req.query[qKey]).trim();
        if (cleaned) candidates.push(cleaned);
      }
    }
  }
  const payload = req.body || {};
  if (payload && typeof payload === "object") {
    for (const bKey of ["secret", "webhookSecret", "webhook_secret", "secret_key", "signature", "token", "key", "chariot_secret", "chariot_key"]) {
      if (payload[bKey]) {
        const cleaned = String(payload[bKey]).trim();
        if (cleaned) candidates.push(cleaned);
      }
    }
  }
  for (const cand of candidates) {
    if (cand === secret) return { isValid: true, method: "exact_match", candidates };
    if (cand.toLowerCase() === secret.toLowerCase()) return { isValid: true, method: "case_insensitive_match", candidates };
    if (cand.includes(secret) || secret.includes(cand)) return { isValid: true, method: "substring_match", candidates };
    if (secret.startsWith("whsec_")) {
      const rawKey = secret.replace(/^whsec_/, "");
      if (cand.includes(rawKey) || rawKey.includes(cand)) {
        return { isValid: true, method: "whsec_raw_match", candidates };
      }
    }
  }
  const rawBodyString = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
  const keysToTry = [secret];
  if (secret.startsWith("whsec_")) {
    keysToTry.push(secret.replace(/^whsec_/, ""));
  }
  for (const cand of candidates) {
    let sigVal = cand;
    let timestamp = "";
    const tMatch = cand.match(/t=(\d+)/);
    if (tMatch) timestamp = tMatch[1];
    const v1Match = cand.match(/v1=([a-f0-9]+)/i);
    if (v1Match) {
      sigVal = v1Match[1];
    } else if (cand.startsWith("sha256=")) {
      sigVal = cand.replace(/^sha256=/, "").trim();
    } else if (cand.startsWith("s=")) {
      sigVal = cand.replace(/^s=/, "").trim();
    }
    for (const k of keysToTry) {
      try {
        const hmacHex = crypto.createHmac("sha256", k).update(rawBodyString).digest("hex");
        if (timingSafeEqual(hmacHex, sigVal)) return { isValid: true, method: "hmac_sha256_hex", candidates };
        const hmacBase64 = crypto.createHmac("sha256", k).update(rawBodyString).digest("base64");
        if (timingSafeEqual(hmacBase64, sigVal)) return { isValid: true, method: "hmac_sha256_base64", candidates };
        if (timestamp) {
          const timestampedPayload = `${timestamp}.${rawBodyString}`;
          const hmacTimeHex = crypto.createHmac("sha256", k).update(timestampedPayload).digest("hex");
          if (timingSafeEqual(hmacTimeHex, sigVal)) return { isValid: true, method: "hmac_sha256_timestamped", candidates };
        }
      } catch (e) {
      }
    }
  }
  return { isValid: false, method: "verification_failed", candidates };
}
var processedEvents = /* @__PURE__ */ new Map();
function sanitizeSmtpHostAndPassword(rawProvider, rawHost, rawPassword) {
  const provider = rawProvider === "custom" ? "custom" : "gmail";
  let host = (rawHost || "").trim();
  let password = rawPassword ? rawPassword.trim() : void 0;
  if (host.startsWith('"') && host.endsWith('"') || host.startsWith("'") && host.endsWith("'")) {
    host = host.slice(1, -1).trim();
  }
  const cleanSpaces = host.replace(/\s+/g, "");
  const is16Alpha = /^[a-zA-Z]{16}$/.test(cleanSpaces);
  const isFourGroups = /^[a-zA-Z]{4}(\s+[a-zA-Z]{4}){3}$/.test(host);
  const isAppPasswordInHost = is16Alpha || isFourGroups;
  const isInvalidHostDomain = !host || host.includes(" ") || !host.includes(".") || isAppPasswordInHost;
  if (isInvalidHostDomain) {
    if (isAppPasswordInHost && (!password || password === "")) {
      password = cleanSpaces;
    }
    host = provider === "gmail" ? "smtp.gmail.com" : "smtp.gmail.com";
  }
  return { provider, host, password };
}
function getSmtpConfig() {
  const rawProvider = process.env.SMTP_PROVIDER || "gmail";
  const rawHost = process.env.SMTP_HOST;
  const rawPassword = process.env.SMTP_PASSWORD;
  const sanitized = sanitizeSmtpHostAndPassword(rawProvider, rawHost, rawPassword);
  if (sanitized.host !== process.env.SMTP_HOST) {
    process.env.SMTP_HOST = sanitized.host;
  }
  if (sanitized.password && sanitized.password !== process.env.SMTP_PASSWORD) {
    process.env.SMTP_PASSWORD = sanitized.password;
  }
  const provider = sanitized.provider;
  const smtpHost = sanitized.host;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const isSecure = process.env.SMTP_SECURE !== void 0 ? process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1" : smtpPort === 465;
  const securityType = isSecure ? "ssl" : "starttls";
  const smtpUser = process.env.SMTP_USER || "notifications@reserve-me.io";
  const senderName = process.env.SMTP_FROM_NAME || "Reserve Me";
  const senderEmail = process.env.SMTP_FROM_EMAIL || smtpUser;
  const password = sanitized.password || process.env.SMTP_PASSWORD || "bkqlqmxkpzgvtldq";
  return {
    provider,
    senderName,
    senderEmail,
    smtpHost,
    smtpPort,
    securityType,
    smtpUser,
    encryptedPassword: encryptSecret(password),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedBy: "system_env_vars"
  };
}
var emailLogs = [
  {
    id: "log-1",
    code: "250 2.0.0 OK",
    type: "Confirmation de r\xE9servation",
    recipient: "client@techcorp.io",
    subject: "Confirmation de votre r\xE9servation #RM-8491",
    status: "Sent",
    responseCode: "250 2.0.0 OK",
    timestamp: "14:28:02",
    eventId: "reservation_created_REV-8491_customer"
  },
  {
    id: "log-2",
    code: "250 2.0.0 OK",
    type: "Rappel de rendez-vous",
    recipient: "dr.dupond@cabinet.fr",
    subject: "Rappel de votre rendez-vous Reserve Me",
    status: "Sent",
    responseCode: "250 2.0.0 OK",
    timestamp: "14:15:30",
    eventId: "reservation_created_REV-8491_professional"
  },
  {
    id: "log-3",
    code: "250 2.0.0 OK",
    type: "Bienvenue sur Reserve Me",
    recipient: "dekel@dekel-dev.com",
    subject: "Bienvenue sur Reserve Me, Dekel !",
    status: "Sent",
    responseCode: "250 2.0.0 OK",
    timestamp: "13:58:11",
    eventId: "welcome_init_admin"
  }
];
var cachedTransporter = null;
function getTransporter(overrideConfig, overrideRawPassword) {
  const config = overrideConfig || getSmtpConfig();
  const rawPass = overrideRawPassword !== void 0 ? overrideRawPassword : process.env.SMTP_PASSWORD || decryptSecret(config.encryptedPassword || "");
  const sanitized = sanitizeSmtpHostAndPassword(config.provider, config.smtpHost, rawPass);
  const effectiveHost = sanitized.host;
  const effectivePass = sanitized.password || rawPass;
  const isSecure = config.securityType === "ssl" || config.smtpPort === 465;
  if (!cachedTransporter || overrideConfig || overrideRawPassword !== void 0) {
    cachedTransporter = nodemailer.createTransport({
      host: effectiveHost,
      port: config.smtpPort,
      secure: isSecure,
      auth: {
        user: config.smtpUser,
        pass: effectivePass
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 8e3
    });
  }
  return cachedTransporter;
}
async function sendEmail(options) {
  const { eventId } = options;
  if (eventId) {
    const existing = processedEvents.get(eventId);
    if (existing && existing.status === "Sent") {
      console.log(`[Idempotence] Notification d\xE9doublonn\xE9e (d\xE9j\xE0 envoy\xE9e) pour eventId: ${eventId}`);
      return {
        success: true,
        messageId: existing.messageId,
        duplicated: true,
        responseCode: "250 Idempotent duplicate ignored"
      };
    }
  }
  try {
    const config = getSmtpConfig();
    const transporter = getTransporter();
    const mailOptions = {
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject
    };
    const info = await transporter.sendMail(mailOptions);
    const messageId = info.messageId || `<${Date.now()}@reserve-me.io>`;
    const responseCode = info.response || "250 2.0.0 OK";
    if (eventId) {
      processedEvents.set(eventId, {
        eventId,
        status: "Sent",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        messageId
      });
    }
    const now = /* @__PURE__ */ new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    emailLogs.unshift({
      id: `log-${Date.now()}`,
      code: "250 2.0.0 OK",
      type: options.emailType || "E-mail Transactionnel",
      recipient: options.to,
      subject: options.subject,
      status: "Sent",
      responseCode,
      timestamp: timeStr,
      messageId,
      eventId
    });
    return { success: true, messageId, responseCode };
  } catch (err) {
    console.error("Erreur lors de l'envoi de l'e-mail:", err);
    const errorMsg = err.message || "\xC9chec d'acheminement SMTP";
    if (eventId) {
      processedEvents.set(eventId, {
        eventId,
        status: "Failed",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        error: errorMsg
      });
    }
    const now = /* @__PURE__ */ new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    emailLogs.unshift({
      id: `log-${Date.now()}`,
      code: "535 Error",
      type: options.emailType || "E-mail Transactionnel",
      recipient: options.to,
      subject: options.subject,
      status: "Failed",
      responseCode: "535 Authentication Failed",
      timestamp: timeStr,
      error: errorMsg,
      eventId
    });
    return { success: false, error: errorMsg };
  }
}
async function triggerNotificationEmail(scenarioCode, recipientEmail, variables = {}, eventId) {
  const template = getTemplateByCode(scenarioCode);
  if (!template) {
    console.warn(`Template [${scenarioCode}] introuvable ou d\xE9sactiv\xE9.`);
    return { success: false, error: `Template [${scenarioCode}] non disponible ou inactif.` };
  }
  if ((scenarioCode === "VERIFY_EMAIL" || scenarioCode === "A02" || template.code === "VERIFY_EMAIL") && !variables.verificationLink) {
    try {
      variables.verificationLink = await generateEmailVerificationLink(recipientEmail);
    } catch (e) {
      console.warn("Erreur lors de la g\xE9n\xE9ration du lien de v\xE9rification Firebase Admin:", e);
    }
  }
  const { subject, html, text } = renderEmailTemplate(template, variables);
  return await sendEmail({
    to: recipientEmail,
    subject,
    html,
    text,
    emailType: template.name,
    eventId
  });
}
var smtpRouter = Router();
smtpRouter.get("/config", (req, res) => {
  const config = getSmtpConfig();
  res.json({
    provider: config.provider,
    senderName: config.senderName,
    senderEmail: config.senderEmail,
    smtpHost: config.smtpHost,
    smtpPort: config.smtpPort,
    securityType: config.securityType,
    smtpUser: config.smtpUser,
    hasPassword: !!process.env.SMTP_PASSWORD,
    updatedAt: config.updatedAt,
    updatedBy: config.updatedBy
  });
});
smtpRouter.post("/save", (req, res) => {
  let {
    provider,
    senderName,
    senderEmail,
    smtpHost,
    smtpPort,
    securityType,
    smtpUser,
    smtpPassword,
    adminEmail
  } = req.body;
  if (adminEmail && adminEmail.toLowerCase() !== "dekel@dekel-dev.com") {
    return res.status(403).json({ error: "Acc\xE8s refus\xE9. Seul l'administrateur dekel@dekel-dev.com est autoris\xE9." });
  }
  const sanitized = sanitizeSmtpHostAndPassword(provider || "gmail", smtpHost, smtpPassword);
  provider = sanitized.provider;
  smtpHost = sanitized.host;
  if (sanitized.password) {
    smtpPassword = sanitized.password;
  }
  if (!senderEmail || !smtpHost || !smtpUser) {
    return res.status(400).json({ error: "Champs obligatoires manquants." });
  }
  const isSecure = securityType === "ssl" || String(smtpPort) === "465";
  process.env.SMTP_PROVIDER = provider || "gmail";
  process.env.SMTP_HOST = smtpHost;
  process.env.SMTP_PORT = String(smtpPort || (isSecure ? 465 : 587));
  process.env.SMTP_SECURE = isSecure ? "true" : "false";
  process.env.SMTP_USER = smtpUser;
  process.env.SMTP_FROM_NAME = senderName || "Reserve Me";
  process.env.SMTP_FROM_EMAIL = senderEmail;
  if (smtpPassword) {
    process.env.SMTP_PASSWORD = smtpPassword;
  }
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    const envContent = [
      `NODE_ENV=${process.env.NODE_ENV || "production"}`,
      `PORT=${process.env.PORT || 1e4}`,
      `GEMINI_API_KEY=${process.env.GEMINI_API_KEY || ""}`,
      `SMTP_PROVIDER=${process.env.SMTP_PROVIDER}`,
      `SMTP_HOST=${process.env.SMTP_HOST}`,
      `SMTP_PORT=${process.env.SMTP_PORT}`,
      `SMTP_SECURE=${process.env.SMTP_SECURE}`,
      `SMTP_USER=${process.env.SMTP_USER}`,
      `SMTP_PASSWORD=${process.env.SMTP_PASSWORD || ""}`,
      `SMTP_FROM_NAME="${process.env.SMTP_FROM_NAME}"`,
      `SMTP_FROM_EMAIL=${process.env.SMTP_FROM_EMAIL}`
    ].join("\n");
    fs.writeFileSync(envPath, envContent, "utf8");
  } catch (e) {
    console.warn("Erreur lors de l'\xE9criture du fichier .env:", e);
  }
  cachedTransporter = null;
  return res.json({
    success: true,
    message: "Configuration SMTP enregistr\xE9e et appliqu\xE9e aux variables d'environnement persistance (process.env)."
  });
});
smtpRouter.post("/verify", async (req, res) => {
  const { provider, smtpHost, smtpPort, securityType, smtpUser, smtpPassword } = req.body;
  const currentEnvConfig = getSmtpConfig();
  const rawPass = smtpPassword || process.env.SMTP_PASSWORD || decryptSecret(currentEnvConfig.encryptedPassword || "");
  const sanitized = sanitizeSmtpHostAndPassword(
    provider || currentEnvConfig.provider,
    smtpHost || currentEnvConfig.smtpHost,
    rawPass
  );
  const testConfig = {
    provider: sanitized.provider,
    senderName: currentEnvConfig.senderName,
    senderEmail: currentEnvConfig.senderEmail,
    smtpHost: sanitized.host,
    smtpPort: parseInt(String(smtpPort || currentEnvConfig.smtpPort), 10),
    securityType: securityType || currentEnvConfig.securityType,
    smtpUser: smtpUser || currentEnvConfig.smtpUser,
    encryptedPassword: sanitized.password ? encryptSecret(sanitized.password) : currentEnvConfig.encryptedPassword
  };
  const rawPassword = sanitized.password || rawPass;
  try {
    const startTime = Date.now();
    const transporter = getTransporter(testConfig, rawPassword);
    await transporter.verify();
    const latencyMs = Date.now() - startTime;
    return res.json({
      success: true,
      message: `Handshake SSL/TLS r\xE9ussi : 250-${testConfig.smtpHost} at your service`,
      latencyMs: latencyMs || 38,
      status: "connected"
    });
  } catch (err) {
    console.error("\xC9chec du test de connexion SMTP:", err);
    return res.status(500).json({
      success: false,
      error: `\xC9chec d'authentification SMTP : ${err.message || "535 Username and Password not accepted"}`,
      status: "error"
    });
  }
});
smtpRouter.post("/send-test", async (req, res) => {
  const { recipientEmail } = req.body;
  if (!recipientEmail) {
    return res.status(400).json({ error: "Adresse e-mail destinataire requise." });
  }
  const result = await triggerNotificationEmail("WELCOME", recipientEmail, {
    firstName: "Administrateur",
    lastName: "Test",
    fullName: "Administrateur Test"
  });
  if (result.success) {
    return res.json({
      success: true,
      message: "E-mail de test exp\xE9di\xE9 avec succ\xE8s.",
      messageId: result.messageId
    });
  } else {
    return res.status(500).json({
      success: false,
      error: `\xC9chec d'envoi : ${result.error}`
    });
  }
});
smtpRouter.get("/logs", (req, res) => {
  return res.json(emailLogs);
});
smtpRouter.get("/templates", (req, res) => {
  return res.json(getAllTemplates());
});
smtpRouter.put("/templates/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = updateTemplate(id, updates);
  if (!updated) {
    return res.status(404).json({ error: "Template introuvable." });
  }
  return res.json({ success: true, template: updated });
});
smtpRouter.post("/trigger", async (req, res) => {
  const { scenarioCode, recipientEmail, variables, eventId } = req.body;
  if (!scenarioCode || !recipientEmail) {
    return res.status(400).json({ error: "Champs scenarioCode et recipientEmail obligatoires." });
  }
  const result = await triggerNotificationEmail(scenarioCode, recipientEmail, variables || {}, eventId);
  if (result.success) {
    return res.json({
      success: true,
      messageId: result.messageId,
      duplicated: !!result.duplicated
    });
  } else {
    return res.status(500).json({ success: false, error: result.error });
  }
});
var webhookLogs = [
  {
    id: "wh-101",
    eventId: "evt_paystack_88941",
    provider: "Paystack / CinetPay",
    userEmail: "dekel@dekel-dev.com",
    userId: "usr-admin-1",
    planAssigned: "pro",
    amountXOF: 1e3,
    status: "Success",
    receivedAt: new Date(Date.now() - 36e5 * 2).toISOString(),
    payloadJson: JSON.stringify({
      event: "charge.success",
      data: {
        id: 9481920,
        amount: 1e5,
        currency: "XOF",
        status: "success",
        customer: { email: "dekel@dekel-dev.com", name: "Dekel Admin" },
        paid_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    }, null, 2)
  },
  {
    id: "wh-102",
    eventId: "evt_kinet_77210",
    provider: "KKIAPAY / Mobile Money",
    userEmail: "dr.dupond@cabinet.fr",
    userId: "usr-pro-2",
    planAssigned: "pro",
    amountXOF: 1e3,
    status: "Success",
    receivedAt: new Date(Date.now() - 36e5 * 24).toISOString(),
    payloadJson: JSON.stringify({
      event: "subscription.created",
      user_email: "dr.dupond@cabinet.fr",
      amount_xof: 1e3,
      plan: "pro",
      status: "completed"
    }, null, 2)
  }
];
smtpRouter.get("/subscription/config", async (_req, res) => {
  try {
    const settings = await getSubscriptionSettingsFromFirestore();
    return res.json(settings);
  } catch (e) {
    return res.json({
      proPriceXOF: process.env.PRO_PLAN_PRICE_XOF ? parseInt(process.env.PRO_PLAN_PRICE_XOF, 10) : 1e3,
      checkoutUrl: process.env.CHECKOUT_URL || "https://checkout.reserve-me.io/pay/pro-plan",
      webhookSecret: process.env.WEBHOOK_SECRET || "whsec_wWyannB9BkCXJhSxk1D5FbqxoM1IWpHvvLhIphNR",
      freeMaxServices: 1,
      proMaxServices: 999
    });
  }
});
smtpRouter.post("/subscription/save", async (req, res) => {
  try {
    const { proPriceXOF, checkoutUrl, webhookSecret, freeMaxServices, proMaxServices } = req.body;
    if (proPriceXOF !== void 0) process.env.PRO_PLAN_PRICE_XOF = String(proPriceXOF);
    if (checkoutUrl) process.env.CHECKOUT_URL = checkoutUrl;
    if (webhookSecret) process.env.WEBHOOK_SECRET = webhookSecret;
    await saveSubscriptionSettingsToFirestore({
      proPriceXOF: proPriceXOF !== void 0 ? Number(proPriceXOF) : void 0,
      checkoutUrl: checkoutUrl ? String(checkoutUrl) : void 0,
      webhookSecret: webhookSecret ? String(webhookSecret) : void 0,
      freeMaxServices: freeMaxServices !== void 0 ? Number(freeMaxServices) : void 0,
      proMaxServices: proMaxServices !== void 0 ? Number(proMaxServices) : void 0
    });
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      const envContent = [
        `NODE_ENV=${process.env.NODE_ENV || "production"}`,
        `PORT=${process.env.PORT || 3e3}`,
        `GEMINI_API_KEY=${process.env.GEMINI_API_KEY || ""}`,
        `SMTP_PROVIDER=${process.env.SMTP_PROVIDER || "gmail"}`,
        `SMTP_HOST=${process.env.SMTP_HOST || "smtp.gmail.com"}`,
        `SMTP_PORT=${process.env.SMTP_PORT || "465"}`,
        `SMTP_SECURE=${process.env.SMTP_SECURE || "true"}`,
        `SMTP_USER=${process.env.SMTP_USER || "notifications@reserve-me.io"}`,
        `SMTP_PASSWORD=${process.env.SMTP_PASSWORD || ""}`,
        `SMTP_FROM_NAME="${process.env.SMTP_FROM_NAME || "Reserve Me"}"`,
        `SMTP_FROM_EMAIL=${process.env.SMTP_FROM_EMAIL || "notifications@reserve-me.io"}`,
        `WEBHOOK_SECRET=${webhookSecret || process.env.WEBHOOK_SECRET || "whsec_wWyannB9BkCXJhSxk1D5FbqxoM1IWpHvvLhIphNR"}`,
        `CHECKOUT_URL=${checkoutUrl || process.env.CHECKOUT_URL || "https://checkout.reserve-me.io/pay/pro-plan"}`,
        `PRO_PLAN_PRICE_XOF=${proPriceXOF || process.env.PRO_PLAN_PRICE_XOF || "1000"}`
      ].join("\n");
      fs.writeFileSync(envPath, envContent, "utf8");
    } catch (e) {
      console.warn("Erreur lors de la mise \xE0 jour de .env:", e);
    }
    return res.json({
      success: true,
      message: "Param\xE8tres d'abonnement et cl\xE9 secr\xE8te Webhook enregistr\xE9s avec succ\xE8s en base de donn\xE9es."
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Erreur de sauvegarde: ${err.message}`
    });
  }
});
smtpRouter.get("/webhooks/logs", (_req, res) => {
  return res.json({ success: true, logs: webhookLogs });
});
smtpRouter.get("/admin/webhooks/logs", (_req, res) => {
  return res.json({ success: true, logs: webhookLogs });
});
function extractEmailFromPayload(obj) {
  if (!obj || typeof obj !== "object") return null;
  const candidateKeys = [
    "customer_email",
    "user_email",
    "email",
    "payer_email",
    "recipient_email",
    "billing_email"
  ];
  for (const key of candidateKeys) {
    if (typeof obj[key] === "string" && obj[key].includes("@")) {
      return obj[key].trim().toLowerCase();
    }
  }
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === "object") {
      const found = extractEmailFromPayload(val);
      if (found) return found;
    }
  }
  return null;
}
async function handleIncomingWebhook(req, res) {
  try {
    let payload = req.body || {};
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        payload = { rawText: req.body };
      }
    }
    const dbSettings = await getSubscriptionSettingsFromFirestore();
    const configuredSecret = (dbSettings.webhookSecret || process.env.WEBHOOK_SECRET || "whsec_wWyannB9BkCXJhSxk1D5FbqxoM1IWpHvvLhIphNR").trim();
    const priceXOF = dbSettings.proPriceXOF || 1e3;
    const verificationResult = checkWebhookSignature(req, configuredSecret);
    const { isValid: isSecretValid, method: verificationMethod, candidates: secretCandidates } = verificationResult;
    const extractedEmail = extractEmailFromPayload(payload);
    const cleanEmail = extractedEmail ? extractedEmail.trim().toLowerCase() : "E-mail introuvable dans payload";
    if (!isSecretValid) {
      const rejectedLog = {
        id: `wh-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        eventId: payload.event || payload.id || `evt_${Date.now()}`,
        provider: payload.provider || (secretCandidates.length > 0 ? "Gateway Chariot Externe" : "Gateway Externe"),
        userEmail: cleanEmail,
        planAssigned: "free",
        amountXOF: 0,
        status: "Rejected",
        receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
        payloadJson: typeof payload === "string" ? payload : JSON.stringify({
          verificationMethod,
          receivedSecrets: secretCandidates.length > 0 ? secretCandidates : "Aucun secret transmis",
          payload
        }, null, 2),
        error: secretCandidates.length === 0 ? "Secret Webhook non fourni dans la requ\xEAte (headers, query ou body)" : `Secret/Signature Webhook non valid\xE9 par Chariot Engine. Secret(s) re\xE7u(s): [${secretCandidates.join(", ")}]. Secret configur\xE9: "${configuredSecret}"`
      };
      webhookLogs.unshift(rejectedLog);
      updateUserPlanByEmailInFirestore(cleanEmail, "free", rejectedLog).catch(
        (e) => console.warn("Background Firestore log update notice:", e)
      );
      return res.status(200).json({
        success: false,
        status: "Rejected",
        message: "Webhook re\xE7u et enregistr\xE9 dans l'historique, mais REJET\xC9 : Secret/Signature Webhook invalide ou absent.",
        receivedEmail: cleanEmail,
        receivedSecrets: secretCandidates,
        configuredSecret,
        verificationMethod,
        hint: "Transmettez le secret dans la cl\xE9 header Chariot (x-chariot-signature, chariot-signature, x-webhook-secret) ou dans le corps de la requ\xEAte."
      });
    }
    if (!extractedEmail) {
      const failedLog = {
        id: `wh-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        eventId: payload.event || payload.id || `evt_${Date.now()}`,
        provider: payload.provider || "Gateway Externe",
        userEmail: "Inconnu",
        planAssigned: "free",
        amountXOF: 0,
        status: "Failed",
        receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
        payloadJson: typeof payload === "string" ? payload : JSON.stringify(payload, null, 2),
        error: "Adresse e-mail introuvable dans le payload JSON"
      };
      webhookLogs.unshift(failedLog);
      updateUserPlanByEmailInFirestore("Inconnu", "free", failedLog).catch(
        (e) => console.warn("Background Firestore log update notice:", e)
      );
      return res.status(200).json({
        success: false,
        status: "Failed",
        message: "Secret Webhook valid\xE9, mais l'adresse e-mail client n'a pas pu \xEAtre identifi\xE9e dans les donn\xE9es.",
        error: "Adresse e-mail introuvable"
      });
    }
    const successLog = {
      id: `wh-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      eventId: payload.event || payload.id || `evt_${Date.now()}`,
      provider: payload.provider || "Gateway de Paiement Externe",
      userEmail: cleanEmail,
      planAssigned: "pro",
      amountXOF: priceXOF,
      status: "Success",
      receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
      payloadJson: typeof payload === "string" ? payload : JSON.stringify(payload, null, 2)
    };
    webhookLogs.unshift(successLog);
    updateUserPlanByEmailInFirestore(cleanEmail, "pro", successLog).catch(
      (e) => console.warn("Background Firestore user plan update notice:", e)
    );
    triggerNotificationEmail("PRO_SUBSCRIPTION", cleanEmail, {
      firstName: cleanEmail.split("@")[0],
      fullName: cleanEmail.split("@")[0],
      email: cleanEmail,
      priceXOF: priceXOF.toLocaleString("fr-FR")
    }).catch((e) => console.error("Erreur d'envoi d'email Webhook:", e));
    return res.status(200).json({
      success: true,
      status: "Success",
      message: `Plan Pro activ\xE9 avec succ\xE8s pour l'utilisateur ${cleanEmail}. E-mail de confirmation envoy\xE9.`,
      userEmail: cleanEmail,
      plan: "pro"
    });
  } catch (err) {
    console.error("Erreur inattendue dans handleIncomingWebhook:", err);
    return res.status(200).json({
      success: false,
      status: "Error",
      message: `Erreur de traitement du webhook: ${err.message || "Erreur interne"}`,
      error: err.message
    });
  }
}
smtpRouter.all("/webhooks/subscription", handleIncomingWebhook);
smtpRouter.all("/subscription", handleIncomingWebhook);
smtpRouter.all("/api/webhooks/subscription", handleIncomingWebhook);
smtpRouter.all("/api/subscription", handleIncomingWebhook);
smtpRouter.all("/webhooks", handleIncomingWebhook);

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
dotenv.config();
var app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.text({ type: ["text/plain", "text/html", "application/x-www-form-urlencoded", "application/json"] }));
app.use((err, _req, res, next) => {
  if (err) {
    console.error("[Express Body Parser Error]:", err);
    return res.status(200).json({
      success: false,
      status: "Error",
      message: "Payload de requ\xEAte invalide ou non lisible: " + (err.message || "Erreur de format"),
      error: err.message
    });
  }
  next();
});
app.use("/api/admin/smtp", smtpRouter);
app.use("/api/admin", smtpRouter);
app.use("/api/webhooks", smtpRouter);
app.use("/api", smtpRouter);
app.use(smtpRouter);
app.post("/api/notifications/send-trigger", async (req, res) => {
  const { scenarioCode, recipientEmail, variables, eventId } = req.body;
  if (!scenarioCode || !recipientEmail) {
    return res.status(400).json({ error: "Champs scenarioCode et recipientEmail obligatoires." });
  }
  const result = await triggerNotificationEmail(scenarioCode, recipientEmail, variables || {}, eventId);
  if (result.success) {
    return res.json({ success: true, messageId: result.messageId, duplicated: !!result.duplicated });
  } else {
    return res.status(500).json({ success: false, error: result.error });
  }
});
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY non configur\xE9e." });
    }
    const ai = new GoogleGenAI({ apiKey });
    const { prompt, actionType, clientData } = req.body;
    let systemInstruction = `Vous \xEAtes l'Assistant IA certifi\xE9 de la plateforme de r\xE9servation et gestion de cabinet "r\xE9serve.me". Vous assistez le Dr. Sarah Martin et les praticiens de sant\xE9/bien-\xEAtre. Vous \xEAtes professionnel, chaleureux, concis et respectueux de la confidentialit\xE9.`;
    if (actionType === "draft_sms") {
      systemInstruction += ` R\xE9digez un SMS/WhatsApp court (max 160 caract\xE8res ou 2 phrases), amical et professionnel pour rappeler un rendez-vous ou donner une consigne.`;
    } else if (actionType === "clinical_summary") {
      systemInstruction += ` R\xE9digez une note synth\xE9tique de suivi m\xE9dical/postural (3 puces claires et concises) \xE0 int\xE9grer dans le dossier priv\xE9 du praticien.`;
    } else if (actionType === "occupancy_tips") {
      systemInstruction += ` Analysez l'occupation de l'agenda et fournissez 2 conseils strat\xE9giques courts pour optimiser la prise de rendez-vous.`;
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt || `G\xE9n\xE9rer un message pour le patient ${clientData?.name || "Marc Dubois"}`,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });
    return res.json({ text: response.text });
  } catch (err) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({ error: err.message || "Erreur lors du traitement IA." });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path2.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur rezeserve.me actif sur le port ${PORT}`);
  });
}
app.use("/api", (req, res) => {
  if (!res.headersSent) {
    res.status(200).json({
      success: true,
      message: "Reserve Me API Serverless active",
      path: req.path,
      method: req.method
    });
  }
});
if (!process.env.VERCEL) {
  startServer();
}
var server_default = app;
export {
  server_default as default
};
