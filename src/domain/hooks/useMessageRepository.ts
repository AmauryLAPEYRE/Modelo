// import { useMemo } from 'react';
// import { MessageRepository, MessageRepositoryImpl } from '../repositories/messageRepository';

// /**
//  * Hook pour accéder au repository de messages
//  * @returns Instance du repository de messages
//  */
// export const useMessageRepository = (): MessageRepository => {
//   // Mémoiser l'instance du repository pour éviter les re-rendus
//   const messageRepository = useMemo(() => new MessageRepositoryImpl(), []);
  
//   return messageRepository;
// };