import {
    getDocumentById,
    addDocument,
    updateDocument,
    getDocuments,
    subscribeToCollection
  } from '../../services/firebase/firestore';
  import { uploadFile } from '../../services/firebase/storage';
  import { MessageModel, MessageType } from '../entities/MessageModel';
  import { Unsubscribe } from 'firebase/firestore';
  
  export interface MessageRepository {
    /**
     * Récupère un message par son ID
     */
    getMessageById(messageId: string): Promise<MessageModel | null>;
  
    /**
     * Récupère tous les messages d'une conversation
     */
    getConversationMessages(
      conversationId: string,
      page?: number,
      limit?: number
    ): Promise<{
      messages: MessageModel[];
      hasMore: boolean;
    }>;
  
    /**
     * Envoie un message texte
     */
    sendTextMessage(
      conversationId: string,
      senderId: string,
      receiverId: string,
      text: string
    ): Promise<string>;
  
    /**
     * Envoie un message avec média (image ou vidéo)
     */
    sendMediaMessage(
      conversationId: string,
      senderId: string,
      receiverId: string,
      file: Blob,
      type: MessageType.IMAGE | MessageType.VIDEO
    ): Promise<string>;
  
    /**
     * Envoie un message de localisation
     */
    sendLocationMessage(
      conversationId: string,
      senderId: string,
      receiverId: string,
      address: string,
      latitude: number,
      longitude: number
    ): Promise<string>;
  
    /**
     * Marque un message comme lu
     */
    markMessageAsRead(messageId: string): Promise<void>;
  
    /**
     * Marque tous les messages d'une conversation comme lus
     */
    markAllMessagesAsRead(
      conversationId: string,
      userId: string
    ): Promise<void>;
  
    /**
     * Souscrit aux changements des messages d'une conversation
     */
    subscribeToConversationMessages(
      conversationId: string,
      callback: (messages: MessageModel[]) => void
    ): Unsubscribe;
  }
  
  export class MessageRepositoryImpl implements MessageRepository {
    private readonly MESSAGES_COLLECTION = 'messages';
    private readonly STORAGE_MESSAGE_MEDIA_PATH = 'message-media';
  
    async getMessageById(messageId: string): Promise<MessageModel | null> {
      try {
        const message = await getDocumentById<MessageModel>(
          this.MESSAGES_COLLECTION,
          messageId
        );
        
        if (!message) return null;
        
        // Convertir les timestamps en Date
        if (message.createdAt) {
          message.createdAt = new Date(message.createdAt);
        }
        if (message.readAt) {
          message.readAt = new Date(message.readAt);
        }
        if (message.deliveredAt) {
          message.deliveredAt = new Date(message.deliveredAt);
        }
        
        return message;
      } catch (error) {
        console.error('Error in getMessageById:', error);
        throw error;
      }
    }
  
    async getConversationMessages(
      conversationId: string,
      page: number = 1,
      limit: number = 20
    ): Promise<{
      messages: MessageModel[];
      hasMore: boolean;
    }> {
      try {
        const result = await getDocuments<MessageModel>(
          this.MESSAGES_COLLECTION,
          [
            {
              field: 'conversationId',
              operator: '==',
              value: conversationId
            }
          ],
          { field: 'createdAt', direction: 'desc' }, // Messages les plus récents d'abord
          page,
          limit
        );
        
        // Convertir les timestamps en Date pour chaque message
        const messages = result.data.map(message => {
          if (message.createdAt) {
            message.createdAt = new Date(message.createdAt);
          }
          if (message.readAt) {
            message.readAt = new Date(message.readAt);
          }
          if (message.deliveredAt) {
            message.deliveredAt = new Date(message.deliveredAt);
          }
          return message;
        });
        
        // Renverser l'ordre pour afficher les messages les plus anciens d'abord
        messages.reverse();
        
        return {
          messages,
          hasMore: result.lastDoc !== null
        };
      } catch (error) {
        console.error('Error in getConversationMessages:', error);
        throw error;
      }
    }
  
    async sendTextMessage(
      conversationId: string,
      senderId: string,
      receiverId: string,
      text: string
    ): Promise<string> {
      try {
        const messageData: Omit<MessageModel, 'id' | 'createdAt'> = {
          conversationId,
          senderId,
          receiverId,
          type: MessageType.TEXT,
          content: {
            text
          },
          isRead: false,
          deliveredAt: new Date()
        };
        
        const messageId = await addDocument(this.MESSAGES_COLLECTION, messageData);
        
        return messageId;
      } catch (error) {
        console.error('Error in sendTextMessage:', error);
        throw error;
      }
    }
  
    async sendMediaMessage(
      conversationId: string,
      senderId: string,
      receiverId: string,
      file: Blob,
      type: MessageType.IMAGE | MessageType.VIDEO
    ): Promise<string> {
      try {
        // Déterminer l'extension du fichier en fonction du type
        const extension = type === MessageType.IMAGE ? 'jpg' : 'mp4';
        
        // Télécharger le fichier média
        const path = `${this.STORAGE_MESSAGE_MEDIA_PATH}/${conversationId}/${Date.now()}.${extension}`;
        const mediaUrl = await uploadFile(file, path);
        
        const messageData: Omit<MessageModel, 'id' | 'createdAt'> = {
          conversationId,
          senderId,
          receiverId,
          type,
          content: {
            mediaUrl
          },
          isRead: false,
          deliveredAt: new Date()
        };
        
        const messageId = await addDocument(this.MESSAGES_COLLECTION, messageData);
        
        return messageId;
      } catch (error) {
        console.error('Error in sendMediaMessage:', error);
        throw error;
      }
    }
  
    async sendLocationMessage(
      conversationId: string,
      senderId: string,
      receiverId: string,
      address: string,
      latitude: number,
      longitude: number
    ): Promise<string> {
      try {
        const messageData: Omit<MessageModel, 'id' | 'createdAt'> = {
          conversationId,
          senderId,
          receiverId,
          type: MessageType.LOCATION,
          content: {
            location: {
              address,
              latitude,
              longitude
            }
          },
          isRead: false,
          deliveredAt: new Date()
        };
        
        const messageId = await addDocument(this.MESSAGES_COLLECTION, messageData);
        
        return messageId;
      } catch (error) {
        console.error('Error in sendLocationMessage:', error);
        throw error;
      }
    }
  
    async markMessageAsRead(messageId: string): Promise<void> {
      try {
        await updateDocument(this.MESSAGES_COLLECTION, messageId, {
          isRead: true,
          readAt: new Date()
        });
      } catch (error) {
        console.error('Error in markMessageAsRead:', error);
        throw error;
      }
    }
  
    async markAllMessagesAsRead(
      conversationId: string,
      userId: string
    ): Promise<void> {
      try {
        // Récupérer tous les messages non lus pour cet utilisateur
        const result = await getDocuments<MessageModel>(
          this.MESSAGES_COLLECTION,
          [
            {
              field: 'conversationId',
              operator: '==',
              value: conversationId
            },
            {
              field: 'receiverId',
              operator: '==',
              value: userId
            },
            {
              field: 'isRead',
              operator: '==',
              value: false
            }
          ]
        );
        
        // Marquer chaque message comme lu
        const updatePromises = result.data.map(message => 
          this.markMessageAsRead(message.id)
        );
        
        await Promise.all(updatePromises);
      } catch (error) {
        console.error('Error in markAllMessagesAsRead:', error);
        throw error;
      }
    }
  
    subscribeToConversationMessages(
      conversationId: string,
      callback: (messages: MessageModel[]) => void
    ): Unsubscribe {
      return subscribeToCollection<MessageModel>(
        this.MESSAGES_COLLECTION,
        (messages) => {
          // Convertir les timestamps en Date pour chaque message
          const formattedMessages = messages.map(message => {
            if (message.createdAt) {
              message.createdAt = new Date(message.createdAt);
            }
            if (message.readAt) {
              message.readAt = new Date(message.readAt);
            }
            if (message.deliveredAt) {
              message.deliveredAt = new Date(message.deliveredAt);
            }
            return message;
          });
          
          // Trier les messages par date de création (du plus ancien au plus récent)
          formattedMessages.sort((a, b) => 
            a.createdAt.getTime() - b.createdAt.getTime()
          );
          
          callback(formattedMessages);
        },
        [
          {
            field: 'conversationId',
            operator: '==',
            value: conversationId
          }
        ],
        { field: 'createdAt', direction: 'asc' },
        100 // Limite de 100 messages
      );
    }
  }