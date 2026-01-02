import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfileActivityCard from "@/components/profile/ProfileActivityCard";
import { X, Loader2 } from "lucide-react";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Toast } from "@/components/ui/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostById, getPostComments, createPostComment, getCommentReplies } from "@/services/api/social";
import type { PostDetail } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Comment, CommentData } from "@/components/post/Comment";
import { useAuthStore } from "@/stores/store";

export default function PostById() {
  const { id } = useParams();
  const [inputValue, setInputValue] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Comment added successfully!");
  const [showDialog, setShowDialog] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  // Redirect to login if no token
  useEffect(() => {
    if (!token?.access_token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Show nothing if no token (redirect will happen)
  if (!token?.access_token) {
    return null;
  }

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
    username: postData.user?.username || postData.user?.full_name || 'Unknown User',
    time: postData.created_at ? formatDistanceToNow(new Date(postData.created_at), { addSuffix: true }) : '',
    org: postData.collective?.name || 'Unknown Collective',
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
      username: comment.user?.username || comment.user?.full_name || 'Unknown User',
      avatarUrl: comment.user?.profile_picture || '/placeholder.svg',
      content: comment.content,
      timestamp: new Date(comment.created_at),
      likes: 0,
      replies: [],
      repliesCount: comment.replies_count || 0,
      parentComment: comment.parent_comment,
      userId: comment.user?.id, // Add user ID for delete functionality
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
    mutationFn: (data: { content: string }) => createPostComment(id || '', { content: data.content }), // No parent_comment_id for main comments
    onSuccess: () => {
      setInputValue("");
      setToastMessage("Comment added successfully!");
      setShowToast(true);
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

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: ({ commentId, data }: { commentId: number; data: { content: string } }) => 
      createPostComment(id || '', { content: data.content, parent_comment_id: commentId }), // Use createPostComment with parent_comment_id
    onSuccess: () => {
      setToastMessage("Reply added successfully!");
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['postComments', id] });
    },
    onError: () => {
      setToastMessage("Failed to add reply. Please try again.");
      setShowToast(true);
    },
  });

  const handleReply = (commentId: number, content: string) => {
    if (content.trim()) {
      createReplyMutation.mutate({ commentId, data: { content: content.trim() } });
    }
  };

  const handleLike = (_commentId: number) => {
    // For now, just show a toast - you can add like comment API later
    setShowToast(true);
  };

  const fetchReplies = async (commentId: number) => {
    setLoadingReplies(prev => new Set(prev).add(commentId));
    try {
      const repliesData = await getCommentReplies(commentId.toString());
      const transformedReplies: CommentData[] = repliesData?.replies?.map((reply: any) => ({
        id: reply.id,
        username: reply.user?.username || reply.user?.full_name || 'Unknown User',
        avatarUrl: reply.user?.profile_picture || '/placeholder.svg',
        content: reply.content,
        timestamp: new Date(reply.created_at),
        likes: 0,
        replies: [],
        repliesCount: reply.replies_count || 0,
        parentComment: reply.parent_comment,
        userId: reply.user?.id, // Add user ID for delete functionality
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

  // useEffect(() => {
  //   const handleBackButton = () => {
  //     window.history.pushState(null, "", window.location.href);
  //     window.onpopstate = function () {
  //       if (inputValue.trim()) {
  //         window.history.pushState(null, "", window.location.href);
  //         setShowDialog(true);
  //       } else {
  //         navigate("/");
  //       }
  //     };
  //   };

  //   handleBackButton();
  //   return () => {
  //     window.onpopstate = null;
  //   };
  // }, [inputValue, navigate]);

  const handleConfirmLeave = () => {
    setShowDialog(false);
    navigate("/");
  };

  const handleCancelLeave = () => {
    setShowDialog(false);
  };


  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col relative pb-16 md:pb-0">
        <ProfileNavbar title={getUserDisplayName()} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8 md:py-10 px-4">
            <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin mx-auto mb-3 md:mb-4" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1.5 md:mb-2">
              Loading post...
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
        <ProfileNavbar title={getUserDisplayName()} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8 md:py-10 px-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1.5 md:mb-2">
              Post not found
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/')}
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
      <ProfileNavbar title={getUserDisplayName()} />
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
              <p className="text-xs md:text-sm text-gray-600 font-medium">
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
                />
              ))}
            </div>
          )}
        </div>

        {/* Spacer for sticky input */}
        <div className="h-24 md:h-30" />
      </main>

      {/* Sticky Input Bar */}
      <div className="fixed bottom-0 right-0 bg-white border-t px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-1.5 md:gap-2 w-full">
        <div className="flex items-center gap-1.5 md:gap-2 flex-1 bg-gray-100 rounded-full px-3 md:px-4 py-1.5 md:py-2 relative">
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt="current user"
              className="w-4 h-4 md:w-5 md:h-5 rounded-full border flex-shrink-0 object-cover"
              onError={(e) => {
                // Fallback to static image if profile picture fails to load
                e.currentTarget.src = "/view.png";
              }}
            />
          ) : (
            <img
              src="/view.png"
              alt="current user"
              className="w-4 h-4 md:w-5 md:h-5 rounded-full border flex-shrink-0"
            />
          )}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Join the conversation"
            disabled={createCommentMutation.isPending}
            className="bg-transparent outline-none flex-1 text-xs md:text-sm text-gray-700 placeholder-gray-400 pr-5 md:pr-6 disabled:opacity-50"
          />
          {createCommentMutation.isPending ? (
            <div className="absolute right-2 md:right-3 p-0.5 md:p-1">
              <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500 animate-spin" />
            </div>
          ) : inputValue ? (
            <button
              onClick={() => setInputValue("")}
              className="absolute right-2 md:right-3 p-0.5 md:p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
            </button>
          ) : null}
        </div>
      </div>

      <Toast
        show={showToast}
        onHide={() => setShowToast(false)}
        message={toastMessage}
      />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Leave this page?</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              You have typed a comment. If you leave now, your comment will be
              lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCancelLeave} className="w-full sm:w-auto text-sm md:text-base">
              Stay on this page
            </Button>
            <Button variant="destructive" onClick={handleConfirmLeave} className="w-full sm:w-auto text-sm md:text-base">
              Leave anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
