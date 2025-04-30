import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, BORDER_RADIUS } from '../../utils/constants';

export type AvatarSize = 'xs' | 'small' | 'medium' | 'large' | 'xl';
export type AvatarVariant = 'circle' | 'rounded' | 'square';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  onPress?: () => void;
  showStatus?: boolean;
  isOnline?: boolean;
  showBadge?: boolean;
  badgeContent?: React.ReactNode;
  showIcon?: boolean;
  iconName?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  variant = 'circle',
  onPress,
  showStatus = false,
  isOnline = false,
  showBadge = false,
  badgeContent,
  showIcon = false,
  iconName = 'camera-outline',
  style,
  imageStyle,
  containerStyle,
  testID
}) => {
  // Obtenir les dimensions en fonction de la taille
  const getDimensions = () => {
    switch (size) {
      case 'xs':
        return 24;
      case 'small':
        return 36;
      case 'medium':
        return 48;
      case 'large':
        return 64;
      case 'xl':
        return 96;
      default:
        return 48;
    }
  };

  // Obtenir la taille de la police pour les initiales
  const getFontSize = () => {
    switch (size) {
      case 'xs':
        return 10;
      case 'small':
        return 14;
      case 'medium':
        return 18;
      case 'large':
        return 24;
      case 'xl':
        return 36;
      default:
        return 18;
    }
  };

  // Obtenir le rayon de la bordure en fonction de la variante
  const getBorderRadius = () => {
    const dimension = getDimensions();
    
    switch (variant) {
      case 'circle':
        return dimension / 2;
      case 'rounded':
        return BORDER_RADIUS.regular;
      case 'square':
        return 0;
      default:
        return dimension / 2;
    }
  };

  // Calculer les initiales à partir du nom
  const getInitials = () => {
    if (!name) return '';
    
    const nameParts = name.split(' ').filter(part => part.length > 0);
    
    if (nameParts.length === 0) return '';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  };

  // Styles de l'avatar
  const avatarDimension = getDimensions();
  const avatarBorderRadius = getBorderRadius();
  const initialsFontSize = getFontSize();

  const avatarStyles: ViewStyle = {
    width: avatarDimension,
    height: avatarDimension,
    borderRadius: avatarBorderRadius,
    backgroundColor: !source ? COLORS.secondary : undefined,
    ...StyleSheet.flatten(style)
  };

  const containerStyles: ViewStyle = {
    position: 'relative',
    ...StyleSheet.flatten(containerStyle)
  };

  const initialsStyles: TextStyle = {
    color: COLORS.white,
    fontSize: initialsFontSize,
    fontWeight: 'bold',
  };

  // Récupérer la taille du statut et du badge en fonction de la taille de l'avatar
  const getStatusSize = () => {
    switch (size) {
      case 'xs':
        return 6;
      case 'small':
        return 8;
      case 'medium':
        return 10;
      case 'large':
        return 12;
      case 'xl':
        return 16;
      default:
        return 10;
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'xs':
        return 12;
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      case 'xl':
        return 32;
      default:
        return 20;
    }
  };

  const statusSize = getStatusSize();
  const badgeSize = getBadgeSize();

  // Rendu de l'avatar
  const renderAvatar = () => (
    <View style={containerStyles}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[avatarStyles, imageStyle]}
          contentFit="cover"
          transition={300}
          testID={`${testID}-image`}
        />
      ) : (
        <View style={[avatarStyles, styles.initialsContainer]} testID={`${testID}-initials`}>
          <Text style={initialsStyles}>{getInitials()}</Text>
        </View>
      )}

      {/* Status indicator */}
      {showStatus && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: statusSize,
              height: statusSize,
              backgroundColor: isOnline ? COLORS.success : COLORS.gray,
              borderRadius: statusSize / 2,
            },
          ]}
          testID={`${testID}-status`}
        />
      )}

      {/* Badge */}
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              minWidth: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
            },
          ]}
          testID={`${testID}-badge`}
        >
          {badgeContent}
        </View>
      )}

      {/* Icon overlay */}
      {showIcon && (
        <View
          style={[
            styles.iconOverlay,
            {
              borderRadius: avatarBorderRadius,
            },
          ]}
          testID={`${testID}-icon-overlay`}
        >
          <Ionicons
            name={iconName as any}
            size={avatarDimension / 2}
            color={COLORS.white}
          />
        </View>
      )}
    </View>
  );

  // Si onPress est fourni, envelopper dans un TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} testID={testID}>
        {renderAvatar()}
      </TouchableOpacity>
    );
  }

  return renderAvatar();
};

const styles = StyleSheet.create({
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  iconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});