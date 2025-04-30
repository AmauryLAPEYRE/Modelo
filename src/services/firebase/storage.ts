import { 
    ref, 
    uploadBytesResumable, 
    getDownloadURL,
    deleteObject,
    listAll,
    StorageReference,
    UploadTaskSnapshot
  } from 'firebase/storage';
  import { storage } from './config';
  
  /**
   * Télécharge un fichier vers Firebase Storage
   * @param file - Blob du fichier à télécharger
   * @param path - Chemin dans le bucket où le fichier sera stocké
   * @param progressCallback - Fonction de rappel pour suivre la progression
   * @returns URL de téléchargement du fichier
   */
  export const uploadFile = async (
    file: Blob,
    path: string,
    progressCallback?: (progress: number) => void
  ): Promise<string> => {
    try {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            // Suivi de la progression
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (progressCallback) {
              progressCallback(progress);
            }
          },
          (error) => {
            // Gestion des erreurs
            console.error('Error uploading file:', error);
            reject(error);
          },
          async () => {
            // Téléchargement terminé avec succès
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  };
  
  /**
   * Télécharge plusieurs fichiers vers Firebase Storage
   * @param files - Array de {file: Blob, path: string}
   * @param progressCallback - Fonction de rappel pour suivre la progression globale
   * @returns Array des URLs de téléchargement
   */
  export const uploadMultipleFiles = async (
    files: Array<{ file: Blob; path: string }>,
    progressCallback?: (progress: number) => void
  ): Promise<string[]> => {
    try {
      const uploadPromises = files.map((fileObj, index) => {
        return uploadFile(
          fileObj.file,
          fileObj.path,
          (progress) => {
            if (progressCallback) {
              // Calculer la progression moyenne pour tous les fichiers
              const avgProgress = (progress / files.length) + (index * (100 / files.length));
              progressCallback(avgProgress);
            }
          }
        );
      });
      
      return Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error in uploadMultipleFiles:', error);
      throw error;
    }
  };
  
  /**
   * Récupère l'URL de téléchargement d'un fichier
   * @param path - Chemin du fichier dans le bucket
   * @returns URL de téléchargement du fichier
   */
  export const getFileURL = async (path: string): Promise<string> => {
    try {
      const fileRef = ref(storage, path);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  };
  
  /**
   * Supprime un fichier de Firebase Storage
   * @param path - Chemin du fichier à supprimer
   */
  export const deleteFile = async (path: string): Promise<void> => {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };
  
  /**
   * Supprime plusieurs fichiers de Firebase Storage
   * @param paths - Array des chemins des fichiers à supprimer
   */
  export const deleteMultipleFiles = async (paths: string[]): Promise<void> => {
    try {
      const deletePromises = paths.map(path => deleteFile(path));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting multiple files:', error);
      throw error;
    }
  };
  
  /**
   * Liste tous les fichiers dans un dossier
   * @param folderPath - Chemin du dossier dans le bucket
   * @returns Array des références de fichiers
   */
  export const listFiles = async (folderPath: string): Promise<StorageReference[]> => {
    try {
      const folderRef = ref(storage, folderPath);
      const listResult = await listAll(folderRef);
      return listResult.items;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  };