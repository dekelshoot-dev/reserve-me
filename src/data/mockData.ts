import { Appointment, Client, DaySchedule, Offer, PractitionerProfile, Service, Transaction } from '../types';

export const initialPractitioner: PractitionerProfile = {
  id: 'dr-sarah-martin',
  name: 'Dr. Sarah Martin',
  title: 'Praticienne & Ostéopathe',
  cabinetName: 'Studio Althéa',
  address: '14 Rue de la Paix, Paris 08',
  rating: 4.95,
  reviewsCount: 112,
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9cwdFDmkaQeuFcKFyycIqQlvcsyJtLtQlAip5UQQbOw2MnykjAe2J5cxDTWnM1lg9-6Ty_89sTVzl53K5DtxRv-Y-oOx7Aj4gKpjQ3no13wnZ-U3LUi2BheV7X-0_zDikkeqkuBzf7D10ZwI1jrWcMzRSdDx2X1-opKbxQ4yLUwkAwfLhp-Tp780wVEsLFgQqMte52CUO9wMZcs-Tt1o2h6AHiGQcScubindYlA',
  coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6NTnYbQy83rZB_7Kqg0E8iPF5H6Pc4WS6M51ydWxaupaEj9bonV2mGpjAwC5IFtUXUlRaEmmfR6UAZAdLMN2wOv4uHTQjMBpt7EGkGJdjNS4W9-SyWjBx2dbEqlQpM_2MCOxdiUusmyRjNVzVt2fn7AiCKbu4PJPBB-ktAJw2u7997u_RuOZYd758SFxTRNn5ep8ssRdOEzOYJ-tZhNRQu2ZzEjHmVgsmt5XQoQ',
  bio: 'Conseil de direction et coaching postural certifié • Accompagnement des dirigeants, athlètes et collectifs sur les arbitrages à fort enjeu.',
  specialties: ['Bilan Postural', 'Nutrition & Santé', 'Téléconsultation', 'Ateliers Collectifs'],
  responseDelay: 'Réponse sous 2h',
  publicUrl: 'reserve.me/althea'
};

export const initialOffers: Offer[] = [
  {
    id: 'off-1',
    title: 'Cabinet Opéra – Dr. Alexandre Vasseur',
    category: 'Ostéopathie & Posturologie',
    businessName: 'Dr. Alexandre Vasseur',
    rating: '4.9',
    reviews: '124',
    locationStr: 'Paris 9e (à 650 m) • Métro Havre-Caumartin',
    priceXOF: 50000,
    priceLabel: '50 000 FCFA',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk09ppjjZFdF8J9fVAFQuGoX3z5rmbgWZEquQGzzoKe445cAEVeie1UcLmDooa-1bEq8WRkhRJyA5QS-IzyguykB8o8jr5j7W95DJ2NnHJViEtP9dlMcVkrLbajXF7yakt6ncnKSAItM5CgEGCth86wZi8RitrUj_GZm9sB8gQgi3qKtH1_LiiINvhmjtHSOyXHfqEdGMOxUKNQZRCoxtUtWlpemrLHRXY5gYpaA',
    description: 'Bilan postural complet et accompagnement personnalisé au cabinet Opéra Paris 9e.',
    slots: ['14:00', '15:30', '17:45'],
    isOnline: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'off-2',
    title: 'Studio Nova – Espace Créatif & Box',
    category: 'Tiers-Lieu & Réunions',
    businessName: 'Studio Nova',
    rating: '4.95',
    reviews: '89',
    locationStr: 'Paris 2e • Sentier • Fibre 1 Gbps & Écrans 4K',
    priceXOF: 15000,
    priceLabel: '15 000 FCFA / h',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe7q9Uf4VaBGN9fsKWwHTajmacR1MbdTqZOHvDL0t28YJKYYatqsWJa7WXeFEGMJ8EBQ3BdKHy_oectC-lDeMFal5bOCY_U0QLfkfxDKYzVfTKxQ-u871-xXovLweSoxFDFl-cRoQL9Ydko2mGgDRi7PL2zeqrCzkw102opL4vONPfxxvHg1rBdkv1DSdgaCAYYApdH2143pYzfy14mCpZZbtDsWaP8DXIFh5hiQ',
    description: 'Espace de réunion tout équipé pour professionnels et créateurs.',
    slots: ['13:00', '15:00', '17:00'],
    isOnline: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'off-3',
    title: 'Éléonore Moreau – Stratégie Carrière',
    category: 'Accompagnement & Leadership',
    businessName: 'Éléonore Moreau',
    rating: '5.0',
    reviews: '62',
    locationStr: 'Visioconférence sécurisée Google Meet',
    priceXOF: 0,
    priceLabel: 'Gratuit (0 FCFA)',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiF_AXQe--eNPBPom39mQ8PJznbTh1SDpaf7Nc0rr_vzlqiXKs7YbMuGyhxOIAldoquncN1yLv8GjRggsCkdKTu5qQpfm3b0Zqf7gN3c77IH8WOHnxdZCsaosFO-HBZf-XT3hXGuN1NXiClAc61bpJtSA4OsCtE6WpCLAF0InurOBEpC3h-M24gkaD-LLy7SFZhBn2d1eBjZ79Nau5wgi2jS1n-cUnHVUeioyfhA',
    description: 'Session de diagnostic offerte de 30 minutes en visio.',
    slots: ['09:00', '11:30', '14:15'],
    isOnline: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'off-4',
    title: 'Maison Botanica – Soins & Stylisme',
    category: 'Coiffure & Spa Botanique',
    businessName: 'Maison Botanica',
    rating: '4.88',
    reviews: '140',
    locationStr: 'Paris 10e • Canal Saint-Martin • Produits bio',
    priceXOF: 40000,
    priceLabel: '40 000 FCFA',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUbuML_uZ1j1UVs7qdMAn346VpC2ZKCVMR1jLc8oGHo0oaMBtHLlQ9yr6Hg3ZxdO-jxpQe7qIZXGIBYOdmDV1hwf-InZPDduiaB0H_DGQdziAnxnOLs6mxAVqjMb7u8WoJKNajFcItZeLd3z21NdERgKLC2ilKLjm2ttTkfJqW2gMcYRyigihgMENCdeUurldxMojx6XaFSg-IbJ-Juz4Ogs6trJjNG2tA21SeNQ',
    description: 'Soins capillaires naturels et rituels botaniques.',
    slots: ['10:00', '11:30', '16:00'],
    isOnline: false,
    createdAt: new Date().toISOString()
  }
];

