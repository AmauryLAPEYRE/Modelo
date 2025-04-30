import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Container } from '../../../src/components/layout/Container';
import { Header } from '../../../src/components/layout/Header';
import { ServiceCard } from '../../../src/components/services/ServiceCard';
import { ServiceFilterBar } from '../../../src/components/services/ServiceFilterBar';
import { Button } from '../../../src/components/core/Button';
import { useHomeViewModel } from '../../../src/viewModels/useHomeViewModel';
import { ServiceModel } from '../../../src/domain/entities/ServiceModel';
import { COLORS } from '../../../src/utils/constants';
import { useAuthStore } from '../../../src/viewModels/stores/authStore';
import { UserRole } from '../../../src/domain/entities/UserModel';

/**
 * Écran d'accueil de l'application
 */
export default function HomeScreen() {
  // ViewModel
  const {
    loading,
    refreshing,
    services,
    categories,
    featuredBanner,
    selectedCategory,
    hasMore,
    refreshData,
    loadMoreServices,
    selectCategory,
    searchServices,
    openServiceDetails,
    openCreateService,
    toggleFavoriteService,
    isFavorite
  } = useHomeViewModel();

  // Auth store
  const { user } = useAuthStore();
  const isProfessional = user?.role === UserRole.PROFESSIONAL;

  // Rendu d'un élément de la liste de services
  const renderServiceItem: ListRenderItem<ServiceModel> = ({ item }) => (
    <ServiceCard
      service={item}
      onPress={() => openServiceDetails(item.id)}
      onFavoritePress={() => toggleFavoriteService(item.id)}
      isFavorite={isFavorite(item.id)}
      testID={`service-card-${item.id}`}
    />
  );

  // Rendu du bouton d'ajout de service pour les professionnels
  const renderFloatingActionButton = () => {
    if (!isProfessional) return null;

    return (
      <View style={styles.fabContainer}>
        <Button
          variant="primary"
          size="large"
          label="Créer une prestation"
          leftIcon="add-outline"
          onPress={openCreateService}
          style={styles.fab}
          testID="create-service-button"
        />
      </View>
    );
  };

  return (
    <Container
      background="default"
      padding="none"
      refreshing={refreshing}
      onRefresh={refreshData}
      testID="home-screen"
    >
      <StatusBar style="dark" />
      
      {/* En-tête */}
      <Header
        title="Modelo"
        subtitle="Trouvez votre prochaine collaboration"
        rightIcon="notifications-outline"
        onRightPress={() => {}} // À implémenter
        variant="default"
        showBorder={false}
        testID="home-header"
      />
      
      {/* Barre de filtres */}
      <ServiceFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={selectCategory}
        onSearchPress={() => {}} // Naviguer vers l'écran de recherche
        onFilterPress={() => {}} // Ouvrir les filtres avancés
        testID="filter-bar"
      />
      
      {/* Liste des services */}
      <FlatList
        data={services}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onEndReached={hasMore ? loadMoreServices : undefined}
        onEndReachedThreshold={0.3}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        ListFooterComponent={
          loading && services.length > 0 ? (
            <View style={styles.loadingFooter} />
          ) : null
        }
        testID="services-list"
      />
      
      {/* Bouton d'ajout pour les professionnels */}
      {renderFloatingActionButton()}
    </Container>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 100, // Espace supplémentaire en bas pour le FAB
  },
  loadingFooter: {
    height: 50,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fab: {
    borderRadius: 30,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});