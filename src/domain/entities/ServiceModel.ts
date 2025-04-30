import { Gender, HairColor, EyeColor } from './UserModel';

export enum ServiceStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum ServiceType {
  HAIR = 'hair',
  MAKEUP = 'makeup',
  PHOTOGRAPHY = 'photography',
  FASHION = 'fashion',
  NAILS = 'nails',
  AESTHETIC = 'aesthetic',
  OTHER = 'other'
}

export enum PaymentType {
  FREE = 'free',
  PAID = 'paid'
}

export interface ServiceCriteria {
  gender?: Gender;
  ageMin?: number;
  ageMax?: number;
  heightMin?: number; // En centimètres
  heightMax?: number;
  hairColor?: HairColor[];
  eyeColor?: EyeColor[];
  experience?: boolean; // Si true, requiert une expérience préalable
  specificRequirements?: string;
}

export interface ServiceLocation {
  address?: string;
  city: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isRemote?: boolean; // Si true, le service peut être réalisé à distance
}

export interface ServiceDate {
  startDate: Date;
  endDate?: Date;
  duration?: number; // Durée en minutes
  isFlexible?: boolean; // Si true, les dates sont flexibles
}

export interface ServicePayment {
  type: PaymentType;
  amount?: number; // Montant en euros (si type === PAID)
  details?: string; // Détails du paiement
}

export interface ServiceModel {
  id: string;
  professionalId: string; // ID de l'utilisateur professionnel
  title: string;
  description: string;
  type: ServiceType | ServiceType[]; // Un ou plusieurs types de service
  status: ServiceStatus;
  date: ServiceDate;
  location: ServiceLocation;
  criteria: ServiceCriteria;
  payment: ServicePayment;
  images: string[]; // URLs des images
  isUrgent: boolean; // Mise en avant prioritaire
  applicationCount: number; // Nombre de candidatures reçues
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // Date d'expiration automatique
}