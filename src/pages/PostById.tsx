import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostDetailHeader from "@/components/post/PostDetailHeader";
import { popularPosts, profileActivity } from "@/lib/profile/profileActivity";
import ProfileActivityCard from "@/components/profile/ProfileActivityCard";
import { X } from "lucide-react";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Toast } from "@/components/ui/toast";
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
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();
  const allPosts = [...popularPosts, ...profileActivity];
  const post = allPosts.find((post) => post.id === parseInt(id || "0"));

  // Initialize comments based on post ID
  const [comments, setComments] = useState<CommentData[]>(
    defaultComments[parseInt(id || "0")] || []
  );

  const handleAddComment = (content: string) => {
    if (content.trim()) {
      const newComment: CommentData = {
        id: Date.now(),
        username: "current_user", // In a real app, this would come from auth context
        avatarUrl: "/view.png", // In a real app, this would come from auth context
        content: content,
        timestamp: new Date(),
        likes: 0,
        replies: [],
      };
      setComments((prevComments) => [newComment, ...prevComments]);
      setShowToast(true);
      setInputValue("");
    }
  };

  const handleReply = (commentId: number, content: string) => {
    const newReply: CommentData = {
      id: Date.now(),
      username: "current_user", // In a real app, this would come from auth context
      avatarUrl: "/view.png", // In a real app, this would come from auth context
      content: content,
      timestamp: new Date(),
      likes: 0,
      replies: [],
    };

    setComments((prevComments) => {
      const addReplyToComment = (comments: CommentData[]): CommentData[] => {
        return comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...comment.replies, newReply],
            };
          }
          if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies),
            };
          }
          return comment;
        });
      };

      return addReplyToComment(prevComments);
    });
  };

  const handleLike = (commentId: number) => {
    setComments((prevComments) => {
      const updateCommentLikes = (comments: CommentData[]): CommentData[] => {
        return comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: comment.likes + 1,
            };
          }
          if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentLikes(comment.replies),
            };
          }
          return comment;
        });
      };

      return updateCommentLikes(prevComments);
    });
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

  if (!post) {
    return (
      <div className="bg-white min-h-screen flex flex-col relative pb-16">
        <PostDetailHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Post not found
            </h2>
            <p className="text-gray-600">
              The post you're looking for doesn't exist or has been removed.
            </p>
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
          className="rounded-none shadow-none border-b border-gray-200"
        />

        {/* Comments Section */}
        <div className="px-4 py-6">
          {comments.length === 0 ? (
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
                />
              ))}
            </div>
          )}
        </div>

        {/* Spacer for sticky input */}
        <div className="h-30" />
      </main>

      {/* Sticky Input Bar */}
      <div className="fixed bottom-0 right-0 bg-white border-t px-4 py-3 flex items-center gap-2 w-full md:w-[calc(100%-288px)] ">
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
            className="bg-transparent outline-none flex-1 text-sm text-gray-700 placeholder-gray-400 pr-6"
          />
          {inputValue && (
            <button
              onClick={() => setInputValue("")}
              className="absolute right-3 p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <Toast
        show={showToast}
        onHide={() => setShowToast(false)}
        message="Reply Added"
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
