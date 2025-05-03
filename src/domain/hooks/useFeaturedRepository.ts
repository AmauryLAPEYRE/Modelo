
import { useMemo } from 'react';
import { FeaturedRepository, FeaturedRepositoryImpl } from '../repositories/FeaturedRepository';

/**
 * Hook pour accéder au repository de bannières mises en avant
 * @returns Instance du repository de bannières
 */
export const useFeaturedRepository = (): FeaturedRepository => {
  // Mémoiser l'instance du repository pour éviter les re-rendus
  const featuredRepository = useMemo(() => new FeaturedRepositoryImpl(), []);
  
  return featuredRepository;
};