export class Conversation {
  id1: number;
  id2: number;
  conversation: string[];
  lastTime: number = 0;
}

export interface ConversationBetweenNPC {
  id: string;
  lastTime: number;
}

export interface ConversationsGroup {
  id: string;
  conversations: Conversation[];
  conversationsBetweenNPC: ConversationBetweenNPC[];
}
