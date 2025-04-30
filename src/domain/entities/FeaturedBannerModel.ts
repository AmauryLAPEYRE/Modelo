export enum BannerType {
    SERVICE = 'service',
    PROFILE = 'profile',
    EXTERNAL = 'external'
  }
  
  export interface FeaturedBannerModel {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    type: BannerType;
    targetId?: string; // ID de la prestation ou du profil (si type !== EXTERNAL)
    externalUrl?: string; // URL externe (si type === EXTERNAL)
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    priority: number; // Priorité d'affichage (plus élevé = plus prioritaire)
  }