import { useState, useEffect, useCallback, useRef } from 'react';
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
    setLoading,
    setError,
    logout: logoutStore,
  } = useAuthStore();
  
  const { showToast } = useUIStore();
  
  // État local
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  
  // Navigation
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  
  // Indicateur pour éviter les opérations doubles
  const processingAuth = useRef(false);
  
  /**
   * Enregistrer un nouveau modèle
   */
  const registerModel = useCallback(async (
    userData: Partial<ModelUserModel>,
    email: string,
    password: string
  ) => {
    if (processingAuth.current) return false;
    processingAuth.current = true;
    
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
      processingAuth.current = false;
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
    if (processingAuth.current) return false;
    processingAuth.current = true;
    
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
      processingAuth.current = false;
    }
  }, []);
  
  /**
   * Connecter un utilisateur
   */
  const login = useCallback(async (email: string, password: string) => {
    if (processingAuth.current) return false;
    processingAuth.current = true;
    
    setLoginLoading(true);
    setError(null);
    
    try {
      const userCredential = await loginWithEmailAndPassword(email, password);
      
      // Ne pas appeler setUser ici, laissez onAuthStateChanged s'en charger
      console.log('Login successful:', userCredential.user.uid);
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
      processingAuth.current = false;
    }
  }, []);
  
  /**
   * Déconnecter l'utilisateur
   */
  const logout = useCallback(async () => {
    if (processingAuth.current) return false;
    processingAuth.current = true;
    
    try {
      await logoutUser();
      logoutStore();
      
      // La redirection se fera automatiquement via _layout.tsx
      
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
    } finally {
      processingAuth.current = false;
    }
  }, []);
  
  /**
   * Réinitialiser le mot de passe
   */
  const forgotPassword = useCallback(async (email: string) => {
    if (processingAuth.current) return false;
    processingAuth.current = true;
    
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
      processingAuth.current = false;
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