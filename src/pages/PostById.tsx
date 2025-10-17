import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProfileActivityCard from "@/components/profile/ProfileActivityCard";
import { X, Loader2 } from "lucide-react";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Toast } from "@/components/ui/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostById, getPostComments, createPostComment, getCommentReplies } from "@/services/api/social";
import type { PostDetail } from "@/lib/types";
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

// Default comments for specific posts
const defaultComments: Record<number, CommentData[]> = {
  // Post about food bank volunteering
  2: [
    {
      id: 1,
      username: "volunteer_123",
      avatarUrl: "/view.png",
      content:
        "This is so inspiring! I'd love to join next time. When do you usually volunteer?",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      likes: 5,
      replies: [
        {
          id: 2,
          username: "mynameismya",
          avatarUrl: "/view.png",
          content:
            "We're there every Saturday morning from 9 AM! Would love to have you join us 😊",
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
          likes: 2,
          replies: [],
        },
      ],
    },
  ],
  // Post about animal shelter
  4: [
    {
      id: 3,
      username: "pet_lover",
      avatarUrl: "/view.png",
      content:
        "Those puppies are absolutely adorable! 😍 Are they all available for adoption?",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      likes: 8,
      replies: [
        {
          id: 4,
          username: "mynameismya",
          avatarUrl: "/view.png",
          content:
            "Yes, they are! The shelter is open daily from 10 AM to 4 PM for visits.",
          timestamp: new Date(Date.now() - 82800000), // 23 hours ago
          likes: 3,
          replies: [],
        },
      ],
    },
    {
      id: 5,
      username: "dog_trainer",
      avatarUrl: "/view.png",
      content:
        "I'd be happy to offer a free training session for anyone who adopts! Just DM me.",
      timestamp: new Date(Date.now() - 43200000), // 12 hours ago
      likes: 15,
      replies: [],
    },
  ],
  // Post about clean water distribution
  6: [
    {
      id: 6,
      username: "water_activist",
      avatarUrl: "/view.png",
      content:
        "This is amazing work! How can others get involved in future distributions?",
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      likes: 12,
      replies: [
        {
          id: 7,
          username: "sarahsmiles",
          avatarUrl: "/view.png",
          content:
            "We're always looking for volunteers! Check our website for upcoming events or DM me for more info.",
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
          likes: 6,
          replies: [],
        },
      ],
    },
  ],
  // Post about tree planting
  7: [
    {
      id: 8,
      username: "eco_warrior",
      avatarUrl: "/view.png",
      content:
        "This is exactly what our city needs! Which areas did you focus on?",
      timestamp: new Date(Date.now() - 432000000), // 5 days ago
      likes: 9,
      replies: [
        {
          id: 9,
          username: "mikegreen",
          avatarUrl: "/view.png",
          content:
            "We focused on the downtown area and local schools. Planning more locations for next month!",
          timestamp: new Date(Date.now() - 345600000), // 4 days ago
          likes: 4,
          replies: [],
        },
      ],
    },
  ],
};

export default function PostById() {
  const { id } = useParams();
  const [inputValue, setInputValue] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Comment added successfully!");
  const [showDialog, setShowDialog] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  // Fetch post data using API
  const { data: postData, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPostById(id || ''),
    enabled: !!id,
  });

  // Transform API response to PostDetail format
  const post: PostDetail | undefined = postData ? {
    id: postData.id,
    userId: postData.user?.id?.toString() || '',
    avatarUrl: postData.user?.profile_picture || '/placeholder.svg',
    username: postData.user?.username || postData.user?.full_name || 'Unknown User',
    time: new Date(postData.created_at).toLocaleDateString(),
    org: postData.collective?.name || 'Unknown Collective',
    orgUrl: `/groupcrwd?crwdId=${postData.collective?.id}`,
    text: postData.content || '',
    imageUrl: postData.media || undefined,
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
    }));
  }, [commentsData]);
  

  // Use API comments if available, otherwise fall back to mock comments
  const [comments, setComments] = useState<CommentData[]>(
    apiComments.length > 0 ? apiComments : (defaultComments[parseInt(id || "0")] || [])
  );

  // Update comments when API data changes
  React.useEffect(() => {
    if (apiComments.length > 0) {
      setComments(apiComments);
    } else {
      const mockComments = defaultComments[parseInt(id || "0")] || [];
      setComments(mockComments);
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

  useEffect(() => {
    const handleBackButton = () => {
      window.history.pushState(null, "", window.location.href);
      window.onpopstate = function () {
        if (inputValue.trim()) {
          window.history.pushState(null, "", window.location.href);
          setShowDialog(true);
        } else {
          navigate("/");
        }
      };
    };

    handleBackButton();
    return () => {
      window.onpopstate = null;
    };
  }, [inputValue, navigate]);

  const handleConfirmLeave = () => {
    setShowDialog(false);
    navigate("/");
  };

  const handleCancelLeave = () => {
    setShowDialog(false);
  };

  if (!currentUser?.id) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-md mx-auto p-8">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Sign in to view this post
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Sign in to view your profile, manage your causes, and connect with your community.
          </p>
          
          {/* CTA Button */}
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Link to="/login" className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Continue
            </Link>
          </Button>
          
          {/* Additional Info */}
          <p className="text-sm text-gray-500 mt-6">
            Don't have an account? 
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col relative pb-16">
        <ProfileNavbar title="Post" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-10">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading post...
            </h2>
            <p className="text-gray-600">
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
      <div className="bg-white min-h-screen flex flex-col relative pb-16">
        <ProfileNavbar title="Post" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Post not found
            </h2>
            <p className="text-gray-600">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <ProfileNavbar title="Post" />
      <main className="flex-1">
        <ProfileActivityCard
          post={post}
          className="rounded-none shadow-none "
        />

        {/* Comments Section */}
         <div className="px-4 py-6">
           {isLoadingComments ? (
             <div className="text-center py-8 px-4">
               <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Loader2 className="w-6 h-6 text-primary animate-spin" />
                 </div>
                 <h3 className="text-base font-medium text-gray-900 mb-2">
                   Loading comments...
                 </h3>
                 <p className="text-sm text-gray-500">
                   Please wait while we fetch the comments
                 </p>
               </div>
             </div>
           ) : comments.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
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
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  Be the first one to comment
                </h3>
                <p className="text-sm text-gray-500">
                  Share your thoughts and start the conversation
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 font-medium">
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
                />
              ))}
            </div>
          )}
        </div>

        {/* Spacer for sticky input */}
        <div className="h-30" />
      </main>

      {/* Sticky Input Bar */}
      <div className="fixed bottom-0 right-0 bg-white border-t px-4 py-3 flex items-center gap-2 w-full ">
        <div className="flex items-center gap-2 flex-1 bg-gray-100 rounded-full px-4 py-2 relative">
          <img
            src="/view.png"
            alt="current user"
            className="w-5 h-5 rounded-full border"
          />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Join the conversation"
            disabled={createCommentMutation.isPending}
            className="bg-transparent outline-none flex-1 text-sm text-gray-700 placeholder-gray-400 pr-6 disabled:opacity-50"
          />
          {createCommentMutation.isPending ? (
            <div className="absolute right-3 p-1">
              <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
            </div>
          ) : inputValue ? (
            <button
              onClick={() => setInputValue("")}
              className="absolute right-3 p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Leave this page?</DialogTitle>
            <DialogDescription>
              You have typed a comment. If you leave now, your comment will be
              lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelLeave}>
              Stay on this page
            </Button>
            <Button variant="destructive" onClick={handleConfirmLeave}>
              Leave anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
