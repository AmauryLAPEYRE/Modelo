import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';
// import { useServiceRepository } from '../domain/hooks/useServiceRepository';
// import { useUserRepository } from '../domain/hooks/useUserRepository';
import { useApplicationRepository } from '../domain/hooks/useApplicationRepository';
import { useRatingRepository } from '../domain/hooks/useRatingRepository';
import { useServiceStore } from './stores/serviceStore';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { ServiceModel, ServiceStatus } from '../domain/entities/ServiceModel';
import { UserModel, UserRole } from '../domain/entities/UserModel';
import { ApplicationModel, ApplicationStatus } from '../domain/entities/ApplicationModel';
import { RatingModel } from '../domain/entities/RatingModel';
import { ROUTES } from '../utils/constants';

/**
 * ViewModel pour la page de détail d'une prestation
 */
export const useServiceDetailViewModel = (serviceId: string) => {
  // Repositories
  const serviceRepository = useServiceRepository();
  const userRepository = useUserRepository();
  const applicationRepository = useApplicationRepository();
  const ratingRepository = useRatingRepository();
  
  // Stores
  const { getServiceById, updateService: updateServiceInStore, toggleFavorite, isFavorite } = useServiceStore();
  const { user: currentUser } = useAuthStore();
  const { showToast, setRefreshing } = useUIStore();
  
  // État local
  const [service, setService] = useState<ServiceModel | null>(null);
  const [professional, setProfessional] = useState<UserModel | null>(null);
  const [applications, setApplications] = useState<ApplicationModel[]>([]);
  const [userApplication, setUserApplication] = useState<ApplicationModel | null>(null);
  const [ratings, setRatings] = useState<RatingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshingLocal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Valeurs dérivées
  const isOwner = service?.professionalId === currentUser?.id;
  const isModel = currentUser?.role === UserRole.MODEL;
  const isProfessional = currentUser?.role === UserRole.PROFESSIONAL;
  const canApply = isModel && !isOwner && service?.status === ServiceStatus.ACTIVE;
  const hasApplied = !!userApplication;
  const canEdit = isOwner && service?.status !== ServiceStatus.COMPLETED;
  const canDelete = isOwner && service?.status !== ServiceStatus.COMPLETED;
  const serviceIsFavorite = service ? isFavorite(service.id) : false;
  
  // Initialisation
  useEffect(() => {
    fetchServiceDetails();
  }, [serviceId]);
  
  /**
   * Récupérer les détails de la prestation
   */
  const fetchServiceDetails = useCallback(async () => {
    setLoading(true);
    
    try {
      // Vérifier si le service est déjà en cache
      const cachedService = getServiceById(serviceId);
      
      // Récupérer le service depuis l'API
      let serviceData: ServiceModel | null;
      
      if (cachedService) {
        serviceData = cachedService;
        setService(cachedService);
        
        // Quand même récupérer les données à jour en arrière-plan
        serviceRepository.getServiceById(serviceId).then((freshService) => {
          if (freshService) {
            setService(freshService);
            updateServiceInStore(serviceId, freshService);
          }
        });
      } else {
        serviceData = await serviceRepository.getServiceById(serviceId);
        
        if (serviceData) {
          setService(serviceData);
          updateServiceInStore(serviceId, serviceData);
        } else {
          showToast({
            type: 'error',
            message: 'Prestation introuvable'
          });
          
          router.back();
          return;
        }
      }
      
      // Récupérer les données du professionnel
      if (serviceData) {
        await Promise.all([
          fetchProfessional(serviceData.professionalId),
          fetchApplications(serviceData.id),
          fetchRatings(serviceData.id)
        ]);
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors du chargement des détails'
      });
    } finally {
      setLoading(false);
    }
  }, [serviceId]);
  
  /**
   * Récupérer les données du professionnel
   */
  const fetchProfessional = useCallback(async (professionalId: string) => {
    try {
      const professionalData = await userRepository.getUserById(professionalId);
      setProfessional(professionalData);
    } catch (error) {
      console.error('Error fetching professional:', error);
    }
  }, []);
  
  /**
   * Récupérer les candidatures pour cette prestation
   */
  const fetchApplications = useCallback(async (serviceId: string) => {
    try {
      // Récupérer toutes les candidatures pour cette prestation
      const result = await applicationRepository.getApplicationsForService(serviceId);
      setApplications(result.applications);
      
      // Vérifier si l'utilisateur actuel a déjà postulé
      if (currentUser && currentUser.role === UserRole.MODEL) {
        const userApp = result.applications.find(app => app.modelId === currentUser.id);
        setUserApplication(userApp || null);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, [currentUser]);
  
  /**
   * Récupérer les évaluations pour cette prestation
   */
  const fetchRatings = useCallback(async (serviceId: string) => {
    try {
      const result = await ratingRepository.getServiceRatings(serviceId);
      setRatings(result.ratings);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  }, []);
  
  /**
   * Rafraîchir les données
   */
  const refreshData = useCallback(async () => {
    setRefreshingLocal(true);
    setRefreshing(true);
    
    try {
      await fetchServiceDetails();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshingLocal(false);
      setRefreshing(false);
    }
  }, []);
  
  /**
   * Supprimer la prestation
   */
  const deleteService = useCallback(async () => {
    if (!service || !isOwner) return;
    
    // Demander confirmation
    Alert.alert(
      'Supprimer la prestation',
      'Êtes-vous sûr de vouloir supprimer cette prestation ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            
            try {
              await serviceRepository.deleteService(service.id);
              
              showToast({
                type: 'success',
                message: 'Prestation supprimée'
              });
              
              router.back();
            } catch (error) {
              console.error('Error deleting service:', error);
              showToast({
                type: 'error',
                message: 'Erreur lors de la suppression'
              });
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  }, [service, isOwner]);
  
  /**
   * Mettre à jour le statut de la prestation
   */
  const updateServiceStatus = useCallback(async (status: ServiceStatus) => {
    if (!service || !isOwner) return;
    
    setUpdating(true);
    
    try {
      await serviceRepository.updateServiceStatus(service.id, status);
      
      // Mettre à jour le service localement
      const updatedService = { ...service, status };
      setService(updatedService);
      updateServiceInStore(service.id, { status });
      
      showToast({
        type: 'success',
        message: 'Statut mis à jour'
      });
    } catch (error) {
      console.error('Error updating service status:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors de la mise à jour du statut'
      });
    } finally {
      setUpdating(false);
    }
  }, [service, isOwner]);
  
  /**
   * Naviguer vers l'écran de modification de la prestation
   */
  const navigateToEditService = useCallback(() => {
    if (!service || !isOwner) return;
    
    router.push({
      pathname: ROUTES.SERVICE_CREATE,
      params: { serviceId: service.id }
    });
  }, [service, isOwner]);
  
  /**
   * Naviguer vers l'écran de création de candidature
   */
  const navigateToCreateApplication = useCallback(() => {
    if (!service || !canApply) return;
    
    router.push(ROUTES.APPLICATION_CREATE(service.id));
  }, [service, canApply]);
  
  /**
   * Naviguer vers le profil du professionnel
   */
  const navigateToProfessionalProfile = useCallback(() => {
    if (!professional) return;
    
    router.push({
      pathname: ROUTES.PROFILE,
      params: { userId: professional.id }
    });
  }, [professional]);
  
  /**
   * Naviguer vers le détail d'une candidature
   */
  const navigateToApplicationDetail = useCallback((applicationId: string) => {
    router.push(ROUTES.APPLICATION_DETAILS(applicationId));
  }, []);
  
  /**
   * Basculer le statut de favori pour cette prestation
   */
  const toggleFavoriteService = useCallback(() => {
    if (!service) return;
    
    toggleFavorite(service.id);
  }, [service]);
  
  /**
   * Partager la prestation
   */
  const shareService = useCallback(() => {
    if (!service) return;
    
    // Ouvrir la feuille de partage
    // Cette fonctionnalité sera implémentée ultérieurement
    
    showToast({
      type: 'info',
      message: 'Partage non disponible pour le moment'
    });
  }, [service]);
  
  return {
    // État
    service,
    professional,
    applications,
    userApplication,
    ratings,
    loading,
    refreshing,
    deleting,
    updating,
    
    // Valeurs dérivées
    isOwner,
    isModel,
    isProfessional,
    canApply,
    hasApplied,
    canEdit,
    canDelete,
    serviceIsFavorite,
    
    // Actions
    refreshData,
    deleteService,
    updateServiceStatus,
    navigateToEditService,
    navigateToCreateApplication,
    navigateToProfessionalProfile,
    navigateToApplicationDetail,
    toggleFavoriteService,
    shareService
  };
};