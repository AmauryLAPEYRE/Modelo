import { useMemo } from 'react';
import { CategoryRepository, CategoryRepositoryImpl } from '../repositories/CategoryRepository';

/**
 * Hook pour accéder au repository de catégories
 * @returns Instance du repository de catégories
 */
export const useCategoryRepository = (): CategoryRepository => {
  // Mémoiser l'instance du repository pour éviter les re-rendus
  const categoryRepository = useMemo(() => new CategoryRepositoryImpl(), []);
  
  return categoryRepository;
};