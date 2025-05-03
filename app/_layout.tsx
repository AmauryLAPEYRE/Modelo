import React, { useEffect, useRef } from 'react';
import { Platform, View, Text } from 'react-native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useSegments, useRootNavigationState, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/viewModels/stores/authStore';
import { useUserRepository } from '../src/domain/hooks/useUserRepository';
import { ROUTES } from '../src/utils/constants';

// Empêcher l'écran de démarrage de disparaître automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Chargement des polices
  const [fontsLoaded, fontError] = useFonts({
    // Vos polices ici...
  });

  // Repositories
  const userRepository = useUserRepository();

  // Navigation state
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  // Stores
  const { 
    user, 
    isAuthenticated,
    isInitialized,
    isLoading,
    setInitialized,
    setLoading,
    setError,
    subscribeToAuthChanges
  } = useAuthStore();

  // Utiliser une ref pour éviter les redirections multiples
  const isRedirecting = useRef(false);
  const hasSubscribed = useRef(false);

  // Écouter les changements d'état d'authentification Firebase
  useEffect(() => {
    // Éviter de s'abonner plusieurs fois
    if (hasSubscribed.current) return;
    
    hasSubscribed.current = true;
    
    // Référence pour savoir si le composant est monté
    let isMounted = true;

    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (!isMounted) return;
      
      setLoading(true);
      
      try {
        if (firebaseUser) {
          // Récupérer les données utilisateur dans Firestore
          const userData = await userRepository.getUserById(firebaseUser.uid);
          
          // Ne pas mettre à jour l'état si le composant est démonté
          if (!isMounted) return;
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Erreur d\'authentification');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    });
    
    // Nettoyer l'abonnement lors du démontage
    return () => {
      isMounted = false;
      unsubscribe();
      hasSubscribed.current = false;
    };
  }, []);

  // Gérer la navigation en fonction de l'état d'authentification
  useEffect(() => {
    if (!navigationState?.key || !isInitialized || isLoading || isRedirecting.current) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    const inPublicGroup = segments[0] === '(public)';
    
    // Éviter les redirections inutiles et les boucles
    if (isAuthenticated && user) {
      if (!inAuthGroup && !isRedirecting.current) {
        isRedirecting.current = true;
        console.log('Redirecting to HOME');
        router.replace(ROUTES.HOME);
        
        // Réinitialiser après un délai pour permettre d'autres redirections plus tard
        setTimeout(() => {
          isRedirecting.current = false;
        }, 100);
      }
    } else if (!inPublicGroup && !isRedirecting.current) {
      isRedirecting.current = true;
      console.log('Redirecting to LOGIN');
      router.replace(ROUTES.LOGIN);
      
      setTimeout(() => {
        isRedirecting.current = false;
      }, 100);
    }
  }, [isAuthenticated, user, segments, navigationState, isInitialized, isLoading]);

  // Cacher l'écran de démarrage une fois les polices chargées et l'initialisation terminée
  useEffect(() => {
    if ((fontsLoaded || fontError) && isInitialized) {
      SplashScreen.hideAsync();
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