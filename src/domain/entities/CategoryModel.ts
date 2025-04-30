export interface CategoryModel {
    id: string;
    name: string;
    icon: string; // Nom de l'icône Ionicons
    color?: string; // Couleur hexadécimale (ex: #FF5733)
    order?: number; // Ordre d'affichage
    isActive: boolean;
  }