import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp
} from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../../utils/constants';

export type CardVariant = 'default' | 'outlined' | 'elevated';
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  onPress,
  disabled = false,
  style,
  testID
}) => {
  // Déterminer les styles en fonction des props
  const cardStyles: ViewStyle[] = [
    styles.card,
    styles[`${variant}Card`],
    padding !== 'none' && styles[`${padding}Padding`],
    style as ViewStyle
  ];

  // Si un onPress est fourni, rendre un TouchableOpacity, sinon une View
  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.regular,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  
  // Variants
  defaultCard: {
    backgroundColor: COLORS.white,
  },
  outlinedCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  elevatedCard: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  
  // Padding
  smallPadding: {
    padding: SPACING.small,
  },
  mediumPadding: {
    padding: SPACING.medium,
  },
  largePadding: {
    padding: SPACING.large,
  },
});

// Section de carte avec un style distinct
interface CardSectionProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const CardSection: React.FC<CardSectionProps> = ({
  children,
  style,
  testID
}) => {
  return (
    <View style={[styles.section, style]} testID={testID}>
      {children}
    </View>
  );
};

const sectionStyles = StyleSheet.create({
  section: {
    padding: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});

// Ajouter les styles de section
Object.assign(styles, sectionStyles);