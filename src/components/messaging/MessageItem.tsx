import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MessageModel, MessageType } from '../../domain/entities/MessageModel';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { formatMessageDate } from '../../utils/formatters';

interface MessageItemProps {
  message: MessageModel;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  onImagePress?: (imageUrl: string) => void;
  onLocationPress?: (latitude: number, longitude: number, address: string) => void;
  previousMessageSameSender?: boolean;
  testID?: string;
}

// Largeur maximale d'un message en pourcentage de l'écran
const MAX_WIDTH_PERCENTAGE = 0.75;
const screenWidth = Dimensions.get('window').width;

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isCurrentUser,
  showAvatar = true,
  onImagePress,
  onLocationPress,
  previousMessageSameSender = false,
  testID
}) => {
  // Déterminer le style du message en fonction de l'expéditeur
  const messageContainerStyle = isCurrentUser
    ? styles.currentUserMessageContainer
    : styles.otherUserMessageContainer;
  
  const messageContentStyle = isCurrentUser
    ? styles.currentUserMessageContent
    : styles.otherUserMessageContent;
  
  const messageTextStyle = isCurrentUser
    ? styles.currentUserMessageText
    : styles.otherUserMessageText;
  
  // Gérer les marges si messages consécutifs du même expéditeur
  const containerSpacing = previousMessageSameSender
    ? { marginTop: 2 }
    : { marginTop: SPACING.small };
  
  // Formater l'heure du message
  const dateText = formatMessageDate(message.createdAt);
  
  // Rendu du contenu du message en fonction du type
  const renderMessageContent = () => {
    switch (message.type) {
      case MessageType.TEXT:
        return (
          <Text style={messageTextStyle} testID={`${testID}-text`}>
            {message.content.text}
          </Text>
        );
      
      case MessageType.IMAGE:
        return (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onImagePress && message.content.mediaUrl && onImagePress(message.content.mediaUrl)}
            testID={`${testID}-image-container`}
          >
            <Image
              source={{ uri: message.content.mediaUrl }}
              style={styles.mediaImage}
              contentFit="cover"
              transition={300}
              testID={`${testID}-image`}
            />
          </TouchableOpacity>
        );
      
      case MessageType.VIDEO:
        return (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onImagePress && message.content.mediaUrl && onImagePress(message.content.mediaUrl)}
            style={styles.videoContainer}
            testID={`${testID}-video-container`}
          >
            <Image
              source={{ uri: message.content.mediaUrl }}
              style={styles.mediaImage}
              contentFit="cover"
              transition={300}
              testID={`${testID}-video-thumbnail`}
            />
            <View style={styles.playButtonOverlay}>
              <Ionicons name="play-circle" size={48} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        );
      
      case MessageType.LOCATION:
        if (message.content.location) {
          const { latitude, longitude, address } = message.content.location;
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => onLocationPress && onLocationPress(latitude, longitude, address)}
              style={styles.locationContainer}
              testID={`${testID}-location-container`}
            >
              <View style={styles.locationIconContainer}>
                <Ionicons name="location" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.locationText} numberOfLines={2} testID={`${testID}-location-text`}>
                {address}
              </Text>
              <Text style={styles.locationSubtext} testID={`${testID}-location-subtext`}>
                Appuyer pour ouvrir la carte
              </Text>
            </TouchableOpacity>
          );
        }
        return null;
      
      case MessageType.SYSTEM:
        return (
          <View style={styles.systemMessageContainer} testID={`${testID}-system-message`}>
            <Text style={styles.systemMessageText}>
              {message.content.text}
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };
  
  // Afficher simplement le message système au centre
  if (message.type === MessageType.SYSTEM) {
    return (
      <View style={styles.systemMessageWrapper} testID={`${testID}-system`}>
        {renderMessageContent()}
      </View>
    );
  }
  
  return (
    <View 
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
        containerSpacing
      ]}
      testID={testID}
    >
      {/* Contenu du message */}
      <View style={messageContainerStyle} testID={`${testID}-container`}>
        <View style={messageContentStyle} testID={`${testID}-content`}>
          {renderMessageContent()}
          
          {/* Heure d'envoi */}
          <Text style={styles.timeText} testID={`${testID}-time`}>
            {dateText}
            {message.isRead && isCurrentUser && (
              <Text style={styles.readStatus}>
                {' '}<Ionicons name="checkmark-done-outline" size={14} color={COLORS.info} />
              </Text>
            )}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: SPACING.small,
  },
  currentUserContainer: {
    justifyContent: 'flex-end',
  },
  otherUserContainer: {
    justifyContent: 'flex-start',
  },
  
  // Conteneurs de messages
  currentUserMessageContainer: {
    maxWidth: screenWidth * MAX_WIDTH_PERCENTAGE,
    alignItems: 'flex-end',
  },
  otherUserMessageContainer: {
    maxWidth: screenWidth * MAX_WIDTH_PERCENTAGE,
    alignItems: 'flex-start',
  },
  
  // Contenu des messages
  currentUserMessageContent: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.large,
    borderBottomRightRadius: 4,
    padding: SPACING.small,
    marginBottom: 2,
  },
  otherUserMessageContent: {
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.large,
    borderBottomLeftRadius: 4,
    padding: SPACING.small,
    marginBottom: 2,
  },
  
  // Texte des messages
  currentUserMessageText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.medium,
  },
  otherUserMessageText: {
    color: COLORS.black,
    fontSize: FONT_SIZES.medium,
  },
  
  // Heure d'envoi
  timeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  readStatus: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.info,
  },
  
  // Messages avec média
  mediaImage: {
    width: 200,
    height: 150,
    borderRadius: BORDER_RADIUS.small,
  },
  videoContainer: {
    position: 'relative',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: BORDER_RADIUS.small,
  },
  
  // Messages de localisation
  locationContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.small,
    padding: SPACING.small,
    width: 200,
  },
  locationIconContainer: {
    backgroundColor: 'rgba(0, 166, 153, 0.1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  locationText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    marginBottom: 4,
  },
  locationSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
  },
  
  // Messages système
  systemMessageWrapper: {
    alignItems: 'center',
    marginVertical: SPACING.medium,
  },
  systemMessageContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.xs,
    maxWidth: '70%',
  },
  systemMessageText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
    textAlign: 'center',
  },
});