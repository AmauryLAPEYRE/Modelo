import React, { useEffect } from 'react';
import { Platform, View, Text } from 'react-native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/viewModels/stores/authStore';
import { useUserRepository } from '../src/domain/hooks/useUserRepository';
import { auth } from '../src/services/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

// Empêcher l'écran de démarrage de disparaître automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Chargement des polices
  const [fontsLoaded, fontError] = useFonts({
    // 'Roboto-Regular': require('../src/assets/fonts/Roboto-Regular.ttf'),
    // 'Roboto-Medium': require('../src/assets/fonts/Roboto-Medium.ttf'),
    // 'Roboto-Bold': require('../src/assets/fonts/Roboto-Bold.ttf'),
    // 'Roboto-Light': require('../src/assets/fonts/Roboto-Light.ttf'),
    // 'Roboto-Italic': require('../src/assets/fonts/Roboto-Italic.ttf'),
  });

  // Repositories
  const userRepository = useUserRepository();

  // Stores
  const { 
    setUser, 
    setFirebaseUser, 
    setInitialized, 
    isInitialized, 
    isAuthenticated, 
    setLoading,
    setError
  } = useAuthStore();

  // Écouter les changements d'état d'authentification Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      try {
        setFirebaseUser(firebaseUser);
        
        if (firebaseUser) {
          // Récupérer les données utilisateur dans Firestore
          const userData = await userRepository.getUserById(firebaseUser.uid);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur d\'authentification';
        setError(errorMessage);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    });
    
    // Nettoyer l'abonnement lors du démontage
    return unsubscribe;
  }, []);

  // Cacher l'écran de démarrage une fois les polices chargées et l'initialisation terminée
  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Attendre que l'initialisation soit terminée avant de cacher l'écran de démarrage
      if (isInitialized) {
        SplashScreen.hideAsync();
      }
    }
  }, [fontsLoaded, fontError, isInitialized]);

  // Si les polices ne sont pas encore chargées et qu'il n'y a pas d'erreur, afficher un écran de chargement
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Si une erreur s'est produite lors du chargement des polices, afficher un message d'erreur
  if (fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Une erreur s'est produite lors du chargement des polices.</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ 
        headerShown: false,
        animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default'
      }}>
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
