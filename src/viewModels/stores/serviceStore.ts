import { create } from 'zustand';
import { ServiceModel, ServiceType } from '../../domain/entities/ServiceModel';
import { calculateDistance } from '../../utils/helpers';

interface ServiceFilters {
  category?: ServiceType | 'all';
  searchQuery?: string;
  city?: string;
  priceRange?: { min: number; max: number };
  dateRange?: { start: Date; end: Date };
  radius?: number;
  onlyUrgent?: boolean;
  gender?: string;
  ageRange?: { min: number; max: number };
  hairColor?: string[];
  eyeColor?: string[];
}

interface ServiceState {
  // État
  recentServices: ServiceModel[];
  favoriteServiceIds: string[];
  activeFilters: ServiceFilters;
  
  // Actions
  setRecentServices: (services: ServiceModel[]) => void;
  addRecentService: (service: ServiceModel) => void;
  updateService: (serviceId: string, updatedService: Partial<ServiceModel>) => void;
  removeService: (serviceId: string) => void;
  
  toggleFavorite: (serviceId: string) => void;
  isFavorite: (serviceId: string) => boolean;
  
  setFilter: <K extends keyof ServiceFilters>(
    key: K, 
    value: ServiceFilters[K]
  ) => void;
  resetFilters: () => void;
  
  // Getters
  getFilteredServices: () => ServiceModel[];
  getServiceById: (serviceId: string) => ServiceModel | undefined;
  getFavoriteServices: () => ServiceModel[];
}

/**
 * Store Zustand pour gérer les prestations
 */
