import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/constants';

export type BadgeVariant = 'filled' | 'outlined' | 'subtle';
export type BadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
export type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label?: string;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  leftIcon?: string;
  rightIcon?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'filled',
  color = 'primary',
  size = 'medium',
  leftIcon,
  rightIcon,
  style,
  textStyle,
  testID
}) => {
  // Déterminer les styles en fonction des props
  const badgeStyles: ViewStyle[] = [
    styles.badge,
    styles[`${variant}Badge`],
    styles[`${variant}${color}Badge`],
    styles[`${size}Badge`],
    style as ViewStyle
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${variant}${color}Text`],
    styles[`${size}Text`],
    textStyle as TextStyle
  ];

  // Calculer la taille de l'icône en fonction de la taille du badge
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  // Obtenir la couleur de l'icône en fonction de la variante et de la couleur
  const getIconColor = () => {
    if (variant === 'filled') {
      return COLORS.white;
    }
    
    return COLORS[color];
  };

  return (
    <View style={badgeStyles} testID={testID}>
      {leftIcon && (
        <Ionicons
          name={leftIcon as any}
          size={getIconSize()}
          color={getIconColor()}
          style={styles.leftIcon}
          testID={`${testID}-left-icon`}
        />
      )}
      
      {label && (
        <Text style={textStyles} testID={`${testID}-text`}>
          {label}
        </Text>
      )}
      
      {rightIcon && (
        <Ionicons
          name={rightIcon as any}
          size={getIconSize()}
          color={getIconColor()}
          style={styles.rightIcon}
          testID={`${testID}-right-icon`}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.round,
  },
  
  // Base variant styles
  filledBadge: {
    backgroundColor: COLORS.primary,
  },
  outlinedBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  subtleBadge: {
    backgroundColor: COLORS.lightGray,
  },
  
  // Color variants for filled
  filledprimaryBadge: {
    backgroundColor: COLORS.primary,
  },
  filledsecondaryBadge: {
    backgroundColor: COLORS.secondary,
  },
  filledsuccessBadge: {
    backgroundColor: COLORS.success,
  },
  filledwarningBadge: {
    backgroundColor: COLORS.warning,
  },
  fillederrorBadge: {
    backgroundColor: COLORS.error,
  },
  filledinfoBadge: {
    backgroundColor: COLORS.info,
  },
  filledgrayBadge: {
    backgroundColor: COLORS.gray,
  },
  
  // Color variants for outlined
  outlinedprimaryBadge: {
    borderColor: COLORS.primary,
  },
  outlinedsecondaryBadge: {
    borderColor: COLORS.secondary,
  },
  outlinedsuccessBadge: {
    borderColor: COLORS.success,
  },
  outlinedwarningBadge: {
    borderColor: COLORS.warning,
  },
  outlinederrorBadge: {
    borderColor: COLORS.error,
  },
  outlinedinfoBadge: {
    borderColor: COLORS.info,
  },
  outlinedgrayBadge: {
    borderColor: COLORS.gray,
  },
  
  // Color variants for subtle
  subtleprimaryBadge: {
    backgroundColor: `${COLORS.primary}20`,
  },
  subtlesecondaryBadge: {
    backgroundColor: `${COLORS.secondary}20`,
  },
  subtlesuccessBadge: {
    backgroundColor: `${COLORS.success}20`,
  },
  subtlewarningBadge: {
    backgroundColor: `${COLORS.warning}20`,
  },
  subtleerrorBadge: {
    backgroundColor: `${COLORS.error}20`,
  },
  subtleinfoBadge: {
    backgroundColor: `${COLORS.info}20`,
  },
  subtlegrayBadge: {
    backgroundColor: `${COLORS.gray}20`,
  },
  
  // Size variants
  smallBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 2,
  },
  mediumBadge: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.xs,
  },
  largeBadge: {
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.small,
  },
  
  // Text styles
  text: {
    fontWeight: '500',
  },
  
  // Text color variants
  filledText: {
    color: COLORS.white,
  },
  outlinedText: {
    color: COLORS.primary,
  },
  subtleText: {
    color: COLORS.primary,
  },
  
  // Text color variants by badge color
  filledprimaryText: {
    color: COLORS.white,
  },
  filledsecondaryText: {
    color: COLORS.white,
  },
  filledsuccessText: {
    color: COLORS.white,
  },
  filledwarningText: {
    color: COLORS.black,
  },
  fillederrorText: {
    color: COLORS.white,
  },
  filledinfoText: {
    color: COLORS.white,
  },
  filledgrayText: {
    color: COLORS.white,
  },
  
  outlinedprimaryText: {
    color: COLORS.primary,
  },
  outlinedsecondaryText: {
    color: COLORS.secondary,
  },
  outlinedsuccessText: {
    color: COLORS.success,
  },
  outlinedwarningText: {
    color: COLORS.warning,
  },
  outlinederrorText: {
    color: COLORS.error,
  },
  outlinedinfoText: {
    color: COLORS.info,
  },
  outlinedgrayText: {
    color: COLORS.gray,
  },
  
  subtleprimaryText: {
    color: COLORS.primary,
  },
  subtlesecondaryText: {
    color: COLORS.secondary,
  },
  subtlesuccessText: {
    color: COLORS.success,
  },
  subtlewarningText: {
    color: COLORS.warning,
  },
  subtleerrorText: {
    color: COLORS.error,
  },
  subtleinfoText: {
    color: COLORS.info,
  },
  subtlegrayText: {
    color: COLORS.gray,
  },
  
  // Text size variants
  smallText: {
    fontSize: FONT_SIZES.xs,
  },
  mediumText: {
    fontSize: FONT_SIZES.small,
  },
  largeText: {
    fontSize: FONT_SIZES.medium,
  },
  
  // Icon styles
  leftIcon: {
    marginRight: 4,
  },
  rightIcon: {
    marginLeft: 4,
  },
});