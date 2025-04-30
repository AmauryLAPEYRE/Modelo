import {
    getDocumentById,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocuments
  } from '../../services/firebase/firestore';
  import { RatingModel } from '../entities/RatingModel';
  
  export interface RatingRepository {
    /**
     * Récupère une évaluation par son ID
     */
    getRatingById(ratingId: string): Promise<RatingModel | null>;
  
    /**
     * Récupère les évaluations pour un utilisateur
     */
    getUserRatings(
      userId: string,
      page?: number,
      limit?: number
    ): Promise<{
      ratings: RatingModel[];
      hasMore: boolean;
    }>;
  
    /**
     * Récupère les évaluations pour une prestation
     */
    getServiceRatings(
      serviceId: string,
      page?: number,
      limit?: number
    ): Promise<{
      ratings: RatingModel[];
      hasMore: boolean;
    }>;
  
    /**
     * Vérifie si un utilisateur a déjà évalué une prestation
     */
    hasUserRatedService(
      raterUserId: string,
      serviceId: string
    ): Promise<boolean>;
  
    /**
     * Crée une nouvelle évaluation
     */
    createRating(
      ratingData: Omit<RatingModel, 'id' | 'createdAt'>
    ): Promise<string>;
  
    /**
     * Met à jour une évaluation
     */
    updateRating(
      ratingId: string,
      ratingData: Partial<RatingModel>
    ): Promise<void>;
  
    /**
     * Supprime une évaluation
     */
    deleteRating(ratingId: string): Promise<void>;
  
    /**
     * Calcule la note moyenne d'un utilisateur
     */
    calculateUserAverageRating(userId: string): Promise<{
      average: number;
      count: number;
    }>;
  }
  
  export class RatingRepositoryImpl implements RatingRepository {
    private readonly RATINGS_COLLECTION = 'ratings';
  
    async getRatingById(ratingId: string): Promise<RatingModel | null> {
      try {
        const rating = await getDocumentById<RatingModel>(
          this.RATINGS_COLLECTION,
          ratingId
        );
        
        if (!rating) return null;
        
        // Convertir les timestamps en Date
        if (rating.createdAt) {
          rating.createdAt = new Date(rating.createdAt);
        }
        if (rating.updatedAt) {
          rating.updatedAt = new Date(rating.updatedAt);
        }
        
        return rating;
      } catch (error) {
        console.error('Error in getRatingById:', error);
        throw error;
      }
    }
  
    async getUserRatings(
      userId: string,
      page: number = 1,
      limit: number = 10
    ): Promise<{
      ratings: RatingModel[];
      hasMore: boolean;
    }> {
      try {
        const result = await getDocuments<RatingModel>(
          this.RATINGS_COLLECTION,
          [
            {
              field: 'ratedUserId',
              operator: '==',
              value: userId
            },
            {
              field: 'isPublic',
              operator: '==',
              value: true
            }
          ],
          { field: 'createdAt', direction: 'desc' },
          page,
          limit
        );
        
        // Convertir les timestamps en Date pour chaque évaluation
        const ratings = result.data.map(rating => {
          if (rating.createdAt) {
            rating.createdAt = new Date(rating.createdAt);
          }
          if (rating.updatedAt) {
            rating.updatedAt = new Date(rating.updatedAt);
          }
          return rating;
        });
        
        return {
          ratings,
          hasMore: result.lastDoc !== null
        };
      } catch (error) {
        console.error('Error in getUserRatings:', error);
        throw error;
      }
    }
  
    async getServiceRatings(
      serviceId: string,
      page: number = 1,
      limit: number = 10
    ): Promise<{
      ratings: RatingModel[];
      hasMore: boolean;
    }> {
      try {
        const result = await getDocuments<RatingModel>(
          this.RATINGS_COLLECTION,
          [
            {
              field: 'serviceId',
              operator: '==',
              value: serviceId
            },
            {
              field: 'isPublic',
              operator: '==',
              value: true
            }
          ],
          { field: 'createdAt', direction: 'desc' },
          page,
          limit
        );
        
        // Convertir les timestamps en Date pour chaque évaluation
        const ratings = result.data.map(rating => {
          if (rating.createdAt) {
            rating.createdAt = new Date(rating.createdAt);
          }
          if (rating.updatedAt) {
            rating.updatedAt = new Date(rating.updatedAt);
          }
          return rating;
        });
        
        return {
          ratings,
          hasMore: result.lastDoc !== null
        };
      } catch (error) {
        console.error('Error in getServiceRatings:', error);
        throw error;
      }
    }
  
    async hasUserRatedService(
      raterUserId: string,
      serviceId: string
    ): Promise<boolean> {
      try {
        const result = await getDocuments<RatingModel>(
          this.RATINGS_COLLECTION,
          [
            {
              field: 'raterUserId',
              operator: '==',
              value: raterUserId
            },
            {
              field: 'serviceId',
              operator: '==',
              value: serviceId
            }
          ],
          undefined,
          1,
          1
        );
        
        return result.data.length > 0;
      } catch (error) {
        console.error('Error in hasUserRatedService:', error);
        throw error;
      }
    }
  
    async createRating(
      ratingData: Omit<RatingModel, 'id' | 'createdAt'>
    ): Promise<string> {
      try {
        const ratingId = await addDocument(this.RATINGS_COLLECTION, ratingData);
        
        return ratingId;
      } catch (error) {
        console.error('Error in createRating:', error);
        throw error;
      }
    }
  
    async updateRating(
      ratingId: string,
      ratingData: Partial<RatingModel>
    ): Promise<void> {
      try {
        await updateDocument(this.RATINGS_COLLECTION, ratingId, ratingData);
      } catch (error) {
        console.error('Error in updateRating:', error);
        throw error;
      }
    }
  
    async deleteRating(ratingId: string): Promise<void> {
      try {
        await deleteDocument(this.RATINGS_COLLECTION, ratingId);
      } catch (error) {
        console.error('Error in deleteRating:', error);
        throw error;
      }
    }
  
    async calculateUserAverageRating(userId: string): Promise<{
      average: number;
      count: number;
    }> {
      try {
        // Récupérer toutes les évaluations pour cet utilisateur
        const result = await getDocuments<RatingModel>(
          this.RATINGS_COLLECTION,
          [
            {
              field: 'ratedUserId',
              operator: '==',
              value: userId
            }
          ],
          undefined,
          1,
          1000 // Limite de 1000 évaluations
        );
        
        const ratings = result.data;
        
        if (ratings.length === 0) {
          return {
            average: 0,
            count: 0
          };
        }
        
        // Calculer la moyenne
        const sum = ratings.reduce((total, rating) => total + rating.score, 0);
        const average = sum / ratings.length;
        
        return {
          average: parseFloat(average.toFixed(1)), // Arrondir à 1 décimale
          count: ratings.length
        };
      } catch (error) {
        console.error('Error in calculateUserAverageRating:', error);
        throw error;
      }
    }
  }