import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { useServiceRepository } from '../domain/hooks/useServiceRepository';
import { useCategoryRepository } from '../domain/hooks/useCategoryRepository';
import { useServiceStore } from './stores/serviceStore';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { useLocation } from '../utils/hooks/useLocation';
import { useDebounce } from '../utils/hooks/useDebounce';
import { ServiceModel } from '../domain/entities/ServiceModel';
import { CategoryModel } from '../domain/entities/CategoryModel';
import { ROUTES, SEARCH_CRITERIA } from '../utils/constants';

/**
 * ViewModel pour la recherche avancée
 */
export const useSearchViewModel = () => {
  // Repositories
  const serviceRepository = useServiceRepository();
  const categoryRepository = useCategoryRepository();
  
  // Stores
  const { 
    activeFilters, 
    setFilter, 
    resetFilters, 
    toggleFavorite, 
    isFavorite 
  } = useServiceStore();
  
  const { user } = useAuthStore();
  const { showToast, setRefreshing } = useUIStore();
  
  // Hooks
  const locationHook = useLocation();
  
  // État local
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshingLocal] = useState(false);
  const [searchResults, setSearchResults] = useState<ServiceModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Paramètres de recherche
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Filtres locaux (pour les options de filtre avancé)
  const [localFilters, setLocalFilters] = useState({
    category: activeFilters.category || 'all',
    city: activeFilters.city || user?.location?.city || '',
    priceRange: activeFilters.priceRange || { min: 0, max: 1000 },
    dateRange: activeFilters.dateRange,
    radius: activeFilters.radius || 30,
    onlyUrgent: activeFilters.onlyUrgent || false,
    gender: activeFilters.gender || 'all',
    ageRange: activeFilters.ageRange || { min: 18, max: 100 },
    hairColor: activeFilters.hairColor || [],
    eyeColor: activeFilters.eyeColor || []
  });
  
  // Initialiser les catégories
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Détecter les changements dans la recherche
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      performSearch(1, true);
    }
  }, [debouncedSearchQuery]);
  
  /**
   * Récupérer les catégories
   */
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await categoryRepository.getCategories();
      
      // Ajouter la catégorie "Tout" au début
      const allCategories = [
        { id: 'all', name: 'Tout', icon: 'apps-outline', isActive: true },
        ...categoriesData
      ];
      
      setCategories(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      // Catégories par défaut en cas d'erreur
      const defaultCategories = [
        { id: 'all', name: 'Tout', icon: 'apps-outline', isActive: true },
        { id: 'hair', name: 'Coiffure', icon: 'cut-outline', isActive: true },
        { id: 'makeup', name: 'Maquillage', icon: 'color-palette-outline', isActive: true },
        { id: 'photography', name: 'Photo', icon: 'camera-outline', isActive: true },
        { id: 'fashion', name: 'Mode', icon: 'shirt-outline', isActive: true }
      ];
      
      setCategories(defaultCategories);
    }
  }, []);
  
  /**
   * Effectuer une recherche
   */
  const performSearch = useCallback(async (pageNumber = 1, resetResults = false) => {
    setLoading(true);
    
    try {
      let results: ServiceModel[] = [];
      
      if (debouncedSearchQuery.trim()) {
        // Recherche par texte
        const searchResult = await serviceRepository.searchServices(
          debouncedSearchQuery,
          pageNumber,
          10
        );
        
        results = searchResult.services;
        setHasMore(searchResult.hasMore);
      } else {
        // Recherche avec filtres
        const filters: any = {};
        
        if (localFilters.category && localFilters.category !== 'all') {
          filters.type = localFilters.category;
        }
        
        if (localFilters.city) {
          filters.city = localFilters.city;
        }
        
        if (localFilters.onlyUrgent) {
          filters.isUrgent = true;
        }
        
        const servicesResult = await serviceRepository.getServices(
          pageNumber,
          10,
          filters
        );
        
        results = servicesResult.services;
        setHasMore(servicesResult.hasMore);
      }
      
      // Filtrer les résultats côté client pour les filtres avancés
      results = filterResultsLocally(results);
      
      if (resetResults) {
        setSearchResults(results);
      } else {
        // Déduplication des résultats
        const existingIds = new Set(searchResults.map(s => s.id));
        const newResults = results.filter(s => !existingIds.has(s.id));
        
        setSearchResults([...searchResults, ...newResults]);
      }
      
      setTotalResults(results.length);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error performing search:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors de la recherche'
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, localFilters, searchResults]);
  
  /**
   * Filtrer les résultats localement pour les filtres avancés
   * qui ne peuvent pas être appliqués directement via l'API
   */
  const filterResultsLocally = useCallback((results: ServiceModel[]) => {
    return results.filter(service => {
      // Filtre de prix
      if (localFilters.priceRange) {
        const price = service.payment.amount || 0;
        if (price < localFilters.priceRange.min || price > localFilters.priceRange.max) {
          return false;
        }
      }
      
      // Filtre de date
      if (localFilters.dateRange) {
        const serviceDate = service.date.startDate;
        if (serviceDate < localFilters.dateRange.start || serviceDate > localFilters.dateRange.end) {
          return false;
        }
      }
      
      // Filtre de genre
      if (localFilters.gender && localFilters.gender !== 'all') {
        if (service.criteria.gender && service.criteria.gender !== localFilters.gender) {
          return false;
        }
      }
      
      // Filtre d'âge
      if (localFilters.ageRange) {
        const { min, max } = localFilters.ageRange;
        
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
      
      // Filtre de couleur de cheveux
      if (localFilters.hairColor && localFilters.hairColor.length > 0) {
        if (service.criteria.hairColor && service.criteria.hairColor.length > 0) {
          // Vérifier si au moins une couleur correspond
          const hasMatch = localFilters.hairColor.some(color =>
            service.criteria.hairColor?.includes(color)
          );
          
          if (!hasMatch) {
            return false;
          }
        }
      }
      
      // Filtre de couleur des yeux
      if (localFilters.eyeColor && localFilters.eyeColor.length > 0) {
        if (service.criteria.eyeColor && service.criteria.eyeColor.length > 0) {
          // Vérifier si au moins une couleur correspond
          const hasMatch = localFilters.eyeColor.some(color =>
            service.criteria.eyeColor?.includes(color)
          );
          
          if (!hasMatch) {
            return false;
          }
        }
      }
      
      // Filtre de rayon géographique
      if (
        localFilters.radius && 
        service.location.coordinates && 
        user?.location.coordinates
      ) {
        const userLocation = user.location.coordinates;
        const serviceLocation = service.location.coordinates;
        
        // Calculer la distance entre l'utilisateur et le service
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          serviceLocation.latitude,
          serviceLocation.longitude
        );
        
        if (distance > localFilters.radius) {
          return false;
        }
      }
      
      // Tous les filtres ont été passés
      return true;
    });
  }, [localFilters, user]);
  
  /**
   * Calculer la distance entre deux points géographiques
   */
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };
  
  /**
   * Rafraîchir les résultats
   */
  const refreshResults = useCallback(async () => {
    setRefreshingLocal(true);
    setRefreshing(true);
    
    try {
      await performSearch(1, true);
    } catch (error) {
      console.error('Error refreshing results:', error);
    } finally {
      setRefreshingLocal(false);
      setRefreshing(false);
    }
  }, [performSearch]);
  
  /**
   * Charger plus de résultats
   */
  const loadMoreResults = useCallback(async () => {
    if (!hasMore || loading) return;
    
    try {
      await performSearch(page + 1, false);
    } catch (error) {
      console.error('Error loading more results:', error);
    }
  }, [hasMore, loading, page, performSearch]);
  
  /**
   * Mettre à jour la requête de recherche
   */
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  /**
   * Mettre à jour un filtre local
   */
  const updateLocalFilter = useCallback(<K extends keyof typeof localFilters>(
    key: K,
    value: typeof localFilters[K]
  ) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  /**
   * Appliquer les filtres
   */
  const applyFilters = useCallback(() => {
    // Mettre à jour les filtres globaux avec les filtres locaux
    Object.entries(localFilters).forEach(([key, value]) => {
      setFilter(key as any, value);
    });
    
    // Fermer le panneau de filtres
    setFiltersOpen(false);
    
    // Lancer la recherche
    performSearch(1, true);
  }, [localFilters, setFilter]);
  
  /**
   * Réinitialiser les filtres
   */
  const resetAllFilters = useCallback(() => {
    resetFilters();
    
    setLocalFilters({
      category: 'all',
      city: user?.location?.city || '',
      priceRange: { min: 0, max: 1000 },
      dateRange: undefined,
      radius: 30,
      onlyUrgent: false,
      gender: 'all',
      ageRange: { min: 18, max: 100 },
      hairColor: [],
      eyeColor: []
    });
    
    setSearchQuery('');
    performSearch(1, true);
  }, [user, resetFilters]);
  
  /**
   * Ouvrir le détail d'un service
   */
  const openServiceDetails = useCallback((serviceId: string) => {
    router.push(ROUTES.SERVICE_DETAILS(serviceId));
  }, []);
  
  /**
   * Basculer un service en favori
   */
  const toggleFavoriteService = useCallback((serviceId: string) => {
    toggleFavorite(serviceId);
  }, [toggleFavorite]);
  
  /**
   * Détecter la localisation actuelle
   */
  const detectCurrentLocation = useCallback(async () => {
    const location = await locationHook.requestLocation();
    
    if (location) {
      updateLocalFilter('city', location.city || localFilters.city);
    }
  }, [localFilters.city]);
  
  return {
    // État
    loading,
    refreshing,
    searchResults,
    categories,
    totalResults,
    hasMore,
    filtersOpen,
    searchQuery,
    localFilters,
    
    // Valeurs de référence
    genderOptions: SEARCH_CRITERIA.gender,
    ageRangeOptions: SEARCH_CRITERIA.ageRanges,
    hairColorOptions: SEARCH_CRITERIA.hairColors,
    eyeColorOptions: SEARCH_CRITERIA.eyeColors,
    radiusOptions: SEARCH_CRITERIA.radiusOptions,
    
    // Location
    ...locationHook,
    
    // Actions
    setFiltersOpen,
    updateSearchQuery,
    updateLocalFilter,
    refreshResults,
    loadMoreResults,
    applyFilters,
    resetAllFilters,
    openServiceDetails,
    toggleFavoriteService,
    isFavorite,
    detectCurrentLocation
  };
};