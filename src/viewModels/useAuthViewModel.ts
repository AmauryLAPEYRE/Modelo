import { useState, useEffect, useCallback } from 'react';
import { router, useSegments, useRootNavigationState } from 'expo-router';
import { useAuthStore } from './stores/authStore';
import { useUserRepository } from '../domain/hooks/useUserRepository';
import { UserModel, UserRole, ModelUserModel, ProfessionalUserModel } from '../domain/entities/UserModel';
import { 
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  logoutUser,
  resetPassword
} from '../services/firebase/auth';
import { User } from 'firebase/auth';
import { useUIStore } from './stores/uiStore';
import { ROUTES } from '../utils/constants';

/**
 * ViewModel pour gérer l'authentification
 */
export const useAuthViewModel = () => {
  // Repositories
  const userRepository = useUserRepository();
  
  // Stores
  const { 
    user, 
    firebaseUser, 
    isAuthenticated, 
    isInitialized,
    isLoading,
    error,
    setUser, 
    setFirebaseUser,
    setAuthenticated,
    setInitialized,
    setLoading,
    setError,
    logout: logoutStore,
    subscribeToAuthChanges
  } = useAuthStore();
  
  const { showToast } = useUIStore();
  
  // État local
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  
  // Navigation
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  
  /**
   * S'abonner aux changements d'authentification de Firebase
   */
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          // Récupérer les données de l'utilisateur depuis Firestore
          const userData = await userRepository.getUserById(firebaseUser.uid);
          
          if (userData) {
            setUser(userData);
          } else {
            // L'utilisateur existe dans Auth mais pas dans Firestore
            setError('Erreur de récupération du profil utilisateur');
            await logoutUser();
            setUser(null);
            setAuthenticated(false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError(error instanceof Error ? error.message : 'Erreur de connexion');
        }
      } else {
        setUser(null);
      }
    });
    
    // Nettoyer l'abonnement lors du démontage
    return unsubscribe;
  }, []);
  
  /**
   * Gérer la navigation en fonction de l'état d'authentification
   */
  useEffect(() => {
    if (!navigationState?.key || !isInitialized) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    const inPublicGroup = segments[0] === '(public)';
    
    if (isAuthenticated && !user) {
      // Attendre que les données utilisateur soient chargées
      return;
    }
    
    if (isAuthenticated && user) {
      // Utilisateur connecté
      if (!inAuthGroup) {
        router.replace(ROUTES.HOME);
      }
    } else {
      // Utilisateur non connecté
      if (!inPublicGroup) {
        router.replace(ROUTES.LOGIN);
      }
    }
  }, [isAuthenticated, user, segments, navigationState, isInitialized]);
  
  /**
   * Enregistrer un nouveau modèle
   */
  const registerModel = useCallback(async (
    userData: Partial<ModelUserModel>,
    email: string,
    password: string
  ) => {
    setRegistrationLoading(true);
    setError(null);
    
    try {
      // Créer l'utilisateur dans Firebase Auth et Firestore
      await registerWithEmailAndPassword(email, password, {
        ...userData,
        role: UserRole.MODEL
      });
      
      showToast({
        type: 'success',
        message: 'Compte créé avec succès !'
      });
      
      // Connecter l'utilisateur automatiquement
      await loginWithEmailAndPassword(email, password);
      
      return true;
    } catch (error) {
      console.error('Error during model registration:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message
        : 'Erreur lors de l\'inscription';
      
      setError(errorMessage);
      
      showToast({
        type: 'error',
        message: errorMessage
      });
      
      return false;
    } finally {
      setRegistrationLoading(false);
    }
  }, []);
  
  /**
   * Enregistrer un nouveau professionnel
   */
  const registerProfessional = useCallback(async (
    userData: Partial<ProfessionalUserModel>,
    email: string,
    password: string
  ) => {
    setRegistrationLoading(true);
    setError(null);
    
    try {
      // Créer l'utilisateur dans Firebase Auth et Firestore
      await registerWithEmailAndPassword(email, password, {
        ...userData,
        role: UserRole.PROFESSIONAL
      });
      
      showToast({
        type: 'success',
        message: 'Compte créé avec succès !'
      });
      
      // Connecter l'utilisateur automatiquement
      await loginWithEmailAndPassword(email, password);
      
      return true;
    } catch (error) {
      console.error('Error during professional registration:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message
        : 'Erreur lors de l\'inscription';
      
      setError(errorMessage);
      
      showToast({
        type: 'error',
        message: errorMessage
      });
      
      return false;
    } finally {
      setRegistrationLoading(false);
    }
  }, []);
  
  /**
   * Connecter un utilisateur
   */
  const login = useCallback(async (email: string, password: string) => {
    setLoginLoading(true);
    setError(null);
    
    try {
      await loginWithEmailAndPassword(email, password);
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      
      let errorMessage = 'Erreur de connexion. Vérifiez vos identifiants.';
      
      if (error instanceof Error) {
        if (error.message.includes('user-not-found')) {
          errorMessage = 'Aucun compte ne correspond à cet email';
        } else if (error.message.includes('wrong-password')) {
          errorMessage = 'Mot de passe incorrect';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      showToast({
        type: 'error',
        message: errorMessage
      });
      
      return false;
    } finally {
      setLoginLoading(false);
    }
  }, []);
  
  /**
   * Déconnecter l'utilisateur
   */
  const logout = useCallback(async () => {
    try {
      await logoutUser();
      logoutStore();
      
      router.replace(ROUTES.LOGIN);
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message
        : 'Erreur lors de la déconnexion';
      
      setError(errorMessage);
      
      showToast({
        type: 'error',
        message: errorMessage
      });
      
      return false;
    }
  }, []);
  
  /**
   * Réinitialiser le mot de passe
   */
  const forgotPassword = useCallback(async (email: string) => {
    setResetPasswordLoading(true);
    setError(null);
    
    try {
      await resetPassword(email);
      
      showToast({
        type: 'success',
        message: 'Email de réinitialisation envoyé'
      });
      
      return true;
    } catch (error) {
      console.error('Error during password reset:', error);
      
      let errorMessage = 'Erreur lors de la réinitialisation du mot de passe';
      
      if (error instanceof Error) {
        if (error.message.includes('user-not-found')) {
          errorMessage = 'Aucun compte ne correspond à cet email';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      showToast({
        type: 'error',
        message: errorMessage
      });
      
      return false;
    } finally {
      setResetPasswordLoading(false);
    }
  }, []);
  
  return {
    // État
    user,
    firebaseUser,
    isAuthenticated,
    isInitialized,
    isLoading,
    error,
    registrationLoading,
    loginLoading,
    resetPasswordLoading,
    
    // Actions
    registerModel,
    registerProfessional,
    login,
    logout,
    forgotPassword
  };
};