import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

interface ImageAsset {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
}

interface UseMediaProps {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  allowsMultipleSelection?: boolean;
}

/**
 * Hook pour gérer la sélection et la manipulation d'images
 */
export const useMedia = ({
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8,
  allowsMultipleSelection = false
}: UseMediaProps = {}) => {
  const [media, setMedia] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Demander les permissions pour accéder à la galerie
  const requestGalleryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      setError('La permission d\'accéder à la galerie a été refusée');
      return false;
    }
    
    return true;
  };

  // Demander les permissions pour accéder à la caméra
  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      setError('La permission d\'accéder à la caméra a été refusée');
      return false;
    }
    
    return true;
  };

  // Manipuler une image pour réduire sa taille
  const processImage = async (uri: string): Promise<ImageAsset> => {
    try {
      // Redimensionner l'image pour réduire sa taille
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth, height: maxHeight } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        type: 'image/jpeg',
        fileName: `image-${Date.now()}.jpg`
      };
    } catch (err) {
      console.error('Error processing image:', err);
      throw err;
    }
  };

  // Traiter plusieurs images
  const processMultipleImages = async (results: ImagePicker.ImagePickerResult): Promise<ImageAsset[]> => {
    if (results.canceled || !results.assets) {
      return [];
    }
    
    try {
      // Traiter chaque image sélectionnée
      const processedImages = await Promise.all(
        results.assets.map(asset => processImage(asset.uri))
      );
      
      return processedImages;
    } catch (err) {
      console.error('Error processing multiple images:', err);
      setError('Erreur lors du traitement des images');
      return [];
    }
  };

  // Sélectionner des images depuis la galerie
  const pickFromGallery = async (): Promise<ImageAsset[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const hasPermission = await requestGalleryPermission();
      
      if (!hasPermission) {
        setLoading(false);
        return [];
      }
      
      const results = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection,
        quality: 1, // Garder la qualité maximale pour le moment (sera réduite lors du traitement)
        aspect: [4, 3]
      });
      
      const processedAssets = await processMultipleImages(results);
      
      setMedia(prevMedia => [...prevMedia, ...processedAssets]);
      setLoading(false);
      
      return processedAssets;
    } catch (err) {
      console.error('Error picking from gallery:', err);
      setError('Erreur lors de la sélection d\'images depuis la galerie');
      setLoading(false);
      return [];
    }
  };

  // Prendre une photo avec la caméra
  const takePhoto = async (): Promise<ImageAsset[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const hasPermission = await requestCameraPermission();
      
      if (!hasPermission) {
        setLoading(false);
        return [];
      }
      
      const results = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1, // Garder la qualité maximale pour le moment (sera réduite lors du traitement)
        aspect: [4, 3]
      });
      
      const processedAssets = await processMultipleImages(results);
      
      setMedia(prevMedia => [...prevMedia, ...processedAssets]);
      setLoading(false);
      
      return processedAssets;
    } catch (err) {
      console.error('Error taking photo:', err);
      setError('Erreur lors de la prise de photo');
      setLoading(false);
      return [];
    }
  };

  // Convertir un asset en blob pour le téléchargement
  const assetToBlob = async (asset: ImageAsset): Promise<Blob> => {
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    return blob;
  };

  // Convertir les assets en blobs pour le téléchargement
  const assetsToBlobs = async (assets: ImageAsset[] = media): Promise<Blob[]> => {
    try {
      const blobs = await Promise.all(assets.map(asset => assetToBlob(asset)));
      return blobs;
    } catch (err) {
      console.error('Error converting assets to blobs:', err);
      setError('Erreur lors de la conversion des images');
      return [];
    }
  };

  // Supprimer une image des médias sélectionnés
  const removeAsset = (index: number) => {
    setMedia(prevMedia => prevMedia.filter((_, i) => i !== index));
  };

  // Effacer tous les médias sélectionnés
  const clearMedia = () => {
    setMedia([]);
    setError(null);
  };

  return {
    media,
    loading,
    error,
    pickFromGallery,
    takePhoto,
    assetToBlob,
    assetsToBlobs,
    removeAsset,
    clearMedia
  };
};