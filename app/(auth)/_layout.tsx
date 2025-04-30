import React, { useEffect } from 'react';
import { Redirect, Stack, Tabs } from 'expo-router';
import { useAuthStore } from '../../src/viewModels/stores/authStore';
import { useMessageStore } from '../../src/viewModels/stores/messageStore';
import { BottomTabs } from '../../src/components/layout/BottomTabs';
import { COLORS } from '../../src/utils/constants';
import { ActivityIndicator, View } from 'react-native';

/**
 * Layout pour la partie authentifiée de l'application
 * Utilise des Tabs personnalisés pour la navigation principale
 */
export default function AuthLayout() {
  // Stores
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore();
  const { unreadCount } = useMessageStore();

  // Si l'authentification n'est pas encore initialisée ou en cours de chargement, afficher un loader
  if (!isInitialized || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home/index" />
      <Stack.Screen name="home/search" />
      <Stack.Screen name="home/notifications" />
      <Stack.Screen name="profile/index" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="profile/settings" />
      <Stack.Screen name="services/index" />
      <Stack.Screen name="services/[id]" />
      <Stack.Screen name="services/create" />
      <Stack.Screen name="applications/index" />
      <Stack.Screen name="applications/[id]" />
      <Stack.Screen name="applications/create" />
      <Stack.Screen name="messages/index" />
      <Stack.Screen name="messages/[id]" />
    </Stack>
  );
}