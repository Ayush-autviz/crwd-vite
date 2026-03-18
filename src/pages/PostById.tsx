import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ProfileActivityCard from "@/components/profile/ProfileActivityCard";
import { Loader2, X } from "lucide-react";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Toast } from "@/components/ui/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostById, getPostComments, createPostComment, getCommentReplies, mentionSearch } from "@/services/api/social";
import type { PostDetail } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { Comment, CommentData } from "@/components/post/Comment";
import { MentionSearchResults } from "@/components/post/MentionSearchResults";
import { useAuthStore } from "@/stores/store";
import { DiscardSheet } from "@/components/ui/DiscardSheet";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import LoggedOutHeader from "@/components/LoggedOutHeader";

export default function PostById() {
  const { id } = useParams();
  const [inputValue, setInputValue] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Comment added successfully!");
  const [showDiscardSheet, setShowDiscardSheet] = useState(false);
  const [isConfirmedLeave, setIsConfirmedLeave] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<number>>(new Set());
  const [replyingTo, setReplyingTo] = useState<CommentData | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user: currentUser } = useAuthStore();
  const [mentionSearchQuery, setMentionSearchQuery] = useState<string | null>(null);
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<{ type: string; id: number | string; name: string }[]>([]);

  // Redirect to login if no token
  // useEffect(() => {
  //   if (!token?.access_token) {
  //     navigate('/login', { replace: true });
  //   }
  // }, [token, navigate]);

  // // Show nothing if no token (redirect will happen)
  // if (!token?.access_token) {
  //   return null;
  // }

  // Fetch post data using API
  const { data: postData, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPostById(id || ''),
    enabled: !!id,
  });

  // Get user display name for header
  const getUserDisplayName = () => {
    if (!postData?.user) return 'Post';
    const user = postData.user;
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.full_name) {
      return user.full_name;
    }
    if (user.username) {
      return user.username;
    }
    return 'Post';
  };

  // Transform API response to PostDetail format
  const post: PostDetail | undefined = postData ? {
    id: postData.id,
    userId: postData.user?.id?.toString() || '',
    avatarUrl: postData.user?.profile_picture || '/placeholder.svg',
    username: postData.user?.username,
    color: postData.user?.color,
    time: postData.created_at ? formatDistanceToNow(new Date(postData.created_at), { addSuffix: true }) : '',
    org: postData.collective?.name || 'Feed',
    orgUrl: postData.collective?.id, // Collective ID for navigation
    text: postData.content || '',
    imageUrl: postData.media || undefined,
    previewDetails: postData.preview_details || null,
    fundraiser: postData.fundraiser ? {
      id: postData.fundraiser.id,
      name: postData.fundraiser.name,
      description: postData.fundraiser.description,
      image: postData.fundraiser.image,
      color: postData.fundraiser.color,
      target_amount: postData.fundraiser.target_amount,
      current_amount: postData.fundraiser.current_amount,
      progress_percentage: postData.fundraiser.progress_percentage || 0,
    } : undefined,
    likes: postData.likes_count || 0,
    comments: postData.comments_count || 0,
    shares: 0,
    isLiked: postData.is_liked || false,
    mentions: postData.mentions,
  } : undefined;

  const queryClient = useQueryClient();

  // Fetch comments for the post
  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ['postComments', id],
    queryFn: () => getPostComments(id || ''),
    enabled: !!id,
  });

  // Transform API comments to CommentData format
  const apiComments = React.useMemo(() => {
    if (!commentsData?.results) return [];

    return commentsData.results.map((comment: any) => ({
      id: comment.id,
      username: comment.user?.username || 'Unknown User',
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
      userId: comment.user?.id, // Add user ID for delete functionality
      mentions: comment.mentions,
    }));
  }, [commentsData]);


  // Use API comments if available, otherwise fall back to mock comments
  const [comments, setComments] = useState<CommentData[]>(
    apiComments.length > 0 ? apiComments : []
  );

  // Update comments when API data changes
  React.useEffect(() => {
    if (apiComments.length > 0) {
      setComments(apiComments);
    }
  }, [apiComments, id]);

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (data: { content: string; mentions?: any[] }) => createPostComment(id || '', { content: data.content, mentions: data.mentions }), // No parent_comment_id for main comments
    onSuccess: () => {
      setInputValue("");
      setSelectedMentions([]);
      // setToastMessage("Comment added successfully!");
      // setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['postComments', id] });
    },
    onError: () => {
      setToastMessage("Failed to add comment. Please try again.");
      setShowToast(true);
    },
  });

  const handleAddComment = (content: string) => {
    if (content.trim()) {
      createCommentMutation.mutate({ content: content.trim() });
    }
  };

  const [isSearchingMentions, setIsSearchingMentions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Get cursor position
    const cursorPosition = e.target.selectionStart;
    if (cursorPosition === null) return;

    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbolIndex !== -1) {
      const charBeforeAt = lastAtSymbolIndex > 0 ? textBeforeCursor[lastAtSymbolIndex - 1] : null;
      const isStartOfWord = !charBeforeAt || charBeforeAt === ' ' || charBeforeAt === '\n';

      if (isStartOfWord) {
        const query = textBeforeCursor.substring(lastAtSymbolIndex + 1);

        // Check if this query already corresponds to a mention we just selected
        const isAlreadySelected = selectedMentions.some(m =>
          query === m.name || query === m.name + ' ' || query.startsWith(m.name + ' ')
        );

        // Allow up to 2 spaces in the query to support full name search
        if (!isAlreadySelected && query.split(' ').length <= 3 && !query.includes('\n')) {
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
    if (mentionSearchQuery === null) {
      setMentionResults([]);
      setIsSearchingMentions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingMentions(true);
      try {
        const data = await mentionSearch(mentionSearchQuery);
        setMentionResults(data.results || (Array.isArray(data) ? data : []));
      } catch (error) {
        console.error('Mention search error:', error);
        setMentionResults([]);
      } finally {
        setIsSearchingMentions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [mentionSearchQuery]);

  const handleMentionSelect = (user: any) => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = inputValue.substring(0, cursorPosition);
    const textAfterCursor = inputValue.substring(cursorPosition);

    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');
    const newTextBeforeCursor = textBeforeCursor.substring(0, lastAtSymbolIndex) + `@${user.name} `;

    setInputValue(newTextBeforeCursor + textAfterCursor);
    setSelectedMentions(prev => [
      ...prev.filter(m => m.name !== user.name),
      { type: user.type, id: user.id, name: user.name }
    ]);
    setMentionSearchQuery(null);
    setMentionResults([]);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = newTextBeforeCursor.length;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: ({ commentId, data }: { commentId: number; data: { content: string; mentions?: any[] } }) =>
      createPostComment(id || '', { content: data.content, parent_comment_id: commentId, mentions: data.mentions }), // Use createPostComment with parent_comment_id
    onSuccess: (_, variables) => {
      // setToastMessage("Reply added successfully!");
      // setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['postComments', id] });
      // Fetch replies to show the new one and expand
      fetchReplies(variables.commentId);
      setInputValue("");
      setSelectedMentions([]);
      setReplyingTo(null);
    },
    onError: () => {
      setToastMessage("Failed to add reply. Please try again.");
      setShowToast(true);
    },
  });

  const handleReply = (commentId: number, _content: string) => {
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

  const handleSubmit = (content: string) => {
    if (!content.trim()) return;

    const finalMentions = selectedMentions
      .filter(m => content.includes(`@${m.name}`))
      .map(({ type, id }) => ({ type, id }));

    if (replyingTo) {
      createReplyMutation.mutate({
        commentId: replyingTo.id,
        data: { content: content.trim(), mentions: finalMentions }
      });
    } else {
      createCommentMutation.mutate({
        content: content.trim(),
        mentions: finalMentions
      });
    }
  };

  const handleLike = (_commentId: number) => {
    // For now, just show a toast - you can add like comment API later
    // setShowToast(true);
  };

  const fetchReplies = async (commentId: number) => {
    setLoadingReplies(prev => new Set(prev).add(commentId));
    try {
      const repliesData = await getCommentReplies(commentId.toString());
      const transformedReplies: CommentData[] = repliesData?.replies?.map((reply: any) => ({
        id: reply.id,
        username: reply.user?.username || reply.user?.full_name || 'Unknown User',
        firstName: reply.user?.first_name,
        lastName: reply.user?.last_name,
        avatarUrl: reply.user?.profile_picture || '/placeholder.svg',
        color: reply.user?.color,
        content: reply.content,
        timestamp: new Date(reply.created_at),
        likes: 0,
        replies: [],
        repliesCount: reply.replies_count || 0,
        parentComment: reply.parent_comment,
        userId: reply.user?.id, // Add user ID for delete functionality
        mentions: reply.mentions,
      })) || [];

      setComments(prevComments => {
        const updateCommentReplies = (comments: CommentData[]): CommentData[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: transformedReplies,
              };
            }
            return comment;
          });
        };
        return updateCommentReplies(prevComments);
      });

      setExpandedComments(prev => new Set(prev).add(commentId));
    } catch (error) {
      console.error('Error fetching replies:', error);
      setToastMessage("Failed to load replies. Please try again.");
      setShowToast(true);
    } finally {
      setLoadingReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const toggleReplies = (commentId: number) => {
    if (expandedComments.has(commentId)) {
      setExpandedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      fetchReplies(commentId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      handleAddComment(inputValue);
    }
  };

  // Navigation guard
  useUnsavedChanges(!!inputValue.trim(), setShowDiscardSheet, isConfirmedLeave);

  const handleBack = () => {
    if (location.key === 'default') {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  const handleConfirmLeave = () => {
    setIsConfirmedLeave(true);
    setShowDiscardSheet(false);
    setTimeout(() => {
      if (location.key === 'default') {
        navigate('/');
      } else {
        navigate(-2);
      }
    }, 0);
  };

  const handleCancelLeave = () => {
    setShowDiscardSheet(false);
  };

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


  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col relative pb-16 md:pb-0">
        {currentUser?.id ?
          <ProfileNavbar title={getUserDisplayName()} onBackClick={handleBack} />
          : <LoggedOutHeader />
        }
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8 md:py-10 px-4">
            <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin mx-auto mb-3 md:mb-4" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1.5 md:mb-2">
              Loading...
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              Please wait while we fetch the post details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <div className="bg-white min-h-screen flex flex-col relative pb-16 md:pb-0">
        {currentUser?.id ?
          <ProfileNavbar title={getUserDisplayName()} onBackClick={handleBack} />
          : <LoggedOutHeader />
        }
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8 md:py-10 px-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1.5 md:mb-2">
              Post not found
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={handleBack}
              className="mt-3 md:mt-4 px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col relative pb-16">
      {currentUser?.id ?
        <ProfileNavbar title={post.org} onBackClick={handleBack} />
        : <LoggedOutHeader />
      }
      <main className="flex-1">
        <ProfileActivityCard
          post={post}
          className="rounded-none shadow-none "
        />

        {/* Comments Section */}
        <div className="px-3 md:px-4 py-4 md:py-6">
          {isLoadingComments ? (
            <div className="text-center py-6 md:py-8 px-3 md:px-4">
              <div className="bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-100">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-primary animate-spin" />
                </div>
                <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1.5 md:mb-2">
                  Loading comments...
                </h3>
                <p className="text-xs md:text-sm text-gray-500">
                  Please wait while we fetch the comments
                </p>
              </div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-6 md:py-8 px-3 md:px-4">
              <div className="bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-100">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1.5 md:mb-2">
                  Be the first one to comment
                </h3>
                <p className="text-xs md:text-sm text-gray-500">
                  Share your thoughts and start the conversation
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              <p className="text-xs xs:text-sm md:text-base text-gray-600 font-medium">
                {comments.length} comment{comments.length !== 1 ? "s" : ""}
              </p>
              {comments.map((comment) => (
                <Comment
                  key={comment.id}
                  {...comment}
                  onReply={handleReply}
                  onLike={handleLike}
                  onToggleReplies={toggleReplies}
                  isExpanded={expandedComments.has(comment.id)}
                  isLoadingReplies={loadingReplies.has(comment.id)}
                  showReplyButton={!comment.parentComment} // Only main comments can have replies
                  onDelete={(commentId) => {
                    // Remove comment or reply from local state
                    setComments(prev => {
                      // First, try to remove it as a main comment
                      const filteredComments = prev.filter(c => c.id !== commentId);

                      // If not found, it might be a reply - remove from parent comment's replies
                      if (filteredComments.length === prev.length) {
                        return prev.map(comment => ({
                          ...comment,
                          replies: comment.replies.filter(reply => reply.id !== commentId),
                          repliesCount: comment.replies.filter(reply => reply.id !== commentId).length,
                        }));
                      }

                      return filteredComments;
                    });
                    // Invalidate queries to refresh
                    queryClient.invalidateQueries({ queryKey: ['postComments', id] });
                  }}
                  mentions={comment.mentions}
                />
              ))}
            </div>
          )}
        </div>

        {/* Spacer for sticky input */}
        <div className="h-24 md:h-30" />
      </main>

      {/* Sticky Input Bar */}
      {token?.access_token && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40">
          <div className="mx-auto w-full">
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
            <div className="relative flex items-center w-full">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1600ff] rounded-l-md z-10" />
              <div className="relative w-full bg-gray-50 rounded-md">
                {/* Mirror Div for styling mentions */}
                <div
                  className="absolute inset-0 py-3 pl-4 pr-4 text-base whitespace-pre overflow-hidden pointer-events-none text-transparent border-none"
                  style={{ font: 'inherit' }}
                >
                  {renderHighlightedText(inputValue)}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Join the conversation"}
                  disabled={createCommentMutation.isPending || createReplyMutation.isPending}
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-base py-3 pl-4 rounded-md min-h-[35px] relative z-10 text-gray-900 caret-black"
                  style={{ color: 'rgba(0,0,0,0.4)' }}
                />
              </div>

              <MentionSearchResults
                results={mentionResults}
                onSelect={handleMentionSelect}
                position="bottom"
              />
              {isSearchingMentions && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-gray-400">
                {/* <button type="button" className="hover:text-gray-600">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button type="button" className="hover:text-gray-600">
                  <LinkIcon className="w-5 h-5" />
                </button> */}
              </div>

              <button
                onClick={() => handleSubmit(inputValue)}
                disabled={!inputValue.trim() || createCommentMutation.isPending || createReplyMutation.isPending}
                className={`px-6 py-1.5 rounded-full font-semibold text-sm transition-colors ${inputValue.trim() && !createCommentMutation.isPending && !createReplyMutation.isPending
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
          </div>
        </div>
      )}

      <Toast
        show={showToast}
        onHide={() => setShowToast(false)}
        message={toastMessage}
      />

      <DiscardSheet
        isOpen={showDiscardSheet}
        onClose={handleCancelLeave}
        onDiscard={handleConfirmLeave}
      />
    </div>
  );
}
