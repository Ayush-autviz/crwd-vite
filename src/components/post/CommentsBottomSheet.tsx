import { useState, useEffect, useRef, useMemo } from 'react';
import { X, MessageCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { getPostComments, createPostComment, getCommentReplies, mentionSearch } from '@/services/api/social';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/store';
import { Comment } from './Comment';
import { MentionSearchResults } from './MentionSearchResults';
import { Button } from '@/components/ui/button';

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
    mentions?: any[];
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
  mentions?: any[];
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [replyingTo, setReplyingTo] = useState<CommentData | null>(null);
  const [mentionSearchQuery, setMentionSearchQuery] = useState<string | null>(null);
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<{ type: string; id: number | string; name: string }[]>([]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCommentText(value);

    // Get cursor position
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);

    // Check if the last typed character or the block before cursor starts with @
    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbolIndex !== -1) {
      const charBeforeAt = lastAtSymbolIndex > 0 ? textBeforeCursor[lastAtSymbolIndex - 1] : null;
      const isStartOfWord = !charBeforeAt || charBeforeAt === ' ' || charBeforeAt === '\n';

      if (isStartOfWord) {
        const query = textBeforeCursor.substring(lastAtSymbolIndex + 1);
        // Allow up to 2 spaces in the query to support full name search
        if (query.split(' ').length <= 3 && !query.includes('\n')) {
          setMentionSearchQuery(query);
        } else {
          setMentionSearchQuery(null);
        }
      } else {
        setMentionSearchQuery(null);
      }
    } else {
      setMentionSearchQuery(null);
    }
  };

  useEffect(() => {
    const fetchMentions = async () => {
      if (mentionSearchQuery !== null) {
        try {
          const data = await mentionSearch(mentionSearchQuery);
          // If the API returns a paginated list, we use results
          setMentionResults(data.results || (Array.isArray(data) ? data : []));
        } catch (error) {
          console.error('Mention search error:', error);
          setMentionResults([]);
        }
      } else {
        setMentionResults([]);
      }
    };

    const timer = setTimeout(fetchMentions, 300);
    return () => clearTimeout(timer);
  }, [mentionSearchQuery]);

  const handleMentionSelect = (user: any) => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = commentText.substring(0, cursorPosition);
    const textAfterCursor = commentText.substring(cursorPosition);

    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');
    const newTextBeforeCursor = textBeforeCursor.substring(0, lastAtSymbolIndex) + `@${user.name} `;

    setCommentText(newTextBeforeCursor + textAfterCursor);
    setSelectedMentions(prev => [
      ...prev.filter(m => m.name !== user.name),
      { type: user.type, id: user.id, name: user.name }
    ]);
    setMentionSearchQuery(null);
    setMentionResults([]);

    // Focus back to input and set cursor position
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = newTextBeforeCursor.length;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

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

  // Fetch comments with infinite query
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['postComments', post.id],
    queryFn: ({ pageParam = 1 }) => getPostComments(post.id.toString(), pageParam),
    enabled: isOpen && !!post.id,
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const match = lastPage.next.match(/[?&]page=(\d+)/);
        return match ? parseInt(match[1]) : undefined;
      }
      return undefined;
    },
    initialPageParam: 1,
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
    if (!commentsData?.pages) return [];

    return commentsData.pages.flatMap(page =>
      (page.results || []).map((comment: any) => ({
        id: comment.id,
        username: getDisplayName(comment.user),
        firstName: comment.user?.first_name,
        lastName: comment.user?.last_name,
        avatarUrl: comment.user?.profile_picture || '/placeholder.svg',
        color: comment.user?.color,
        content: comment.content,
        timestamp: new Date(comment.created_at),
        likes: comment.likes_count || 0,
        replies: [],
        repliesCount: comment.replies_count || 0,
        parentComment: comment.parent_comment,
        isLiked: comment.is_liked || false,
        userId: comment.user?.id,
        mentions: comment.mentions,
      }))
    );
  }, [commentsData?.pages]);

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
    mutationFn: (data: { content: string; mentions?: any[] }) => createPostComment(post.id.toString(), { content: data.content, mentions: data.mentions }),
    onSuccess: () => {
      setCommentText('');
      setSelectedMentions([]);
      queryClient.invalidateQueries({ queryKey: ['postComments', post.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Error creating comment:', error);
    },
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: ({ commentId, data }: { commentId: number; data: { content: string; mentions?: any[] } }) =>
      createPostComment(post.id.toString(), { content: data.content, parent_comment_id: commentId, mentions: data.mentions }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['postComments', post.id] });
      // Fetch replies to show the new one and expand
      fetchReplies(variables.commentId);
      setCommentText('');
      setSelectedMentions([]);
      setReplyingTo(null);
    },
    onError: () => {
      console.error('Failed to add reply');
    },
  });

  const handleReply = (commentId: number, _content: string) => {
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
        mentions: reply.mentions,
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
      const finalMentions = selectedMentions
        .filter(m => commentText.includes(`@${m.name}`))
        .map(({ type, id }) => ({ type, id }));

      if (replyingTo) {
        createReplyMutation.mutate({
          commentId: replyingTo.id,
          data: { content: commentText.trim(), mentions: finalMentions }
        });
      } else if (!createCommentMutation.isPending) {
        createCommentMutation.mutate({
          content: commentText.trim(),
          mentions: finalMentions
        });
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

  const renderHighlightedText = (text: string) => {
    if (!text) return null;

    const mentionNames = selectedMentions.map(m => `@${m.name}`);
    const mentionNamesLower = mentionNames.map(n => n.toLowerCase());
    mentionNames.sort((a, b) => b.length - a.length);

    // Fallback: simple highlighter if no selected mentions
    if (mentionNames.length === 0) {
      return text.split(/(@[\w\s]{1,30}(?=\s|$)|@\w+)/g).map((part, index) => {
        if (part.startsWith('@')) {
          return <span key={index} className="text-blue-600 font-medium">{part}</span>;
        }
        return <span key={index}>{part}</span>;
      });
    }

    const pattern = mentionNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');

    return text.split(regex).map((part, index) => {
      if (mentionNamesLower.includes(part.toLowerCase())) {
        return <span key={index} className="text-blue-600 font-medium">{part}</span>;
      }
      return part.split(/(@[\w\s]{1,30}(?=\s|$)|@\w+)/g).map((subPart, subIndex) => {
        if (subPart.startsWith('@')) {
          return <span key={`${index}-${subIndex}`} className="text-blue-600 font-medium">{subPart}</span>;
        }
        return <span key={`${index}-${subIndex}`}>{subPart}</span>;
      });
    });
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-end justify-center z-100 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
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
              <p className="text-sm text-muted-foreground truncate">
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
              <p className="text-xs md:text-sm text-foreground whitespace-pre-line">
                {(() => {
                  const mentions = post.mentions || [];
                  const content = post.text || "";

                  if (!mentions || mentions.length === 0) {
                    return content.split(/(@\w+)/g).map((part, index) => {
                      if (part.startsWith('@')) {
                        return (
                          <span
                            key={index}
                            className="text-blue-600 font-medium cursor-pointer hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(`/u/${part.substring(1)}`);
                            }}
                          >
                            {part}
                          </span>
                        );
                      }
                      return part;
                    });
                  }

                  const mentionMap: Record<string, any> = {};
                  const triggers: string[] = [];

                  mentions.forEach(m => {
                    const details = m.mention_details;
                    if (details?.name) {
                      const nameKey = `@${details.name}`.toLowerCase();
                      mentionMap[nameKey] = m;
                      triggers.push(`@${details.name}`);
                    }
                    if (details?.username) {
                      const userKey = `@${details.username}`.toLowerCase();
                      if (!mentionMap[userKey]) {
                        mentionMap[userKey] = m;
                        triggers.push(`@${details.username}`);
                      }
                    }
                  });

                  triggers.sort((a, b) => b.length - a.length);

                  const triggerPattern = triggers.length > 0
                    ? `(${triggers.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}|@\\w+)`
                    : '(@\\w+)';

                  const regex = new RegExp(triggerPattern, 'gi');

                  return content.split(regex).map((part, index) => {
                    const partLower = part.toLowerCase();
                    const mention = mentionMap[partLower];

                    if (part.startsWith('@')) {
                      let path = `/u/${part.substring(1)}`;
                      if (mention) {
                        const details = mention.mention_details;
                        const type = (mention.mention_type || details.type || '').toLowerCase();
                        const targetId = details.username || details.id;

                        if (type === 'collective' || type === 'group') path = `/g/${targetId}`;
                        else if (type === 'cause' || type === 'nonprofit' || type === 'organization') path = `/c/${targetId}`;
                        else path = `/u/${targetId}`;
                      }

                      return (
                        <span
                          key={index}
                          className="text-blue-600 font-medium cursor-pointer hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(path);
                          }}
                        >
                          {part}
                        </span>
                      );
                    }

                    return part;
                  });
                })()}
              </p>
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
                    mentions: comment.mentions,
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
                        mentions={commentWithReplies.mentions}
                      />
                    </div>
                  );
                })}

              {/* Show More Button for Web */}
              {hasNextPage && (
                <div className="flex justify-center py-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="min-w-[120px]"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Show More Comments"
                    )}
                  </Button>
                </div>
              )}
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
            <div className="relative flex items-center w-full">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1600ff] rounded-l-md z-10" />
              <div className="relative w-full">
                {/* Mirror Div for styling mentions */}
                <div
                  className="absolute inset-0 py-3 pl-4 pr-4 text-base whitespace-pre-wrap break-words pointer-events-none text-transparent border-none min-h-[45px] max-h-[120px]"
                  style={{ font: 'inherit', lineHeight: '1.5' }}
                >
                  {renderHighlightedText(commentText)}
                  {commentText.endsWith('\n') ? '\n' : ''}
                </div>
                <textarea
                  ref={inputRef}
                  placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Join the conversation"}
                  value={commentText}
                  onChange={handleTextChange}
                  className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-base py-3 pl-4 rounded-md min-h-[45px] max-h-[120px] resize-none overflow-y-auto relative z-10 text-gray-900 caret-black"
                  style={{
                    color: 'rgba(0,0,0,0.4)', // Slightly transparent to let the blue show through more clearly if perfectly aligned, or use transparent if we want full custom.
                    // Actually, let's use a subtle color or fully transparent.
                    // Fully transparent is best if we can guarantee alignment.
                  }}
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

              <MentionSearchResults
                results={mentionResults}
                onSelect={handleMentionSelect}
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

