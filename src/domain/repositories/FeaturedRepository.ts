import {
    getDocumentById,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocuments
  } from '../../services/firebase/firestore';
  import { uploadFile } from '../../services/firebase/storage';
  import { FeaturedBannerModel } from '../entities/FeaturedBannerModel';
  
  export interface FeaturedRepository {
    /**
     * Récupère une bannière par son ID
     */
    getFeaturedBannerById(bannerId: string): Promise<FeaturedBannerModel | null>;
  
    /**
     * Récupère la bannière mise en avant actuellement
     */
    getFeaturedBanner(): Promise<FeaturedBannerModel | null>;
  
    /**
     * Récupère toutes les bannières actives
     */
    getAllActiveBanners(): Promise<FeaturedBannerModel[]>;
  
    /**
     * Crée une nouvelle bannière
     */
    createBanner(
      bannerData: Omit<FeaturedBannerModel, 'id'>
    ): Promise<string>;
  
    /**
     * Met à jour une bannière
     */
    updateBanner(
      bannerId: string,
      bannerData: Partial<FeaturedBannerModel>
    ): Promise<void>;
  
    /**
     * Supprime une bannière
     */
    deleteBanner(bannerId: string): Promise<void>;
  
    /**
     * Télécharge l'image d'une bannière
     */
    uploadBannerImage(
      bannerId: string,
      file: Blob
    ): Promise<string>;
  }
  
  export class FeaturedRepositoryImpl implements FeaturedRepository {
    private readonly BANNERS_COLLECTION = 'featured_banners';
    private readonly STORAGE_BANNER_IMAGES_PATH = 'banner-images';
  
    async getFeaturedBannerById(bannerId: string): Promise<FeaturedBannerModel | null> {
      try {
        const banner = await getDocumentById<FeaturedBannerModel>(
          this.BANNERS_COLLECTION,
          bannerId
        );
        
        if (!banner) return null;
        
        // Convertir les timestamps en Date
        if (banner.startDate) {
          banner.startDate = new Date(banner.startDate);
        }
        if (banner.endDate) {
          banner.endDate = new Date(banner.endDate);
        }
        
        return banner;
      } catch (error) {
        console.error('Error in getFeaturedBannerById:', error);
        throw error;
      }
    }
  
    async getFeaturedBanner(): Promise<FeaturedBannerModel | null> {
      try {
        const currentDate = new Date();
        
        // Récupérer les bannières actives dont la période est valide
        const result = await getDocuments<FeaturedBannerModel>(
          this.BANNERS_COLLECTION,
          [
            {
              field: 'isActive',
              operator: '==',
              value: true
            },
            {
              field: 'startDate',
              operator: '<=',
              value: currentDate
            },
            {
              field: 'endDate',
              operator: '>=',
              value: currentDate
            }
          ],
          { field: 'priority', direction: 'desc' }, // La plus haute priorité d'abord
          1, // Seulement une bannière
          1
        );
        
        if (result.data.length === 0) {
          return null;
        }
        
        const banner = result.data[0];
        
        // Convertir les timestamps en Date
        if (banner.startDate) {
          banner.startDate = new Date(banner.startDate);
        }
        if (banner.endDate) {
          banner.endDate = new Date(banner.endDate);
        }
        
        return banner;
      } catch (error) {
        console.error('Error in getFeaturedBanner:', error);
        throw error;
      }
    }
  
    async getAllActiveBanners(): Promise<FeaturedBannerModel[]> {
      try {
        const currentDate = new Date();
        
        // Récupérer toutes les bannières actives dont la période est valide
        const result = await getDocuments<FeaturedBannerModel>(
          this.BANNERS_COLLECTION,
          [
            {
              field: 'isActive',
              operator: '==',
              value: true
            },
            {
              field: 'startDate',
              operator: '<=',
              value: currentDate
            },
            {
              field: 'endDate',
              operator: '>=',
              value: currentDate
            }
          ],
          { field: 'priority', direction: 'desc' } // Triées par priorité
        );
        
        // Convertir les timestamps en Date pour chaque bannière
        const banners = result.data.map(banner => {
          if (banner.startDate) {
            banner.startDate = new Date(banner.startDate);
          }
          if (banner.endDate) {
            banner.endDate = new Date(banner.endDate);
          }
          return banner;
        });
        
        return banners;
      } catch (error) {
        console.error('Error in getAllActiveBanners:', error);
        throw error;
      }
    }
  
    async createBanner(
      bannerData: Omit<FeaturedBannerModel, 'id'>
    ): Promise<string> {
      try {
        const bannerId = await addDocument(this.BANNERS_COLLECTION, bannerData);
        
        return bannerId;
      } catch (error) {
        console.error('Error in createBanner:', error);
        throw error;
      }
    }
  
    async updateBanner(
      bannerId: string,
      bannerData: Partial<FeaturedBannerModel>
    ): Promise<void> {
      try {
        await updateDocument(this.BANNERS_COLLECTION, bannerId, bannerData);
      } catch (error) {
        console.error('Error in updateBanner:', error);
        throw error;
      }
    }
  
    async deleteBanner(bannerId: string): Promise<void> {
      try {
        await deleteDocument(this.BANNERS_COLLECTION, bannerId);
      } catch (error) {
        console.error('Error in deleteBanner:', error);
        throw error;
      }
    }
  
    async uploadBannerImage(
      bannerId: string,
      file: Blob
    ): Promise<string> {
      try {
        const path = `${this.STORAGE_BANNER_IMAGES_PATH}/${bannerId}/banner-${Date.now()}.jpg`;
        const downloadURL = await uploadFile(file, path);
        
        // Mettre à jour l'URL de l'image dans Firestore
        await this.updateBanner(bannerId, { imageUrl: downloadURL });
        
        return downloadURL;
      } catch (error) {
        console.error('Error in uploadBannerImage:', error);
        throw error;
      }
    }
  }