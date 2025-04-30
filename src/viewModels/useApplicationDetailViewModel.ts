import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useApplicationRepository } from '../domain/hooks/useApplicationRepository';
import { useServiceRepository } from '../domain/hooks/useServiceRepository';
import { useUserRepository } from '../domain/hooks/useUserRepository';
import { useMessageRepository } from '../domain/hooks/useMessageRepository';
import { useRatingRepository } from '../domain/hooks/useRatingRepository';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { ApplicationModel, ApplicationStatus } from '../domain/entities/ApplicationModel';
import { ServiceModel } from '../domain/entities/ServiceModel';
import { UserModel, UserRole, ModelUserModel } from '../domain/entities/UserModel';
import { MessageType } from '../domain/entities/MessageModel';
import { useMedia } from '../utils/hooks/useMedia';
import { ROUTES } from '../utils/constants';

/**
 * ViewModel pour la page de détail d'une candidature
 */
export const useApplicationDetailViewModel = (applicationId: string) => {
  // Repositories
  const applicationRepository = useApplicationRepository();
  const serviceRepository = useServiceRepository();
  const userRepository = useUserRepository();
  const messageRepository = useMessageRepository();
  const ratingRepository = useRatingRepository();
  
  // Stores
  const { user: currentUser } = useAuthStore();
  const { showToast, setRefreshing } = useUIStore();
  
  // Hooks
  const mediaHook = useMedia();
  
  // État local
  const [application, setApplication] = useState<ApplicationModel | null>(null);
  const [service, setService] = useState<ServiceModel | null>(null);
  const [model, setModel] = useState<ModelUserModel | null>(null);
  const [professional, setProfessional] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]); // Utiliser le type MessageModel approprié
  const [refreshing, setRefreshingLocal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  
  // Valeurs dérivées
  const isModel = currentUser?.role === UserRole.MODEL;
  const isProfessional = currentUser?.role === UserRole.PROFESSIONAL;
  const isApplicant = application?.modelId === currentUser?.id;
  const isServiceOwner = service?.professionalId === currentUser?.id;
  const canAccept = isServiceOwner && application?.status === ApplicationStatus.PENDING;
  const canReject = isServiceOwner && application?.status === ApplicationStatus.PENDING;
  const canComplete = (isServiceOwner || isApplicant) && application?.status === ApplicationStatus.ACCEPTED;
  const canCancel = (isServiceOwner || isApplicant) && 
    (application?.status === ApplicationStatus.PENDING || application?.status === ApplicationStatus.ACCEPTED);
  const canRate = (isServiceOwner || isApplicant) && 
    application?.status === ApplicationStatus.COMPLETED && !hasRated;
  
  // Initialisation
  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);
  
  /**
   * Récupérer les détails de la candidature
   */
  const fetchApplicationDetails = useCallback(async () => {
    setLoading(true);
    
    try {
      // Récupérer la candidature
      const applicationData = await applicationRepository.getApplicationById(applicationId);
      
      if (applicationData) {
        setApplication(applicationData);
        
        // Vérifier les permissions
        if (
          applicationData.modelId !== currentUser?.id && 
          applicationData.professionalId !== currentUser?.id
        ) {
          showToast({
            type: 'error',
            message: 'Vous n\'êtes pas autorisé à voir cette candidature'
          });
          
          router.back();
          return;
        }
        
        // Récupérer les données associées
        await Promise.all([
          fetchService(applicationData.serviceId),
          fetchModel(applicationData.modelId),
          fetchProfessional(applicationData.professionalId),
          fetchMessages(applicationId),
          checkIfUserHasRated(applicationData.id)
        ]);
        
        // Marquer les messages comme lus
        if (currentUser) {
          await messageRepository.markAllMessagesAsRead(applicationId, currentUser.id);
        }
      } else {
        showToast({
          type: 'error',
          message: 'Candidature introuvable'
        });
        
        router.back();
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors du chargement des détails'
      });
    } finally {
      setLoading(false);
    }
  }, [applicationId, currentUser]);
  
  /**
   * Récupérer les détails du service
   */
  const fetchService = useCallback(async (serviceId: string) => {
    try {
      const serviceData = await serviceRepository.getServiceById(serviceId);
      setService(serviceData);
    } catch (error) {
      console.error('Error fetching service:', error);
    }
  }, []);
  
  /**
   * Récupérer les détails du modèle
   */
  const fetchModel = useCallback(async (modelId: string) => {
    try {
      const modelData = await userRepository.getUserById(modelId);
      setModel(modelData as ModelUserModel | null);
    } catch (error) {
      console.error('Error fetching model:', error);
    }
  }, []);
  
  /**
   * Récupérer les détails du professionnel
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
   * Récupérer les messages de la conversation
   */
  const fetchMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    
    try {
      const result = await messageRepository.getConversationMessages(conversationId);
      setMessages(result.messages);
      
      // Souscrire aux mises à jour des messages
      const unsubscribe = messageRepository.subscribeToConversationMessages(
        conversationId,
        (updatedMessages) => {
          setMessages(updatedMessages);
        }
      );
      
      // Nettoyer la souscription lors du démontage
      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, []);
  
  /**
   * Vérifier si l'utilisateur a déjà évalué
   */
  const checkIfUserHasRated = useCallback(async (applicationId: string) => {
    if (!currentUser) return;
    
    try {
      const hasRated = await ratingRepository.hasUserRatedService(
        currentUser.id,
        applicationId
      );
      
      setHasRated(hasRated);
    } catch (error) {
      console.error('Error checking if user has rated:', error);
    }
  }, [currentUser]);
  
  /**
   * Rafraîchir les données
   */
  const refreshData = useCallback(async () => {
    setRefreshingLocal(true);
    setRefreshing(true);
    
    try {
      await fetchApplicationDetails();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshingLocal(false);
      setRefreshing(false);
    }
  }, [fetchApplicationDetails]);
  
  /**
   * Accepter la candidature
   */
  const acceptApplication = useCallback(async () => {
    if (!application || !canAccept) return;
    
    setProcessing(true);
    
    try {
      await applicationRepository.updateApplicationStatus(
        application.id,
        ApplicationStatus.ACCEPTED
      );
      
      // Mettre à jour localement
      setApplication({
        ...application,
        status: ApplicationStatus.ACCEPTED
      });
      
      // Envoyer un message système
      await messageRepository.sendTextMessage(
        application.id,
        'system',
        application.modelId,
        'Votre candidature a été acceptée ! Vous pouvez maintenant échanger avec le professionnel.'
      );
      
      showToast({
        type: 'success',
        message: 'Candidature acceptée'
      });
    } catch (error) {
      console.error('Error accepting application:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors de l\'acceptation'
      });
    } finally {
      setProcessing(false);
    }
  }, [application, canAccept]);
  
  /**
   * Rejeter la candidature
   */
  const rejectApplication = useCallback(async (reason?: string) => {
    if (!application || !canReject) return;
    
    setProcessing(true);
    
    try {
      await applicationRepository.updateApplicationStatus(
        application.id,
        ApplicationStatus.REJECTED,
        reason
      );
      
      // Mettre à jour localement
      setApplication({
        ...application,
        status: ApplicationStatus.REJECTED,
        rejectionReason: reason
      });
      
      showToast({
        type: 'success',
        message: 'Candidature refusée'
      });
    } catch (error) {
      console.error('Error rejecting application:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors du refus'
      });
    } finally {
      setProcessing(false);
    }
  }, [application, canReject]);
  
  /**
   * Marquer la candidature comme terminée
   */
  const completeApplication = useCallback(async () => {
    if (!application || !canComplete) return;
    
    setProcessing(true);
    
    try {
      await applicationRepository.updateApplicationStatus(
        application.id,
        ApplicationStatus.COMPLETED
      );
      
      // Mettre à jour localement
      setApplication({
        ...application,
        status: ApplicationStatus.COMPLETED
      });
      
      // Envoyer un message système
      await messageRepository.sendTextMessage(
        application.id,
        'system',
        isServiceOwner ? application.modelId : application.professionalId,
        'La prestation a été marquée comme terminée. Vous pouvez maintenant laisser une évaluation.'
      );
      
      showToast({
        type: 'success',
        message: 'Prestation terminée'
      });
    } catch (error) {
      console.error('Error completing application:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors de la finalisation'
      });
    } finally {
      setProcessing(false);
    }
  }, [application, canComplete, isServiceOwner]);
  
  /**
   * Annuler la candidature
   */
  const cancelApplication = useCallback(async () => {
    if (!application || !canCancel) return;
    
    // Demander confirmation
    Alert.alert(
      'Annuler la candidature',
      'Êtes-vous sûr de vouloir annuler cette candidature ? Cette action est irréversible.',
      [
        {
          text: 'Non',
          style: 'cancel'
        },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            setProcessing(true);
            
            try {
              await applicationRepository.updateApplicationStatus(
                application.id,
                ApplicationStatus.CANCELLED
              );
              
              // Mettre à jour localement
              setApplication({
                ...application,
                status: ApplicationStatus.CANCELLED
              });
              
              // Envoyer un message système
              await messageRepository.sendTextMessage(
                application.id,
                'system',
                isServiceOwner ? application.modelId : application.professionalId,
                `La candidature a été annulée par ${isServiceOwner ? 'le professionnel' : 'le modèle'}.`
              );
              
              showToast({
                type: 'success',
                message: 'Candidature annulée'
              });
            } catch (error) {
              console.error('Error cancelling application:', error);
              showToast({
                type: 'error',
                message: 'Erreur lors de l\'annulation'
              });
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  }, [application, canCancel, isServiceOwner]);
  
  /**
   * Envoyer un message
   */
  const sendMessage = useCallback(async () => {
    if (!application || !currentUser || !messageText.trim()) return;
    
    try {
      const partnerId = currentUser.id === application.modelId 
        ? application.professionalId 
        : application.modelId;
      
      await messageRepository.sendTextMessage(
        application.id,
        currentUser.id,
        partnerId,
        messageText.trim()
      );
      
      // Vider le champ de texte
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors de l\'envoi du message'
      });
    }
  }, [application, currentUser, messageText]);
  
  /**
   * Envoyer une image
   */
  const sendImage = useCallback(async () => {
    if (!application || !currentUser) return;
    
    try {
      // Sélectionner une image depuis la galerie
      const selectedMedia = await mediaHook.pickFromGallery();
      
      if (selectedMedia.length === 0) return;
      
      const imageBlob = await mediaHook.assetToBlob(selectedMedia[0]);
      
      const partnerId = currentUser.id === application.modelId 
        ? application.professionalId 
        : application.modelId;
      
      await messageRepository.sendMediaMessage(
        application.id,
        currentUser.id,
        partnerId,
        imageBlob,
        MessageType.IMAGE
      );
    } catch (error) {
      console.error('Error sending image:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors de l\'envoi de l\'image'
      });
    }
  }, [application, currentUser]);
  
  /**
   * Naviguer vers l'écran d'évaluation
   */
  const navigateToRating = useCallback(() => {
    if (!application || !canRate) return;
    
    // Naviguer vers l'écran d'évaluation (à implémenter)
    showToast({
      type: 'info',
      message: 'Fonctionnalité d\'évaluation à venir'
    });
  }, [application, canRate]);
  
  /**
   * Naviguer vers le profil du modèle
   */
  const navigateToModelProfile = useCallback(() => {
    if (!model) return;
    
    router.push({
      pathname: ROUTES.PROFILE,
      params: { userId: model.id }
    });
  }, [model]);
  
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
   * Naviguer vers le détail du service
   */
  const navigateToServiceDetail = useCallback(() => {
    if (!service) return;
    
    router.push(ROUTES.SERVICE_DETAILS(service.id));
  }, [service]);
  
  return {
    // État
    application,
    service,
    model,
    professional,
    loading,
    refreshing,
    processing,
    messages,
    messagesLoading,
    messageText,
    hasRated,
    
    // Valeurs dérivées
    isModel,
    isProfessional,
    isApplicant,
    isServiceOwner,
    canAccept,
    canReject,
    canComplete,
    canCancel,
    canRate,
    
    // Actions
    setMessageText,
    refreshData,
    acceptApplication,
    rejectApplication,
    completeApplication,
    cancelApplication,
    sendMessage,
    sendImage,
    navigateToRating,
    navigateToModelProfile,
    navigateToProfessionalProfile,
    navigateToServiceDetail
  };
};