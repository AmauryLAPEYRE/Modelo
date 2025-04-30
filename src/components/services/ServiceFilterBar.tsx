import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { CategoryModel } from '../../domain/entities/CategoryModel';

interface ServiceFilterBarProps {
  categories: CategoryModel[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  onSearchPress: () => void;
  onFilterPress: () => void;
  showAdvancedFilters?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ServiceFilterBar: React.FC<ServiceFilterBarProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  onSearchPress,
  onFilterPress,
  showAdvancedFilters = true,
  style,
  testID
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Boutons de recherche et filtre */}
      <View style={styles.actionsContainer} testID={`${testID}-actions`}>
        {/* Bouton de recherche */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={onSearchPress}
          activeOpacity={0.7}
          testID={`${testID}-search-button`}
        >
          <Ionicons name="search-outline" size={20} color={COLORS.gray} />
          <Text style={styles.searchButtonText}>Rechercher...</Text>
        </TouchableOpacity>
        
        {/* Bouton de filtre avancé */}
        {showAdvancedFilters && (
          <TouchableOpacity
            style={styles.filterButton}
            onPress={onFilterPress}
            activeOpacity={0.7}
            testID={`${testID}-filter-button`}
          >
            <Ionicons name="options-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Filtres de catégories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        testID={`${testID}-categories`}
      >
        {categories.map((category) => {
          const isSelected = category.id === selectedCategory;
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                isSelected && styles.selectedCategoryButton
              ]}
              onPress={() => onCategorySelect(category.id)}
              activeOpacity={0.7}
              testID={`${testID}-category-${category.id}`}
            >
              <Ionicons
                name={category.icon as any}
                size={18}
                color={isSelected ? COLORS.white : COLORS.gray}
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.selectedCategoryText
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingTop: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.medium,
    marginBottom: SPACING.small,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },
  searchButtonText: {
    color: COLORS.gray,
    marginLeft: SPACING.small,
    fontSize: FONT_SIZES.medium,
  },
  filterButton: {
    marginLeft: SPACING.small,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.round,
    padding: SPACING.small,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.medium,
    paddingBottom: SPACING.small,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.small,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
});