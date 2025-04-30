import { format, formatDistance, isToday, isYesterday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ServiceType, PaymentType } from '../domain/entities/ServiceModel';
import { ApplicationStatus } from '../domain/entities/ApplicationModel';
import { UserRole, Gender, HairColor, EyeColor, ProfessionalStatus } from '../domain/entities/UserModel';

/**
 * Formate une date en format lisible
 */
export const formatDate = (date: Date | string | number): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  return format(parsedDate, 'dd/MM/yyyy', { locale: fr });
};

/**
 * Formate une date et une heure en format lisible
 */
export const formatDateTime = (date: Date | string | number): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  return format(parsedDate, 'dd/MM/yyyy à HH:mm', { locale: fr });
};

/**
 * Formate une date pour les messages
 */
export const formatMessageDate = (date: Date | string | number): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (isToday(parsedDate)) {
    return format(parsedDate, 'HH:mm', { locale: fr });
  }
  
  if (isYesterday(parsedDate)) {
    return 'Hier à ' + format(parsedDate, 'HH:mm', { locale: fr });
  }
  
  return format(parsedDate, 'dd/MM/yyyy à HH:mm', { locale: fr });
};

/**
 * Formate une date relative (il y a X temps)
 */
export const formatRelativeDate = (date: Date | string | number): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  return formatDistance(parsedDate, new Date(), { addSuffix: true, locale: fr });
};

/**
 * Formate un type de service en texte
 */
export const formatServiceType = (type: ServiceType | ServiceType[]): string => {
  if (Array.isArray(type)) {
    return type.map(t => formatSingleServiceType(t)).join(', ');
  }
  
  return formatSingleServiceType(type);
};

/**
 * Formate un type de service unique en texte
 */
const formatSingleServiceType = (type: ServiceType): string => {
  switch (type) {
    case ServiceType.HAIR:
      return 'Coiffure';
    case ServiceType.MAKEUP:
      return 'Maquillage';
    case ServiceType.PHOTOGRAPHY:
      return 'Photographie';
    case ServiceType.FASHION:
      return 'Mode';
    case ServiceType.NAILS:
      return 'Ongles';
    case ServiceType.AESTHETIC:
      return 'Esthétique';
    case ServiceType.OTHER:
      return 'Autre';
    default:
      return 'Inconnu';
  }
};

/**
 * Formate un type de paiement en texte
 */
export const formatPaymentType = (type: PaymentType, amount?: number): string => {
  switch (type) {
    case PaymentType.FREE:
      return 'Gratuit';
    case PaymentType.PAID:
      return `${amount ? amount + ' €' : 'Payant'}`;
    default:
      return 'Inconnu';
  }
};

/**
 * Formate un statut de candidature en texte
 */
export const formatApplicationStatus = (status: ApplicationStatus): string => {
  switch (status) {
    case ApplicationStatus.PENDING:
      return 'En attente';
    case ApplicationStatus.ACCEPTED:
      return 'Acceptée';
    case ApplicationStatus.REJECTED:
      return 'Refusée';
    case ApplicationStatus.CANCELLED:
      return 'Annulée';
    case ApplicationStatus.COMPLETED:
      return 'Terminée';
    default:
      return 'Inconnu';
  }
};

/**
 * Formate un rôle d'utilisateur en texte
 */
export const formatUserRole = (role: UserRole): string => {
  switch (role) {
    case UserRole.MODEL:
      return 'Modèle';
    case UserRole.PROFESSIONAL:
      return 'Professionnel';
    default:
      return 'Inconnu';
  }
};

/**
 * Formate un genre en texte
 */
export const formatGender = (gender: Gender): string => {
  switch (gender) {
    case Gender.MALE:
      return 'Homme';
    case Gender.FEMALE:
      return 'Femme';
    case Gender.OTHER:
      return 'Autre';
    default:
      return 'Non spécifié';
  }
};

/**
 * Formate une couleur de cheveux en texte
 */
export const formatHairColor = (color: HairColor): string => {
  switch (color) {
    case HairColor.BLACK:
      return 'Noir';
    case HairColor.BROWN:
      return 'Brun';
    case HairColor.BLONDE:
      return 'Blond';
    case HairColor.RED:
      return 'Roux';
    case HairColor.WHITE:
      return 'Blanc';
    case HairColor.GRAY:
      return 'Gris';
    case HairColor.OTHER:
      return 'Autre';
    default:
      return 'Non spécifié';
  }
};

/**
 * Formate une couleur d'yeux en texte
 */
export const formatEyeColor = (color: EyeColor): string => {
  switch (color) {
    case EyeColor.BROWN:
      return 'Brun';
    case EyeColor.BLUE:
      return 'Bleu';
    case EyeColor.GREEN:
      return 'Vert';
    case EyeColor.GRAY:
      return 'Gris';
    case EyeColor.HAZEL:
      return 'Noisette';
    case EyeColor.OTHER:
      return 'Autre';
    default:
      return 'Non spécifié';
  }
};

/**
 * Formate un statut professionnel en texte
 */
export const formatProfessionalStatus = (status: ProfessionalStatus): string => {
  switch (status) {
    case ProfessionalStatus.FREELANCE:
      return 'Freelance';
    case ProfessionalStatus.SELF_EMPLOYED:
      return 'Auto-entrepreneur';
    case ProfessionalStatus.COMPANY:
      return 'Société';
    default:
      return 'Non spécifié';
  }
};

/**
 * Formate une note (1-5) en texte avec étoiles
 */
export const formatRating = (rating: number): string => {
  const roundedRating = Math.round(rating);
  
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += i <= roundedRating ? '★' : '☆';
  }
  
  return `${rating.toFixed(1)} ${stars}`;
};

/**
 * Formate un nombre en texte avec espace comme séparateur de milliers
 */
export const formatNumber = (number: number): string => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Formate un prix en euros
 */
export const formatPrice = (price: number): string => {
  return `${price.toFixed(2)} €`.replace('.', ',');
};

/**
 * Formate une taille en centimètres
 */
export const formatHeight = (height: number): string => {
  return `${height} cm`;
};

/**
 * Formate un âge en années
 */
export const formatAge = (age: number): string => {
  return `${age} an${age > 1 ? 's' : ''}`;
};