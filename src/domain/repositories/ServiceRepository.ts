import {
    getDocumentById,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocuments,
    subscribeToDocument
  } from '../../services/firebase/firestore';
  import { uploadMultipleFiles, deleteMultipleFiles } from '../../services/firebase/storage';
  import { ServiceModel, ServiceStatus, ServiceType } from '../entities/ServiceModel';
  import { Unsubscribe } from 'firebase/firestore';
  
  export interface ServiceRepository {
    /**
     * Récupère une prestation par son ID
     */
    getServiceById(serviceId: string): Promise<ServiceModel | null>;
  
    /**
     * Récupère plusieurs prestations avec filtres
     */
    getServices(
      page?: number,
      limit?: number,
      filters?: {
        type?: ServiceType;
        city?: string;
        professionalId?: string;
        status?: ServiceStatus;
        isUrgent?: boolean;
      }
    ): Promise<{
      services: ServiceModel[];
      hasMore: boolean;
    }>;
  
    /**
     * Recherche de prestations avec texte libre
     */
    searchServices(
      query: string,
      page?: number,
      limit?: number
    ): Promise<{
      services: ServiceModel[];
      hasMore: boolean;
    }>;
  
    /**
     * Crée une nouvelle prestation
     */
    createService(serviceData: Omit<ServiceModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  
    /**
     * Met à jour une prestation existante
     */
    updateService(serviceId: string, serviceData: Partial<ServiceModel>): Promise<void>;
  
    /**
     * Supprime une prestation
     */
    deleteService(serviceId: string): Promise<void>;
  
    /**
     * Télécharge des images pour une prestation
     */
    uploadServiceImages(serviceId: string, files: Blob[]): Promise<string[]>;
  
    /**
     * Supprime des images d'une prestation
     */
    deleteServiceImages(serviceId: string, imageUrls: string[]): Promise<void>;
  
    /**
     * Change le statut d'une prestation
     */
    updateServiceStatus(serviceId: string, status: ServiceStatus): Promise<void>;
  
    /**
     * Souscrit aux changements d'une prestation
     */
    subscribeToServiceChanges(
      serviceId: string,
      callback: (service: ServiceModel | null) => void
    ): Unsubscribe;
  }
  
  export class ServiceRepositoryImpl implements ServiceRepository {
    private readonly SERVICES_COLLECTION = 'services';
    private readonly STORAGE_SERVICE_IMAGES_PATH = 'service-images';
  
    async getServiceById(serviceId: string): Promise<ServiceModel | null> {
      try {
        const service = await getDocumentById<ServiceModel>(this.SERVICES_COLLECTION, serviceId);
        
        if (!service) return null;
        
        // Convertir les timestamps en Date
        if (service.createdAt) {
          service.createdAt = new Date(service.createdAt);
        }
        if (service.updatedAt) {
          service.updatedAt = new Date(service.updatedAt);
        }
        if (service.expiresAt) {
          service.expiresAt = new Date(service.expiresAt);
        }
        if (service.date.startDate) {
          service.date.startDate = new Date(service.date.startDate);
        }
        if (service.date.endDate) {
          service.date.endDate = new Date(service.date.endDate);
        }
        
        return service;
      } catch (error) {
        console.error('Error in getServiceById:', error);
        throw error;
      }
    }
  
    async getServices(
      page: number = 1,
      limit: number = 10,
      filters?: {
        type?: ServiceType;
        city?: string;
        professionalId?: string;
        status?: ServiceStatus;
        isUrgent?: boolean;
      }
    ): Promise<{
      services: ServiceModel[];
      hasMore: boolean;
    }> {
      try {
        const firebaseFilters = [];
        
        // Convertir les filtres en format Firebase
        if (filters) {
          if (filters.type) {
            firebaseFilters.push({
              field: 'type',
              operator: 'array-contains',
              value: filters.type
            });
          }
          
          if (filters.city) {
            firebaseFilters.push({
              field: 'location.city',
              operator: '==',
              value: filters.city
            });
          }
          
          if (filters.professionalId) {
            firebaseFilters.push({
              field: 'professionalId',
              operator: '==',
              value: filters.professionalId
            });
          }
          
          if (filters.status) {
            firebaseFilters.push({
              field: 'status',
              operator: '==',
              value: filters.status
            });
          }
          
          if (filters.isUrgent) {
            firebaseFilters.push({
              field: 'isUrgent',
              operator: '==',
              value: filters.isUrgent
            });
          }
        }
        
        // Par défaut, ne pas afficher les services expirés ou annulés
        if (!filters?.status) {
          firebaseFilters.push({
            field: 'status',
            operator: 'in',
            value: [ServiceStatus.ACTIVE, ServiceStatus.DRAFT]
          });
        }
        
        const result = await getDocuments<ServiceModel>(
          this.SERVICES_COLLECTION,
          firebaseFilters.length > 0 ? firebaseFilters : undefined,
          { field: 'createdAt', direction: 'desc' },
          page,
          limit
        );
        
        // Convertir les timestamps en Date pour chaque service
        const services = result.data.map(service => {
          if (service.createdAt) {
            service.createdAt = new Date(service.createdAt);
          }
          if (service.updatedAt) {
            service.updatedAt = new Date(service.updatedAt);
          }
          if (service.expiresAt) {
            service.expiresAt = new Date(service.expiresAt);
          }
          if (service.date.startDate) {
            service.date.startDate = new Date(service.date.startDate);
          }
          if (service.date.endDate) {
            service.date.endDate = new Date(service.date.endDate);
          }
          return service;
        });
        
        return {
          services,
          hasMore: result.lastDoc !== null
        };
      } catch (error) {
        console.error('Error in getServices:', error);
        throw error;
      }
    }
  
    async searchServices(
      query: string,
      page: number = 1,
      limit: number = 10
    ): Promise<{
      services: ServiceModel[];
      hasMore: boolean;
    }> {
      try {
        // Note: Firebase ne supporte pas nativement la recherche textuelle
        // Cette implémentation est simplifiée et pourrait nécessiter Algolia ou une solution similaire
        
        // Pour l'instant, nous récupérons tous les services et filtrons côté client
        const result = await getDocuments<ServiceModel>(
          this.SERVICES_COLLECTION,
          [
            {
              field: 'status',
              operator: '==',
              value: ServiceStatus.ACTIVE
            }
          ],
          { field: 'createdAt', direction: 'desc' },
          page,
          limit
        );
        
        // Filtrer les services contenant le terme de recherche dans le titre ou la description
        const queryLower = query.toLowerCase();
        const filteredServices = result.data.filter(service => 
          service.title.toLowerCase().includes(queryLower) || 
          service.description.toLowerCase().includes(queryLower)
        );
        
        // Convertir les timestamps en Date pour chaque service
        const services = filteredServices.map(service => {
          if (service.createdAt) {
            service.createdAt = new Date(service.createdAt);
          }
          if (service.updatedAt) {
            service.updatedAt = new Date(service.updatedAt);
          }
          if (service.expiresAt) {
            service.expiresAt = new Date(service.expiresAt);
          }
          if (service.date.startDate) {
            service.date.startDate = new Date(service.date.startDate);
          }
          if (service.date.endDate) {
            service.date.endDate = new Date(service.date.endDate);
          }
          return service;
        });
        
        return {
          services,
          hasMore: result.lastDoc !== null && services.length >= limit
        };
      } catch (error) {
        console.error('Error in searchServices:', error);
        throw error;
      }
    }
  
    async createService(serviceData: Omit<ServiceModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
      try {
        // Calculer la date d'expiration automatique (par défaut: 30 jours après la date de début)
        const expiresAt = serviceData.expiresAt || new Date(serviceData.date.startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const serviceId = await addDocument(this.SERVICES_COLLECTION, {
          ...serviceData,
          expiresAt,
          applicationCount: 0
        });
        
        return serviceId;
      } catch (error) {
        console.error('Error in createService:', error);
        throw error;
      }
    }
  
    async updateService(serviceId: string, serviceData: Partial<ServiceModel>): Promise<void> {
      try {
        await updateDocument(this.SERVICES_COLLECTION, serviceId, serviceData);
      } catch (error) {
        console.error('Error in updateService:', error);
        throw error;
      }
    }
  
    async deleteService(serviceId: string): Promise<void> {
      try {
        // Récupérer le service pour obtenir les URLs des images
        const service = await this.getServiceById(serviceId);
        
        if (service && service.images && service.images.length > 0) {
          // Supprimer les images du Storage
          await this.deleteServiceImages(serviceId, service.images);
        }
        
        // Supprimer le document
        await deleteDocument(this.SERVICES_COLLECTION, serviceId);
      } catch (error) {
        console.error('Error in deleteService:', error);
        throw error;
      }
    }
  
    async uploadServiceImages(serviceId: string, files: Blob[]): Promise<string[]> {
      try {
        const filesWithPaths = files.map((file, index) => ({
          file,
          path: `${this.STORAGE_SERVICE_IMAGES_PATH}/${serviceId}/image-${index}-${Date.now()}.jpg`
        }));
        
        const downloadURLs = await uploadMultipleFiles(filesWithPaths);
        
        // Récupérer le service actuel
        const service = await this.getServiceById(serviceId);
        
        if (service) {
          // Mettre à jour la liste des images
          const updatedImages = [...service.images || [], ...downloadURLs];
          
          await this.updateService(serviceId, { 
            images: updatedImages 
          });
        }
        
        return downloadURLs;
      } catch (error) {
        console.error('Error in uploadServiceImages:', error);
        throw error;
      }
    }
  
    async deleteServiceImages(serviceId: string, imageUrls: string[]): Promise<void> {
      try {
        // Récupérer les chemins de stockage à partir des URLs
        const storagePaths = imageUrls.map(url => {
          const urlObj = new URL(url);
          const path = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
          return path;
        });
        
        // Supprimer les images du Storage
        await deleteMultipleFiles(storagePaths);
        
        // Mettre à jour le service pour retirer les URLs des images supprimées
        const service = await this.getServiceById(serviceId);
        
        if (service) {
          const updatedImages = service.images.filter(url => !imageUrls.includes(url));
          
          await this.updateService(serviceId, {
            images: updatedImages
          });
        }
      } catch (error) {
        console.error('Error in deleteServiceImages:', error);
        throw error;
      }
    }
  
    async updateServiceStatus(serviceId: string, status: ServiceStatus): Promise<void> {
      try {
        await this.updateService(serviceId, { status });
      } catch (error) {
        console.error('Error in updateServiceStatus:', error);
        throw error;
      }
    }
  
    subscribeToServiceChanges(
      serviceId: string,
      callback: (service: ServiceModel | null) => void
    ): Unsubscribe {
      return subscribeToDocument<ServiceModel>(this.SERVICES_COLLECTION, serviceId, (service) => {
        if (service) {
          // Convertir les timestamps en Date
          if (service.createdAt) {
            service.createdAt = new Date(service.createdAt);
          }
          if (service.updatedAt) {
            service.updatedAt = new Date(service.updatedAt);
          }
          if (service.expiresAt) {
            service.expiresAt = new Date(service.expiresAt);
          }
          if (service.date.startDate) {
            service.date.startDate = new Date(service.date.startDate);
          }
          if (service.date.endDate) {
            service.date.endDate = new Date(service.date.endDate);
          }
        }
        
        callback(service);
      });
    }
  }