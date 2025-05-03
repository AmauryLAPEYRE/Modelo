import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { useApplicationRepository } from '../domain/hooks/useApplicationRepository';
import { useMessageRepository } from '../domain/hooks/useMessageRepository';
import { useUserRepository } from '../domain/hooks/useUserRepository';
import { useServiceRepository } from '../domain/hooks/useServiceRepository';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { useMessageStore } from './stores/messageStore';
import { ApplicationModel, ApplicationStatus } from '../domain/entities/ApplicationModel';
import { MessageModel } from '../domain/entities/MessageModel';
import { UserModel } from '../domain/entities/UserModel';
import { ServiceModel } from '../domain/entities/ServiceModel';
import { ROUTES } from '../utils/constants';

/**
 * ViewModel pour la gestion des messages
 */
export const useMessagingViewModel = (conversationId?: string) => {
  // Repositories
  const applicationRepository = useApplicationRepository();
  const messageRepository = useMessageRepository();
  const userRepository = useUserRepository();
  const serviceRepository = useServiceRepository();
  
  // Stores
  const { user: currentUser } = useAuthStore();
  const { showToast, setRefreshing } = useUIStore();
  const { 
    conversations, 
    setConversations,
    messages: storeMessages,
    setMessages,
    currentConversationId,
    setCurrentConversation,
    markConversationAsRead,
    getTotalUnreadCount
  } = useMessageStore();
  
  // État local
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshingLocal] = useState(false);
  const [messages, setLocalMessages] = useState<MessageModel[]>([]);
  const [application, setApplication] = useState<ApplicationModel | null>(null);
  const [service, setService] = useState<ServiceModel | null>(null);
  const [partner, setPartner] = useState<UserModel | null>(null);
  
  // Initialisation
  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);
  
  useEffect(() => {
    if (conversationId) {
      setCurrentConversation(conversationId);
      fetchConversationDetails(conversationId);
    }
  }, [conversationId]);
  
  useEffect(() => {
    if (currentConversationId && storeMessages[currentConversationId]) {
      setLocalMessages(storeMessages[currentConversationId]);
    }
  }, [currentConversationId, storeMessages]);
  
  /**
   * Récupérer toutes les conversations
   */
  const fetchConversations = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    
    try {
      // Récupérer toutes les candidatures acceptées de l'utilisateur
      let applications: ApplicationModel[] = [];
      
      if (currentUser.role === 'model') {
        // Pour les modèles
        const result = await applicationRepository.getModelApplications(
          currentUser.id,
          [ApplicationStatus.ACCEPTED, ApplicationStatus.COMPLETED]
        );
        applications = result.applications;
      } else {
        // Pour les professionnels
        const result = await applicationRepository.getProfessionalApplications(
          currentUser.id,
          [ApplicationStatus.ACCEPTED, ApplicationStatus.COMPLETED]
        );
        applications = result.applications;
      }
      
      // Transformer les candidatures en conversations
      const conversationsData = await Promise.all(
        applications.map(async (app) => {
          // Déterminer l'ID du partenaire
          const partnerId = currentUser.role === 'model' 
            ? app.professionalId 
            : app.modelId;
          
          // Récupérer les informations du partenaire
          const partner = await userRepository.getUserById(partnerId);
          
          // Récupérer les informations du service
          const service = await serviceRepository.getServiceById(app.serviceId);
          
          // Récupérer le dernier message
          const messagesResult = await messageRepository.getConversationMessages(
            app.id,
            1,
            1
          );
          
          const lastMessage = messagesResult.messages.length > 0 
            ? messagesResult.messages[0] 
            : undefined;
          
          // Calculer le nombre de messages non lus
          const unreadCount = app.hasUnreadMessages ? 1 : 0;
          
          return {
            id: app.id,
            partnerId,
            partnerName: partner?.fullName || 'Utilisateur inconnu',
            partnerPicture: partner?.profilePicture,
            lastMessage,
            unreadCount,
            serviceId: app.serviceId,
            serviceTitle: service?.title || 'Prestation inconnue'
          };
        })
      );
      
      // Trier les conversations par date du dernier message
      conversationsData.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        
        return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime();
      });
      
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors du chargement des conversations'
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser]);
  
  /**
   * Récupérer les détails d'une conversation
   */
  const fetchConversationDetails = useCallback(async (convId: string) => {
    if (!currentUser) return;
    
    setLoading(true);
    
    try {
      // Marquer la conversation comme lue
      markConversationAsRead(convId);
      await applicationRepository.markMessagesAsRead(convId);
      
      // Récupérer l'application associée à cette conversation
      const applicationData = await applicationRepository.getApplicationById(convId);
      
      if (applicationData) {
        setApplication(applicationData);
        
        // Vérifier les permissions
        if (
          applicationData.modelId !== currentUser.id && 
          applicationData.professionalId !== currentUser.id
        ) {
          showToast({
            type: 'error',
            message: 'Vous n\'êtes pas autorisé à voir cette conversation'
          });
          
          router.back();
          return;
        }
        
        // Récupérer les messages
        await fetchMessages(convId);
        
        // Récupérer le service
        const serviceData = await serviceRepository.getServiceById(applicationData.serviceId);
        setService(serviceData);
        
        // Récupérer le partenaire
        const partnerId = currentUser.id === applicationData.modelId
          ? applicationData.professionalId
          : applicationData.modelId;
          
        const partnerData = await userRepository.getUserById(partnerId);
        setPartner(partnerData);
      } else {
        showToast({
          type: 'error',
          message: 'Conversation introuvable'
        });
        
        router.back();
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors du chargement de la conversation'
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser]);
  
  /**
   * Récupérer les messages d'une conversation
   */
  const fetchMessages = useCallback(async (convId: string) => {
    try {
      // Récupérer les messages
      const result = await messageRepository.getConversationMessages(convId);
      
      // Mettre à jour le store
      setMessages(convId, result.messages);
      
      // Mettre à jour l'état local
      setLocalMessages(result.messages);
      
      // Souscrire aux nouveaux messages
      const unsubscribe = messageRepository.subscribeToConversationMessages(
        convId,
        (updatedMessages) => {
          setMessages(convId, updatedMessages);
          setLocalMessages(updatedMessages);
        }
      );
      
      // Nettoyer la souscription lors du démontage
      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);
  
  /**
   * Rafraîchir les données
   */
  const refreshData = useCallback(async () => {
    setRefreshingLocal(true);
    setRefreshing(true);
    
    try {
      if (conversationId) {
        await fetchConversationDetails(conversationId);
      } else {
        await fetchConversations();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshingLocal(false);
      setRefreshing(false);
    }
  }, [conversationId]);
  
  /**
   * Envoyer un message texte
   */
  const sendTextMessage = useCallback(async (text: string) => {
    if (!currentUser || !conversationId || !text.trim() || !partner) return;
    
    try {
      await messageRepository.sendTextMessage(
        conversationId,
        currentUser.id,
        partner.id,
        text.trim()
      );
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors de l\'envoi du message'
      });
      return false;
    }
  }, [currentUser, conversationId, partner]);
  
  /**
   * Envoyer un message avec média (image)
   */
  const sendImageMessage = useCallback(async (imageBlob: Blob) => {
    if (!currentUser || !conversationId || !partner) return;
    
    try {
      await messageRepository.sendMediaMessage(
        conversationId,
        currentUser.id,
        partner.id,
        imageBlob,
        'image'
      );
      
      return true;
    } catch (error) {
      console.error('Error sending image message:', error);
      showToast({
        type: 'error',
        message: 'Erreur lors de l\'envoi de l\'image'
      });
      return false;
    }
  }, [currentUser, conversationId, partner]);
  
  /**
   * Naviguer vers une conversation
   */
  const navigateToConversation = useCallback((convId: string) => {
    setCurrentConversation(convId);
    router.push(ROUTES.CONVERSATION(convId));
  }, []);
  
  /**
   * Naviguer vers le profil du partenaire
   */
  const navigateToPartnerProfile = useCallback(() => {
    if (!partner) return;
    
    router.push({
      pathname: ROUTES.PROFILE,
      params: { userId: partner.id }
    });
  }, [partner]);
  
  /**
   * Naviguer vers le détail du service
   */
  const navigateToServiceDetail = useCallback(() => {
    if (!service) return;
    
    router.push(ROUTES.SERVICE_DETAILS(service.id));
  }, [service]);
  
  /**
   * Naviguer vers le détail de la candidature
   */
  const navigateToApplicationDetail = useCallback(() => {
    if (!application) return;
    
    router.push(ROUTES.APPLICATION_DETAILS(application.id));
  }, [application]);
  
  return {
    // État
    loading,
    refreshing,
    conversations,
    messages: localMessages,
    application,
    service,
    partner,
    unreadCount: getTotalUnreadCount(),
    
    // Actions
    refreshData,
    sendTextMessage,
    sendImageMessage,
    navigateToConversation,
    navigateToPartnerProfile,
    navigateToServiceDetail,
    navigateToApplicationDetail
  };
};