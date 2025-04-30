import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';
// import { useServiceRepository } from '../domain/hooks/useServiceRepository';
import { useCategoryRepository } from '../domain/hooks/useCategoryRepository';
// import { useFeaturedRepository } from '../domain/hooks/useFeaturedRepository';
import { useServiceStore } from './stores/serviceStore';
import { ServiceModel } from '../domain/entities/ServiceModel';
import { CategoryModel } from '../domain/entities/CategoryModel';
import { FeaturedBannerModel } from '../domain/entities/FeaturedBannerModel';
// import { useDebounce } from '../utils/hooks/useDebounce';
import { useUIStore } from './stores/uiStore';
import { useAuthStore } from './stores/authStore';
import { ROUTES } from '../utils/constants';

/**
 * ViewModel pour l'écran d'accueil
 */
export const useHomeViewModel = () => {
  // Repositories
  const serviceRepository = useServiceRepository();
  const categoryRepository = useCategoryRepository();
  const featuredRepository = useFeaturedRepository();
  
  // Stores
  const { 
    recentServices, 
    setRecentServices, 
    activeFilters, 
    setFilter, 
    resetFilters,
    getFilteredServices,
    toggleFavorite,
    isFavorite
  } = useServiceStore();
  
  const { setRefreshing } = useUIStore();
  const { user } = useAuthStore();
  
  // État local
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshingLocal] = useState(false);
  const [featuredBanner, setFeaturedBanner] = useState<FeaturedBannerModel | null>(null);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // Valeurs dérivées
  const selectedCategory = activeFilters.category || 'all';
  const searchQuery = activeFilters.searchQuery || '';
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const services = getFilteredServices();
  
  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
  }, []);
  
  // Effectuer la recherche lorsque la requête de recherche change
  useEffect(() => {
    if (debouncedSearchQuery !== activeFilters.searchQuery) {
      setFilter('searchQuery', debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);
  
  /**
   * Charger les données initiales
   */
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // Exécuter les requêtes en parallèle pour améliorer les performances
      const [categoriesResult, bannerResult] = await Promise.all([
        fetchCategories(),
        fetchFeaturedBanner(),
      ]);
      
      // Seulement après avoir les catégories et la bannière, charger les services
      await fetchServices(1, true);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les données. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Récupérer les catégories
   */
  const fetchCategories = useCallback(async () => {
    try {
      const categories = await categoryRepository.getCategories();
      
      // Ajouter la catégorie "Tout" au début
      const allCategories = [
        { id: 'all', name: 'Tout', icon: 'apps-outline', isActive: true },
        ...categories,
      ];
      
      setCategories(allCategories);
      return allCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      // Catégories par défaut en cas d'erreur
      const defaultCategories = [
        { id: 'all', name: 'Tout', icon: 'apps-outline', isActive: true },
        { id: 'hair', name: 'Coiffure', icon: 'cut-outline', isActive: true },
        { id: 'makeup', name: 'Maquillage', icon: 'color-palette-outline', isActive: true },
        { id: 'photography', name: 'Photo', icon: 'camera-outline', isActive: true },
        { id: 'fashion', name: 'Mode', icon: 'shirt-outline', isActive: true },
      ];
      
      setCategories(defaultCategories);
      return defaultCategories;
    }
  }, []);
  
  /**
   * Récupérer la bannière mise en avant
   */
  const fetchFeaturedBanner = useCallback(async () => {
    try {
      const banner = await featuredRepository.getFeaturedBanner();
      setFeaturedBanner(banner);
      return banner;
    } catch (error) {
      console.error('Error fetching featured banner:', error);
      setFeaturedBanner(null);
      return null;
    }
  }, []);
  
  /**
   * Récupérer les services paginés
   */
  const fetchServices = useCallback(async (pageNumber = 1, resetList = false) => {
    try {
      // Récupérer les services filtrés par catégorie
      const filter = selectedCategory !== 'all' ? { type: selectedCategory } : undefined;
      
      const result = await serviceRepository.getServices(
        pageNumber,
        10,
        filter
      );
      
      if (result.services.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      if (resetList) {
        setRecentServices(result.services);
      } else {
        // Déduplication des services
        const existingIds = new Set(recentServices.map(s => s.id));
        const newServices = result.services.filter(s => !existingIds.has(s.id));
        
        setRecentServices([...recentServices, ...newServices]);
      }
      
      setPage(pageNumber);
      return result.services;
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }, [selectedCategory, recentServices]);
  
  /**
   * Charger plus de services (pagination)
   */
  const loadMoreServices = useCallback(async () => {
    if (!hasMore || loading) return;
    
    try {
      await fetchServices(page + 1);
    } catch (error) {
      console.error('Error loading more services:', error);
    }
  }, [page, hasMore, loading, fetchServices]);
  
  /**
   * Rafraîchir les données
   */
  const refreshData = useCallback(async () => {
    setRefreshingLocal(true);
    setRefreshing(true);
    
    try {
      resetFilters();
      await loadInitialData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshingLocal(false);
      setRefreshing(false);
    }
  }, []);
  
  /**
   * Sélectionner une catégorie
   */
  const selectCategory = useCallback((categoryId: string) => {
    setFilter('category', categoryId);
    fetchServices(1, true);
  }, []);
  
  /**
   * Rechercher des services
   */
  const searchServices = useCallback((query: string) => {
    setFilter('searchQuery', query);
  }, []);
  
  /**
   * Ouvrir le détail d'un service
   */
  const openServiceDetails = useCallback((serviceId: string) => {
    router.push(ROUTES.SERVICE_DETAILS(serviceId));
  }, []);
  
  /**
   * Ouvrir la page de création de service
   */
  const openCreateService = useCallback(() => {
    router.push(ROUTES.SERVICE_CREATE);
  }, []);
  
  /**
   * Mettre un service en favori ou le retirer
   */
  const toggleFavoriteService = useCallback((serviceId: string) => {
    toggleFavorite(serviceId);
  }, []);
  
  return {
    // État
    loading,
    refreshing,
    services,
    categories,
    featuredBanner,
    selectedCategory,
    searchQuery,
    hasMore,
    
    // Actions
    refreshData,
    loadMoreServices,
    selectCategory,
    searchServices,
    openServiceDetails,
    openCreateService,
    toggleFavoriteService,
    isFavorite
  };
};