import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Card } from '../core/Card';
import { Badge } from '../core/Badge';
import { ServiceModel, ServiceStatus, PaymentType } from '../../domain/entities/ServiceModel';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { formatDate, formatServiceType, formatPaymentType } from '../../utils/formatters';

interface ServiceCardProps {
  service: ServiceModel;
  onPress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onPress,
  onFavoritePress,
  isFavorite = false,
  style,
  testID
}) => {
  // Obtenir l'image principale du service (première image ou placeholder)
  const mainImage = service.images && service.images.length > 0
    ? service.images[0]
    : 'https://via.placeholder.com/300x200/EEEEEE/999999?text=Modelo';
  
  // Formater le type de service
  const serviceTypeText = formatServiceType(service.type);
  
  // Formater le prix
  const priceText = formatPaymentType(service.payment.type, service.payment.amount);
  
  // Statut du service
  const getStatusBadge = () => {
    switch (service.status) {
      case ServiceStatus.ACTIVE:
        return <Badge label="Actif" variant="filled" color="success" size="small" />;
      case ServiceStatus.DRAFT:
        return <Badge label="Brouillon" variant="filled" color="warning" size="small" />;
      case ServiceStatus.COMPLETED:
        return <Badge label="Terminé" variant="filled" color="info" size="small" />;
      case ServiceStatus.CANCELLED:
        return <Badge label="Annulé" variant="filled" color="error" size="small" />;
      case ServiceStatus.EXPIRED:
        return <Badge label="Expiré" variant="filled" color="gray" size="small" />;
      default:
        return null;
    }
  };
  
  return (
    <Card
      variant="elevated"
      padding="none"
      onPress={onPress}
      style={[styles.card, style]}
      testID={testID}
    >
      {/* Image du service */}
      <View style={styles.imageContainer} testID={`${testID}-image-container`}>
        <Image
          source={{ uri: mainImage }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          testID={`${testID}-image`}
        />
        
        {/* Bouton favori */}
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoritePress}
            activeOpacity={0.8}
            testID={`${testID}-favorite-button`}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? COLORS.error : COLORS.white}
            />
          </TouchableOpacity>
        )}
        
        {/* Badge urgent */}
        {service.isUrgent && (
          <View style={styles.urgentBadgeContainer} testID={`${testID}-urgent-badge`}>
            <Badge
              label="Urgent"
              variant="filled"
              color="error"
              size="small"
              leftIcon="time-outline"
            />
          </View>
        )}
      </View>
      
      {/* Contenu du service */}
      <View style={styles.contentContainer} testID={`${testID}-content`}>
        {/* Titre et statut */}
        <View style={styles.titleRow}>
          <Text
            style={styles.title}
            numberOfLines={2}
            testID={`${testID}-title`}
          >
            {service.title}
          </Text>
          {getStatusBadge()}
        </View>
        
        {/* Métadonnées */}
        <View style={styles.metaContainer} testID={`${testID}-meta`}>
          {/* Type */}
          <View style={styles.metaItem}>
            <Ionicons name="pricetag-outline" size={16} color={COLORS.gray} />
            <Text style={styles.metaText} numberOfLines={1}>
              {serviceTypeText}
            </Text>
          </View>
          
          {/* Localisation */}
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={COLORS.gray} />
            <Text style={styles.metaText} numberOfLines={1}>
              {service.location.city}
            </Text>
          </View>
          
          {/* Date */}
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
            <Text style={styles.metaText} numberOfLines={1}>
              {formatDate(service.date.startDate)}
            </Text>
          </View>
          
          {/* Prix */}
          <View style={styles.metaItem}>
            <Ionicons
              name={service.payment.type === PaymentType.FREE ? 'gift-outline' : 'cash-outline'}
              size={16}
              color={COLORS.gray}
            />
            <Text
              style={[
                styles.metaText,
                service.payment.type === PaymentType.FREE ? styles.freeText : styles.paidText
              ]}
              numberOfLines={1}
              testID={`${testID}-price`}
            >
              {priceText}
            </Text>
          </View>
        </View>
        
        {/* Pied de carte */}
        <View style={styles.footer} testID={`${testID}-footer`}>
          <Text style={styles.applicationsCount}>
            {service.applicationCount || 0} candidature{service.applicationCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.medium,
    borderRadius: BORDER_RADIUS.regular,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.small,
    right: SPACING.small,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  urgentBadgeContainer: {
    position: 'absolute',
    top: SPACING.small,
    left: SPACING.small,
  },
  contentContainer: {
    padding: SPACING.medium,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.small,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    marginRight: SPACING.small,
    color: COLORS.black,
  },
  metaContainer: {
    marginBottom: SPACING.small,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  metaText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  freeText: {
    color: COLORS.success,
  },
  paidText: {
    color: COLORS.primary,
  },
  footer: {
    marginTop: SPACING.small,
    paddingTop: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationsCount: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
  },
});