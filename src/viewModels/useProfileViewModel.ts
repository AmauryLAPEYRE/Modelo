import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
// import { useUserRepository } from '../domain/hooks/useUserRepository';
import { useRatingRepository } from '../domain/hooks/useRatingRepository';
// import { useServiceRepository } from '../domain/hooks/useServiceRepository';
import { useApplicationRepository } from '../domain/hooks/useApplicationRepository';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { UserModel, UserRole, ModelUserModel, ProfessionalUserModel } from '../domain/entities/UserModel';
import { ServiceModel } from '../domain/entities/ServiceModel';
import { ApplicationModel } from '../domain/entities/ApplicationModel';
import { RatingModel } from '../domain/entities/RatingModel';
// import { useMedia } from '../utils/hooks/useMedia';
import { ROUTES } from '../utils/constants';

/**
 * ViewModel pour la gestion du profil utilisateur
 */
export const useProfileViewModel = (userId?: string) => {
  // Repositories
  const userRepository = useUserRepository();
  const ratingRepository = useRatingRepository();
  const serviceRepository = useServiceRepository();
  const applicationRepository = useApplicationRepository();
  
  // Stores
  const { user: currentUser, setUser } = useAuthStore();
  const { showToast, setRefreshing } = useUIStore();
  
  // Hooks
  const mediaHook = useMedia({
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8
  });
  
  // État local
  const [profile, setProfile] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshingLocal] = useState(false);
  const [ratings, setRatings] = useState<RatingModel[]>([]);
  const [services, setServices] = useState<ServiceModel[]>([]);
  const [applications, setApplications] = useState<ApplicationModel[]>([]);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'applications'>('info');
  
  // ID de l'utilisateur à afficher
  const targetUserId = userId || currentUser?.id;
  
  // Détermine si le profil affiché est celui de l'utilisateur courant
  const isCurrentUserProfile = !userId || userId === currentUser?.id;
  
  // Déterminer le type d'utilisateur
  const isModel = profile?.role === UserRole.MODEL;
  const isProfessional = profile?.role === UserRole.PROFESSIONAL;
  
  // Charger les données du profil
  useEffect(() => {
    if (targetUserId) {
      fetchProfile(targetUserId);
    }
  }, [targetUserId]);
  
  /**
   * Récupérer les données du profil
   */
  const fetchProfile = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      // Récupérer le profil utilisateur
      const userProfile = await userRepository.getUserById(userId);
      
      if (userProfile) {
        setProfile(userProfile);
        
        // Charger les évaluations
        fetchRatings(userId);
        
        // Charger les services ou applications selon le rôle
        if (userProfile.role === UserRole.PROFESSIONAL) {
          fetchServices(userId);
        } else {
          fetchApplications(userId);
        }
      } else {
        showToast({
          type: 'error',
          message: 'Utilisateur introuvable'
        });
        
        // Rediriger vers la page d'accueil si l'utilisateur n'existe pas
        if (!isCurrentUserProfile) {
          router.back();
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors du chargement du profil'
      });
    } finally {
      setLoading(false);
    }
  }, [isCurrentUserProfile]);
  
  /**
   * Récupérer les évaluations de l'utilisateur
   */
  const fetchRatings = useCallback(async (userId: string) => {
    try {
      const result = await ratingRepository.getUserRatings(userId, 1, 5);
      setRatings(result.ratings);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  }, []);
  
  /**
   * Récupérer les services d'un professionnel
   */
  const fetchServices = useCallback(async (userId: string) => {
    try {
      const result = await serviceRepository.getServices(1, 10, { professionalId: userId });
      setServices(result.services);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  }, []);
  
  /**
   * Récupérer les candidatures d'un modèle
   */
  const fetchApplications = useCallback(async (userId: string) => {
    try {
      const result = await applicationRepository.getModelApplications(userId);
      setApplications(result.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, []);
  
  /**
   * Rafraîchir les données du profil
   */
  const refreshProfile = useCallback(async () => {
    if (!targetUserId) return;
    
    setRefreshingLocal(true);
    setRefreshing(true);
    
    try {
      await fetchProfile(targetUserId);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshingLocal(false);
      setRefreshing(false);
    }
  }, [targetUserId]);
  
  /**
   * Mettre à jour la photo de profil
   */
  const updateProfilePicture = useCallback(async () => {
    if (!isCurrentUserProfile || !currentUser) return;
    
    try {
      // Sélectionner une image depuis la galerie
      const selectedMedia = await mediaHook.pickFromGallery();
      
      if (selectedMedia.length === 0) return;
      
      setUpdatingProfile(true);
      
      // Convertir l'image en blob
      const imageBlob = await mediaHook.assetToBlob(selectedMedia[0]);
      
      // Télécharger l'image
      const downloadUrl = await userRepository.uploadProfilePicture(currentUser.id, imageBlob);
      
      // Mettre à jour le profil local
      const updatedProfile = { ...profile, profilePicture: downloadUrl } as UserModel;
      setProfile(updatedProfile);
      
      // Mettre à jour le profil global
      if (isCurrentUserProfile) {
        setUser(updatedProfile);
      }
      
      showToast({
        type: 'success',
        message: 'Photo de profil mise à jour'
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors de la mise à jour de la photo'
      });
    } finally {
      setUpdatingProfile(false);
    }
  }, [isCurrentUserProfile, currentUser, profile]);
  
  /**
   * Mettre à jour les photos de modèle
   */
  const updateModelPhotos = useCallback(async () => {
    if (!isCurrentUserProfile || !currentUser || !isModel) return;
    
    try {
      // Sélectionner des images depuis la galerie
      const selectedMedia = await mediaHook.pickFromGallery();
      
      if (selectedMedia.length === 0) return;
      
      setUpdatingProfile(true);
      
      // Convertir les images en blobs
      const imageBlobs = await mediaHook.assetsToBlobs(selectedMedia);
      
      // Télécharger les images
      const downloadUrls = await userRepository.uploadModelPhotos(currentUser.id, imageBlobs);
      
      // Mettre à jour le profil local
      const modelProfile = profile as ModelUserModel;
      const updatedPhotos = [...(modelProfile.photos || []), ...downloadUrls];
      const updatedProfile = { ...modelProfile, photos: updatedPhotos } as ModelUserModel;
      
      setProfile(updatedProfile);
      
      // Mettre à jour le profil global
      if (isCurrentUserProfile) {
        setUser(updatedProfile);
      }
      
      showToast({
        type: 'success',
        message: 'Photos de profil mises à jour'
      });
    } catch (error) {
      console.error('Error updating model photos:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors de la mise à jour des photos'
      });
    } finally {
      setUpdatingProfile(false);
    }
  }, [isCurrentUserProfile, currentUser, profile, isModel]);
  
  /**
   * Naviguer vers l'écran d'édition du profil
   */
  const navigateToEditProfile = useCallback(() => {
    router.push(ROUTES.PROFILE_EDIT);
  }, []);
  
  /**
   * Naviguer vers les paramètres
   */
  const navigateToSettings = useCallback(() => {
    router.push(ROUTES.PROFILE_SETTINGS);
  }, []);
  
  /**
   * Mettre à jour le profil
   */
  const updateProfile = useCallback(async (profileData: Partial<UserModel>) => {
    if (!isCurrentUserProfile || !currentUser) return false;
    
    setUpdatingProfile(true);
    
    try {
      // Mettre à jour le profil dans Firestore
      await userRepository.updateUser(currentUser.id, profileData);
      
      // Mettre à jour le profil local
      const updatedProfile = { ...profile, ...profileData } as UserModel;
      setProfile(updatedProfile);
      
      // Mettre à jour le profil global
      setUser(updatedProfile);
      
      showToast({
        type: 'success',
        message: 'Profil mis à jour'
      });
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors de la mise à jour du profil'
      });
      return false;
    } finally {
      setUpdatingProfile(false);
    }
  }, [isCurrentUserProfile, currentUser, profile]);
  
  return {
    // État
    profile,
    ratings,
    services,
    applications,
    loading,
    refreshing,
    updatingProfile,
    activeTab,
    isCurrentUserProfile,
    isModel,
    isProfessional,
    
    // Media
    ...mediaHook,
    
    // Actions
    setActiveTab,
    refreshProfile,
    updateProfilePicture,
    updateModelPhotos,
    navigateToEditProfile,
    navigateToSettings,
    updateProfile
  };
};