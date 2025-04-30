import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    DocumentData,
    QueryDocumentSnapshot,
    DocumentReference,
    QueryConstraint,
    serverTimestamp,
    onSnapshot,
    Unsubscribe
  } from 'firebase/firestore';
  import { db } from './config';
  
  /**
   * Récupère un document par son ID
   */
  export const getDocumentById = async <T>(
    collectionName: string,
    docId: string
  ): Promise<T | null> => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  };
  
  /**
   * Ajoute un nouveau document à une collection
   */
  export const addDocument = async <T extends object>(
    collectionName: string,
    data: T
  ): Promise<string> => {
    try {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  };
  
  /**
   * Met à jour un document existant
   */
  export const updateDocument = async <T extends object>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  };
  
  /**
   * Supprime un document
   */
  export const deleteDocument = async (
    collectionName: string,
    docId: string
  ): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  };
  
  /**
   * Récupère tous les documents d'une collection avec filtres, tri et pagination
   */
  export const getDocuments = async <T>(
    collectionName: string,
    filters?: Array<{
      field: string;
      operator: string;
      value: any;
    }>,
    sortBy?: { field: string; direction: 'asc' | 'desc' },
    page: number = 1,
    pageSize: number = 10,
    lastDocument?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{ data: T[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
    try {
      const constraints: QueryConstraint[] = [];
      
      // Ajouter les filtres
      if (filters && filters.length > 0) {
        filters.forEach(filter => {
          constraints.push(where(filter.field, filter.operator as any, filter.value));
        });
      }
      
      // Ajouter le tri
      if (sortBy) {
        constraints.push(orderBy(sortBy.field, sortBy.direction));
      } else {
        constraints.push(orderBy('createdAt', 'desc'));
      }
      
      // Ajouter la pagination
      constraints.push(limit(pageSize));
      
      // Ajouter startAfter si lastDocument est fourni (pour la pagination)
      if (lastDocument) {
        constraints.push(startAfter(lastDocument));
      }
      
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const data: T[] = [];
      let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
      
      querySnapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as T);
        lastDoc = doc;
      });
      
      return { data, lastDoc };
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  };
  
  /**
   * Écoute les modifications en temps réel sur un document
   */
  export const subscribeToDocument = <T>(
    collectionName: string,
    docId: string,
    callback: (data: T | null) => void
  ): Unsubscribe => {
    const docRef = doc(db, collectionName, docId);
    
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error subscribing to document in ${collectionName}:`, error);
      callback(null);
    });
  };
  
  /**
   * Écoute les modifications en temps réel sur une collection
   */
  export const subscribeToCollection = <T>(
    collectionName: string,
    callback: (data: T[]) => void,
    filters?: Array<{
      field: string;
      operator: string;
      value: any;
    }>,
    sortBy?: { field: string; direction: 'asc' | 'desc' },
    limitCount: number = 50
  ): Unsubscribe => {
    const constraints: QueryConstraint[] = [];
    
    // Ajouter les filtres
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        constraints.push(where(filter.field, filter.operator as any, filter.value));
      });
    }
    
    // Ajouter le tri
    if (sortBy) {
      constraints.push(orderBy(sortBy.field, sortBy.direction));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }
    
    // Ajouter la limite
    constraints.push(limit(limitCount));
    
    const q = query(collection(db, collectionName), ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      const data: T[] = [];
      
      querySnapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as T);
      });
      
      callback(data);
    }, (error) => {
      console.error(`Error subscribing to collection ${collectionName}:`, error);
      callback([]);
    });
  };