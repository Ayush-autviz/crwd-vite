export type Organization = {
  id: string;
  name: string;
  imageUrl: string;
  color?: string;
  shortDesc?: string;
  description?: string;
};

export interface PostDetail {
  id: number;
  avatarUrl: string;
  username: string;
  time: string;
  org: string;
  orgUrl: string;
  text: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
}

export type UserType = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  isFollowing?: boolean;
};

export interface Topic {
  id: string;
  name: string;
  posts: number;
  avatars: string[];
}

export interface Member {
  name: string;
  username: string;
  connected: boolean;
}

export type NotificationType =
  | "connect"
  | "donation"
  | "post"
  | "event"
  | "mention"
  | "follow"
  | "like"
  | "comment"
  | "achievement"
  | "crwd_activity"
  | "crwd_join"
  | "event_attend"
  | "community_post"
  | "community_event"
  | "community_donation"
  | "community_interest"
  | "community_join";

export interface Transaction {
  date: string;
  description: string;
  amount: string;
}
