import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Container } from '../../../src/components/layout/Container';
import { Header } from '../../../src/components/layout/Header';
import { Button } from '../../../src/components/core/Button';
import { Card } from '../../../src/components/core/Card';
import { Badge } from '../../../src/components/core/Badge';
import { Avatar } from '../../../src/components/core/Avatar';
import { useServiceDetailViewModel } from '../../../src/viewModels/useServiceDetailViewModel';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/utils/constants';
import { 
  formatDate, 
  formatServiceType, 
  formatPaymentType,
  formatGender,
  formatHairColor,
  formatEyeColor
} from '../../../src/utils/formatters';
import { ServiceStatus, PaymentType } from '../../../src/domain/entities/ServiceModel';

// Largeur de l'écran pour le slider d'images
const { width: screenWidth } = Dimensions.get('window');

/**
 * Écran de détail d'une prestation
 */
export default function ServiceDetailScreen() {
  // Récupérer l'ID du service depuis les paramètres de route
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // ViewModel
  const {
    service,
    professional,
    loading,
    refreshing,
    deleting,
    updating,
    isOwner,
    isModel,
    isProfessional,
    canApply,
    hasApplied,
    canEdit,
    canDelete,
    serviceIsFavorite,
    refreshData,
    deleteService,
    updateServiceStatus,
    navigateToEditService,
    navigateToCreateApplication,
    navigateToProfessionalProfile,
    navigateToApplicationDetail,
    toggleFavoriteService,
    shareService
  } = useServiceDetailViewModel(id);
  
  // Gérer le cas où le service est en cours de chargement ou n'existe pas
  if (!service && !loading) {
    return (
      <Container>
        <Header
          title="Détail prestation"
          showBack
          testID="service-detail-header"
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Prestation introuvable</Text>
          <Button 
            label="Retour" 
            onPress={() => navigateToApplicationDetail('')} 
            variant="primary" 
            testID="back-button"
          />
        </View>
      </Container>
    );
  }
  
  // Rendu du contenu une fois les données chargées
  return (
    <Container
      background="white"
      padding="none"
      refreshing={refreshing}
      onRefresh={refreshData}
      testID="service-detail-screen"
    >
      <StatusBar style="light" />
      
      {/* En-tête transparent sur l'image */}
      <Header
        variant="transparent"
        showBack
        rightIcon={isOwner ? 'ellipsis-vertical' : 'share-outline'}
        onRightPress={isOwner 
          ? () => Alert.alert(
              'Options',
              'Que souhaitez-vous faire ?',
              [
                { text: 'Modifier', onPress: navigateToEditService },
                { text: 'Supprimer', onPress: deleteService, style: 'destructive' },
                { text: 'Annuler', style: 'cancel' }
              ]
            )
          : shareService
        }
        testID="service-detail-header"
      />
      
      {/* Contenu scrollable */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        testID="service-detail-scroll"
      >
        {/* Slider d'images */}
        <View style={styles.imageSlider} testID="image-slider">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {service?.images && service.images.length > 0 ? (
              service.images.map((image, index) => (
                <Image
                  key={`image-${index}`}
                  source={{ uri: image }}
                  style={styles.image}
                  contentFit="cover"
                  transition={300}
                  testID={`image-${index}`}
                />
              ))
            ) : (
              <View style={styles.placeholderImage} testID="placeholder-image">
                <Ionicons name="image-outline" size={64} color={COLORS.gray} />
                <Text style={styles.placeholderText}>Aucune image</Text>
              </View>
            )}
          </ScrollView>
          
          {/* Badge urgent */}
          {service?.isUrgent && (
            <View style={styles.urgentBadge} testID="urgent-badge">
              <Badge
                label="Urgent"
                variant="filled"
                color="error"
                leftIcon="time-outline"
              />
            </View>
          )}
          
          {/* Bouton favori */}
          <View style={styles.favoriteButton} testID="favorite-button">
            <Button
              variant="ghost"
              size="medium"
              leftIcon={serviceIsFavorite ? 'heart' : 'heart-outline'}
              onPress={toggleFavoriteService}
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 20
              }}
              textStyle={{
                color: serviceIsFavorite ? COLORS.error : COLORS.white
              }}
            />
          </View>
        </View>
        
        {/* Contenu principal */}
        <View style={styles.mainContent} testID="main-content">
          {/* En-tête avec titre et statut */}
          <View style={styles.titleRow} testID="title-row">
            <Text style={styles.title} testID="service-title">
              {service?.title}
            </Text>
            
            <Badge
              label={service?.status === ServiceStatus.ACTIVE ? 'Actif' : 
                     service?.status === ServiceStatus.DRAFT ? 'Brouillon' :
                     service?.status === ServiceStatus.COMPLETED ? 'Terminé' :
                     service?.status === ServiceStatus.CANCELLED ? 'Annulé' :
                     'Expiré'}
              variant="filled"
              color={service?.status === ServiceStatus.ACTIVE ? 'success' :
                     service?.status === ServiceStatus.DRAFT ? 'warning' :
                     service?.status === ServiceStatus.COMPLETED ? 'info' :
                     service?.status === ServiceStatus.CANCELLED ? 'error' :
                     'gray'}
              testID="status-badge"
            />
          </View>
          
          {/* Informations de base */}
          <View style={styles.infoSection} testID="info-section">
            <View style={styles.infoRow} testID="info-type">
              <Ionicons name="pricetag-outline" size={20} color={COLORS.gray} />
              <Text style={styles.infoText}>
                {service && formatServiceType(service.type)}
              </Text>
            </View>
            
            <View style={styles.infoRow} testID="info-location">
              <Ionicons name="location-outline" size={20} color={COLORS.gray} />
              <Text style={styles.infoText}>
                {service?.location.city}
                {service?.location.address ? ` - ${service.location.address}` : ''}
              </Text>
            </View>
            
            <View style={styles.infoRow} testID="info-date">
              <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
              <Text style={styles.infoText}>
                {service && formatDate(service.date.startDate)}
                {service?.date.endDate ? ` au ${formatDate(service.date.endDate)}` : ''}
                {service?.date.isFlexible ? ' (Dates flexibles)' : ''}
              </Text>
            </View>
            
            <View style={styles.infoRow} testID="info-price">
              <Ionicons name={service?.payment.type === PaymentType.FREE ? 'gift-outline' : 'cash-outline'} 
                       size={20} 
                       color={COLORS.gray} />
              <Text style={[
                styles.infoText,
                service?.payment.type === PaymentType.FREE ? styles.freeText : styles.paidText
              ]}>
                {service && formatPaymentType(service.payment.type, service.payment.amount)}
                {service?.payment.details ? ` - ${service.payment.details}` : ''}
              </Text>
            </View>
          </View>
          
          {/* Description */}
          <Card variant="outlined" padding="medium" style={styles.section} testID="description-section">
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description} testID="description-text">
              {service?.description}
            </Text>
          </Card>
          
          {/* Critères recherchés */}
          {service?.criteria && (
            <Card variant="outlined" padding="medium" style={styles.section} testID="criteria-section">
              <Text style={styles.sectionTitle}>Critères recherchés</Text>
              
              <View style={styles.criteriaContainer}>
                {service.criteria.gender && (
                  <View style={styles.criteriaItem} testID="criteria-gender">
                    <Text style={styles.criteriaLabel}>Genre :</Text>
                    <Text style={styles.criteriaValue}>
                      {formatGender(service.criteria.gender)}
                    </Text>
                  </View>
                )}
                
                {(service.criteria.ageMin || service.criteria.ageMax) && (
                  <View style={styles.criteriaItem} testID="criteria-age">
                    <Text style={styles.criteriaLabel}>Âge :</Text>
                    <Text style={styles.criteriaValue}>
                      {service.criteria.ageMin && service.criteria.ageMax 
                        ? `${service.criteria.ageMin} à ${service.criteria.ageMax} ans`
                        : service.criteria.ageMin 
                          ? `Minimum ${service.criteria.ageMin} ans` 
                          : `Maximum ${service.criteria.ageMax} ans`}
                    </Text>
                  </View>
                )}
                
                {service.criteria.hairColor && service.criteria.hairColor.length > 0 && (
                  <View style={styles.criteriaItem} testID="criteria-hair">
                    <Text style={styles.criteriaLabel}>Cheveux :</Text>
                    <Text style={styles.criteriaValue}>
                      {service.criteria.hairColor.map(color => formatHairColor(color)).join(', ')}
                    </Text>
                  </View>
                )}
                
                {service.criteria.eyeColor && service.criteria.eyeColor.length > 0 && (
                  <View style={styles.criteriaItem} testID="criteria-eyes">
                    <Text style={styles.criteriaLabel}>Yeux :</Text>
                    <Text style={styles.criteriaValue}>
                      {service.criteria.eyeColor.map(color => formatEyeColor(color)).join(', ')}
                    </Text>
                  </View>
                )}
                
                {service.criteria.experience && (
                  <View style={styles.criteriaItem} testID="criteria-experience">
                    <Text style={styles.criteriaLabel}>Expérience requise</Text>
                  </View>
                )}
                
                {service.criteria.specificRequirements && (
                  <View style={styles.criteriaItem} testID="criteria-other">
                    <Text style={styles.criteriaLabel}>Autres critères :</Text>
                    <Text style={styles.criteriaValue}>
                      {service.criteria.specificRequirements}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          )}
          
          {/* Professionnel */}
          {professional && (
            <Card 
              variant="outlined" 
              padding="medium" 
              style={styles.section}
              onPress={navigateToProfessionalProfile}
              testID="professional-section"
            >
              <Text style={styles.sectionTitle}>Professionnel</Text>
              
              <View style={styles.professionalContainer} testID="professional-info">
                <Avatar
                  source={professional.profilePicture}
                  name={professional.fullName}
                  size="medium"
                  showStatus
                  isOnline={false}
                  testID="professional-avatar"
                />
                
                <View style={styles.professionalInfo}>
                  <Text style={styles.professionalName}>
                    {professional.fullName}
                  </Text>
                  <Text style={styles.professionalLocation}>
                    {professional.location.city}
                  </Text>
                  
                  {professional.rating && (
                    <View style={styles.ratingContainer} testID="professional-rating">
                      <Ionicons name="star" size={14} color={COLORS.warning} />
                      <Text style={styles.ratingText}>
                        {professional.rating.average.toFixed(1)} ({professional.rating.count})
                      </Text>
                    </View>
                  )}
                </View>
                
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </View>
            </Card>
          )}
          
          {/* Candidatures */}
          {isOwner && service?.applicationCount !== undefined && service.applicationCount > 0 && (
            <Card 
              variant="outlined" 
              padding="medium" 
              style={styles.section}
              onPress={() => {}} // Naviguer vers la liste des candidatures
              testID="applications-section"
            >
              <View style={styles.applicationsHeader}>
                <Text style={styles.sectionTitle}>Candidatures</Text>
                <Badge
                  label={service.applicationCount.toString()}
                  variant="filled"
                  color="primary"
                  size="small"
                  testID="applications-count"
                />
              </View>
              
              <Text style={styles.applicationsText}>
                Vous avez reçu {service.applicationCount} candidature{service.applicationCount > 1 ? 's' : ''} pour cette prestation.
              </Text>
              
              <Button
                label="Voir les candidatures"
                variant="outline"
                size="medium"
                rightIcon="chevron-forward"
                onPress={() => {}} // Naviguer vers la liste des candidatures
                style={styles.applicationsButton}
                testID="view-applications-button"
              />
            </Card>
          )}
        </View>
      </ScrollView>
      
      {/* Actions en bas de l'écran */}
      <View style={styles.actionBar} testID="action-bar">
        {/* Si propriétaire du service */}
        {isOwner && (
          <>
            {service?.status === ServiceStatus.DRAFT && (
              <Button
                label="Publier"
                variant="primary"
                leftIcon="checkmark-circle-outline"
                onPress={() => updateServiceStatus(ServiceStatus.ACTIVE)}
                loading={updating}
                disabled={updating}
                style={styles.actionButton}
                testID="publish-button"
              />
            )}
            
            {service?.status === ServiceStatus.ACTIVE && (
              <Button
                label="Marquer comme terminé"
                variant="primary"
                leftIcon="checkmark-done-outline"
                onPress={() => updateServiceStatus(ServiceStatus.COMPLETED)}
                loading={updating}
                disabled={updating}
                style={styles.actionButton}
                testID="complete-button"
              />
            )}
            
            {canEdit && (
              <Button
                label="Modifier"
                variant="outline"
                leftIcon="create-outline"
                onPress={navigateToEditService}
                disabled={updating}
                style={styles.actionButton}
                testID="edit-button"
              />
            )}
          </>
        )}
        
        {/* Si modèle */}
        {isModel && !isOwner && (
          <Button
            label={hasApplied ? "Voir ma candidature" : "Postuler"}
            variant="primary"
            leftIcon={hasApplied ? "eye-outline" : "paper-plane-outline"}
            onPress={hasApplied ? () => {} : navigateToCreateApplication}
            disabled={!canApply && !hasApplied}
            style={styles.actionButton}
            testID={hasApplied ? "view-application-button" : "apply-button"}
          />
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100, // Espace pour les boutons d'action
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large,
  },
  errorText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.gray,
    marginBottom: SPACING.medium,
  },
  imageSlider: {
    height: 300,
    position: 'relative',
  },
  image: {
    width: screenWidth,
    height: 300,
  },
  placeholderImage: {
    width: screenWidth,
    height: 300,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.gray,
    marginTop: SPACING.small,
  },
  urgentBadge: {
    position: 'absolute',
    top: SPACING.medium,
    left: SPACING.medium,
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.medium,
    right: SPACING.medium,
  },
  mainContent: {
    padding: SPACING.medium,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    marginRight: SPACING.small,
  },
  infoSection: {
    marginBottom: SPACING.large,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  infoText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    marginLeft: SPACING.small,
  },
  freeText: {
    color: COLORS.success,
  },
  paidText: {
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.small,
  },
  description: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    lineHeight: 24,
  },
  criteriaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.medium,
    marginBottom: SPACING.small,
  },
  criteriaLabel: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '500',
    color: COLORS.black,
    marginRight: SPACING.xs,
  },
  criteriaValue: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.gray,
  },
  professionalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  professionalInfo: {
    flex: 1,
    marginLeft: SPACING.medium,
  },
  professionalName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.black,
  },
  professionalLocation: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  ratingText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.black,
    marginLeft: 4,
  },
  applicationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  applicationsText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    marginBottom: SPACING.small,
  },
  applicationsButton: {
    alignSelf: 'flex-start',
    marginTop: SPACING.small,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.medium,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});