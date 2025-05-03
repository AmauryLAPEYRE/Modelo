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
export const useAuthStore = create<AuthState>((set) => ({
  // État initial
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: true,
  error: null,
  
  // Actions
  setUser: (user: UserModel | null) => set({ 
    user, 
    isAuthenticated: !!user 
  }),
  
  setFirebaseUser: (firebaseUser: User | null) => set(state => {
    // Si l'utilisateur Firebase change, mettre à jour son état
    // sans toucher aux autres propriétés qui seront gérées séparément
    if (firebaseUser?.uid !== state.firebaseUser?.uid) {
      return { firebaseUser };
    }
    return state;
  }),
  
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
    // On utilise une variable pour suivre si l'abonnement est actif
    let isActive = true;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Ne pas continuer si l'abonnement a été annulé
      if (!isActive) return;
      
      // Mettre à jour uniquement le firebaseUser
      // Le reste (user et isAuthenticated) sera géré par le callback
      set(state => {
        if (user?.uid === state.firebaseUser?.uid) {
          return state; // Pas de changement nécessaire
        }
        
        return { firebaseUser: user };
      });
      
      // Appeler le callback avec l'utilisateur Firebase
      // C'est ce callback qui va gérer la mise à jour du user Firestore et isAuthenticated
      if (isActive) {
        callback(user);
      }
    });
    
    // Retourner une fonction qui nettoie l'abonnement
    return () => {
      isActive = false;
      unsubscribe();
    };
  }
}));