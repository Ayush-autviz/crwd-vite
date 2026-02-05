import { useState, useEffect, useRef, useMemo } from 'react';
import { X, MessageCircle, Loader2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPostComments, createPostComment, getCommentReplies } from '@/services/api/social';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
    color?: string;
  };
}

interface CommentData {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl: string;
  color?: string;
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [replyingTo, setReplyingTo] = useState<CommentData | null>(null);

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
      setReplyingTo(null);
    }
    return () => clearTimeout(timer);
  }, [isOpen, isVisible]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [commentText]);

  // Handle window resize - close sheet if viewport changes significantly
  useEffect(() => {
    if (!isOpen) return;

    let initialWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      // If width changes by more than 100px, close the sheet
      if (Math.abs(currentWidth - initialWidth) > 10) {
        handleClose();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Lock body scroll when sheet is visible
  useEffect(() => {
    if (isVisible) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup on unmount
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isVisible]);

  // Fetch comments
  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ['postComments', post.id],
    queryFn: () => getPostComments(post.id.toString()),
    enabled: isOpen && !!post.id,
  });

  // Get display name helper
  const getDisplayName = (user: any) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) {
      return user.first_name;
    }
    return user?.username || user?.full_name || 'Unknown User';
  };

  // Transform API comments to CommentData format - memoized to prevent infinite loops
  const apiComments = useMemo(() => {
    return commentsData?.results?.map((comment: any) => ({
      id: comment.id,
      username: getDisplayName(comment.user),
      firstName: comment.user?.first_name,
      lastName: comment.user?.last_name,
      avatarUrl: comment.user?.profile_picture || '/placeholder.svg',
      color: comment.user?.color,
      content: comment.content,
      timestamp: new Date(comment.created_at),
      likes: 0,
      replies: [],
      repliesCount: comment.replies_count || 0,
      parentComment: comment.parent_comment,
      userId: comment.user?.id,
    })) || [];
  }, [commentsData?.results]);

  // Update comments when API data changes, but preserve existing replies
  useEffect(() => {
    // Only update if we have commentsData (not undefined/null)
    if (commentsData !== undefined) {
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
        // Only clear if we actually have no comments (not just loading)
        setComments(prev => prev.length > 0 ? [] : prev);
      }
    }
  }, [apiComments, commentsData]);

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['postComments', post.id] });
      // Fetch replies to show the new one and expand
      fetchReplies(variables.commentId);
      setCommentText('');
      setReplyingTo(null);
    },
    onError: () => {
      console.error('Failed to add reply');
    },
  });

  const handleReply = (commentId: number, content: string) => {
    // Find comment or handle based on ID if we have full comment object lookup available
    // For now we just need the ID and minimal info to show "Replying to..."
    // Since we pass content as "@username " from Comment.tsx, we can use that logic or refactor
    // Refactoring: The Comment component now calls onReply(id, "@username ")

    // Find the comment object to get username properly
    const findComment = (commentsList: CommentData[]): CommentData | undefined => {
      for (const c of commentsList) {
        if (c.id === commentId) return c;
        if (c.replies && c.replies.length > 0) {
          const found = findComment(c.replies);
          if (found) return found;
        }
      }
      return undefined;
    };

    const targetComment = findComment(comments);

    if (targetComment) {
      setReplyingTo(targetComment);
      inputRef.current?.focus();
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
        username: getDisplayName(reply.user),
        firstName: reply.user?.first_name,
        lastName: reply.user?.last_name,
        avatarUrl: reply.user?.profile_picture || '/placeholder.svg',
        color: reply.user?.color,
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

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      if (replyingTo) {
        createReplyMutation.mutate({ commentId: replyingTo.id, data: { content: commentText.trim() } });
      } else if (!createCommentMutation.isPending) {
        createCommentMutation.mutate({ content: commentText.trim() });
      }
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setCommentText('');
      setReplyingTo(null);
    }, 300);
  };

  // Truncate post text for header
  const truncatedText = post.text.length > 50 ? `${post.text.substring(0, 50)}...` : post.text;

  if (!isVisible) return null;

  // Get post display name
  const postDisplayName = post.firstName && post.lastName
    ? `${post.firstName} ${post.lastName}`
    : post.username;

  const postUserInitials = post.firstName && post.lastName
    ? `${post.firstName.charAt(0)}`.toUpperCase()
    : post.username.charAt(0).toUpperCase();

  // Generate consistent color for post avatar
  const avatarColors = [
    '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B',
    '#EF4444', '#06B6D4', '#F97316', '#84CC16', '#A855F7',
    '#14B8A6', '#F43F5E', '#6366F1', '#22C55E', '#EAB308',
  ];
  const getConsistentColor = (id: number | string, colors: string[]) => {
    const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const postAvatarColor = post.color || getConsistentColor(post.id, avatarColors);

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-t-3xl w-full h-[85vh] flex flex-col transform transition-transform duration-300 ${isAnimating ? 'translate-y-0' : 'translate-y-full'
          }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scroll indicator */}
        <div className="flex justify-center pt-2 pb-1 sticky top-0 bg-white z-10">
          <div className="w-10 md:w-12 h-1.5 md:h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                Commenting on <span className="font-semibold text-foreground">{postDisplayName}</span>'s {truncatedText}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors ml-1.5 md:ml-2 flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Original Post */}
        <div className="px-3 md:px-4 py-3 md:py-4 border-b border-gray-200">
          <div className="flex gap-2.5 md:gap-3">
            <Avatar className="w-9 h-9 md:w-10 md:h-10 flex-shrink-0">
              <AvatarImage src={post.avatarUrl} alt={postDisplayName} />
              <AvatarFallback
                style={{ backgroundColor: postAvatarColor }}
                className="text-white font-bold text-xs md:text-sm"
              >
                {postUserInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                <span className="font-bold text-xs md:text-sm text-foreground">{postDisplayName}</span>
              </div>
              <p className="text-xs md:text-sm text-foreground whitespace-pre-line">{post.text}</p>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 md:py-4">
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-6 md:py-8">
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-12">
              <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mb-3 md:mb-4" />
              <p className="text-xs md:text-sm text-muted-foreground text-center">
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              <p className="text-xs md:text-sm text-gray-600 font-medium">
                {comments.filter(c => !c.parentComment).length} comment{comments.filter(c => !c.parentComment).length !== 1 ? "s" : ""}
              </p>
              {comments
                .filter(comment => !comment.parentComment) // Only show top-level comments
                .map((comment) => {
                  // Ensure replies array exists and is properly structured
                  const commentWithReplies: CommentData = {
                    id: comment.id,
                    username: comment.username,
                    firstName: comment.firstName,
                    lastName: comment.lastName,
                    avatarUrl: comment.avatarUrl,
                    color: comment.color,
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
                        firstName={commentWithReplies.firstName}
                        lastName={commentWithReplies.lastName}
                        avatarUrl={commentWithReplies.avatarUrl}
                        color={commentWithReplies.color}
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
        <div className="border-t border-gray-200 p-4 bg-white sticky bottom-0">
          {replyingTo && (
            <div className="flex items-center justify-between bg-gray-50 px-4 py-2 mb-2 rounded-lg border-l-4 border-blue-500">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-blue-600">Replying to {replyingTo.username}</span>
                <span className="text-xs text-gray-500 line-clamp-1">{replyingTo.content}</span>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="relative flex items-center">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1600ff] rounded-l-md z-10" />
              <textarea
                ref={inputRef}
                placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Join the conversation"}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-gray-50 border-none focus:ring-0 focus:outline-none text-base py-3 pl-4 rounded-md min-h-[45px] max-h-[120px] resize-none overflow-y-auto"
                disabled={createCommentMutation.isPending || createReplyMutation.isPending || !currentUser}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-gray-400">
                {/* <button type="button" className="hover:text-gray-600">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button type="button" className="hover:text-gray-600">
                  <LinkIcon className="w-5 h-5" />
                </button> */}
              </div>

              <button
                type="submit"
                disabled={!commentText.trim() || createCommentMutation.isPending || createReplyMutation.isPending || !currentUser}
                className={`px-6 py-1.5 rounded-full font-semibold text-sm transition-colors ${commentText.trim() && !createCommentMutation.isPending && !createReplyMutation.isPending
                  ? 'bg-[#1600ff] text-white hover:bg-[#1400cc]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {createCommentMutation.isPending || createReplyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Reply'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

