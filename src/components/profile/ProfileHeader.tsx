import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Avatar } from '../core/Avatar';
import { Badge } from '../core/Badge';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { UserModel, UserRole } from '../../domain/entities/UserModel';
import { formatUserRole } from '../../utils/formatters';

interface ProfileHeaderProps {
  user: UserModel;
  rating?: { average: number; count: number };
  isCurrentUser?: boolean;
  onEditPress?: () => void;
  onImagePress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  rating,
  isCurrentUser = false,
  onEditPress,
  onImagePress,
  style,
  testID
}) => {
  // Formatage des valeurs
  const userRoleText = formatUserRole(user.role);
  const ratingText = rating ? `${rating.average.toFixed(1)} (${rating.count})` : 'Nouveau';
  
  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Fond avec dégradé */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBackground}
      />
      
      {/* Contenu du header */}
      <View style={styles.contentContainer}>
        {/* Avatar avec possibilité de mettre à jour pour l'utilisateur courant */}
        <TouchableOpacity
          onPress={isCurrentUser ? onImagePress : undefined}
          activeOpacity={isCurrentUser ? 0.7 : 1}
          style={styles.avatarContainer}
          testID={`${testID}-avatar-container`}
        >
          <Avatar
            source={user.profilePicture}
            name={user.fullName}
            size="xl"
            showIcon={isCurrentUser}
            iconName="camera-outline"
            showStatus={!isCurrentUser}
            isOnline={false}
            testID={`${testID}-avatar`}
          />
        </TouchableOpacity>
        
        {/* Informations de l'utilisateur */}
        <View style={styles.userInfoContainer} testID={`${testID}-user-info`}>
          <Text style={styles.userName} testID={`${testID}-user-name`}>
            {user.fullName}
          </Text>
          
          {/* Badge de rôle et vérification */}
          <View style={styles.badgesContainer}>
            <Badge
              label={userRoleText}
              variant="filled"
              color={user.role === UserRole.MODEL ? 'secondary' : 'primary'}
              size="small"
              testID={`${testID}-role-badge`}
            />
            
            {user.isVerified && (
              <Badge
                label="Vérifié"
                variant="filled"
                color="success"
                size="small"
                leftIcon="checkmark-circle-outline"
                style={styles.verifiedBadge}
                testID={`${testID}-verified-badge`}
              />
            )}
          </View>
          
          {/* Localisation */}
          <View style={styles.infoRow} testID={`${testID}-location`}>
            <Ionicons name="location-outline" size={16} color={COLORS.white} />
            <Text style={styles.infoText}>
              {user.location.city}{user.location.radius ? ` (${user.location.radius} km)` : ''}
            </Text>
          </View>
          
          {/* Note */}
          <View style={styles.infoRow} testID={`${testID}-rating`}>
            <Ionicons name="star-outline" size={16} color={COLORS.white} />
            <Text style={styles.infoText}>{ratingText}</Text>
          </View>
        </View>
        
        {/* Bouton d'édition pour l'utilisateur courant */}
        {isCurrentUser && onEditPress && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEditPress}
            activeOpacity={0.7}
            testID={`${testID}-edit-button`}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.white} />
            <Text style={styles.editButtonText}>Modifier</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Onglets de bio, expérience, etc. seront ajoutés dans un composant séparé */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderBottomLeftRadius: BORDER_RADIUS.regular,
    borderBottomRightRadius: BORDER_RADIUS.regular,
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    padding: SPACING.large,
    paddingBottom: SPACING.xl,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: SPACING.medium,
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  userName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.small,
  },
  verifiedBadge: {
    marginLeft: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  infoText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  editButton: {
    position: 'absolute',
    top: SPACING.medium,
    right: SPACING.medium,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.small,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.small,
    marginLeft: 4,
  },
});