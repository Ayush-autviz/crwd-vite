import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, EllipsisIcon, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteComment } from '@/services/api/social';
import { useAuthStore } from '@/stores/store';

export interface CommentData {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: CommentData[];
  repliesCount?: number;
  parentComment?: any;
  userId?: string | number; // User ID to check if comment belongs to current user
}

interface CommentProps extends CommentData {
  onReply: (commentId: number, content: string) => void;
  onLike: (commentId: number) => void;
  onToggleReplies?: (commentId: number) => void;
  isExpanded?: boolean;
  isLoadingReplies?: boolean;
  showReplyButton?: boolean;
  onDelete?: (commentId: number) => void; // Callback when comment is deleted
}

export const Comment: React.FC<CommentProps> = ({
  id,
  username,
  firstName,
  lastName,
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
  userId,
  onDelete,
}) => {
  // Get display name (first name + last name, or fallback to username)
  const displayName = firstName && lastName
    ? `${firstName} ${lastName}`
    : firstName || username;
  
  // Get initials for avatar fallback
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return username.charAt(0).toUpperCase();
  };
  
  const initials = getInitials();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isOwnComment = user?.id && userId && (user.id.toString() === userId.toString());

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: () => deleteComment(id.toString()),
    onSuccess: () => {
      setShowDeleteConfirm(false);
      setShowMenu(false);
      // Call onDelete callback if provided
      if (onDelete) {
        onDelete(id);
      }
      // Invalidate comments queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['postComments'] });
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      setShowDeleteConfirm(false);
      setShowMenu(false);
    },
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };


  return (
    <div className="space-y-2 md:space-y-4">
      <div className="flex gap-2 md:gap-3">
        <Avatar className="h-6 w-6 md:h-8 md:w-8">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="text-[10px] md:text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted p-2 md:p-3 rounded-lg">
            <div className="flex items-center justify-between mb-0.5 md:mb-1">
              <span className="font-medium text-xs md:text-sm">{displayName}</span>
              {isOwnComment && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="p-0.5 md:p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <EllipsisIcon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground cursor-pointer" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-6 md:top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-28 md:w-32">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowMenu(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="flex items-center gap-1.5 md:gap-2 w-full px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-red-600 hover:bg-gray-50 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs md:text-sm">{content}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 mt-1 md:mt-2 text-xs md:text-sm">
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
                <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
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
                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                    <span className="hidden sm:inline">Loading...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">{isExpanded ? 'Hide' : 'View'} </span>
                    {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
                  </>
                )}
              </button>
            )}
          </div>

          {isReplying && (
            <form onSubmit={handleReplySubmit} className="mt-2 md:mt-3">
              <div className="flex gap-1.5 md:gap-2">
                <Avatar className="h-5 w-5 md:h-6 md:w-6">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="text-[8px] md:text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-muted rounded-full px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button type="submit" size="sm" className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-2">
                  Reply
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Render replies - only for main comments when expanded */}
      {isExpanded && replies.length > 0 && (
        <div className="ml-7 md:ml-10 space-y-2 md:space-y-4">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              {...reply}
              onReply={onReply}
              onLike={onLike}
              showReplyButton={false} // Replies cannot have replies
              onDelete={onDelete} // Pass onDelete to replies as well
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-sm md:text-base">Delete Comment</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteCommentMutation.isPending}
              className="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteCommentMutation.mutate();
              }}
              disabled={deleteCommentMutation.isPending}
              className="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2"
            >
              {deleteCommentMutation.isPending ? (
                <>
                  <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 