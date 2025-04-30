export enum ApplicationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed'
  }
  
  export interface ApplicationModel {
    id: string;
    serviceId: string; // ID de la prestation
    modelId: string; // ID du modèle candidat
    professionalId: string; // ID du professionnel
    message: string; // Message de candidature
    photos: string[]; // URLs des photos soumises avec la candidature
    video?: string; // URL de la vidéo (optionnelle)
    status: ApplicationStatus;
    rejectionReason?: string; // Raison du refus (si status === REJECTED)
    hasUnreadMessages: boolean; // Indique si des messages non lus existent
    createdAt: Date;
    updatedAt: Date;
    expiredAt?: Date; // Date d'expiration (si pas de réponse)
  }