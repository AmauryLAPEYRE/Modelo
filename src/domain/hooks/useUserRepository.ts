import { useMemo } from 'react';
import { UserRepository, UserRepositoryImpl } from '../repositories/userRepository';

/**
 * Hook pour accéder au repository utilisateur
 * @returns Instance du repository utilisateur
 */
export const useUserRepository = (): UserRepository => {
  // Mémoiser l'instance du repository pour éviter les re-rendus
  const userRepository = useMemo(() => new UserRepositoryImpl(), []);
  
  return userRepository;
};