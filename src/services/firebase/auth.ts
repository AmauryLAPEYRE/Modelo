import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    UserCredential,
    updateEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    User
  } from 'firebase/auth';
  import { auth } from './config';
  import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
  import { db } from './config';
  import { UserModel, UserRole } from '../../domain/entities/UserModel';
  
  /**
   * Crée un nouvel utilisateur avec email et mot de passe
   */
  export const registerWithEmailAndPassword = async (
    email: string, 
    password: string, 
    userData: Partial<UserModel>
  ): Promise<UserCredential> => {
    try {
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      // Mettre à jour le profil utilisateur avec le nom complet
      if (userData.fullName) {
        await updateProfile(user, {
          displayName: userData.fullName
        });
      }
  
      // Créer le document utilisateur dans Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        fullName: userData.fullName || '',
        role: userData.role || UserRole.MODEL,
        createdAt: serverTimestamp(),
        ...userData,
      });
  
      return userCredential;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  };
  
  /**
   * Connecte un utilisateur avec email et mot de passe
   */
  export const loginWithEmailAndPassword = async (
    email: string, 
    password: string
  ): Promise<UserCredential> => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };
  
  /**
   * Déconnecte l'utilisateur actuel
   */
  export const logoutUser = async (): Promise<void> => {
    try {
      return await signOut(auth);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };
  
  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  export const resetPassword = async (email: string): Promise<void> => {
    try {
      return await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  };
  
  /**
   * Met à jour le profil de l'utilisateur connecté
   */
  export const updateUserProfile = async (
    user: User,
    profileData: { displayName?: string; photoURL?: string }
  ): Promise<void> => {
    try {
      return await updateProfile(user, profileData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };
  
  /**
   * Met à jour l'email de l'utilisateur (nécessite ré-authentification récente)
   */
  export const updateUserEmail = async (
    user: User,
    newEmail: string
  ): Promise<void> => {
    try {
      return await updateEmail(user, newEmail);
    } catch (error) {
      console.error('Error updating user email:', error);
      throw error;
    }
  };
  
  /**
   * Ré-authentifie l'utilisateur (nécessaire pour les opérations sensibles)
   */
  export const reauthenticateUser = async (
    user: User,
    password: string
  ): Promise<void> => {
    try {
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);
    } catch (error) {
      console.error('Error during reauthentication:', error);
      throw error;
    }
  };
  
  /**
   * Met à jour le mot de passe de l'utilisateur
   */
  export const updateUserPassword = async (
    user: User,
    newPassword: string
  ): Promise<void> => {
    try {
      return await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };