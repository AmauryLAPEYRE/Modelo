import {
    getDocumentById,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocuments
  } from '../../services/firebase/firestore';
  import { CategoryModel } from '../entities/CategoryModel';
  
  export interface CategoryRepository {
    /**
     * Récupère une catégorie par son ID
     */
    getCategoryById(categoryId: string): Promise<CategoryModel | null>;
  
    /**
     * Récupère toutes les catégories actives
     */
    getCategories(): Promise<CategoryModel[]>;
  
    /**
     * Crée une nouvelle catégorie
     */
    createCategory(
      categoryData: Omit<CategoryModel, 'id'>
    ): Promise<string>;
  
    /**
     * Met à jour une catégorie
     */
    updateCategory(
      categoryId: string,
      categoryData: Partial<CategoryModel>
    ): Promise<void>;
  
    /**
     * Supprime une catégorie
     */
    deleteCategory(categoryId: string): Promise<void>;
  }
  
  export class CategoryRepositoryImpl implements CategoryRepository {
    private readonly CATEGORIES_COLLECTION = 'categories';
  
    async getCategoryById(categoryId: string): Promise<CategoryModel | null> {
      try {
        const category = await getDocumentById<CategoryModel>(
          this.CATEGORIES_COLLECTION,
          categoryId
        );
        
        return category;
      } catch (error) {
        console.error('Error in getCategoryById:', error);
        throw error;
      }
    }
  
    async getCategories(): Promise<CategoryModel[]> {
      try {
        const result = await getDocuments<CategoryModel>(
          this.CATEGORIES_COLLECTION,
          [
            {
              field: 'isActive',
              operator: '==',
              value: true
            }
          ],
          { field: 'order', direction: 'asc' } // Trier par ordre
        );
        
        return result.data;
      } catch (error) {
        console.error('Error in getCategories:', error);
        throw error;
      }
    }
  
    async createCategory(
      categoryData: Omit<CategoryModel, 'id'>
    ): Promise<string> {
      try {
        const categoryId = await addDocument(this.CATEGORIES_COLLECTION, categoryData);
        
        return categoryId;
      } catch (error) {
        console.error('Error in createCategory:', error);
        throw error;
      }
    }
  
    async updateCategory(
      categoryId: string,
      categoryData: Partial<CategoryModel>
    ): Promise<void> {
      try {
        await updateDocument(this.CATEGORIES_COLLECTION, categoryId, categoryData);
      } catch (error) {
        console.error('Error in updateCategory:', error);
        throw error;
      }
    }
  
    async deleteCategory(categoryId: string): Promise<void> {
      try {
        // Plutôt que de supprimer, marquer comme inactif
        await updateDocument(this.CATEGORIES_COLLECTION, categoryId, {
          isActive: false
        });
      } catch (error) {
        console.error('Error in deleteCategory:', error);
        throw error;
      }
    }
  }