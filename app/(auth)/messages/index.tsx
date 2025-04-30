import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItem
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Container } from '../../../src/components/layout/Container';
import { Header } from '../../../src/components/layout/Header';
import { Avatar } from '../../../src/components/core/Avatar';
import { Badge } from '../../../src/components/core/Badge';
import { useMessagingViewModel } from '../../../src/viewModels/useMessagingViewModel';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../src/utils/constants';
import { formatRelativeDate } from '../../../src/utils/formatters';

/**
 * Interface pour un élément de conversation dans la liste
 */
interface ConversationItemProps {
  id: string;
  name: string;
  avatarUrl?: string;
  serviceTitle: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  unreadCount: number;
  onPress: () => void;
  testID?: string;
}

/**
 * Composant pour afficher un élément de conversation
 */
const ConversationItem: React.FC<ConversationItemProps> = ({
  id,
  name,
  avatarUrl,
  serviceTitle,
  lastMessage,
  lastMessageDate,
  unreadCount,
  onPress,
  testID
}) => {
  return (
    <TouchableOpacity 
      style={styles.conversationItem} 
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      {/* Avatar avec indicateur d'état */}
      <Avatar
        source={avatarUrl}
        name={name}
        size="medium"
        showStatus
        isOnline={unreadCount > 0}
        testID={`${testID}-avatar`}
      />
      
      {/* Contenu de la conversation */}
      <View style={styles.conversationContent} testID={`${testID}-content`}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName} numberOfLines={1} testID={`${testID}-name`}>
            {name}
          </Text>
          {lastMessageDate && (
            <Text style={styles.conversationDate} testID={`${testID}-date`}>
              {formatRelativeDate(lastMessageDate)}
            </Text>
          )}
        </View>
        
        <Text style={styles.conversationService} numberOfLines={1} testID={`${testID}-service`}>
          {serviceTitle}
        </Text>
        
        <View style={styles.conversationFooter}>
          <Text
            style={[
              styles.conversationLastMessage,
              unreadCount > 0 && styles.conversationUnreadMessage
            ]}
            numberOfLines={1}
            testID={`${testID}-last-message`}
          >
            {lastMessage || "Pas encore de message"}
          </Text>
          
          {unreadCount > 0 && (
            <Badge
              label={unreadCount.toString()}
              variant="filled"
              color="primary"
              size="small"
              testID={`${testID}-unread-count`}
            />
          )}
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );
};

/**
 * Écran de messagerie (liste des conversations)
 */
export default function MessagingScreen() {
  // ViewModel
  const {
    loading,
    refreshing,
    conversations,
    unreadCount,
    refreshData,
    navigateToConversation
  } = useMessagingViewModel();
  
  // Rendu d'un élément de la liste de conversations
  const renderConversationItem: ListRenderItem<typeof conversations[0]> = ({ item }) => (
    <ConversationItem
      id={item.id}
      name={item.partnerName}
      avatarUrl={item.partnerPicture}
      serviceTitle={item.serviceTitle}
      lastMessage={item.lastMessage?.content.text || 
                  (item.lastMessage?.type === 'image' ? 'Image' : 
                   item.lastMessage?.type === 'video' ? 'Vidéo' : 
                   item.lastMessage?.type === 'location' ? 'Localisation' : 
                   item.lastMessage?.type === 'system' ? 'Message système' : '')}
      lastMessageDate={item.lastMessage?.createdAt}
      unreadCount={item.unreadCount}
      onPress={() => navigateToConversation(item.id)}
      testID={`conversation-${item.id}`}
    />
  );
  
  // Rendu de l'état vide
  const renderEmptyState = () => (
    <View style={styles.emptyContainer} testID="empty-state">
      <Ionicons name="chatbubbles-outline" size={64} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>Aucune conversation</Text>
      <Text style={styles.emptyText}>
        Vos conversations avec les modèles et professionnels apparaîtront ici.
      </Text>
    </View>
  );
  
  return (
    <Container
      background="white"
      padding="none"
      refreshing={refreshing}
      onRefresh={refreshData}
      testID="messaging-screen"
    >
      <StatusBar style="dark" />
      
      {/* En-tête */}
      <Header
        title="Messages"
        subtitle={unreadCount > 0 ? `${unreadCount} non lu${unreadCount > 1 ? 's' : ''}` : undefined}
        testID="messaging-header"
      />
      
      {/* Liste des conversations */}
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          conversations.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        testID="conversations-list"
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: SPACING.medium,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.medium,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.regular,
    marginBottom: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  conversationContent: {
    flex: 1,
    marginLeft: SPACING.medium,
    marginRight: SPACING.small,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  conversationName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.black,
    flex: 1,
    marginRight: SPACING.small,
  },
  conversationDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
  },
  conversationService: {
    fontSize: FONT_SIZES.small,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationLastMessage: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
    flex: 1,
    marginRight: SPACING.small,
  },
  conversationUnreadMessage: {
    color: COLORS.black,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: SPACING.medium,
    marginBottom: SPACING.small,
  },
  emptyText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.gray,
    textAlign: 'center',
  },
});