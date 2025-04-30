export enum UserRole {
    MODEL = 'model',
    PROFESSIONAL = 'professional'
  }
  
  export enum ProfessionalStatus {
    FREELANCE = 'freelance',
    SELF_EMPLOYED = 'self_employed',
    COMPANY = 'company'
  }
  
  export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other'
  }
  
  export enum HairColor {
    BLACK = 'black',
    BROWN = 'brown',
    BLONDE = 'blonde',
    RED = 'red',
    WHITE = 'white',
    GRAY = 'gray',
    OTHER = 'other'
  }
  
  export enum EyeColor {
    BROWN = 'brown',
    BLUE = 'blue',
    GREEN = 'green',
    GRAY = 'gray',
    HAZEL = 'hazel',
    OTHER = 'other'
  }
  
  export interface Availability {
    days: string[]; // Jours de disponibilité (format: 'YYYY-MM-DD')
    timeSlots?: {
      morning: boolean; // 8h-12h
      afternoon: boolean; // 12h-18h
      evening: boolean; // 18h-22h
    };
  }
  
  export interface SocialMedia {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    portfolio?: string;
    other?: string;
  }
  
  export interface Location {
    address?: string;
    city: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    radius: number; // Rayon d'action en km
  }
  
  export interface Rating {
    average: number; // Moyenne des notes (1-5)
    count: number; // Nombre total d'évaluations
  }
  
  export interface BaseUserModel {
    id: string;
    uid: string; // Firebase Auth UID
    email: string;
    fullName: string;
    phoneNumber?: string;
    profilePicture?: string;
    location: Location;
    role: UserRole;
    interests: string[]; // Catégories d'intérêt (ex: coiffure, maquillage, photos, etc.)
    bio?: string;
    socialMedia?: SocialMedia;
    rating?: Rating;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastActive?: Date;
    blockedUsers?: string[]; // Liste des UIDs bloqués
    fcmTokens?: string[]; // Tokens pour les notifications push
  }
  
  export interface ModelUserModel extends BaseUserModel {
    role: UserRole.MODEL;
    age: number;
    gender: Gender;
    height?: number; // En centimètres
    hairColor?: HairColor;
    eyeColor?: EyeColor;
    photos: string[]; // URLs des photos (visage, profil, plein pied)
    experience?: string; // Description de l'expérience
    availability: Availability;
  }
  
  export interface ProfessionalUserModel extends BaseUserModel {
    role: UserRole.PROFESSIONAL;
    businessName?: string;
    status: ProfessionalStatus;
    services: string[]; // Types de services proposés
    portfolio?: string[];
  }
  
  export type UserModel = ModelUserModel | ProfessionalUserModel;