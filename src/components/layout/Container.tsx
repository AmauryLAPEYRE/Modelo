import React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ViewStyle,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  RefreshControl,
  ScrollViewProps
} from 'react-native';
import { COLORS } from '../../utils/constants';

export type ContainerBackground = 'default' | 'white' | 'light' | 'primary' | 'secondary' | 'transparent';
export type ContainerPadding = 'none' | 'small' | 'medium' | 'large';

interface ContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  background?: ContainerBackground;
  padding?: ContainerPadding;
  scrollable?: boolean;
  safeArea?: boolean;
  keyboardAvoiding?: boolean;
  scrollViewRef?: React.RefObject<ScrollView>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  statusBarStyle?: 'dark-content' | 'light-content';
  statusBarColor?: string;
  testID?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  background = 'default',
  padding = 'medium',
  scrollable = true,
  safeArea = true,
  keyboardAvoiding = false,
  scrollViewRef,
  contentContainerStyle,
  style,
  refreshing,
  onRefresh,
  header,
  footer,
  statusBarStyle = 'dark-content',
  statusBarColor,
  testID,
  ...scrollViewProps
}) => {
  // Déterminer les styles en fonction des props
  const containerStyles: ViewStyle[] = [
    styles.container,
    styles[`${background}Background`],
    padding !== 'none' && styles[`${padding}Padding`],
    style as ViewStyle
  ];

  const contentContainerStyles: ViewStyle[] = [
    styles.contentContainer,
    scrollable && styles.scrollableContentContainer,
    contentContainerStyle as ViewStyle
  ];

  // Statut de la barre de statut
  const statusBarBackgroundColor = statusBarColor || styles[`${background}Background`].backgroundColor;

  // Rendu du contenu
  const renderContent = () => {
    // Contenu principal
    const content = scrollable ? (
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={contentContainerStyles}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing || false}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          ) : undefined
        }
        keyboardShouldPersistTaps="handled"
        {...scrollViewProps}
        testID={`${testID}-scroll-view`}
      >
        {children}
      </ScrollView>
    ) : (
      <View style={contentContainerStyles} testID={`${testID}-content`}>
        {children}
      </View>
    );

    // Si keyboard avoiding est activé, envelopper dans KeyboardAvoidingView
    if (keyboardAvoiding) {
      return (
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          testID={`${testID}-keyboard-avoiding`}
        >
          {content}
        </KeyboardAvoidingView>
      );
    }

    return content;
  };

  // Container final
  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarBackgroundColor}
        translucent
      />
      {safeArea ? (
        <SafeAreaView style={containerStyles} testID={testID}>
          {header}
          {renderContent()}
          {footer}
        </SafeAreaView>
      ) : (
        <View style={containerStyles} testID={testID}>
          {header}
          {renderContent()}
          {footer}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Backgrounds
  defaultBackground: {
    backgroundColor: COLORS.background,
  },
  whiteBackground: {
    backgroundColor: COLORS.white,
  },
  lightBackground: {
    backgroundColor: COLORS.lightGray,
  },
  primaryBackground: {
    backgroundColor: COLORS.primary,
  },
  secondaryBackground: {
    backgroundColor: COLORS.secondary,
  },
  transparentBackground: {
    backgroundColor: 'transparent',
  },
  
  // Padding
  nonePadding: {
    padding: 0,
  },
  smallPadding: {
    padding: 8,
  },
  mediumPadding: {
    padding: 16,
  },
  largePadding: {
    padding: 24,
  },
  
  // Scroll view
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  scrollableContentContainer: {
    flexGrow: 1,
  },
  
  // Keyboard avoiding
  keyboardAvoiding: {
    flex: 1,
  },
});