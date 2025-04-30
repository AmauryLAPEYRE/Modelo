import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/constants';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  label,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...rest
}) => {
  // Déterminer les styles en fonction des props
  const buttonStyles: ViewStyle[] = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabledButton,
    style as ViewStyle
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle as TextStyle
  ];

  // Taille de l'icône en fonction de la taille du bouton
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  // Couleur de l'icône en fonction de la variante
  const getIconColor = () => {
    if (disabled) return COLORS.gray;
    
    switch (variant) {
      case 'primary':
        return COLORS.white;
      case 'secondary':
        return COLORS.white;
      case 'outline':
        return COLORS.primary;
      case 'ghost':
        return COLORS.primary;
      case 'danger':
        return COLORS.white;
      default:
        return COLORS.white;
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {/* Icône gauche */}
      {leftIcon && !loading && (
        <Ionicons
          name={leftIcon as any}
          size={getIconSize()}
          color={getIconColor()}
          style={styles.leftIcon}
        />
      )}

      {/* Indicateur de chargement */}
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white}
          style={styles.leftIcon}
        />
      )}

      {/* Texte du bouton */}
      {label && <Text style={textStyles}>{label}</Text>}

      {/* Icône droite */}
      {rightIcon && !loading && (
        <Ionicons
          name={rightIcon as any}
          size={getIconSize()}
          color={getIconColor()}
          style={styles.rightIcon}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.regular,
  },
  
  // Variantes
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  
  // Tailles
  smallButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.xs,
    minHeight: 32,
  },
  mediumButton: {
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.small,
    minHeight: 40,
  },
  largeButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.medium,
    minHeight: 48,
  },
  
  // Styles de texte
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.primary,
  },
  ghostText: {
    color: COLORS.primary,
  },
  dangerText: {
    color: COLORS.white,
  },
  
  // Tailles de texte
  smallText: {
    fontSize: FONT_SIZES.small,
  },
  mediumText: {
    fontSize: FONT_SIZES.medium,
  },
  largeText: {
    fontSize: FONT_SIZES.large,
  },
  
  // Autres styles
  fullWidth: {
    width: '100%',
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.border,
    opacity: 0.7,
  },
  disabledText: {
    color: COLORS.gray,
  },
  leftIcon: {
    marginRight: SPACING.small,
  },
  rightIcon: {
    marginLeft: SPACING.small,
  },
});