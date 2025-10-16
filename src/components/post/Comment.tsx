import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export interface CommentData {
  id: number;
  username: string;
  avatarUrl: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: CommentData[];
  repliesCount?: number;
  parentComment?: any;
}

interface CommentProps extends CommentData {
  onReply: (commentId: number, content: string) => void;
  onLike: (commentId: number) => void;
  onToggleReplies?: (commentId: number) => void;
  isExpanded?: boolean;
  isLoadingReplies?: boolean;
  showReplyButton?: boolean;
}

export const Comment: React.FC<CommentProps> = ({
  id,
  username,
  avatarUrl,
  content,
  timestamp,
  replies,
  repliesCount = 0,
  onReply,
  onLike,
  onToggleReplies,
  isExpanded = false,
  isLoadingReplies = false,
  showReplyButton = true,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback>
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">@{username}</span>
              {/* <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button> */}
            </div>
            <p className="text-sm">{content}</p>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-muted-foreground">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>
            {/* <button
              onClick={handleLike}
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-primary text-primary' : ''}`} />
              {likes}
            </button> */}
            {showReplyButton && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Reply
              </button>
            )}
            {repliesCount > 0 && onToggleReplies && (
              <button
                onClick={() => onToggleReplies(id)}
                disabled={isLoadingReplies}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              >
                {isLoadingReplies ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    {isExpanded ? 'Hide' : 'View'} {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
                  </>
                )}
              </button>
            )}
          </div>

          {isReplying && (
            <form onSubmit={handleReplySubmit} className="mt-3">
              <div className="flex gap-2">
                <Avatar className="h-6 w-6">
                  <img src={avatarUrl} alt={username} className="rounded-full" />
                </Avatar>
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-muted rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button type="submit" size="sm">
                  Reply
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Render replies - only for main comments when expanded */}
      {isExpanded && replies.length > 0 && (
        <div className="ml-10 space-y-4">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              {...reply}
              onReply={onReply}
              onLike={onLike}
              showReplyButton={false} // Replies cannot have replies
            />
          ))}
        </div>
      )}
    </div>
  );
}; 