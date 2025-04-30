import { useState, useEffect } from 'react';

/**
 * Hook pour débouncer une valeur
 * @param value Valeur à débouncer
 * @param delay Délai en ms (défaut: 500ms)
 * @returns Valeur debouncée
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Définir un timer pour mettre à jour la valeur debouncée après le délai
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyer le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};