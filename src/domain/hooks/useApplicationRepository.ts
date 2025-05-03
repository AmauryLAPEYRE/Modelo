import { useMemo } from 'react';
import { ApplicationRepository, ApplicationRepositoryImpl } from '../repositories/ApplicationRepository';

/**
 * Hook pour accéder au repository de candidatures
 * @returns Instance du repository de candidatures
 */
export const useApplicationRepository = (): ApplicationRepository => {
  // Mémoiser l'instance du repository pour éviter les re-rendus
  const applicationRepository = useMemo(() => new ApplicationRepositoryImpl(), []);
  
  return applicationRepository;
};