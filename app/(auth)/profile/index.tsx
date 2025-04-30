import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Container } from '../../../src/components/layout/Container';
import { Header } from '../../../src/components/layout/Header';
import { ProfileHeader } from '../../../src/components/profile/ProfileHeader';
import { ServiceCard } from '../../../src/components/services/ServiceCard';
import { ApplicationCard } from '../../../src/components/applications/ApplicationCard';
import { Button } from '../../../src/components/core/Button';
import { useProfileViewModel } from '../../../src/viewModels/useProfileViewModel';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/utils/constants';
import { UserRole } from '../../../src/domain/entities/UserModel';

// Onglets du profil
type TabType = 'info' | 'services' | 'applications';

/**
 * Écran de profil utilisateur
 */
export default function ProfileScreen() {
  // Récupérer l'ID du profil à afficher depuis les paramètres de route (facultatif)
  const params = useLocalSearchParams<{ userId?: string }>();
  
  // ViewModel
  const {
    profile,
    ratings,
    services,
    applications,
    loading,
    refreshing,
    updatingProfile,
    activeTab,
    isCurrentUserProfile,
    isModel,
    isProfessional,
    refreshProfile,
    updateProfilePicture,
    updateModelPhotos,
    navigateToEditProfile,
    navigateToSettings,
    setActiveTab
  } = useProfileViewModel(params.userId);
  
  // Si le profil est en cours de chargement
  if (loading || !profile) {
    return (
      <Container background="default" testID="profile-loading">
        <Header
          title="Profil"
          rightIcon={isCurrentUserProfile ? 'settings-outline' : undefined}
          onRightPress={isCurrentUserProfile ? navigateToSettings : undefined}
          testID="profile-header"
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </Container>
    );
  }
  
  // Calculer la note moyenne
  const averageRating = ratings.length > 0
    ? ratings.reduce((acc, rating) => acc + rating.score, 0) / ratings.length
    : 0;
  
  // Rendu du contenu de l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View style={styles.tabContent} testID="info-tab-content">
            {/* Biographie */}
            <View style={styles.section} testID="bio-section">
              <Text style={styles.sectionTitle}>À propos</Text>
              <Text style={styles.bioText}>
                {profile.bio || 'Aucune biographie renseignée.'}
              </Text>
            </View>
            
            {/* Informations supplémentaires pour les modèles */}
            {isModel && profile.role === UserRole.MODEL && (
              <>
                {/* Caractéristiques */}
                <View style={styles.section} testID="characteristics-section">
                  <Text style={styles.sectionTitle}>Caractéristiques</Text>
                  <View style={styles.characteristicsGrid}>
                    <View style={styles.characteristicItem}>
                      <Text style={styles.characteristicLabel}>Âge</Text>
                      <Text style={styles.characteristicValue}>{profile.age} ans</Text>
                    </View>
                    
                    <View style={styles.characteristicItem}>
                      <Text style={styles.characteristicLabel}>Genre</Text>
                      <Text style={styles.characteristicValue}>
                        {profile.gender === 'male' ? 'Homme' : 
                         profile.gender === 'female' ? 'Femme' : 'Autre'}
                      </Text>
                    </View>
                    
                    {profile.height && (
                      <View style={styles.characteristicItem}>
                        <Text style={styles.characteristicLabel}>Taille</Text>
                        <Text style={styles.characteristicValue}>{profile.height} cm</Text>
                      </View>
                    )}
                    
                    {profile.hairColor && (
                      <View style={styles.characteristicItem}>
                        <Text style={styles.characteristicLabel}>Cheveux</Text>
                        <Text style={styles.characteristicValue}>
                          {profile.hairColor === 'black' ? 'Noirs' :
                           profile.hairColor === 'brown' ? 'Bruns' :
                           profile.hairColor === 'blonde' ? 'Blonds' :
                           profile.hairColor === 'red' ? 'Roux' :
                           profile.hairColor === 'white' ? 'Blancs' :
                           profile.hairColor === 'gray' ? 'Gris' : 'Autre'}
                        </Text>
                      </View>
                    )}
                    
                    {profile.eyeColor && (
                      <View style={styles.characteristicItem}>
                        <Text style={styles.characteristicLabel}>Yeux</Text>
                        <Text style={styles.characteristicValue}>
                          {profile.eyeColor === 'brown' ? 'Bruns' :
                           profile.eyeColor === 'blue' ? 'Bleus' :
                           profile.eyeColor === 'green' ? 'Verts' :
                           profile.eyeColor === 'gray' ? 'Gris' :
                           profile.eyeColor === 'hazel' ? 'Noisette' : 'Autre'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Photos du portfolio */}
                <View style={styles.section} testID="photos-section">
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Photos</Text>
                    {isCurrentUserProfile && (
                      <TouchableOpacity 
                        onPress={updateModelPhotos}
                        disabled={updatingProfile}
                        testID="add-photos-button"
                      >
                        <Text style={styles.addLink}>Ajouter</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.photosContainer}
                    testID="photos-scroll"
                  >
                    {profile.photos && profile.photos.length > 0 ? (
                      profile.photos.map((photo, index) => (
                        <TouchableOpacity 
                          key={`photo-${index}`}
                          style={styles.photoItem}
                          activeOpacity={0.9}
                          testID={`photo-${index}`}
                        >
                          <Image
                            source={{ uri: photo }}
                            style={styles.photo}
                            contentFit="cover"
                            transition={300}
                          />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.noPhotosContainer} testID="no-photos">
                        <Ionicons name="images-outline" size={40} color={COLORS.gray} />
                        <Text style={styles.noPhotosText}>Aucune photo</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </>
            )}
            
            {/* Réseaux sociaux */}
            {profile.socialMedia && (
              <View style={styles.section} testID="social-section">
                <Text style={styles.sectionTitle}>Réseaux sociaux</Text>
                <View style={styles.socialContainer}>
                  {profile.socialMedia.instagram && (
                    <TouchableOpacity style={styles.socialItem} testID="instagram-link">
                      <Ionicons name="logo-instagram" size={24} color={COLORS.primary} />
                      <Text style={styles.socialText}>{profile.socialMedia.instagram}</Text>
                    </TouchableOpacity>
                  )}
                  
                  {profile.socialMedia.facebook && (
                    <TouchableOpacity style={styles.socialItem} testID="facebook-link">
                      <Ionicons name="logo-facebook" size={24} color={COLORS.primary} />
                      <Text style={styles.socialText}>{profile.socialMedia.facebook}</Text>
                    </TouchableOpacity>
                  )}
                  
                  {profile.socialMedia.tiktok && (
                    <TouchableOpacity style={styles.socialItem} testID="tiktok-link">
                      <Ionicons name="logo-tiktok" size={24} color={COLORS.primary} />
                      <Text style={styles.socialText}>{profile.socialMedia.tiktok}</Text>
                    </TouchableOpacity>
                  )}
                  
                  {profile.socialMedia.portfolio && (
                    <TouchableOpacity style={styles.socialItem} testID="portfolio-link">
                      <Ionicons name="globe-outline" size={24} color={COLORS.primary} />
                      <Text style={styles.socialText}>{profile.socialMedia.portfolio}</Text>
                    </TouchableOpacity>
                  )}
                  
                  {profile.socialMedia.other && (
                    <TouchableOpacity style={styles.socialItem} testID="other-link">
                      <Ionicons name="link-outline" size={24} color={COLORS.primary} />
                      <Text style={styles.socialText}>{profile.socialMedia.other}</Text>
                    </TouchableOpacity>
                  )}
                  
                  {/* Si aucun réseau social n'est renseigné */}
                  {!profile.socialMedia.instagram && 
                   !profile.socialMedia.facebook && 
                   !profile.socialMedia.tiktok && 
                   !profile.socialMedia.portfolio && 
                   !profile.socialMedia.other && (
                    <Text style={styles.noContentText} testID="no-social">
                      Aucun réseau social renseigné
                    </Text>
                  )}
                </View>
              </View>
            )}
            
            {/* Évaluations */}
            <View style={styles.section} testID="ratings-section">
              <Text style={styles.sectionTitle}>Évaluations</Text>
              {ratings.length > 0 ? (
                <View testID="ratings-list">
                  <View style={styles.ratingOverview}>
                    <View style={styles.ratingScoreContainer}>
                      <Text style={styles.ratingScore}>{averageRating.toFixed(1)}</Text>
                      <View style={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={`star-${star}`}
                            name={star <= Math.round(averageRating) ? 'star' : 'star-outline'}
                            size={16}
                            color={COLORS.warning}
                          />
                        ))}
                      </View>
                      <Text style={styles.ratingCount}>
                        {ratings.length} avis
                      </Text>
                    </View>
                  </View>
                  
                  {/* Liste des avis (limité aux 3 premiers) */}
                  {ratings.slice(0, 3).map((rating) => (
                    <View key={rating.id} style={styles.ratingItem} testID={`rating-${rating.id}`}>
                      <View style={styles.ratingHeader}>
                        <View style={styles.ratingUser}>
                          <Text style={styles.ratingUserName}>Utilisateur</Text>
                          <View style={styles.ratingStarsSmall}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Ionicons
                                key={`star-${star}`}
                                name={star <= rating.score ? 'star' : 'star-outline'}
                                size={12}
                                color={COLORS.warning}
                              />
                            ))}
                          </View>
                        </View>
                        <Text style={styles.ratingDate}>
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      {rating.comment && (
                        <Text style={styles.ratingComment}>{rating.comment}</Text>
                      )}
                    </View>
                  ))}
                  
                  {/* Bouton pour voir tous les avis si plus de 3 */}
                  {ratings.length > 3 && (
                    <TouchableOpacity style={styles.seeAllButton} testID="see-all-ratings">
                      <Text style={styles.seeAllText}>
                        Voir tous les avis ({ratings.length})
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <Text style={styles.noContentText} testID="no-ratings">
                  Aucune évaluation pour le moment
                </Text>
              )}
            </View>
          </View>
        );
      
      case 'services':
        return (
          <View style={styles.tabContent} testID="services-tab-content">
            {isProfessional && services.length > 0 ? (
              services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onPress={() => {}} // Navigate to service detail
                  testID={`service-${service.id}`}
                />
              ))
            ) : isProfessional ? (
              <View style={styles.emptyState} testID="no-services">
                <Ionicons name="briefcase-outline" size={64} color={COLORS.gray} />
                <Text style={styles.emptyStateTitle}>
                  Aucune prestation
                </Text>
                <Text style={styles.emptyStateText}>
                  {isCurrentUserProfile
                    ? "Vous n'avez pas encore créé de prestation"
                    : "Ce professionnel n'a pas encore créé de prestation"}
                </Text>
                {isCurrentUserProfile && (
                  <Button
                    label="Créer une prestation"
                    variant="primary"
                    leftIcon="add-outline"
                    onPress={() => {}} // Navigate to service creation
                    style={styles.emptyStateButton}
                    testID="create-service-button"
                  />
                )}
              </View>
            ) : (
              <View style={styles.emptyState} testID="services-not-available">
                <Ionicons name="information-circle-outline" size={64} color={COLORS.gray} />
                <Text style={styles.emptyStateTitle}>
                  Section non disponible
                </Text>
                <Text style={styles.emptyStateText}>
                  Cette section est réservée aux profils professionnels
                </Text>
              </View>
            )}
          </View>
        );
      
      case 'applications':
        return (
          <View style={styles.tabContent} testID="applications-tab-content">
            {isModel && applications.length > 0 ? (
              applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onPress={() => {}} // Navigate to application detail
                  testID={`application-${application.id}`}
                />
              ))
            ) : isModel ? (
              <View style={styles.emptyState} testID="no-applications">
                <Ionicons name="document-text-outline" size={64} color={COLORS.gray} />
                <Text style={styles.emptyStateTitle}>
                  Aucune candidature
                </Text>
                <Text style={styles.emptyStateText}>
                  {isCurrentUserProfile
                    ? "Vous n'avez pas encore postulé à une prestation"
                    : "Ce modèle n'a pas encore postulé à une prestation"}
                </Text>
                {isCurrentUserProfile && (
                  <Button
                    label="Explorer les prestations"
                    variant="primary"
                    leftIcon="search-outline"
                    onPress={() => {}} // Navigate to service search
                    style={styles.emptyStateButton}
                    testID="explore-services-button"
                  />
                )}
              </View>
            ) : (
              <View style={styles.emptyState} testID="applications-not-available">
                <Ionicons name="information-circle-outline" size={64} color={COLORS.gray} />
                <Text style={styles.emptyStateTitle}>
                  Section non disponible
                </Text>
                <Text style={styles.emptyStateText}>
                  Cette section est réservée aux profils modèles
                </Text>
              </View>
            )}
          </View>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Container
      background="default"
      padding="none"
      refreshing={refreshing}
      onRefresh={refreshProfile}
      testID="profile-screen"
    >
      <StatusBar style="light" />
      
      {/* En-tête transparent sur l'image */}
      <Header
        variant="transparent"
        showBack={!isCurrentUserProfile}
        rightIcon={isCurrentUserProfile ? 'settings-outline' : 'ellipsis-vertical'}
        onRightPress={isCurrentUserProfile ? navigateToSettings : () => {}}
        testID="profile-header"
      />
      
      {/* Header du profil */}
      <ProfileHeader
        user={profile}
        rating={profile.rating}
        isCurrentUser={isCurrentUserProfile}
        onEditPress={navigateToEditProfile}
        onImagePress={isCurrentUserProfile ? updateProfilePicture : undefined}
        testID="profile-header-component"
      />
      
      {/* Onglets */}
      <View style={styles.tabsContainer} testID="profile-tabs">
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
          testID="info-tab"
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            Infos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'services' && styles.activeTab]}
          onPress={() => setActiveTab('services')}
          testID="services-tab"
        >
          <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
            Prestations
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
          onPress={() => setActiveTab('applications')}
          testID="applications-tab"
        >
          <Text style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>
            Candidatures
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Contenu des onglets */}
      {renderTabContent()}
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.gray,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.medium,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '500',
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  tabContent: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.medium,
    paddingTop: SPACING.medium,
    paddingBottom: SPACING.xxxl,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.regular,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.small,
  },
  bioText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    lineHeight: 24,
  },
  characteristicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  characteristicItem: {
    width: '50%',
    marginBottom: SPACING.small,
  },
  characteristicLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
    marginBottom: 2,
  },
  characteristicValue: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    fontWeight: '500',
  },
  addLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: '500',
  },
  photosContainer: {
    paddingBottom: SPACING.small,
  },
  photoItem: {
    width: 120,
    height: 180,
    borderRadius: BORDER_RADIUS.small,
    marginRight: SPACING.small,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  noPhotosContainer: {
    width: 120,
    height: 180,
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotosText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
    marginTop: SPACING.small,
  },
  socialContainer: {
    gap: SPACING.small,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    marginLeft: SPACING.small,
  },
  noContentText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  ratingOverview: {
    flexDirection: 'row',
    marginBottom: SPACING.medium,
  },
  ratingScoreContainer: {
    alignItems: 'center',
  },
  ratingScore: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  ratingStars: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
  },
  ratingCount: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
  },
  ratingItem: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingVertical: SPACING.small,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  ratingUser: {
    flex: 1,
  },
  ratingUserName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 2,
  },
  ratingStarsSmall: {
    flexDirection: 'row',
  },
  ratingDate: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
  },
  ratingComment: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    lineHeight: 22,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.small,
    marginTop: SPACING.small,
  },
  seeAllText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: SPACING.xs,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: SPACING.medium,
    marginBottom: SPACING.small,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.large,
  },
  emptyStateButton: {
    minWidth: 200,
  },
});