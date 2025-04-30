import { Platform, Dimensions } from 'react-native';
import * as Notifications from 'expo-notifications';
import { APP_CONFIG } from './constants';

// Dimensions de l'écran
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Vérifie si le texte dépasse la longueur maximale
 */
export const isTextValid = (text: string, maxLength: number = APP_CONFIG.maxMessageLength): boolean => {
  return text.trim().length > 0 && text.length <= maxLength;
};

/**
 * Tronque un texte si nécessaire
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return `${text.substring(0, maxLength - 3)}...`;
};

/**
 * Calcule la distance entre deux coordonnées (en km)
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance en km
  
  return parseFloat(distance.toFixed(1));
};

/**
 * Convertit des degrés en radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Formate un numéro de téléphone
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Supprimer tous les caractères non numériques
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format français: 06 12 34 56 78
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return phoneNumber;
};

/**
 * Vérifie si un fichier est trop volumineux
 */
export const isFileTooLarge = (fileSize: number, maxSize: number = APP_CONFIG.maxFileSize): boolean => {
  return fileSize > maxSize;
};

/**
 * Demande l'autorisation pour les notifications push
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    // Vérifier si l'appareil peut recevoir des notifications
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Si l'autorisation n'a pas encore été demandée, la demander
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // Si l'autorisation n'est pas accordée, sortir
    if (finalStatus !== 'granted') {
      return null;
    }
    
    // Obtenir le token d'exposition
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Configurer les gestionnaires de notification
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true
      })
    });
    
    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Génère un ID unique
 */
export const generateUniqueId = (): string => {
  return 'id-' + Math.random().toString(36).substring(2, 11);
};

/**
 * Renvoie l'extension d'un fichier à partir de son URI
 */
export const getFileExtension = (uri: string): string => {
  return uri.split('.').pop()?.toLowerCase() || '';
};

/**
 * Vérifie si un email est valide
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Vérifie si un mot de passe est suffisamment fort
 * - Au moins 8 caractères
 * - Au moins 1 lettre majuscule
 * - Au moins 1 lettre minuscule
 * - Au moins 1 chiffre
 */
export const isStrongPassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

/**
 * Vérifie si l'appareil est un iPhone avec une encoche
 */
export const hasNotch = (): boolean => {
  const { height, width } = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTV &&
    (height === 780 || width === 780 || height === 812 || width === 812 || height === 844 || width === 844 || height === 896 || width === 896 || height === 926 || width === 926)
  );
};

/**
 * Vérifie si une URL est valide
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Ajoute "https://" à une URL si nécessaire
 */
export const ensureHttps = (url: string): string => {
  if (!url) return '';
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
};

/**
 * Ajoute "@" à un nom d'utilisateur Instagram si nécessaire
 */
export const formatInstagramUsername = (username: string): string => {
  if (!username) return '';
  
  return username.startsWith('@') ? username : `@${username}`;
};