export const initialServices: Service[] = [
  {
    id: 'srv-1',
    title: 'Bilan Nutritionnel Initial',
    category: 'cabinet',
    categoryLabel: 'Cabinet & Visio',
    durationMinutes: 75,
    bufferMinutes: 15,
    priceXOF: 55000,
    depositXOF: 20000,
    location: 'Cabinet Althéa (Salle 1)',
    description: 'Clarification stratégique, bilan postural complet, relevé des points de friction et plan opérationnel 90 jours.',
    isActive: true,
    isPopular: true
  },
  {
    id: 'srv-2',
    title: 'Consultation de suivi diététique',
    category: 'cabinet',
    categoryLabel: 'Cabinet & Visio',
    durationMinutes: 45,
    bufferMinutes: 15,
    priceXOF: 35000,
    depositXOF: 15000,
    location: 'Cabinet Althéa (Salle 2)',
    description: 'Évaluation des progrès, ajustements nutritionnels et revue des objectifs personnels.',
    isActive: true
  },
  {
    id: 'srv-3',
    title: 'Téléconsultation express',
    category: 'visio',
    categoryLabel: '100% En ligne',
    durationMinutes: 30,
    bufferMinutes: 10,
    priceXOF: 25000,
    depositXOF: 25000,
    location: 'Visio HD Google Meet',
    description: 'Bilan rapide à distance, idéal pour un suivi hebdomadaire ou un ajustement urgent.',
    isActive: true
  },
  {
    id: 'srv-4',
    title: 'Programme nutrition & sport - Pack 3 mois',
    category: 'ateliers',
    categoryLabel: 'Forfait 6 séances',
    durationMinutes: 60,
    bufferMinutes: 15,
    priceXOF: 155000,
    depositXOF: 52000,
    location: 'Cabinet & Visio',
    description: 'Accompagnement intensif sur 90 jours incluant 6 consultations et accès illimité aux conseils WhatsApp.',
    isActive: true
  },
  {
    id: 'srv-5',
    title: 'Atelier découverte groupe (4 pers)',
    category: 'ateliers',
    categoryLabel: 'Atelier collectif',
    durationMinutes: 120,
    bufferMinutes: 30,
    priceXOF: 30000,
    depositXOF: 15000,
    location: 'Salle de réunion Althéa',
    description: 'Co-développement intensif et ateliers pratiques du samedi matin.',
    isActive: false
  }
];

