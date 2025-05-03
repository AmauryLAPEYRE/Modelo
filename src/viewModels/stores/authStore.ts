import { create } from 'zustand';
import { UserModel } from '../../domain/entities/UserModel';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../services/firebase/config';

interface AuthState {
  // État
  user: UserModel | null;
  firebaseUser: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: UserModel | null) => void;
  setFirebaseUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  
  // Helpers
  subscribeToAuthChanges: (callback: (user: User | null) => void) => () => void;
}

/**
 * Store Zustand pour gérer l'état d'authentification
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // État initial
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: true,
  error: null,
  
  // Actions
  setUser: (user: UserModel | null) => set({ user }),
  
  setFirebaseUser: (firebaseUser: User | null) => set({ 
    firebaseUser,
    isAuthenticated: !!firebaseUser
  }),
  
  setAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  
  setInitialized: (isInitialized: boolean) => set({ isInitialized }),
  
  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  setError: (error: string | null) => set({ error }),
  
  logout: () => set({ 
    user: null,
    firebaseUser: null, 
    isAuthenticated: false 
  }),
  
  // Helper pour s'abonner aux changements d'état d'authentification Firebase
  subscribeToAuthChanges: (callback) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Mettre à jour l'état d'authentification
      set({
        firebaseUser: user,
        isAuthenticated: !!user,
        isInitialized: true,
        isLoading: false
      });
      
      // Appeler le callback avec l'utilisateur Firebase
      callback(user);
    });
    
    return unsubscribe;
  }
}));