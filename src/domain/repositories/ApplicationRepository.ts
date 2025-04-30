import {
    getDocumentById,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocuments,
    subscribeToDocument,
    subscribeToCollection
  } from '../../services/firebase/firestore';
  import { uploadMultipleFiles } from '../../services/firebase/storage';
  import { ApplicationModel, ApplicationStatus } from '../entities/ApplicationModel';
  import { Unsubscribe } from 'firebase/firestore';
  
  export interface ApplicationRepository {
    /**
     * Récupère une candidature par son ID
     */
    getApplicationById(applicationId: string): Promise<ApplicationModel | null>;
  
    /**
     * Récupère les candidatures pour une prestation
     */
    getApplicationsForService(
      serviceId: string,
      page?: number,
      limit?: number
    ): Promise<{
      applications: ApplicationModel[];
      hasMore: boolean;
    }>;
  
    /**
     * Récupère les candidatures d'un modèle
     */
    getModelApplications(
      modelId: string,
      status?: ApplicationStatus[],
      page?: number,
      limit?: number
    ): Promise<{
      applications: ApplicationModel[];
      hasMore: boolean;
    }>;
  
    /**
     * Récupère les candidatures pour les services d'un professionnel
     */
    getProfessionalApplications(
      professionalId: string,
      status?: ApplicationStatus[],
      page?: number,
      limit?: number
    ): Promise<{
      applications: ApplicationModel[];
      hasMore: boolean;
    }>;
  
    /**
     * Crée une nouvelle candidature
     */
    createApplication(
      applicationData: Omit<ApplicationModel, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<string>;
  
    /**
     * Met à jour une candidature
     */
    updateApplication(
      applicationId: string,
      applicationData: Partial<ApplicationModel>
    ): Promise<void>;
  
    /**
     * Supprime une candidature
     */
    deleteApplication(applicationId: string): Promise<void>;
  
    /**
     * Télécharge des photos pour une candidature
     */
    uploadApplicationPhotos(
      applicationId: string,
      files: Blob[]
    ): Promise<string[]>;
  
    /**
     * Met à jour le statut d'une candidature
     */
    updateApplicationStatus(
      applicationId: string,
      status: ApplicationStatus,
      rejectionReason?: string
    ): Promise<void>;
  
    /**
     * Marque les messages d'une candidature comme lus
     */
    markMessagesAsRead(applicationId: string): Promise<void>;
  
    /**
     * Souscrit aux changements d'une candidature
     */
    subscribeToApplicationChanges(
      applicationId: string,
      callback: (application: ApplicationModel | null) => void
    ): Unsubscribe;
  
    /**
     * Souscrit aux changements des candidatures d'un modèle
     */
    subscribeToModelApplicationsChanges(
      modelId: string,
      callback: (applications: ApplicationModel[]) => void
    ): Unsubscribe;
  
    /**
     * Souscrit aux changements des candidatures pour les services d'un professionnel
     */
    subscribeToProfessionalApplicationsChanges(
      professionalId: string,
      callback: (applications: ApplicationModel[]) => void
    ): Unsubscribe;
  }
  
  export class ApplicationRepositoryImpl implements ApplicationRepository {
    private readonly APPLICATIONS_COLLECTION = 'applications';
    private readonly STORAGE_APPLICATION_PHOTOS_PATH = 'application-photos';
  
    async getApplicationById(applicationId: string): Promise<ApplicationModel | null> {
      try {
        const application = await getDocumentById<ApplicationModel>(
          this.APPLICATIONS_COLLECTION,
          applicationId
        );
        
        if (!application) return null;
        
        // Convertir les timestamps en Date
        if (application.createdAt) {
          application.createdAt = new Date(application.createdAt);
        }
        if (application.updatedAt) {
          application.updatedAt = new Date(application.updatedAt);
        }
        if (application.expiredAt) {
          application.expiredAt = new Date(application.expiredAt);
        }
        
        return application;
      } catch (error) {
        console.error('Error in getApplicationById:', error);
        throw error;
      }
    }
  
    async getApplicationsForService(
      serviceId: string,
      page: number = 1,
      limit: number = 10
    ): Promise<{
      applications: ApplicationModel[];
      hasMore: boolean;
    }> {
      try {
        const result = await getDocuments<ApplicationModel>(
          this.APPLICATIONS_COLLECTION,
          [
            {
              field: 'serviceId',
              operator: '==',
              value: serviceId
            }
          ],
          { field: 'createdAt', direction: 'desc' },
          page,
          limit
        );
        
        // Convertir les timestamps en Date pour chaque application
        const applications = result.data.map(application => {
          if (application.createdAt) {
            application.createdAt = new Date(application.createdAt);
          }
          if (application.updatedAt) {
            application.updatedAt = new Date(application.updatedAt);
          }
          if (application.expiredAt) {
            application.expiredAt = new Date(application.expiredAt);
          }
          return application;
        });
        
        return {
          applications,
          hasMore: result.lastDoc !== null
        };
      } catch (error) {
        console.error('Error in getApplicationsForService:', error);
        throw error;
      }
    }
  
    async getModelApplications(
      modelId: string,
      status: ApplicationStatus[] = [
        ApplicationStatus.PENDING,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.COMPLETED
      ],
      page: number = 1,
      limit: number = 10
    ): Promise<{
      applications: ApplicationModel[];
      hasMore: boolean;
    }> {
      try {
        const filters = [
          {
            field: 'modelId',
            operator: '==',
            value: modelId
          }
        ];
        
        // Ajouter le filtre de statut si spécifié
        if (status && status.length > 0) {
          filters.push({
            field: 'status',
            operator: 'in',
            value: status
          });
        }
        
        const result = await getDocuments<ApplicationModel>(
          this.APPLICATIONS_COLLECTION,
          filters,
          { field: 'createdAt', direction: 'desc' },
          page,
          limit
        );
        
        // Convertir les timestamps en Date pour chaque application
        const applications = result.data.map(application => {
          if (application.createdAt) {
            application.createdAt = new Date(application.createdAt);
          }
          if (application.updatedAt) {
            application.updatedAt = new Date(application.updatedAt);
          }
          if (application.expiredAt) {
            application.expiredAt = new Date(application.expiredAt);
          }
          return application;
        });
        
        return {
          applications,
          hasMore: result.lastDoc !== null
        };
      } catch (error) {
        console.error('Error in getModelApplications:', error);
        throw error;
      }
    }
  
    async getProfessionalApplications(
      professionalId: string,
      status: ApplicationStatus[] = [
        ApplicationStatus.PENDING,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.COMPLETED
      ],
      page: number = 1,
      limit: number = 10
    ): Promise<{
      applications: ApplicationModel[];
      hasMore: boolean;
    }> {
      try {
        const filters = [
          {
            field: 'professionalId',
            operator: '==',
            value: professionalId
          }
        ];
        
        // Ajouter le filtre de statut si spécifié
        if (status && status.length > 0) {
          filters.push({
            field: 'status',
            operator: 'in',
            value: status
          });
        }
        
        const result = await getDocuments<ApplicationModel>(
          this.APPLICATIONS_COLLECTION,
          filters,
          { field: 'createdAt', direction: 'desc' },
          page,
          limit
        );
        
        // Convertir les timestamps en Date pour chaque application
        const applications = result.data.map(application => {
          if (application.createdAt) {
            application.createdAt = new Date(application.createdAt);
          }
          if (application.updatedAt) {
            application.updatedAt = new Date(application.updatedAt);
          }
          if (application.expiredAt) {
            application.expiredAt = new Date(application.expiredAt);
          }
          return application;
        });
        
        return {
          applications,
          hasMore: result.lastDoc !== null
        };
      } catch (error) {
        console.error('Error in getProfessionalApplications:', error);
        throw error;
      }
    }
  
    async createApplication(
      applicationData: Omit<ApplicationModel, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<string> {
      try {
        // Calculer la date d'expiration automatique (par défaut: 7 jours)
        const expiredAt = applicationData.expiredAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        const applicationId = await addDocument(this.APPLICATIONS_COLLECTION, {
          ...applicationData,
          status: ApplicationStatus.PENDING,
          hasUnreadMessages: false,
          expiredAt
        });
        
        return applicationId;
      } catch (error) {
        console.error('Error in createApplication:', error);
        throw error;
      }
    }
  
    async updateApplication(
      applicationId: string,
      applicationData: Partial<ApplicationModel>
    ): Promise<void> {
      try {
        await updateDocument(this.APPLICATIONS_COLLECTION, applicationId, applicationData);
      } catch (error) {
        console.error('Error in updateApplication:', error);
        throw error;
      }
    }
  
    async deleteApplication(applicationId: string): Promise<void> {
      try {
        await deleteDocument(this.APPLICATIONS_COLLECTION, applicationId);
      } catch (error) {
        console.error('Error in deleteApplication:', error);
        throw error;
      }
    }
  
    async uploadApplicationPhotos(
      applicationId: string,
      files: Blob[]
    ): Promise<string[]> {
      try {
        const filesWithPaths = files.map((file, index) => ({
          file,
          path: `${this.STORAGE_APPLICATION_PHOTOS_PATH}/${applicationId}/photo-${index}-${Date.now()}.jpg`
        }));
        
        const downloadURLs = await uploadMultipleFiles(filesWithPaths);
        
        // Récupérer la candidature actuelle
        const application = await this.getApplicationById(applicationId);
        
        if (application) {
          // Mettre à jour la liste des photos
          const updatedPhotos = [...application.photos || [], ...downloadURLs];
          
          await this.updateApplication(applicationId, { 
            photos: updatedPhotos 
          });
        }
        
        return downloadURLs;
      } catch (error) {
        console.error('Error in uploadApplicationPhotos:', error);
        throw error;
      }
    }
  
    async updateApplicationStatus(
      applicationId: string,
      status: ApplicationStatus,
      rejectionReason?: string
    ): Promise<void> {
      try {
        const updateData: Partial<ApplicationModel> = { status };
        
        if (status === ApplicationStatus.REJECTED && rejectionReason) {
          updateData.rejectionReason = rejectionReason;
        }
        
        await this.updateApplication(applicationId, updateData);
      } catch (error) {
        console.error('Error in updateApplicationStatus:', error);
        throw error;
      }
    }
  
    async markMessagesAsRead(applicationId: string): Promise<void> {
      try {
        await this.updateApplication(applicationId, {
          hasUnreadMessages: false
        });
      } catch (error) {
        console.error('Error in markMessagesAsRead:', error);
        throw error;
      }
    }
  
    subscribeToApplicationChanges(
      applicationId: string,
      callback: (application: ApplicationModel | null) => void
    ): Unsubscribe {
      return subscribeToDocument<ApplicationModel>(
        this.APPLICATIONS_COLLECTION,
        applicationId,
        (application) => {
          if (application) {
            // Convertir les timestamps en Date
            if (application.createdAt) {
              application.createdAt = new Date(application.createdAt);
            }
            if (application.updatedAt) {
              application.updatedAt = new Date(application.updatedAt);
            }
            if (application.expiredAt) {
              application.expiredAt = new Date(application.expiredAt);
            }
          }
          
          callback(application);
        }
      );
    }
  
    subscribeToModelApplicationsChanges(
      modelId: string,
      callback: (applications: ApplicationModel[]) => void
    ): Unsubscribe {
      return subscribeToCollection<ApplicationModel>(
        this.APPLICATIONS_COLLECTION,
        (applications) => {
          // Convertir les timestamps en Date pour chaque application
          const formattedApplications = applications.map(application => {
            if (application.createdAt) {
              application.createdAt = new Date(application.createdAt);
            }
            if (application.updatedAt) {
              application.updatedAt = new Date(application.updatedAt);
            }
            if (application.expiredAt) {
              application.expiredAt = new Date(application.expiredAt);
            }
            return application;
          });
          
          callback(formattedApplications);
        },
        [
          {
            field: 'modelId',
            operator: '==',
            value: modelId
          }
        ],
        { field: 'createdAt', direction: 'desc' },
        50 // Limite de 50 candidatures
      );
    }
  
    subscribeToProfessionalApplicationsChanges(
      professionalId: string,
      callback: (applications: ApplicationModel[]) => void
    ): Unsubscribe {
      return subscribeToCollection<ApplicationModel>(
        this.APPLICATIONS_COLLECTION,
        (applications) => {
          // Convertir les timestamps en Date pour chaque application
          const formattedApplications = applications.map(application => {
            if (application.createdAt) {
              application.createdAt = new Date(application.createdAt);
            }
            if (application.updatedAt) {
              application.updatedAt = new Date(application.updatedAt);
            }
            if (application.expiredAt) {
              application.expiredAt = new Date(application.expiredAt);
            }
            return application;
          });
          
          callback(formattedApplications);
        },
        [
          {
            field: 'professionalId',
            operator: '==',
            value: professionalId
          }
        ],
        { field: 'createdAt', direction: 'desc' },
        50 // Limite de 50 candidatures
      );
    }
  }