export type ViewMode = 
  | 'public-landing'
  | 'public-explorer'
  | 'public-booking'
  | 'auth-signin'
  | 'auth-signup'
  | 'auth-verify-email'
  | 'auth-forgot-password'
  | 'user-profile'
  | 'pro-accueil'
  | 'pro-calendrier'
  | 'pro-reservations'
  | 'pro-services'
  | 'pro-service-editor'
  | 'pro-disponibilites'
  | 'pro-clients'
  | 'pro-facturation'
  | 'pro-promocodes'
  | 'pro-subscription'
  | 'admin-dashboard';

export type UserRole = 'customer' | 'business' | 'admin' | 'particulier' | 'professionnel';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string | null;
  emailVerified: boolean;
  role: UserRole;
  providerId?: string;
  companyName?: string;
  plan?: 'free' | 'pro';
  subscriptionStatus?: 'active' | 'inactive' | 'canceled';
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  companyName?: string;
  emailVerified?: boolean;
  plan?: 'free' | 'pro';
  subscriptionStatus?: 'active' | 'inactive' | 'canceled';
  createdAt?: string;
}

export interface SubscriptionSettings {
  proPriceXOF: number;
  checkoutUrl: string;
  webhookSecret: string;
  webhookProvider?: 'custom' | 'maketou' | 'chariow';
  freeMaxServices: number;
  proMaxServices: number;
  updatedAt?: string;
}

export interface WebhookLog {
  id: string;
  eventId: string;
  provider: string;
  userEmail: string;
  userId?: string;
  planAssigned: 'free' | 'pro';
  amountXOF: number;
  status: 'Success' | 'Failed' | 'Rejected';
  receivedAt: string;
  payloadJson: string;
  error?: string;
}

export interface SubPrestation {
  id: string;
  title: string;
  durationMinutes: number;
  priceXOF: number;
  depositXOF: number;
  description?: string;
}

export interface Service {
  id: string;
  userId?: string;
  title: string;
  category: 'cabinet' | 'visio' | 'ateliers';
  categoryLabel: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceXOF: number;
  depositXOF: number;
  location: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  isPopular?: boolean;
  subPrestations?: SubPrestation[];
}

export interface PromoCode {
  id: string;
  userId?: string;
  code: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  isActive: boolean;
  usageCount?: number;
  createdAt?: string;
}

export interface PromoCodeUsage {
  id: string;
  promoCodeId?: string;
  promoCode: string;
  userId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceTitle: string;
  appointmentRef: string;
  appliedAt: string;
  dateStr?: string;
  originalPriceXOF: number;
  discountAmountXOF: number;
  finalPriceXOF: number;
}

export interface Client {
  id: string;
  userId?: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  badge: string;
  createdDate: string;
  totalAppointments: number;
  totalRevenueXOF: number;
  lastVisitDate: string;
  nextAppointmentDate?: string;
  notes: string;
  tags: string[];
  documents?: Array<{
    name: string;
    type: 'pdf' | 'receipt';
    size: string;
  }>;
}

export interface Appointment {
  id: string;
  reference: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAvatar?: string;
  serviceTitle: string;
  serviceDuration: string;
  location: string;
  dateStr: string;
  dateIso?: string;
  timeSlot: string;
  amountXOF: number;
  paidAmountXOF: number;
  status: 'confirmé' | 'en_attente' | 'terminé' | 'annulé';
  paymentMode: string;
  paymentStatus: 'Payé' | 'Préautorisation' | 'Acompte retenu' | 'En attente (48h)';
  room?: string;
  practitionerNote?: string;
  userId?: string;
  appliedPromoCode?: string;
  promoDiscountXOF?: number;
}

export interface Transaction {
  id: string;
  userId?: string;
  reference: string;
  dateStr: string;
  clientName: string;
  serviceTitle: string;
  paymentMode: string;
  amountXOF: number;
  status: 'Payé' | 'Acompte retenu' | 'En attente (48h)';
}

export interface DaySchedule {
  dayName: string;
  dayIndex: number; // 0 = Mon, 6 = Sun
  isOpen: boolean;
  slots: Array<{ start: string; end: string }>;
  customNote?: string;
}

export interface PractitionerProfile {
  id: string;
  name: string;
  title: string;
  cabinetName: string;
  address: string;
  rating: number;
  reviewsCount: number;
  avatar: string;
  coverImage: string;
  bio: string;
  specialties: string[];
  responseDelay: string;
  publicUrl: string;
}

export interface Offer {
  id: string;
  userId?: string;
  serviceId?: string;
  title: string;
  category: string;
  businessName: string;
  rating?: string;
  reviews?: string;
  locationStr: string;
  priceXOF: number;
  priceLabel?: string;
  image: string;
  description?: string;
  slots?: string[];
  isOnline?: boolean;
  createdAt?: string;
}
