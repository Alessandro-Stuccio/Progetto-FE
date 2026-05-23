/**
 * Tipi TypeScript per la dashboard Kore.
 * Mappati 1:1 ai DTO Java del backend Spring Boot.
 */

// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────

export enum UserRole {
  CLIENT = 'CLIENT',
  PERSONAL_TRAINER = 'PERSONAL_TRAINER',
  NUTRITIONIST = 'NUTRITIONIST',
  MODERATOR = 'MODERATOR',
  INSURANCE_MANAGER = 'INSURANCE_MANAGER',
  ADMIN = 'ADMIN'
}

export type BookingStatus =
  | 'CONFIRMED'
  | 'CANCELED'
  | 'COMPLETED';

export type PlanDuration = 'SEMESTRALE' | 'ANNUALE';

export type TabId =
  | 'home'
  | 'calendar'
  | 'chat'
  | 'clients'
  | 'book-call'
  | 'my-services'
  | 'admin-users'
  | 'admin-plans'
  | 'admin-stats'
  | 'insurance';

// ─────────────────────────────────────────────────────────────
// User & Auth
// ─────────────────────────────────────────────────────────────

export type UserManagementMode = 'admin' | 'moderator';

export interface ManagedUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
  planId?: number;
  paymentFrequency?: string;
  assignedPTId?: number;
  assignedNutritionistId?: number;
}

/** Dati utente salvati in localStorage dopo il login (da AuthResponse.java). */
export interface AuthUser {
  token: string;
  type: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
  createdAt?: string;
}

/** Profilo utente completo (da UserResponse.java e UserResponseDTO.java). */
export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  // Da UserResponse (dashboard cliente/professionista)
  active?: boolean;
  profilePictureUrl?: string;
  weight?: number;
  height?: number;
  assignedPtName?: string;
  assignedNutritionistName?: string;
  bio?: string;
  specialization?: string;
  averageRating?: number;
  activeClientsCount?: number;
  // Da UserResponseDTO (tabelle admin/moderator) — stessa relazione, case diverso
  assignedPTName?: string;
  professionalBio?: string;
  createdAt?: string;
}

/** Info base di un cliente (da ClientBasicInfoResponse.java). */
export interface ClientBasicInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
  role?: string;
}

/** Item nell'elenco "clienti da monitorare" (da ClientAttentionItem.java in ProfessionalStatsResponse). */
export interface ClientAttentionItem {
  id: number;
  firstName: string;
  lastName: string;
  lastDocDate?: string;
  daysSinceLastDoc: number;
}

// ─────────────────────────────────────────────────────────────
// Subscription & Plan
// ─────────────────────────────────────────────────────────────

/** Stato abbonamento (da SubscriptionResponse.java). */
export interface Subscription {
  id: number;
  planName: string;
  startDate: string;
  endDate: string;
  /** `isActive` nel DTO Java; Jackson lo serializza come `active`. */
  active: boolean;
  isActive?: boolean;
  remainingPtCredits: number;
  remainingNutritionistCredits: number;
  /** Campi aggiuntivi da endpoint admin/insurance */
  monthlyPrice?: number;
  currentCreditsPT?: number;
  currentCreditsNutri?: number;
  userId?: number;
}

/** Piano di abbonamento (dedotto da admin-plans-tab e backend). */
export interface Plan {
  id: number;
  name: string;
  duration: PlanDuration;
  fullPrice: number;
  monthlyInstallmentPrice: number;
  monthlyCreditsPT: number;
  monthlyCreditsNutri: number;
}

// ─────────────────────────────────────────────────────────────
// Professional
// ─────────────────────────────────────────────────────────────

/** Riepilogo professionista (da ProfessionalSummaryDTO.java + campi UI extra). */
export interface ProfessionalSummary {
  id: number;
  fullName: string;
  averageRating?: number;
  currentActiveClients?: number;
  isSoldOut?: boolean;
  role: UserRole;
  /** Campo aggiuntivo dal frontend (non nel Java DTO base). */
  profilePicture?: string;
  /** Bio del professionista (esteso dal frontend). */
  professionalBio?: string;
  /** Campi aggiuntivi usati in chat-tab per costruire i contatti chat */
  firstName?: string;
  lastName?: string;
  email?: string;
}

// ─────────────────────────────────────────────────────────────
// Booking
// ─────────────────────────────────────────────────────────────

/** Prenotazione (da BookingResponse.java). */
export interface Booking {
  id: number;
  /** Formato "yyyy-MM-dd". */
  date: string;
  /** Formato "HH:mm". */
  startTime: string;
  /** Formato "HH:mm". */
  endTime: string;
  professionalName?: string;
  clientName?: string;
  professionalRole: UserRole;
  meetingLink?: string;
  status: BookingStatus;
  canJoin: boolean;
}

/** Richiesta creazione prenotazione (userId estratto dal JWT lato backend). */
export interface BookingRequest {
  slotId: number;
}

// ─────────────────────────────────────────────────────────────
// Slot
// ─────────────────────────────────────────────────────────────

/** Slot di disponibilità (da SlotDTO.java). */
export interface ProfessionalSlot {
  id: number;
  /** ISO datetime string. */
  startTime: string;
  /** ISO datetime string. */
  endTime: string;
  /**
   * Jackson serializza `isAvailable` (boolean primitivo Java) come `available`.
   * Entrambi sono accettati per retrocompatibilità.
   */
  isAvailable?: boolean;
  available?: boolean;
  professionalId?: number;
}

/** Payload per creare nuovi slot. */
export interface SlotPayload {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// ─────────────────────────────────────────────────────────────
// Dashboard aggregata
// ─────────────────────────────────────────────────────────────

/** Risposta dashboard aggregata (da ClientDashboardResponse.java). */
export interface DashboardData {
  profile: UserProfile;
  followingProfessionals: ProfessionalSummary[];
  subscription: Subscription | null;
  upcomingBookings: Booking[];
}

// ─────────────────────────────────────────────────────────────
// Statistiche & Activity
// ─────────────────────────────────────────────────────────────

/** Singolo appuntamento di oggi (da TodayBookingItem.java). */
export interface TodayBookingItem {
  id: number;
  clientName: string;
  clientId: number;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  meetingLink?: string;
}

/** Statistiche professionista (da ProfessionalStatsResponse.java). */
export interface ProStats {
  todayBookings: TodayBookingItem[];
  todayBookingsCount: number;
  clientsNeedingAttention: ClientAttentionItem[];
  clientsNeedingAttentionCount: number;
  docsUploadedThisWeek: number;
  totalClients: number;
}

/** Singolo item del feed attività (da ActivityFeedItemResponse.java). */
export interface ActivityFeedItem {
  type: string;
  icon: string;
  text: string;
  timestamp: string;
  timeAgo: string;
}

// ─────────────────────────────────────────────────────────────
// Profilo edit
// ─────────────────────────────────────────────────────────────

/** Dati form modifica profilo. */
export interface ProfileEditData {
  firstName: string;
  lastName: string;
  password: string;
  profilePicture: string;
}

// ─────────────────────────────────────────────────────────────
// Error handling
// ─────────────────────────────────────────────────────────────

/**
 * Struttura standard per errori API del backend.
 * Corrisponde a `ErrorResponse.java`.
 */
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}
