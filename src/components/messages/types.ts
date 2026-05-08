export interface Conversation {
  id: string;
  user: {
    name: string;
    avatar: string;
    color?: string;
  };
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: "me" | "other";
  text: string;
  timestamp: string;
  type?: "text" | "card";
  cardData?: {
    title: string;
    description: string;
    image: string;
    icon: string;
  };
}
