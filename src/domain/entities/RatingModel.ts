export interface RatingModel {
    id: string;
    serviceId: string; // ID de la prestation
    applicationId: string; // ID de la candidature
    ratedUserId: string; // ID de l'utilisateur évalué
    raterUserId: string; // ID de l'utilisateur qui évalue
    score: number; // Note de 1 à 5
    comment?: string; // Commentaire optionnel
    createdAt: Date;
    updatedAt?: Date;
    isPublic: boolean; // Si true, visible sur le profil public
  }