import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Send, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPostComments, createPostComment, getCommentReplies } from '@/services/api/social';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/store';
import { Comment } from './Comment';

interface CommentsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: number;
    username: string;
    text: string;
    avatarUrl?: string;
    firstName?: string;
    lastName?: string;
  };
}

interface CommentData {
  id: number;
  username: string;
  avatarUrl: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: CommentData[];
  repliesCount?: number;
  parentComment?: number;
  userId?: string | number;
}

export default function CommentsBottomSheet({
  isOpen,
  onClose,
  post,
}: CommentsBottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<CommentData[]>([]);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Handle animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(false);
      timer = setTimeout(() => setIsAnimating(true), 20);
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 300);
    } else if (isVisible) {
      setIsAnimating(false);
      timer = setTimeout(() => setIsVisible(false), 300);
    }
    return () => clearTimeout(timer);
  }, [isOpen, isVisible]);

  // Fetch comments
  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ['postComments', post.id],
    queryFn: () => getPostComments(post.id.toString()),
    enabled: isOpen && !!post.id,
  });

  // Transform API comments to CommentData format
  const apiComments = commentsData?.results?.map((comment: any) => ({
    id: comment.id,
    username: comment.user?.username || comment.user?.full_name || 'Unknown User',
    avatarUrl: comment.user?.profile_picture || '/placeholder.svg',
    content: comment.content,
    timestamp: new Date(comment.created_at),
    likes: 0,
    replies: [],
    repliesCount: comment.replies_count || 0,
    parentComment: comment.parent_comment,
    userId: comment.user?.id,
  })) || [];

  // Update comments when API data changes, but preserve existing replies
  useEffect(() => {
    if (apiComments.length > 0) {
      setComments(prev => {
        // Preserve replies that were already loaded
        return apiComments.map((apiComment: CommentData) => {
          const existingComment = prev.find(c => c.id === apiComment.id);
          return {
            ...apiComment,
            replies: existingComment?.replies || [],
          };
        });
      });
    } else {
      setComments([]);
    }
  }, [apiComments]);

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (data: { content: string }) => createPostComment(post.id.toString(), { content: data.content }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['postComments', post.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Error creating comment:', error);
    },
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: ({ commentId, data }: { commentId: number; data: { content: string } }) => 
      createPostComment(post.id.toString(), { content: data.content, parent_comment_id: commentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postComments', post.id] });
    },
    onError: () => {
      console.error('Failed to add reply');
    },
  });

  const handleReply = (commentId: number, content: string) => {
    if (content.trim()) {
      createReplyMutation.mutate({ commentId, data: { content: content.trim() } });
    }
  };

  const handleLike = (_commentId: number) => {
    // For now, just a placeholder - you can add like comment API later
  };

  const fetchReplies = async (commentId: number) => {
    setLoadingReplies(prev => new Set(prev).add(commentId));
    try {
      const repliesData = await getCommentReplies(commentId.toString());
      
      // Check different possible response structures
      const repliesArray = repliesData?.replies || repliesData?.results || (Array.isArray(repliesData) ? repliesData : []);
      
      const transformedReplies: CommentData[] = repliesArray.map((reply: any) => ({
        id: reply.id,
        username: reply.user?.username || reply.user?.full_name || 'Unknown User',
        avatarUrl: reply.user?.profile_picture || '/placeholder.svg',
        content: reply.content,
        timestamp: new Date(reply.created_at),
        likes: 0,
        replies: [],
        repliesCount: reply.replies_count || 0,
        parentComment: reply.parent_comment || commentId,
        userId: reply.user?.id,
      }));

      setComments(prev => {
        return prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, replies: transformedReplies }
            : comment
        );
      });
      
      // Also add to expanded comments set after replies are loaded
      setExpandedComments(prev => new Set(prev).add(commentId));
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const toggleReplies = (commentId: number) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    if (expandedComments.has(commentId)) {
      // Collapse
      setExpandedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      // Expand - fetch replies if not already loaded
      if ((!comment.replies || comment.replies.length === 0) && comment.repliesCount && comment.repliesCount > 0) {
        fetchReplies(commentId);
      } else {
        // Replies already loaded, just expand
        setExpandedComments(prev => new Set(prev).add(commentId));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && !createCommentMutation.isPending) {
      createCommentMutation.mutate({ content: commentText.trim() });
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setCommentText('');
    }, 300);
  };

  // Truncate post text for header
  const truncatedText = post.text.length > 50 ? `${post.text.substring(0, 50)}...` : post.text;

  if (!isVisible) return null;

  const postUserInitials = post.firstName && post.lastName
    ? `${post.firstName.charAt(0)}${post.lastName.charAt(0)}`.toUpperCase()
    : post.username.charAt(0).toUpperCase();
  
  // Generate consistent color for post avatar
  const avatarColors = [
    '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B',
    '#EF4444', '#06B6D4', '#F97316', '#84CC16', '#A855F7',
    '#14B8A6', '#F43F5E', '#6366F1', '#22C55E', '#EAB308',
  ];
  const postAvatarColor = avatarColors[post.id % avatarColors.length];

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-t-3xl w-full h-[85vh] flex flex-col transform transition-transform duration-300 ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scroll indicator */}
        <div className="flex justify-center pt-2 pb-1 sticky top-0 bg-white z-10">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">
                Commenting on <span className="font-semibold text-foreground">@{post.username}</span>'s {truncatedText}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2 flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Original Post */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={post.avatarUrl} alt={post.username} />
              <AvatarFallback
                style={{ backgroundColor: postAvatarColor }}
                className="text-white font-bold"
              >
                {postUserInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-foreground">{post.username}</span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-line">{post.text}</p>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 font-medium">
                {comments.filter(c => !c.parentComment).length} comment{comments.filter(c => !c.parentComment).length !== 1 ? "s" : ""}
              </p>
              {comments
                .filter(comment => !comment.parentComment) // Only show top-level comments
                .map((comment) => {
                  // Ensure replies array exists and is properly structured
                  const commentWithReplies: CommentData = {
                    id: comment.id,
                    username: comment.username,
                    avatarUrl: comment.avatarUrl,
                    content: comment.content,
                    timestamp: comment.timestamp,
                    likes: comment.likes,
                    replies: Array.isArray(comment.replies) ? comment.replies : [],
                    repliesCount: comment.repliesCount,
                    parentComment: comment.parentComment,
                    userId: comment.userId,
                  };
                  
                  const isExpanded = expandedComments.has(comment.id);
                  
                  return (
                    <div key={comment.id}>
                      <Comment
                        id={commentWithReplies.id}
                        username={commentWithReplies.username}
                        avatarUrl={commentWithReplies.avatarUrl}
                        content={commentWithReplies.content}
                        timestamp={commentWithReplies.timestamp}
                        likes={commentWithReplies.likes}
                        replies={commentWithReplies.replies}
                        repliesCount={commentWithReplies.repliesCount}
                        parentComment={commentWithReplies.parentComment}
                        userId={commentWithReplies.userId}
                        onReply={handleReply}
                        onLike={handleLike}
                        onToggleReplies={toggleReplies}
                        isExpanded={isExpanded}
                        isLoadingReplies={loadingReplies.has(comment.id)}
                        showReplyButton={!comment.parentComment}
                        onDelete={(commentId) => {
                          setComments(prev => {
                            const filteredComments = prev.filter(c => c.id !== commentId);
                            if (filteredComments.length === prev.length) {
                              return prev.map(comment => ({
                                ...comment,
                                replies: comment.replies.filter(reply => reply.id !== commentId),
                                repliesCount: comment.replies.filter(reply => reply.id !== commentId).length,
                              }));
                            }
                            return filteredComments;
                          });
                          queryClient.invalidateQueries({ queryKey: ['postComments', post.id] });
                        }}
                      />
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-gray-200 px-4 py-3 bg-white sticky bottom-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Join the conversation"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-gray-100 rounded-full border-none focus-visible:ring-0"
              disabled={createCommentMutation.isPending || !currentUser}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || createCommentMutation.isPending || !currentUser}
              className="p-2 bg-[#1600ff] text-white rounded-full hover:bg-[#1400cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createCommentMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

