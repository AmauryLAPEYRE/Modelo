import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/constants';

export type InputSize = 'small' | 'medium' | 'large';
export type InputVariant = 'outline' | 'filled' | 'underlined';

interface InputProps extends TextInputProps {
  label?: string;
  helper?: string;
  error?: string;
  size?: InputSize;
  variant?: InputVariant;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  helperStyle?: TextStyle;
  errorStyle?: TextStyle;
  required?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  onChangeText?: (text: string) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  helper,
  error,
  size = 'medium',
  variant = 'outline',
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  helperStyle,
  errorStyle,
  required = false,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  onChangeText,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(!secureTextEntry);

  // Déterminer les styles en fonction des props
  const containerStyles: ViewStyle[] = [
    styles.container,
    containerStyle as ViewStyle
  ];

  const labelStyles: TextStyle[] = [
    styles.label,
    focused && styles.focusedLabel,
    error ? styles.errorLabel : undefined,
    labelStyle as TextStyle
  ];

  const helperStyles: TextStyle[] = [
    styles.helper,
    error ? styles.errorHelper : undefined,
    helperStyle as TextStyle
  ];

  const inputWrapperStyles: ViewStyle[] = [
    styles.inputWrapper,
    styles[`${variant}Wrapper`],
    styles[`${size}Wrapper`],
    focused && styles.focusedWrapper,
    error ? styles.errorWrapper : undefined,
    multiline && styles.multilineWrapper
  ];

  const inputStyles: TextStyle[] = [
    styles.input,
    styles[`${size}Input`],
    leftIcon ? styles.inputWithLeftIcon : undefined,
    rightIcon || secureTextEntry ? styles.inputWithRightIcon : undefined,
    multiline && styles.multilineInput,
    inputStyle as TextStyle
  ];

  // Taille de l'icône en fonction de la taille de l'input
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

  // Gestion du toggle password
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Rendu de l'icône à droite (personnalisée ou toggle password)
  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.rightIconContainer}
        >
          <Ionicons
            name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={getIconSize()}
            color={COLORS.gray}
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={styles.rightIconContainer}
          disabled={!onRightIconPress}
        >
          <Ionicons
            name={rightIcon as any}
            size={getIconSize()}
            color={COLORS.gray}
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={containerStyles}>
      {/* Label */}
      {label && (
        <Text style={labelStyles}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Input avec icônes */}
      <View style={inputWrapperStyles}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons
              name={leftIcon as any}
              size={getIconSize()}
              color={COLORS.gray}
            />
          </View>
        )}

        <TextInput
          style={inputStyles}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secureTextEntry && !passwordVisible}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          onChangeText={onChangeText}
          placeholderTextColor={COLORS.gray}
          {...rest}
        />

        {renderRightIcon()}
      </View>

      {/* Message d'aide ou d'erreur */}
      {(helper || error) && (
        <Text style={helperStyles}>{error || helper}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.medium,
  },
  label: {
    fontSize: FONT_SIZES.small,
    marginBottom: SPACING.xs,
    color: COLORS.black,
    fontWeight: '500',
  },
  required: {
    color: COLORS.error,
  },
  focusedLabel: {
    color: COLORS.primary,
  },
  errorLabel: {
    color: COLORS.error,
  },
  helper: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
    color: COLORS.gray,
  },
  errorHelper: {
    color: COLORS.error,
  },
  
  // Wrapper styles
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  focusedWrapper: {
    borderColor: COLORS.primary,
  },
  errorWrapper: {
    borderColor: COLORS.error,
  },
  
  // Variants
  outlineWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.regular,
  },
  filledWrapper: {
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.regular,
  },
  underlinedWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  // Sizes
  smallWrapper: {
    height: 36,
  },
  mediumWrapper: {
    height: 44,
  },
  largeWrapper: {
    height: 52,
  },
  
  // Input styles
  input: {
    flex: 1,
    color: COLORS.black,
    paddingHorizontal: SPACING.medium,
  },
  smallInput: {
    fontSize: FONT_SIZES.small,
  },
  mediumInput: {
    fontSize: FONT_SIZES.medium,
  },
  largeInput: {
    fontSize: FONT_SIZES.large,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  
  // Icon containers
  leftIconContainer: {
    paddingLeft: SPACING.medium,
  },
  rightIconContainer: {
    paddingRight: SPACING.medium,
  },
  
  // Multiline
  multilineWrapper: {
    height: undefined,
    minHeight: 100,
    paddingVertical: SPACING.small,
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: SPACING.small,
  },
});