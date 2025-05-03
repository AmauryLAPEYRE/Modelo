import { useMemo } from 'react';
import { RatingRepository, RatingRepositoryImpl } from '../repositories/RatingRepository';

/**
 * Hook pour accéder au repository d'évaluations
 * @returns Instance du repository d'évaluations
 */
export const useRatingRepository = (): RatingRepository => {
  // Mémoiser l'instance du repository pour éviter les re-rendus
  const ratingRepository = useMemo(() => new RatingRepositoryImpl(), []);
  
  return ratingRepository;
};