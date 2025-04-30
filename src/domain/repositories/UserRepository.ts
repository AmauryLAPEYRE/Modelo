import { auth } from '../../services/firebase/auth';
import { 
  getDocumentById, 
  updateDocument, 
  deleteDocument,
  getDocuments,
  subscribeToDocument
} from '../../services/firebase/firestore';
import { uploadFile, deleteFile } from '../../services/firebase/storage';
import { UserModel, ModelUserModel, ProfessionalUserModel, UserRole } from '../entities/UserModel';
import { Unsubscribe } from 'firebase/firestore';

/**
 * Repository pour gérer les utilisateurs
 */
export interface UserRepository {
  /**
   * Récupère un utilisateur par son ID
   */
  getUserById(userId: string): Promise<UserModel | null>;

  /**
   * Récupère l'utilisateur actuellement connecté
   */
  getCurrentUser(): Promise<UserModel | null>;

  /**
   * Récupère plusieurs utilisateurs avec filtres
   */
  getUsers(filters?: any, page?: number, limit?: number): Promise<{
    users: UserModel[];
    hasMore: boolean;
  }>;

  /**
   * Met à jour un utilisateur
   */
  updateUser(userId: string, userData: Partial<UserModel>): Promise<void>;

  /**
   * Télécharge une photo de profil
   */
  uploadProfilePicture(userId: string, file: Blob): Promise<string>;

  /**
   * Télécharge des photos pour un modèle
   */
  uploadModelPhotos(userId: string, files: Blob[]): Promise<string[]>;

  /**
   * Met à jour la localisation d'un utilisateur
   */
  updateUserLocation(
    userId: string, 
    latitude: number, 
    longitude: number, 
    city: string, 
    radius: number
  ): Promise<void>;

  /**
   * Ajoute un utilisateur à la liste des bloqués
   */
  blockUser(currentUserId: string, userToBlockId: string): Promise<void>;

  /**
   * Retire un utilisateur de la liste des bloqués
   */
  unblockUser(currentUserId: string, userToUnblockId: string): Promise<void>;

  /**
   * Met à jour le token FCM pour les notifications
   */
  updateFcmToken(userId: string, token: string): Promise<void>;

  /**
   * Souscrit aux changements d'un utilisateur
   */
  subscribeToUserChanges(userId: string, callback: (user: UserModel | null) => void): Unsubscribe;
}

/**
 * Implémentation du repository utilisateur
 */
export class UserRepositoryImpl implements UserRepository {
  private readonly USERS_COLLECTION = 'users';
  private readonly STORAGE_PROFILE_PATH = 'profiles';
  private readonly STORAGE_MODEL_PHOTOS_PATH = 'model-photos';

  async getUserById(userId: string): Promise<UserModel | null> {
    try {
      const user = await getDocumentById<UserModel>(this.USERS_COLLECTION, userId);
      
      if (!user) return null;
      
      // Convertir les timestamps en Date
      if (user.createdAt) {
        user.createdAt = new Date(user.createdAt);
      }
      if (user.updatedAt) {
        user.updatedAt = new Date(user.updatedAt);
      }
      if (user.lastActive) {
        user.lastActive = new Date(user.lastActive);
      }
      
      return user;
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<UserModel | null> {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser) return null;
      
      return await this.getUserById(currentUser.uid);
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      throw error;
    }
  }