export const initialClients: Client[] = [
  {
    id: 'cli-1',
    code: 'CLI-9021',
    name: 'Marc Dubois',
    email: 'marc.dubois@email.fr',
    phone: '+33 6 42 19 88 02',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAapZlXxdaeiTAvaXl-mjh2PWf2lZztYGVJhWW5yUp_Kst2FzlU6VrbQ0xkHhySbjxeb_x4PKxuoAtMovlrccAZqekcactXxEOOBWxUz5KJHRXM2NNntkOC-E7E5B_Z0ktaFRLBu5FFBVAB2aVTWBSeIl8PSLVO5zByjBWmqDwjZDJ8vmh-8SbS0EWPRHGu6p1ab6Trm9Ap9r1go2_h_10eOM30TGlMxZWEsKav-Q',
    badge: 'PRO',
    createdDate: '14 Fév 2024',
    totalAppointments: 4,
    totalRevenueXOF: 220000,
    lastVisitDate: '12 Oct 2025',
    nextAppointmentDate: '24 Oct • 14:30',
    notes: 'Lombalgie mécanique L4-L5 soulagée à 70% après manipulation du 12/10. Rappel : prescrire étirements ischio-jambiers et tester la posture assise prolongée.',
    tags: ['Régulier', 'Lombalgie'],
    documents: [
      { name: 'Bilan_Postural_Marc_Dubois.pdf', type: 'pdf', size: '1.2 MB' },
      { name: 'Note_Honoraires_Septembre.pdf', type: 'receipt', size: '340 KB' }
    ]
  },
  {
    id: 'cli-2',
    code: 'CLI-9044',
    name: 'Camille Leroux',
    email: 'camille.leroux@studio.io',
    phone: '+33 7 81 04 22 55',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBG9jKwLeKMShYhSTFEGUF0Gr9jLLtRyGA-W3DS14KG081w42imnlhxDlDV0Qmfj_F2QTOnGw-0PcMccbrNArO5ouK1VDnXTowJoPjTrnpYdt6rV2OSS56T4o3j-OsC1MKsjEqqOud4lGLGSG3SJJ-z07JV25-bJ-iuvFPa5cIeSivQEactfn1TMLNfi4zxQXyOGpzw4V61oCVO18IGigLpUXPYT3BX4tnNcbhuWQ',
    badge: 'NOUVEAU',
    createdDate: '03 Oct 2025',
    totalAppointments: 2,
    totalRevenueXOF: 110000,
    lastVisitDate: '03 Oct 2025',
    notes: 'Première séance effectuée : tensions cervicales importantes liées au travail prolongé sur écran. Bilan ergonomique envoyé par email.',
    tags: ['Première consultation']
  },
  {
    id: 'cli-3',
    code: 'CLI-8890',
    name: 'Sophie Bernard',
    email: 'sophie.b@avocat-paris.fr',
    phone: '+33 6 11 90 45 10',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeLN3OCV30hTJ7D_ifGeHeSykePo9bnKfk9v_Ip6ek_3BeyiE0MHMiTX9XDlCk07y8zC03ItnZCHX4zCn36vaT5kUm_JxXyFo6cWIBKiKtCJ488VpTR2gpEOfCw5cxEINeqdp_4Geqg6fKGi0asgZ3CqyCUwCWi_exR2c21T9Z6ZwQA3ZByVERCGNO2vzCwFKYb9JE8bBkzbB3XVBzVxM0z0DGENntvFgNdK_FEA',
    badge: 'VIP',
    createdDate: '12 Jan 2024',
    totalAppointments: 6,
    totalRevenueXOF: 335000,
    lastVisitDate: '18 Sep 2025',
    nextAppointmentDate: '28 Oct • 10:00',
    notes: 'Patiente assidue. Protocole de suivi semestriel pour migraine ophtalmique et trapèzes. Préférence créneaux du matin.',
    tags: ['VIP', 'Régulier']
  },
  {
    id: 'cli-4',
    code: 'CLI-9102',
    name: 'Antoine Alibert',
    email: 'antoine.alibert@tech.co',
    phone: '+33 6 88 12 34 76',
    badge: 'VISIO',
    createdDate: '22 Aoû 2025',
    totalAppointments: 1,
    totalRevenueXOF: 55000,
    lastVisitDate: '15 Oct 2025',
    nextAppointmentDate: '02 Nov • 16:00',
    notes: 'Suivi postural en téléconsultation. Amélioration de la mobilité d’épaule droite suite à reprise sportive progressive.',
    tags: ['Téléconsultation']
  },
  {
    id: 'cli-5',
    code: 'CLI-8762',
    name: 'Éléonore Ndiaye',
    email: 'e.ndiaye@design.net',
    phone: '+33 6 54 32 10 98',
    badge: 'RÉGULIER',
    createdDate: '05 Nov 2024',
    totalAppointments: 5,
    totalRevenueXOF: 280000,
    lastVisitDate: '29 Sep 2025',
    notes: 'Bilan podologique et chaînes montantes équilibrées. En attente de feedback sur les semelles orthopédiques.',
    tags: ['Régulier', 'Posturologie']
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: 'apt-1',
    reference: 'REV-8492',
    clientName: 'Marc Dubreuil',
    clientEmail: 'm.dubreuil@finance.eu',
    clientPhone: '+33 6 42 19 88 02',
    clientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBV8vMmivtr07Kq1WhyEvzMC5aftQATmvC5s-Rv0MotI8jIOZaia_C-6637U7Jjt7x_3aoh9jyWO_qykVcf3R7ci7E-gwT7Z4iFsh5xEWBedMywTxWmLrWPsmcDOePnSfOCVp92jTf7hAyewqv94VEAB78psd0J12otvDjtXPEnYQkiXrkylFfkGNHhwXnk62VXz9dB4EOlh1ruIblOaochZyU1BPDNNbKY05F7-g',
    serviceTitle: 'Bilan Nutritionnel Initial',
    serviceDuration: '60 min',
    location: 'Cabine Prestige (Salle 2)',
    dateStr: 'Mercredi 16 Oct.',
    dateIso: '2026-10-16',
    timeSlot: '10:30',
    amountXOF: 60000,
    paidAmountXOF: 30000,
    status: 'en_attente',
    paymentMode: 'Stripe CB (•••• 4218)',
    paymentStatus: 'Préautorisation',
    room: 'Cabine 2',
    practitionerNote: 'Empreinte de 30 000 FCFA retenue. Patient sollicite 10 min de conseils produits.'
  },
  {
    id: 'apt-2',
    reference: 'REV-8493',
    clientName: 'Camille Leroux',
    clientEmail: 'camille.leroux@studio.io',
    clientPhone: '+33 7 81 04 22 55',
    clientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBG9jKwLeKMShYhSTFEGUF0Gr9jLLtRyGA-W3DS14KG081w42imnlhxDlDV0Qmfj_F2QTOnGw-0PcMccbrNArO5ouK1VDnXTowJoPjTrnpYdt6rV2OSS56T4o3j-OsC1MKsjEqqOud4lGLGSG3SJJ-z07JV25-bJ-iuvFPa5cIeSivQEactfn1TMLNfi4zxQXyOGpzw4V61oCVO18IGigLpUXPYT3BX4tnNcbhuWQ',
    serviceTitle: 'Consultation de suivi',
    serviceDuration: '45 min',
    location: 'Cabinet Althéa',
    dateStr: 'Mardi 14 Oct.',
    dateIso: '2026-10-14',
    timeSlot: '10:30',
    amountXOF: 45000,
    paidAmountXOF: 45000,
    status: 'confirmé',
    paymentMode: 'Stripe CB',
    paymentStatus: 'Payé',
    room: 'Salle 1'
  },
  {
    id: 'apt-3',
    reference: 'REV-8494',
    clientName: 'Thomas Vasseur',
    clientEmail: 'thomas.v@studio.fr',
    clientPhone: '+33 6 88 12 34 76',
    clientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWvfSGzCB2RfXh0R1EIpgJTwqW_LiF0PaBVY5-itENBniXukB8nze1YooYdktjYDMSTHRCKhSHtROPKuJjja8iwZ82qV4FJzadLPJNRZ7Y1jFgY5nuQQg0u3yZ_vVdzj3h5YQ_TSJKAGUH5iPr2YTfYdDCHfsM5W3TZBcbT7juvxfDjjFyK2PM3YXMbam-5rYPmbW3hrsSLOD3d7n8ENL8xruR4-peccTzApzVRA',
    serviceTitle: 'Atelier personnalisé',
    serviceDuration: '90 min',
    location: 'Cabinet Althéa',
    dateStr: 'Mardi 14 Oct.',
    dateIso: '2026-10-14',
    timeSlot: '14:00',
    amountXOF: 65000,
    paidAmountXOF: 25000,
    status: 'en_attente',
    paymentMode: 'Acompte CB',
    paymentStatus: 'Acompte retenu',
    room: 'Atelier'
  },
  {
    id: 'apt-4',
    reference: 'REV-8495',
    clientName: 'Élodie Fabre',
    clientEmail: 'elodie.fabre@paris.com',
    clientPhone: '+33 6 12 34 56 78',
    clientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLnzcPFFdOiNmLOPYkt3Oz8Q7WO_xV4nRZa0KGM2lkSL2vppEKePJdOe2chyqWTyLX9NW5oGLAeKvfdUYWhAxmYkUMcaqDriIuofrUYRuosgc4jH4Ga65FhvcAQwDyLHwM9C7xwTZ5p7eu40HLuViusoNpfUeS1_KUdhXQ5PgkU6CJeQLzjFk0z1Bic5SnvWCUF3MU3orS8IdAZQHCTukXsOVn4WFaCt42yWi9WA',
    serviceTitle: 'Téléconsultation express',
    serviceDuration: '45 min',
    location: 'Visio HD Google Meet',
    dateStr: 'Mardi 14 Oct.',
    dateIso: '2026-10-14',
    timeSlot: '16:00',
    amountXOF: 35000,
    paidAmountXOF: 35000,
    status: 'confirmé',
    paymentMode: 'Apple Pay',
    paymentStatus: 'Payé',
    room: 'Visio'
  },
  {
    id: 'apt-5',
    reference: 'REV-8496',
    clientName: 'Sophie G.',
    clientEmail: 'sophie.g@domain.fr',
    clientPhone: '+33 6 99 88 77 66',
    serviceTitle: 'Consultation classique',
    serviceDuration: '60 min',
    location: 'Cabinet Althéa',
    dateStr: 'Lundi 13 Oct.',
    dateIso: '2026-10-13',
    timeSlot: '09:30',
    amountXOF: 50000,
    paidAmountXOF: 50000,
    status: 'terminé',
    paymentMode: 'Stripe CB',
    paymentStatus: 'Payé'
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    reference: 'FAC-2024-1082',
    dateStr: '26 Oct • 09:30',
    clientName: 'Marc Lefèvre',
    serviceTitle: 'Consultation Ostéopathie (Cabinet)',
    paymentMode: 'Stripe CB (•••• 4242)',
    amountXOF: 50000,
    status: 'Payé'
  },
  {
    id: 'tx-2',
    reference: 'FAC-2024-1081',
    dateStr: '25 Oct • 17:15',
    clientName: 'Élodie Bernard',
    serviceTitle: 'Téléconsultation Posturologie',
    paymentMode: 'Apple Pay',
    amountXOF: 40000,
    status: 'Payé'
  },
  {
    id: 'tx-3',
    reference: 'IND-2024-0014',
    dateStr: '25 Oct • 11:00',
    clientName: 'Thibault Laurent',
    serviceTitle: 'Annulation < 24h (Désistement)',
    paymentMode: 'Acompte Stripe CB',
    amountXOF: 20000,
    status: 'Acompte retenu'
  },
  {
    id: 'tx-4',
    reference: 'PROV-2024-041',
    dateStr: '27 Oct • 14:00',
    clientName: 'Camille Perrin',
    serviceTitle: 'Ostéopathie Pédiatrique',
    paymentMode: 'Empreinte CB bloquée',
    amountXOF: 45000,
    status: 'En attente (48h)'
  },
  {
    id: 'tx-5',
    reference: 'FAC-2024-1080',
    dateStr: '24 Oct • 16:00',
    clientName: 'Antoine Garnier',
    serviceTitle: 'Ostéopathie d\'urgence',
    paymentMode: 'Sur place (TPE / Espèces)',
    amountXOF: 55000,
    status: 'Payé'
  }
];

