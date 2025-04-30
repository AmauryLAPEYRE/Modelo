import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  StyleProp
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export interface TabItem {
  key: string;
  label: string;
  icon: string;
  activeIcon?: string;
  badge?: number;
  onPress: () => void;
}

interface BottomTabsProps {
  tabs: TabItem[];
  activeTab: string;
  variant?: 'solid' | 'blur';
  showBorder?: boolean;
  showLabels?: boolean;
  style?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({
  tabs,
  activeTab,
  variant = 'solid',
  showBorder = true,
  showLabels = true,
  style,
  tabStyle,
  labelStyle,
  testID
}) => {
  // Obtenir les insets de la zone de sécurité
  const insets = useSafeAreaInsets();
  
  // Styles du container
  const containerStyles: ViewStyle[] = [
    styles.container,
    showBorder && styles.border,
    { paddingBottom: Math.max(insets.bottom, 10) },
    style as ViewStyle
  ];

  // Rendu d'un onglet individuel
  const renderTab = (tab: TabItem, index: number) => {
    const isActive = tab.key === activeTab;
    const iconName = isActive && tab.activeIcon ? tab.activeIcon : tab.icon;
    
    return (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.tab,
          tabStyle as ViewStyle
        ]}
        onPress={tab.onPress}
        activeOpacity={0.7}
        testID={`${testID}-tab-${tab.key}`}
      >
        <View style={styles.tabContent}>
          {/* Icône */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={iconName as any}
              size={24}
              color={isActive ? COLORS.primary : COLORS.gray}
            />
            
            {/* Badge (si présent) */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <View style={styles.badge} testID={`${testID}-badge-${tab.key}`}>
                <Text style={styles.badgeText}>
                  {tab.badge > 99 ? '99+' : tab.badge}
                </Text>
              </View>
            )}
          </View>
          
          {/* Label */}
          {showLabels && (
            <Text
              style={[
                styles.label,
                isActive ? styles.activeLabel : styles.inactiveLabel,
                labelStyle as TextStyle
              ]}
              numberOfLines={1}
              testID={`${testID}-label-${tab.key}`}
            >
              {tab.label}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Rendu du composant
  if (variant === 'blur' && Platform.OS === 'ios') {
    return (
      <BlurView intensity={80} tint="light" style={containerStyles} testID={testID}>
        <View style={styles.tabsRow}>
          {tabs.map(renderTab)}
        </View>
      </BlurView>
    );
  }

  return (
    <View style={containerStyles} testID={testID}>
      <View style={styles.tabsRow}>
        {tabs.map(renderTab)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingTop: SPACING.small,
  },
  border: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  label: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
    textAlign: 'center',
  },
  activeLabel: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  inactiveLabel: {
    color: COLORS.gray,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});