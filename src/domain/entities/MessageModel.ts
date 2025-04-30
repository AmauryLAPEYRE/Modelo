export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    VIDEO = 'video',
    LOCATION = 'location',
    SYSTEM = 'system'
  }
  
  export interface MessageContent {
    text?: string;
    mediaUrl?: string; // URL de l'image ou vidéo
    location?: {
      address: string;
      latitude: number;
      longitude: number;
    };
  }
  
  export interface MessageModel {
    id: string;
    conversationId: string; // ID de la conversation (même que applicationId)
    senderId: string; // ID de l'expéditeur
    receiverId: string; // ID du destinataire
    type: MessageType;
    content: MessageContent;
    isRead: boolean;
    createdAt: Date;
    readAt?: Date; // Date de lecture
    deliveredAt?: Date; // Date de livraison
  }