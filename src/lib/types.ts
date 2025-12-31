export type Organization = {
  id: string;
  name: string;
  imageUrl: string;
  color?: string;
  shortDesc?: string;
  description?: string;
};

export interface PreviewDetails {
  title: string | null;
  description: string | null;
  image: string | null;
  site_name: string | null;
  url: string;
  domain: string;
}

export interface PostDetail {
  id: number;
  userId: string;
  avatarUrl: string;
  username: string;
  time: string;
  org: string;
  orgUrl?: string | number; // Collective ID for navigation (optional)
  text: string;
  imageUrl?: string;
  previewDetails?: PreviewDetails | null;
  fundraiser?: {
    id: number;
    name: string;
    description?: string;
    image?: string | null;
    color?: string | null;
    target_amount: string;
    current_amount: string;
    progress_percentage: number;
  };
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
