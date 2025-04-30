import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Card } from '../core/Card';
import { Avatar } from '../core/Avatar';
import { Badge } from '../core/Badge';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { ApplicationModel, ApplicationStatus } from '../../domain/entities/ApplicationModel';
import { ServiceModel } from '../../domain/entities/ServiceModel';
import { UserModel } from '../../domain/entities/UserModel';
import { formatDate, formatApplicationStatus, formatRelativeDate } from '../../utils/formatters';

interface ApplicationCardProps {
  application: ApplicationModel;
  service?: ServiceModel;
  user?: UserModel;
  isUserProfessional?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  service,
  user,
  isUserProfessional = false,
  onPress,
  style,
  testID
}) => {
  // Obtenir la photo principale de la candidature (première photo ou placeholder)
  const mainImage = application.photos && application.photos.length > 0
    ? application.photos[0]
    : 'https://via.placeholder.com/300x200/EEEEEE/999999?text=Modelo';
  
  // Statut de la candidature
  const getStatusBadge = () => {
    switch (application.status) {
      case ApplicationStatus.PENDING:
        return <Badge label="En attente" variant="filled" color="warning" size="small" />;
      case ApplicationStatus.ACCEPTED:
        return <Badge label="Acceptée" variant="filled" color="success" size="small" />;
      case ApplicationStatus.REJECTED:
        return <Badge label="Refusée" variant="filled" color="error" size="small" />;
      case ApplicationStatus.CANCELLED:
        return <Badge label="Annulée" variant="filled" color="gray" size="small" />;
      case ApplicationStatus.COMPLETED:
        return <Badge label="Terminée" variant="filled" color="info" size="small" />;
      default:
        return null;
    }
  };
  
  return (
    <Card
      variant="elevated"
      padding="medium"
      onPress={onPress}
      style={[styles.card, style]}
      testID={testID}
    >
      <View style={styles.content}>
        {/* En-tête avec utilisateur et service */}
        <View style={styles.header} testID={`${testID}-header`}>
          {/* Profil utilisateur */}
          {user && (
            <View style={styles.userContainer} testID={`${testID}-user`}>
              <Avatar
                source={user.profilePicture}
                name={user.fullName}
                size="medium"
                testID={`${testID}-avatar`}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.fullName}
                </Text>
                <Text style={styles.userLocation} numberOfLines={1}>
                  {user.location.city}
                </Text>
              </View>
            </View>
          )}
          
          {/* Statut de la candidature */}
          <View testID={`${testID}-status`}>
            {getStatusBadge()}
          </View>
        </View>
        
        {/* Service concerné (affiché seulement si fourni) */}
        {service && (
          <View style={styles.serviceContainer} testID={`${testID}-service`}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName} numberOfLines={2}>
                {service.title}
              </Text>
              <View style={styles.serviceDetailsRow}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
                <Text style={styles.serviceDetailsText}>
                  {formatDate(service.date.startDate)}
                </Text>
              </View>
              <View style={styles.serviceDetailsRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                <Text style={styles.serviceDetailsText}>
                  {service.location.city}
                </Text>
              </View>
            </View>
            
            {service.images && service.images.length > 0 && (
              <View style={styles.serviceImageContainer}>
                <Image
                  source={{ uri: service.images[0] }}
                  style={styles.serviceImage}
                  contentFit="cover"
                  transition={300}
                  testID={`${testID}-service-image`}
                />
              </View>
            )}
          </View>
        )}
        
        {/* Contenu de la candidature */}
        <View style={styles.applicationContent} testID={`${testID}-content`}>
          {/* Image principale */}
          <Image
            source={{ uri: mainImage }}
            style={styles.mainImage}
            contentFit="cover"
            transition={300}
            testID={`${testID}-main-image`}
          />
          
          {/* Prévisualisation du message */}
          {application.message && (
            <Text style={styles.messagePreview} numberOfLines={2} testID={`${testID}-message`}>
              {application.message}
            </Text>
          )}
          
          {/* Indicateur de messages non lus */}
          {application.hasUnreadMessages && (
            <View style={styles.unreadIndicator} testID={`${testID}-unread`}>
              <Badge
                label="Messages non lus"
                variant="filled"
                color="primary"
                size="small"
                leftIcon="mail-unread-outline"
              />
            </View>
          )}
        </View>
        
        {/* Pied de carte */}
        <View style={styles.footer} testID={`${testID}-footer`}>
          <Text style={styles.dateText}>
            {formatRelativeDate(application.createdAt)}
          </Text>
          
          {/* Raison du refus si rejetée */}
          {application.status === ApplicationStatus.REJECTED && application.rejectionReason && (
            <Text style={styles.rejectionReason} testID={`${testID}-rejection-reason`}>
              Motif : {application.rejectionReason}
            </Text>
          )}
          
          {/* Actions possibles selon l'utilisateur et le statut */}
          {application.status === ApplicationStatus.PENDING && (
            <View style={styles.actionIndicator}>
              {isUserProfessional ? (
                <Text style={styles.actionText}>
                  <Ionicons name="arrow-forward-outline" size={14} color={COLORS.primary} />
                  {' '}Répondre
                </Text>
              ) : (
                <Text style={styles.waitingText}>
                  <Ionicons name="time-outline" size={14} color={COLORS.warning} />
                  {' '}En attente de réponse
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.medium,
  },
  content: {
    gap: SPACING.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfo: {
    marginLeft: SPACING.small,
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.black,
  },
  userLocation: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
  },
  serviceContainer: {
    flexDirection: 'row',
    padding: SPACING.small,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.small,
  },
  serviceInfo: {
    flex: 1,
    marginRight: SPACING.small,
  },
  serviceName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  serviceDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  serviceDetailsText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
    marginLeft: 4,
  },
  serviceImageContainer: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.small,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  applicationContent: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 180,
    borderRadius: BORDER_RADIUS.regular,
  },
  messagePreview: {
    marginTop: SPACING.small,
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    lineHeight: 22,
  },
  unreadIndicator: {
    position: 'absolute',
    top: SPACING.small,
    right: SPACING.small,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SPACING.small,
  },
  dateText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
  },
  rejectionReason: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.small,
    color: COLORS.error,
    fontStyle: 'italic',
  },
  actionIndicator: {
    marginTop: SPACING.xs,
  },
  actionText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
  waitingText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.warning,
    fontWeight: '500',
  },
});