export const initialWeeklySchedule: DaySchedule[] = [
  {
    dayName: 'Lundi',
    dayIndex: 0,
    isOpen: true,
    slots: [
      { start: '09:00', end: '13:00' },
      { start: '14:00', end: '18:30' }
    ]
  },
  {
    dayName: 'Mardi',
    dayIndex: 1,
    isOpen: true,
    slots: [
      { start: '09:00', end: '13:00' },
      { start: '14:00', end: '19:00' }
    ]
  },
  {
    dayName: 'Mercredi',
    dayIndex: 2,
    isOpen: true,
    slots: [
      { start: '09:00', end: '12:30' }
    ],
    customNote: 'Après-midi réservé'
  },
  {
    dayName: 'Jeudi',
    dayIndex: 3,
    isOpen: true,
    slots: [
      { start: '09:00', end: '13:00' },
      { start: '14:00', end: '19:00' }
    ]
  },
  {
    dayName: 'Vendredi',
    dayIndex: 4,
    isOpen: true,
    slots: [
      { start: '08:30', end: '16:30' }
    ],
    customNote: 'Journée continue'
  },
  {
    dayName: 'Samedi',
    dayIndex: 5,
    isOpen: false,
    slots: [],
    customNote: 'Fermé au public'
  },
  {
    dayName: 'Dimanche',
    dayIndex: 6,
    isOpen: false,
    slots: [],
    customNote: 'Fermé au public'
  }
];
