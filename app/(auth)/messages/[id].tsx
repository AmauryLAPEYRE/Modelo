import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Container } from '../../../src/components/layout/Container';
import { Header } from '../../../src/components/layout/Header';
import { MessageItem } from '../../../src/components/messaging/MessageItem';
import { useMessagingViewModel } from '../../../src/viewModels/useMessagingViewModel';
// import { useMedia } from '../../../src/utils/hooks/useMedia';
import { MessageModel } from '../../../src/domain/entities/MessageModel';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/utils/constants';

/**
 * Écran de conversation (messages d'une candidature)
 */
export default function ConversationScreen() {
  // Récupérer l'ID de la conversation depuis les paramètres de route
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Références
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  
  // États locaux
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Hooks
  const mediaHook = useMedia({
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.7
  });
  
  // ViewModel
  const {
    loading,
    refreshing,
    messages,
    application,
    service,
    partner,
    refreshData,
    sendTextMessage,
    sendImageMessage,
    navigateToServiceDetail,
    navigateToPartnerProfile,
    navigateToApplicationDetail
  } = useMessagingViewModel(id);
  
  // Écouter les événements du clavier
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        scrollToBottom();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Faire défiler automatiquement jusqu'au bas lors du chargement des messages
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      scrollToBottom();
    }
  }, [messages, loading]);

  // Fonction pour faire défiler jusqu'au bas
  const scrollToBottom = (animated = true) => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated });
      }, 100);
    }
  };

  // Envoyer un message texte
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const success = await sendTextMessage(message);
    
    if (success) {
      setMessage('');
      setInputHeight(40);
      inputRef.current?.clear();
      scrollToBottom();
    }
  };

  // Envoyer une image
  const handleSendImage = async () => {
    try {
      const selectedMedia = await mediaHook.pickFromGallery();
      
      if (selectedMedia.length > 0) {
        const imageBlob = await mediaHook.assetToBlob(selectedMedia[0]);
        await sendImageMessage(imageBlob);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending image:', error);
    }
  };

  // Rendu de l'élément de message
  const renderMessageItem = ({ item, index }: { item: MessageModel; index: number }) => {
    // Déterminer si l'utilisateur actuel est l'expéditeur
    const isCurrentUser = item.senderId !== partner?.id && item.senderId !== 'system';
    
    // Déterminer si le message précédent provient du même expéditeur
    const previousMessageSameSender = index > 0 && messages[index - 1].senderId === item.senderId;
    
    return (
      <MessageItem
        message={item}
        isCurrentUser={isCurrentUser}
        showAvatar={!previousMessageSameSender}
        previousMessageSameSender={previousMessageSameSender}
        onImagePress={(url) => {
          // Afficher l'image en plein écran
        }}
        onLocationPress={(lat, lng, address) => {
          // Ouvrir la carte
        }}
        testID={`message-${item.id}`}
      />
    );
  };

  // S'il n'y a pas de conversation
  if (!application && !loading) {
    return (
      <Container background="white" testID="conversation-not-found">
        <Header
          title="Conversation"
          showBack
          testID="conversation-header"
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Conversation introuvable</Text>
        </View>
      </Container>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Container
        background="white"
        padding="none"
        refreshing={refreshing}
        onRefresh={refreshData}
        scrollable={false}
        testID="conversation-screen"
      >
        <StatusBar style="dark" />
        
        {/* En-tête avec infos sur le partenaire */}
        <Header
          title={partner?.fullName || 'Conversation'}
          subtitle={service?.title || 'Chargement...'}
          showBack
          rightIcon="information-circle-outline"
          onRightPress={navigateToApplicationDetail}
          testID="conversation-header"
        />
        
        {/* Contenu de la conversation */}
        {loading && messages.length === 0 ? (
          <View style={styles.centerContainer} testID="loading-container">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Chargement des messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => scrollToBottom(false)}
            onLayout={() => scrollToBottom(false)}
            testID="messages-list"
          />
        )}
        
        {/* Barre de saisie de message */}
        <View style={styles.inputContainer} testID="input-container">
          {/* Bouton d'ajout de média */}
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleSendImage}
            activeOpacity={0.7}
            testID="attach-button"
          >
            <Ionicons name="image-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          
          {/* Champ de saisie */}
          <TextInput
            ref={inputRef}
            style={[styles.input, { height: Math.max(40, inputHeight) }]}
            placeholder="Écrivez votre message..."
            value={message}
            onChangeText={setMessage}
            multiline
            onContentSizeChange={(e) => {
              const height = e.nativeEvent.contentSize.height;
              // Limiter la hauteur à un maximum de 100
              setInputHeight(Math.min(100, height));
            }}
            testID="message-input"
          />
          
          {/* Bouton d'envoi */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              !message.trim() && styles.disabledSendButton
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
            activeOpacity={0.7}
            testID="send-button"
          >
            <Ionicons name="send" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </Container>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large,
  },
  errorText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.gray,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.gray,
    marginTop: SPACING.medium,
  },
  messagesContainer: {
    padding: SPACING.small,
    paddingBottom: SPACING.large,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    fontSize: FONT_SIZES.medium,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.small,
  },
  disabledSendButton: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
  },
});