import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';

export interface ImageAsset {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
}

interface ImagePickerProps {
  images: ImageAsset[];
  onAddImages: () => void;
  onAddFromCamera?: () => void;
  onRemoveImage?: (index: number) => void;
  onImagePress?: (index: number) => void;
  maxImages?: number;
  title?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  images,
  onAddImages,
  onAddFromCamera,
  onRemoveImage,
  onImagePress,
  maxImages = 5,
  title = 'Images',
  style,
  testID
}) => {
  // Vérifier si la limite d'images est atteinte
  const isLimitReached = images.length >= maxImages;
  
  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Titre et compteur */}
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.counter}>
          {images.length}/{maxImages}
        </Text>
      </View>
      
      {/* Liste des images + boutons d'ajout */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        testID={`${testID}-scroll`}
      >
        {/* Images sélectionnées */}
        {images.map((image, index) => (
          <View key={`image-${index}`} style={styles.imageContainer} testID={`${testID}-image-${index}`}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => onImagePress && onImagePress(index)}
              style={styles.imageWrapper}
              testID={`${testID}-image-touch-${index}`}
            >
              <Image
                source={{ uri: image.uri }}
                style={styles.image}
                contentFit="cover"
                transition={300}
                testID={`${testID}-image-preview-${index}`}
              />
            </TouchableOpacity>
            
            {/* Bouton de suppression */}
            {onRemoveImage && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveImage(index)}
                activeOpacity={0.7}
                testID={`${testID}-remove-${index}`}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {/* Bouton d'ajout depuis la galerie */}
        {!isLimitReached && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddImages}
            activeOpacity={0.7}
            testID={`${testID}-add-gallery`}
          >
            <Ionicons name="images-outline" size={24} color={COLORS.primary} />
            <Text style={styles.addButtonText}>Galerie</Text>
          </TouchableOpacity>
        )}
        
        {/* Bouton d'ajout depuis la caméra */}
        {!isLimitReached && onAddFromCamera && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddFromCamera}
            activeOpacity={0.7}
            testID={`${testID}-add-camera`}
          >
            <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
            <Text style={styles.addButtonText}>Caméra</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {/* Message d'aide */}
      <Text style={styles.helperText} testID={`${testID}-helper`}>
        {images.length === 0
          ? 'Ajoutez des images pour votre prévisualisation'
          : isLimitReached
            ? `Nombre maximum d'images atteint (${maxImages})`
            : `Vous pouvez ajouter jusqu'à ${maxImages - images.length} image${maxImages - images.length > 1 ? 's' : ''} supplémentaire${maxImages - images.length > 1 ? 's' : ''}`
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.medium,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  title: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.black,
  },
  counter: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
  },
  scrollContent: {
    paddingBottom: SPACING.small,
  },
  imageContainer: {
    position: 'relative',
    marginRight: SPACING.small,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.small,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: 24,
    height: 24,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.small,
  },
  addButtonText: {
    marginTop: 4,
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
  },
  helperText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
});