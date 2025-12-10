import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, unlikePost } from "@/services/api/social";
import CommentsBottomSheet from "@/components/post/CommentsBottomSheet";
import { SharePost } from "@/components/ui/SharePost";

interface CommunityPostCardProps {
  post: {
    id: string | number;
    user: {
      id?: string | number;
      name: string;
      firstName?: string;
      lastName?: string;
      username: string;
      avatar?: string;
    };
    collective?: {
      name: string;
      id?: string | number;
    };
    content: string;
    imageUrl?: string;
    likes: number;
    comments: number;
    isLiked?: boolean;
    timestamp?: string;
  };
}

export default function CommunityPostCard({ post }: CommunityPostCardProps) {
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const likeMutation = useMutation({
    mutationFn: () => likePost(post.id.toString()),
    onSuccess: () => {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
    },
    onError: (error) => {
      console.error('Error liking post:', error);
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => unlikePost(post.id.toString()),
    onSuccess: () => {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
    },
    onError: (error) => {
      console.error('Error unliking post:', error);
    },
  });

  const handleLikeClick = () => {
    if (isLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  const displayName = post.user.firstName && post.user.lastName
    ? `${post.user.firstName} ${post.user.lastName}`
    : post.user.name || post.user.username;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar */}
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={post.user.avatar} />
            <AvatarFallback className="bg-[#1600ff] text-white">
              {displayName
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
            <Link
              to={`/user-profile/${post.user.username}`}
              className="font-bold text-gray-900 hover:underline block"
            >
              {displayName}
            </Link>
            <p className="text-sm text-gray-500">@{post.user.username}</p>
            </div>
            {post.collective && (
              <p className="text-sm text-gray-500 mt-0.5">{post.collective.name}</p>
            )}
          </div>
        </div>

        {/* Join Button - Only show if not own post and collective exists */}
        {/* {!isOwnPost && post.collective && (
          <Button
            onClick={() => {
              if (post.collective?.id) {
                window.location.href = `/newgroupcrwd/${post.collective.id}`;
              }
            }}
            className="bg-[#1600ff] hover:bg-[#1400cc] text-white px-4 py-1.5 rounded-full text-sm font-medium"
          >
            Join
          </Button>
        )} */}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={post.imageUrl}
            alt="Post content"
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Engagement Section */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLikeClick}
            disabled={likeMutation.isPending || unlikeMutation.isPending}
            className="flex items-center gap-1.5 hover:opacity-70 transition-opacity disabled:opacity-50"
          >
            <Heart
              className={`h-4 w-4 ${
                isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
            <span className="text-sm text-gray-600">{likesCount}</span>
          </button>
          <button
            onClick={() => setShowCommentsSheet(true)}
            className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
          >
            <MessageCircle className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">{post.comments || 0}</span>
          </button>
        </div>
        <button
          onClick={() => setShowShareModal(true)}
          className="hover:opacity-70 transition-opacity"
        >
          <Share2 className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Comments Bottom Sheet */}
      <CommentsBottomSheet
        isOpen={showCommentsSheet}
        onClose={() => setShowCommentsSheet(false)}
        post={{
          id: typeof post.id === 'string' ? parseInt(post.id) : post.id,
          username: post.user.username,
          text: post.content,
          avatarUrl: post.user.avatar,
          firstName: post.user.firstName,
          lastName: post.user.lastName,
        }}
      />

      {/* Share Modal */}
      <SharePost
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={`${window.location.origin}/post/${post.id}`}
        title={post.collective?.name || `${post.user.firstName} ${post.user.lastName}` || post.user.name}
        description={post.content}
      />
    </div>
  );
}

