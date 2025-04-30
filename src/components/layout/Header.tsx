import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, FONT_SIZES, SPACING } from '../../utils/constants';

export type HeaderVariant = 'default' | 'transparent' | 'primary' | 'white';
export type HeaderAlignment = 'left' | 'center';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  variant?: HeaderVariant;
  alignment?: HeaderAlignment;
  showBack?: boolean;
  showBorder?: boolean;
  showShadow?: boolean;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  variant = 'default',
  alignment = 'left',
  showBack = false,
  showBorder = true,
  showShadow = false,
  leftComponent,
  rightComponent,
  style,
  titleStyle,
  subtitleStyle,
  testID
}) => {
  // Obtenir les insets de la zone de sécurité
  const insets = useSafeAreaInsets();
  
  // Détecter si l'écran est de retour en arrière
  const handleBackPress = () => {
    router.back();
  };

  // Styles du header en fonction des props
  const headerStyles: ViewStyle[] = [
    styles.header,
    styles[`${variant}Header`],
    showBorder && styles.borderBottom,
    showShadow && styles.shadow,
    { paddingTop: Platform.OS === 'ios' ? insets.top : SPACING.medium },
    style as ViewStyle
  ];

  // Styles du titre en fonction des props
  const titleContainerStyles: ViewStyle = {
    ...styles.titleContainer,
    ...(alignment === 'center' ? styles.titleCentered : {})
  };

  const titleTextStyles: TextStyle[] = [
    styles.title,
    styles[`${variant}Title`],
    titleStyle as TextStyle
  ];

  const subtitleTextStyles: TextStyle[] = [
    styles.subtitle,
    styles[`${variant}Subtitle`],
    subtitleStyle as TextStyle
  ];

  // Calculer la couleur de l'icône en fonction de la variante
  const getIconColor = () => {
    switch (variant) {
      case 'transparent':
        return COLORS.white;
      case 'primary':
        return COLORS.white;
      case 'white':
        return COLORS.black;
      default:
        return COLORS.black;
    }
  };

  // Rendu du bouton gauche (back ou personnalisé)
  const renderLeftButton = () => {
    if (leftComponent) {
      return leftComponent;
    }
    
    if (showBack) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onLeftPress || handleBackPress}
          activeOpacity={0.7}
          testID={`${testID}-back-button`}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={getIconColor()}
          />
        </TouchableOpacity>
      );
    }
    
    if (leftIcon) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onLeftPress}
          activeOpacity={0.7}
          disabled={!onLeftPress}
          testID={`${testID}-left-button`}
        >
          <Ionicons
            name={leftIcon as any}
            size={24}
            color={getIconColor()}
          />
        </TouchableOpacity>
      );
    }
    
    return <View style={styles.iconPlaceholder} />;
  };

  // Rendu du bouton droit
  const renderRightButton = () => {
    if (rightComponent) {
      return rightComponent;
    }
    
    if (rightIcon) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onRightPress}
          activeOpacity={0.7}
          disabled={!onRightPress}
          testID={`${testID}-right-button`}
        >
          <Ionicons
            name={rightIcon as any}
            size={24}
            color={getIconColor()}
          />
        </TouchableOpacity>
      );
    }
    
    return <View style={styles.iconPlaceholder} />;
  };

  return (
    <View style={headerStyles} testID={testID}>
      {/* Bouton gauche */}
      {renderLeftButton()}

      {/* Titre et sous-titre */}
      <View style={titleContainerStyles}>
        {title && (
          <Text style={titleTextStyles} numberOfLines={1} testID={`${testID}-title`}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={subtitleTextStyles} numberOfLines={1} testID={`${testID}-subtitle`}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Bouton droit */}
      {renderRightButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: SPACING.medium,
    paddingHorizontal: SPACING.medium,
    height: 60 + (Platform.OS === 'ios' ? 40 : 0), // Hauteur de base + espace pour le statusbar iOS
  },
  
  // Variantes de header
  defaultHeader: {
    backgroundColor: COLORS.background,
  },
  transparentHeader: {
    backgroundColor: 'transparent',
  },
  primaryHeader: {
    backgroundColor: COLORS.primary,
  },
  whiteHeader: {
    backgroundColor: COLORS.white,
  },
  
  // Styles de bordure et ombre
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  shadow: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Styles des boutons
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  iconPlaceholder: {
    width: 40,
  },
  
  // Styles du titre
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: SPACING.small,
  },
  titleCentered: {
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: FONT_SIZES.small,
    marginTop: 2,
  },
  
  // Variantes de couleur pour le titre
  defaultTitle: {
    color: COLORS.black,
  },
  transparentTitle: {
    color: COLORS.white,
  },
  primaryTitle: {
    color: COLORS.white,
  },
  whiteTitle: {
    color: COLORS.black,
  },
  
  // Variantes de couleur pour le sous-titre
  defaultSubtitle: {
    color: COLORS.gray,
  },
  transparentSubtitle: {
    color: COLORS.white,
  },
  primarySubtitle: {
    color: COLORS.white,
  },
  whiteSubtitle: {
    color: COLORS.gray,
  },
});