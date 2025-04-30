// Couleurs de l'application
export const COLORS = {
    primary: '#FF5A5F', // Rouge corail
    secondary: '#00A699', // Turquoise
    tertiary: '#FC642D', // Orange
    black: '#222222', // Noir
    white: '#FFFFFF', // Blanc
    gray: '#767676', // Gris
    lightGray: '#F7F7F7', // Gris clair
    border: '#DDDDDD', // Bordure
    success: '#4CAF50', // Vert succès
    warning: '#FFCA28', // Jaune avertissement
    error: '#F44336', // Rouge erreur
    info: '#2196F3', // Bleu info
    background: '#F9F9F9', // Fond d'écran
    card: '#FFFFFF', // Carte
    shadow: 'rgba(0, 0, 0, 0.1)' // Ombre
  };
  
  // Typographie
  export const FONTS = {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
    italic: 'Roboto-Italic'
  };
  
  // Tailles de texte
  export const FONT_SIZES = {
    xs: 10,
    small: 12,
    medium: 14,
    regular: 16,
    large: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32
  };
  
  // Tailles d'espacement
  export const SPACING = {
    xs: 4,
    small: 8,
    medium: 12,
    regular: 16,
    large: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40
  };
  
  // Tailles d'icônes
  export const ICON_SIZES = {
    small: 16,
    medium: 24,
    large: 32,
    xl: 40
  };
  
  // Tailles d'input
  export const INPUT_HEIGHTS = {
    small: 40,
    regular: 48,
    large: 56
  };
  
  // Rayons de bord
  export const BORDER_RADIUS = {
    small: 4,
    regular: 8,
    large: 12,
    xl: 16,
    round: 999
  };
  
  // Durées d'animation
  export const ANIMATION_DURATIONS = {
    short: 200,
    medium: 300,
    long: 500
  };
  
  // Configuration de l'application
  export const APP_CONFIG = {
    maxImagesPerService: 5,
    maxImagesPerProfile: 6,
    maxApplicationImages: 3,
    defaultSearchRadius: 30, // km
    serviceExpirationDays: 30,
    applicationExpirationDays: 7,
    maxMessageLength: 1000,
    defaultPageSize: 10,
    maxPageSize: 50,
    maxFileSize: 5 * 1024 * 1024 // 5 MB
  };
  
  // Types de prestations
  export const SERVICE_TYPES = [
    { id: 'all', name: 'Tout', icon: 'apps-outline' },
    { id: 'hair', name: 'Coiffure', icon: 'cut-outline' },
    { id: 'makeup', name: 'Maquillage', icon: 'color-palette-outline' },
    { id: 'photography', name: 'Photographie', icon: 'camera-outline' },
    { id: 'fashion', name: 'Mode', icon: 'shirt-outline' },
    { id: 'nails', name: 'Ongles', icon: 'hand-left-outline' },
    { id: 'aesthetic', name: 'Esthétique', icon: 'flower-outline' },
    { id: 'other', name: 'Autre', icon: 'ellipsis-horizontal-outline' }
  ];
  
  // Critères de recherche
  export const SEARCH_CRITERIA = {
    gender: [
      { id: 'all', name: 'Tous genres' },
      { id: 'male', name: 'Homme' },
      { id: 'female', name: 'Femme' },
      { id: 'other', name: 'Autre' }
    ],
    ageRanges: [
      { id: '18-25', name: '18-25 ans', min: 18, max: 25 },
      { id: '26-35', name: '26-35 ans', min: 26, max: 35 },
      { id: '36-45', name: '36-45 ans', min: 36, max: 45 },
      { id: '46+', name: '46+ ans', min: 46, max: 100 }
    ],
    hairColors: [
      { id: 'all', name: 'Toutes couleurs' },
      { id: 'black', name: 'Noir' },
      { id: 'brown', name: 'Brun' },
      { id: 'blonde', name: 'Blond' },
      { id: 'red', name: 'Roux' },
      { id: 'white', name: 'Blanc' },
      { id: 'gray', name: 'Gris' },
      { id: 'other', name: 'Autre' }
    ],
    eyeColors: [
      { id: 'all', name: 'Toutes couleurs' },
      { id: 'brown', name: 'Brun' },
      { id: 'blue', name: 'Bleu' },
      { id: 'green', name: 'Vert' },
      { id: 'gray', name: 'Gris' },
      { id: 'hazel', name: 'Noisette' },
      { id: 'other', name: 'Autre' }
    ],
    radiusOptions: [
      { id: '5', name: '5 km', value: 5 },
      { id: '10', name: '10 km', value: 10 },
      { id: '20', name: '20 km', value: 20 },
      { id: '30', name: '30 km', value: 30 },
      { id: '50', name: '50 km', value: 50 },
      { id: '100', name: '100 km', value: 100 }
    ]
  };
  
  // Routes de l'application
  export const ROUTES = {
    // Routes publiques
    LOGIN: '/login',
    REGISTER: '/register',
    ONBOARDING: '/onboarding',
    
    // Routes authentifiées
    HOME: '/',
    SEARCH: '/home/search',
    NOTIFICATIONS: '/home/notifications',
    
    PROFILE: '/profile',
    PROFILE_EDIT: '/profile/edit',
    PROFILE_SETTINGS: '/profile/settings',
    
    SERVICES: '/services',
    SERVICE_DETAILS: (id: string) => `/services/${id}`,
    SERVICE_CREATE: '/services/create',
    
    APPLICATIONS: '/applications',
    APPLICATION_DETAILS: (id: string) => `/applications/${id}`,
    APPLICATION_CREATE: (serviceId: string) => `/applications/create?serviceId=${serviceId}`,
    
    MESSAGES: '/messages',
    CONVERSATION: (id: string) => `/messages/${id}`
  };