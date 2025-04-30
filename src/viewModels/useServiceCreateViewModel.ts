import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { useServiceRepository } from '../domain/hooks/useServiceRepository';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { useServiceStore } from './stores/serviceStore';
import { useMedia } from '../utils/hooks/useMedia';
import { useLocation } from '../utils/hooks/useLocation';
import { 
  ServiceModel, 
  ServiceStatus, 
  ServiceType, 
  PaymentType 
} from '../domain/entities/ServiceModel';
import { ROUTES } from '../utils/constants';

/**
 * ViewModel pour la création/édition d'une prestation
 */
export const useServiceCreateViewModel = (serviceId?: string) => {
  // Repositories
  const serviceRepository = useServiceRepository();
  
  // Stores
  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  const { addRecentService, updateService: updateServiceInStore } = useServiceStore();
  
  // Hooks
  const mediaHook = useMedia({
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    allowsMultipleSelection: true
  });
  
  const locationHook = useLocation();
  
  // État local
  const [service, setService] = useState<ServiceModel | null>(null);
  const [loading, setLoading] = useState(serviceId ? true : false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(!!serviceId);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: [] as ServiceType[],
    location: {
      city: user?.location?.city || '',
      address: '',
      isRemote: false
    },
    date: {
      startDate: new Date(),
      endDate: undefined as Date | undefined,
      duration: 60, // minutes
      isFlexible: false
    },
    payment: {
      type: PaymentType.FREE,
      amount: 0,
      details: ''
    },
    criteria: {
      gender: undefined as string | undefined,
      ageMin: undefined as number | undefined,
      ageMax: undefined as number | undefined,
      hairColor: [] as string[],
      eyeColor: [] as string[],
      experience: false,
      specificRequirements: ''
    },
    isUrgent: false
  });
  
  // Initialisation
  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails(serviceId);
    } else if (user?.location?.coordinates) {
      // Pré-remplir les coordonnées si disponibles
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          city: user.location.city || '',
          coordinates: user.location.coordinates
        }
      }));
    }
  }, [serviceId, user]);
  
  /**
   * Récupérer les détails d'une prestation pour l'édition
   */
  const fetchServiceDetails = useCallback(async (id: string) => {
    setLoading(true);
    
    try {
      const serviceData = await serviceRepository.getServiceById(id);
      
      if (serviceData) {
        setService(serviceData);
        
        // Vérifier si l'utilisateur est le propriétaire
        if (serviceData.professionalId !== user?.id) {
          showToast({
            type: 'error',
            message: 'Vous n\'êtes pas autorisé à modifier cette prestation'
          });
          
          router.back();
          return;
        }
        
        // Pré-remplir le formulaire avec les données de la prestation
        setFormData({
          title: serviceData.title,
          description: serviceData.description,
          type: Array.isArray(serviceData.type) ? serviceData.type : [serviceData.type],
          location: {
            city: serviceData.location.city,
            address: serviceData.location.address || '',
            isRemote: serviceData.location.isRemote || false,
            coordinates: serviceData.location.coordinates
          },
          date: {
            startDate: serviceData.date.startDate,
            endDate: serviceData.date.endDate,
            duration: serviceData.date.duration || 60,
            isFlexible: serviceData.date.isFlexible || false
          },
          payment: {
            type: serviceData.payment.type,
            amount: serviceData.payment.amount || 0,
            details: serviceData.payment.details || ''
          },
          criteria: {
            gender: serviceData.criteria.gender,
            ageMin: serviceData.criteria.ageMin,
            ageMax: serviceData.criteria.ageMax,
            hairColor: serviceData.criteria.hairColor || [],
            eyeColor: serviceData.criteria.eyeColor || [],
            experience: serviceData.criteria.experience || false,
            specificRequirements: serviceData.criteria.specificRequirements || ''
          },
          isUrgent: serviceData.isUrgent
        });
        
        // Ajouter les images au gestionnaire de média
        if (serviceData.images && serviceData.images.length > 0) {
          // Convertir les URLs en objets ImageAsset (approximativement, car nous n'avons pas les dimensions réelles)
          const assets = serviceData.images.map(url => ({
            uri: url,
            width: 800,
            height: 600,
            type: 'image/jpeg'
          }));
          
          // Réinitialiser les médias et définir les nouvelles images
          mediaHook.clearMedia();
          assets.forEach(asset => mediaHook.media.push(asset));
        }
      } else {
        showToast({
          type: 'error',
          message: 'Prestation introuvable'
        });
        
        router.back();
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors du chargement des détails'
      });
      
      router.back();
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  /**
   * Mettre à jour les valeurs du formulaire
   */
  const updateFormValue = useCallback(<K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  /**
   * Mettre à jour les valeurs imbriquées du formulaire
   */
  const updateNestedFormValue = useCallback(<
    K extends keyof typeof formData,
    NK extends keyof typeof formData[K]
  >(
    parent: K,
    field: NK,
    value: typeof formData[K][NK]
  ) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  }, []);
  
  /**
   * Récupérer la localisation
   */
  const getLocation = useCallback(async () => {
    const location = await locationHook.requestLocation();
    
    if (location) {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          city: location.city || prev.location.city,
          coordinates: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }
      }));
    }
  }, []);
  
  /**
   * Créer ou mettre à jour une prestation
   */
  const saveService = useCallback(async (isDraft: boolean = false) => {
    if (!user) return;
    
    // Validation de base
    if (!formData.title.trim()) {
      showToast({
        type: 'error',
        message: 'Le titre est requis'
      });
      return;
    }
    
    if (!formData.description.trim()) {
      showToast({
        type: 'error',
        message: 'La description est requise'
      });
      return;
    }
    
    if (formData.type.length === 0) {
      showToast({
        type: 'error',
        message: 'Au moins un type de prestation est requis'
      });
      return;
    }
    
    if (!formData.location.city.trim()) {
      showToast({
        type: 'error',
        message: 'La ville est requise'
      });
      return;
    }
    
    if (formData.payment.type === PaymentType.PAID && (!formData.payment.amount || formData.payment.amount <= 0)) {
      showToast({
        type: 'error',
        message: 'Un montant valide est requis pour une prestation payante'
      });
      return;
    }
    
    setSaving(true);
    
    try {
      // Préparer les images pour le téléchargement
      let imageUrls: string[] = [];
      
      // Si nous avons des médias à télécharger
      if (mediaHook.media.length > 0) {
        // Pour l'édition, conservez les URLs existantes
        if (isEditing && service) {
          // Filtrer les URLs des images qui sont déjà sur le serveur
          const existingUrls = service.images.filter(url => 
            mediaHook.media.some(asset => asset.uri === url)
          );
          
          // Filtrer les nouveaux assets qui doivent être téléchargés
          const newAssets = mediaHook.media.filter(asset => 
            !service.images.includes(asset.uri)
          );
          
          // Si nous avons de nouveaux assets, les télécharger
          if (newAssets.length > 0) {
            const blobs = await mediaHook.assetsToBlobs(newAssets);
            const newUrls = await serviceRepository.uploadServiceImages(
              serviceId || 'temp',
              blobs
            );
            
            // Combiner les URLs existantes et nouvelles
            imageUrls = [...existingUrls, ...newUrls];
          } else {
            // Sinon, utiliser uniquement les URLs existantes
            imageUrls = existingUrls;
          }
        } else {
          // Pour une nouvelle prestation, télécharger toutes les images
          const blobs = await mediaHook.assetsToBlobs();
          
          // Créer un ID temporaire pour les téléchargements
          const tempId = serviceId || `temp-${Date.now()}`;
          
          imageUrls = await serviceRepository.uploadServiceImages(tempId, blobs);
        }
      }
      
      // Préparer les données de la prestation
      const serviceData: Omit<ServiceModel, 'id' | 'createdAt' | 'updatedAt'> = {
        professionalId: user.id,
        title: formData.title,
        description: formData.description,
        type: formData.type.length === 1 ? formData.type[0] : formData.type,
        status: isDraft ? ServiceStatus.DRAFT : ServiceStatus.ACTIVE,
        date: {
          startDate: formData.date.startDate,
          endDate: formData.date.endDate,
          duration: formData.date.duration,
          isFlexible: formData.date.isFlexible
        },
        location: {
          city: formData.location.city,
          address: formData.location.address,
          coordinates: formData.location.coordinates,
          isRemote: formData.location.isRemote
        },
        criteria: {
          gender: formData.criteria.gender,
          ageMin: formData.criteria.ageMin,
          ageMax: formData.criteria.ageMax,
          hairColor: formData.criteria.hairColor.length > 0 ? formData.criteria.hairColor : undefined,
          eyeColor: formData.criteria.eyeColor.length > 0 ? formData.criteria.eyeColor : undefined,
          experience: formData.criteria.experience,
          specificRequirements: formData.criteria.specificRequirements
        },
        payment: {
          type: formData.payment.type,
          amount: formData.payment.type === PaymentType.PAID ? formData.payment.amount : undefined,
          details: formData.payment.details
        },
        images: imageUrls,
        isUrgent: formData.isUrgent,
        applicationCount: isEditing && service ? service.applicationCount : 0,
        expiresAt: new Date(formData.date.startDate.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 jours
      };
      
      let savedServiceId: string;
      
      if (isEditing && serviceId) {
        // Mettre à jour la prestation existante
        await serviceRepository.updateService(serviceId, serviceData);
        savedServiceId = serviceId;
        
        // Mettre à jour le store
        updateServiceInStore(serviceId, serviceData);
        
        showToast({
          type: 'success',
          message: 'Prestation mise à jour avec succès'
        });
      } else {
        // Créer une nouvelle prestation
        savedServiceId = await serviceRepository.createService(serviceData);
        
        // Récupérer la prestation complète
        const newService = await serviceRepository.getServiceById(savedServiceId);
        
        if (newService) {
          // Ajouter au store
          addRecentService(newService);
        }
        
        showToast({
          type: 'success',
          message: 'Prestation créée avec succès'
        });
      }
      
      // Rediriger vers la page de détail
      router.replace(ROUTES.SERVICE_DETAILS(savedServiceId));
    } catch (error) {
      console.error('Error saving service:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors de l\'enregistrement'
      });
    } finally {
      setSaving(false);
    }
  }, [formData, user, mediaHook.media, isEditing, service, serviceId]);
  
  /**
   * Enregistrer en tant que brouillon
   */
  const saveAsDraft = useCallback(() => {
    saveService(true);
  }, [saveService]);
  
  /**
   * Publier la prestation
   */
  const publishService = useCallback(() => {
    saveService(false);
  }, [saveService]);
  
  /**
   * Annuler la création/édition
   */
  const cancelCreation = useCallback(() => {
    router.back();
  }, []);
  
  return {
    // État
    formData,
    service,
    loading,
    saving,
    isEditing,
    
    // Media
    ...mediaHook,
    
    // Location
    ...locationHook,
    
    // Actions
    updateFormValue,
    updateNestedFormValue,
    getLocation,
    saveAsDraft,
    publishService,
    cancelCreation
  };
};