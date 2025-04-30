import React, { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/viewModels/stores/authStore';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../../src/utils/constants';

/**
 * Layout pour la partie publique de l'application (non authentifiée)
 * Gère la redirection vers la partie authentifiée si l'utilisateur est connecté
 */
export default function PublicLayout() {
  // Stores
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore();

  // Si l'authentification n'est pas encore initialisée ou en cours de chargement, afficher un loader
  if (!isInitialized || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Si l'utilisateur est authentifié, rediriger vers la page d'accueil
  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}