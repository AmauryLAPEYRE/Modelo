import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  city: string | null;
}

interface UseLocationProps {
  onLocationReceived?: (location: LocationData) => void;
  autoRequest?: boolean;
}

/**
 * Hook pour gérer la géolocalisation
 */
export const useLocation = ({
  onLocationReceived,
  autoRequest = false
}: UseLocationProps = {}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fonction pour demander et récupérer la localisation
  const requestLocation = async (): Promise<LocationData | null> => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // Demander la permission d'accéder à la localisation
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('La permission d\'accéder à la localisation a été refusée');
        setLoading(false);
        return null;
      }

      // Récupérer la position actuelle
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      // Récupérer les informations d'adresse à partir des coordonnées
      const addressInfo = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });

      // Extraire la ville des informations d'adresse
      const city = addressInfo.length > 0 ? addressInfo[0].city : null;

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        city
      };

      setLocation(locationData);
      
      // Appeler le callback si fourni
      if (onLocationReceived) {
        onLocationReceived(locationData);
      }

      setLoading(false);
      return locationData;
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Erreur lors de la récupération de la localisation');
      setLoading(false);
      return null;
    }
  };

  // Si autoRequest est true, demander automatiquement la localisation au montage
  useEffect(() => {
    if (autoRequest) {
      requestLocation();
    }
  }, [autoRequest]);

  return {
    location,
    errorMsg,
    loading,
    requestLocation
  };
};