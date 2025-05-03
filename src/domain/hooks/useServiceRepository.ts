// src/domain/hooks/useServiceRepository.ts
import { useMemo } from 'react';
import { ServiceRepository, ServiceRepositoryImpl } from '../repositories/ServiceRepository';

/**
 * Hook pour accéder au repository de services
 * @returns Instance du repository de services
 */
export const useServiceRepository = (): ServiceRepository => {
  // Mémoiser l'instance du repository pour éviter les re-rendus
  const serviceRepository = useMemo(() => new ServiceRepositoryImpl(), []);
  
  return serviceRepository;
};