export const useServiceStore = create<ServiceState>((set, get) => ({
  // État initial
  recentServices: [],
  favoriteServiceIds: [],
  activeFilters: {
    category: 'all',
    searchQuery: '',
    radius: 30 // 30km par défaut
  },
  
  // Actions
  setRecentServices: (services: ServiceModel[]) => set({ recentServices: services }),
  
  addRecentService: (service: ServiceModel) => set(state => ({
    recentServices: [service, ...state.recentServices]
  })),
  
  updateService: (serviceId: string, updatedService: Partial<ServiceModel>) => set(state => ({
    recentServices: state.recentServices.map(service => 
      service.id === serviceId 
        ? { ...service, ...updatedService } 
        : service
    )
  })),
  
  removeService: (serviceId: string) => set(state => ({
    recentServices: state.recentServices.filter(service => service.id !== serviceId)
  })),
  
  toggleFavorite: (serviceId: string) => set(state => {
    // Vérifier si le service est déjà en favori
    const isFavorite = state.favoriteServiceIds.includes(serviceId);
    
    // Ajouter ou retirer des favoris
    if (isFavorite) {
      return {
        favoriteServiceIds: state.favoriteServiceIds.filter(id => id !== serviceId)
      };
    } else {
      return {
        favoriteServiceIds: [...state.favoriteServiceIds, serviceId]
      };
    }
  }),
  
  isFavorite: (serviceId: string) => {
    return get().favoriteServiceIds.includes(serviceId);
  },
  
  setFilter: (key, value) => set(state => ({
    activeFilters: { ...state.activeFilters, [key]: value }
  })),
  
  resetFilters: () => set({
    activeFilters: {
      category: 'all',
      searchQuery: '',
      radius: 30
    }
  }),
  
  // Getter pour les services filtrés
  getFilteredServices: () => {
    const { recentServices, activeFilters } = get();
    
    return recentServices.filter(service => {
      // Filtrer par catégorie
      if (activeFilters.category && activeFilters.category !== 'all') {
        // Vérifier si le type est un tableau ou une valeur unique
        const serviceTypes = Array.isArray(service.type) 
          ? service.type 
          : [service.type];
          
        if (!serviceTypes.includes(activeFilters.category)) {
          return false;
        }
      }
      
      // Filtrer par recherche textuelle
      if (activeFilters.searchQuery) {
        const query = activeFilters.searchQuery.toLowerCase();
        const titleMatch = service.title.toLowerCase().includes(query);
        const descMatch = service.description.toLowerCase().includes(query);
        const cityMatch = service.location.city.toLowerCase().includes(query);
        
        if (!titleMatch && !descMatch && !cityMatch) {
          return false;
        }
      }
      
      // Filtrer par ville
      if (activeFilters.city && service.location.city.toLowerCase() !== activeFilters.city.toLowerCase()) {
        return false;
      }
      
      // Filtrer par plage de prix
      if (activeFilters.priceRange) {
        const price = service.payment.amount || 0;
        if (price < activeFilters.priceRange.min || price > activeFilters.priceRange.max) {
          return false;
        }
      }
      
      // Filtrer par plage de dates
      if (activeFilters.dateRange) {
        const serviceDate = service.date.startDate;
        if (serviceDate < activeFilters.dateRange.start || serviceDate > activeFilters.dateRange.end) {
          return false;
        }
      }
      
      // Filtrer par urgence
      if (activeFilters.onlyUrgent && !service.isUrgent) {
        return false;
      }
      
      // Filtrer par genre
      if (activeFilters.gender && service.criteria.gender !== activeFilters.gender && service.criteria.gender !== undefined) {
        return false;
      }
      
      // Filtrer par plage d'âge
      if (activeFilters.ageRange) {
        const { min, max } = activeFilters.ageRange;
        
        // Si le service a des critères d'âge min et max
        if (service.criteria.ageMin && service.criteria.ageMax) {
          // Vérifier si les plages se chevauchent
          if (min > service.criteria.ageMax || max < service.criteria.ageMin) {
            return false;
          }
        }
        // Si le service a seulement un critère d'âge min
        else if (service.criteria.ageMin && min < service.criteria.ageMin) {
          return false;
        }
        // Si le service a seulement un critère d'âge max
        else if (service.criteria.ageMax && max > service.criteria.ageMax) {
          return false;
        }
      }
      
      // Filtrer par couleur de cheveux
      if (activeFilters.hairColor && activeFilters.hairColor.length > 0 && service.criteria.hairColor) {
        // Vérifier si au moins une couleur correspond
        const hasMatch = activeFilters.hairColor.some(color => 
          service.criteria.hairColor?.includes(color)
        );
        
        if (!hasMatch) {
          return false;
        }
      }
      
      // Filtrer par couleur des yeux
      if (activeFilters.eyeColor && activeFilters.eyeColor.length > 0 && service.criteria.eyeColor) {
        // Vérifier si au moins une couleur correspond
        const hasMatch = activeFilters.eyeColor.some(color => 
          service.criteria.eyeColor?.includes(color)
        );
        
        if (!hasMatch) {
          return false;
        }
      }
      
      // Filtrer par rayon géographique
      if (
        activeFilters.radius && 
        service.location.coordinates && 
        get().user?.location.coordinates
      ) {
        const userLocation = get().user?.location.coordinates;
        const serviceLocation = service.location.coordinates;
        
        // Calculer la distance entre l'utilisateur et le service
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          serviceLocation.latitude,
          serviceLocation.longitude
        );
        
        if (distance > activeFilters.radius) {
          return false;
        }
      }
      
      // Tous les filtres ont été passés
      return true;
    });
  },
  
  // Getter pour un service par ID
  getServiceById: (serviceId: string) => {
    return get().recentServices.find(service => service.id === serviceId);
  },
  
  // Getter pour les services favoris
  getFavoriteServices: () => {
    const { recentServices, favoriteServiceIds } = get();
    return recentServices.filter(service => favoriteServiceIds.includes(service.id));
  },
  
  // Propriété calculée pour l'utilisateur courant (depuis authStore)
  get user() {
    // L'import est à l'intérieur de la fonction pour éviter les références circulaires
    const { useAuthStore } = require('./authStore');
    return useAuthStore.getState().user;
  }
}));