  async getUsers(
    filters: any = {}, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{
    users: UserModel[];
    hasMore: boolean;
  }> {
    try {
      const firebaseFilters = [];
      
      // Convertir les filtres en format Firebase
      if (filters.role) {
        firebaseFilters.push({
          field: 'role',
          operator: '==',
          value: filters.role
        });
      }
      
      if (filters.city) {
        firebaseFilters.push({
          field: 'location.city',
          operator: '==',
          value: filters.city
        });
      }
      
      // Ajouter d'autres filtres selon les besoins
      
      const result = await getDocuments<UserModel>(
        this.USERS_COLLECTION,
        firebaseFilters.length > 0 ? firebaseFilters : undefined,
        { field: 'createdAt', direction: 'desc' },
        page,
        limit
      );
      
      // Convertir les timestamps en Date pour chaque utilisateur
      const users = result.data.map(user => {
        if (user.createdAt) {
          user.createdAt = new Date(user.createdAt);
        }
        if (user.updatedAt) {
          user.updatedAt = new Date(user.updatedAt);
        }
        if (user.lastActive) {
          user.lastActive = new Date(user.lastActive);
        }
        return user;
      });
      
      return {
        users,
        hasMore: result.lastDoc !== null
      };
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<UserModel>): Promise<void> {
    try {
      await updateDocument<UserModel>(this.USERS_COLLECTION, userId, userData);
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  async uploadProfilePicture(userId: string, file: Blob): Promise<string> {
    try {
      const path = `${this.STORAGE_PROFILE_PATH}/${userId}/profile-${Date.now()}.jpg`;
      const downloadURL = await uploadFile(file, path);
      
      // Mettre à jour l'URL de la photo de profil dans Firestore
      await this.updateUser(userId, { profilePicture: downloadURL });
      
      return downloadURL;
    } catch (error) {
      console.error('Error in uploadProfilePicture:', error);
      throw error;
    }
  }

  async uploadModelPhotos(userId: string, files: Blob[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const path = `${this.STORAGE_MODEL_PHOTOS_PATH}/${userId}/photo-${index}-${Date.now()}.jpg`;
        return uploadFile(file, path);
      });
      
      const downloadURLs = await Promise.all(uploadPromises);
      
      // Récupérer l'utilisateur actuel
      const user = await this.getUserById(userId);
      
      if (user && user.role === UserRole.MODEL) {
        const modelUser = user as ModelUserModel;
        
        // Mettre à jour la liste des photos
        const updatedPhotos = [...modelUser.photos || [], ...downloadURLs];
        
        await this.updateUser(userId, { 
          photos: updatedPhotos 
        });
      }
      
      return downloadURLs;
    } catch (error) {
      console.error('Error in uploadModelPhotos:', error);
      throw error;
    }
  }

  async updateUserLocation(
    userId: string, 
    latitude: number, 
    longitude: number, 
    city: string, 
    radius: number
  ): Promise<void> {
    try {
      await this.updateUser(userId, {
        location: {
          city,
          coordinates: {
            latitude,
            longitude
          },
          radius
        }
      });
    } catch (error) {
      console.error('Error in updateUserLocation:', error);
      throw error;
    }
  }

  async blockUser(currentUserId: string, userToBlockId: string): Promise<void> {
    try {
      const currentUser = await this.getUserById(currentUserId);
      
      if (!currentUser) {
        throw new Error('Current user not found');
      }
      
      const blockedUsers = [...(currentUser.blockedUsers || [])];
      
      // Vérifier si l'utilisateur est déjà bloqué
      if (!blockedUsers.includes(userToBlockId)) {
        blockedUsers.push(userToBlockId);
        
        await this.updateUser(currentUserId, {
          blockedUsers
        });
      }
    } catch (error) {
      console.error('Error in blockUser:', error);
      throw error;
    }
  }

  async unblockUser(currentUserId: string, userToUnblockId: string): Promise<void> {
    try {
      const currentUser = await this.getUserById(currentUserId);
      
      if (!currentUser || !currentUser.blockedUsers) {
        return;
      }
      
      const blockedUsers = currentUser.blockedUsers.filter(id => id !== userToUnblockId);
      
      await this.updateUser(currentUserId, {
        blockedUsers
      });
    } catch (error) {
      console.error('Error in unblockUser:', error);
      throw error;
    }
  }

  async updateFcmToken(userId: string, token: string): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const fcmTokens = [...(user.fcmTokens || [])];
      
      // Vérifier si le token existe déjà
      if (!fcmTokens.includes(token)) {
        fcmTokens.push(token);
        
        await this.updateUser(userId, {
          fcmTokens
        });
      }
    } catch (error) {
      console.error('Error in updateFcmToken:', error);
      throw error;
    }
  }

  subscribeToUserChanges(userId: string, callback: (user: UserModel | null) => void): Unsubscribe {
    return subscribeToDocument<UserModel>(this.USERS_COLLECTION, userId, (user) => {
      if (user) {
        // Convertir les timestamps en Date
        if (user.createdAt) {
          user.createdAt = new Date(user.createdAt);
        }
        if (user.updatedAt) {
          user.updatedAt = new Date(user.updatedAt);
        }
        if (user.lastActive) {
          user.lastActive = new Date(user.lastActive);
        }
      }
      
      callback(user);
    });
  }
}