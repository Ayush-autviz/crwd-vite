"use client";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { CardContent } from "../ui/card";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { EllipsisIcon, Trash2 } from "lucide-react";
import type { PostDetail } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { SharePost } from "../ui/SharePost";
import { Toast } from "../ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, unlikePost, deletePost } from "@/services/api/social";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/store";
import CommentsBottomSheet from "../post/CommentsBottomSheet";

export default function ProfileActivityCard({
  post,
  className,
  imageUrl,
}: {
  post: PostDetail;
  className?: string;
  imageUrl?: string;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isOwnPost = user?.id === post.userId;

  // Like/Unlike mutations
  const likeMutation = useMutation({
    mutationFn: () => likePost(post.id.toString()),
    onSuccess: () => {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      setToastMessage("Post liked!");
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Error liking post:', error);
      setToastMessage("Failed to like post");
      setShowToast(true);
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => unlikePost(post.id.toString()),
    onSuccess: () => {
      setIsLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
      setToastMessage("Post unliked!");
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Error unliking post:', error);
      setToastMessage("Failed to unlike post");
      setShowToast(true);
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: () => deletePost(post.id.toString()),
    onSuccess: () => {
      setToastMessage("Post deleted successfully!");
      setShowToast(true);
      setShowDeleteConfirm(false);
      setShowMenu(false);
      // Invalidate posts queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // If there's an onDelete callback, call it (for parent component to handle removal)
      // For now, the query invalidation should handle the update
    },
    onError: (error) => {
      console.error('Error deleting post:', error);
      setToastMessage("Failed to delete post");
      setShowToast(true);
      setShowDeleteConfirm(false);
    },
  });

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
     setToastMessage("Please login to like posts");
     setShowToast(true);
    } else {
      if (isLiked) {
        unlikeMutation.mutate();
      } else {
        likeMutation.mutate();
      }
    }
  };

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

  // Generate consistent color for org tag based on post ID
  const tagColors = [
    '#ec4899', // pink
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ef4444', // red
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
    '#a855f7', // violet
    '#14b8a6', // teal
    '#f43f5e', // rose
    '#6366f1', // indigo
  ];
  const tagColorIndex = post.id ? (String(post.id).charCodeAt(String(post.id).length - 1) || 0) % tagColors.length : 0;
  const tagBgColor = tagColors[tagColorIndex];

  // Generate random vibrant avatar colors
  const avatarColors = [
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#A855F7', // Violet
    '#14B8A6', // Teal
    '#F43F5E', // Rose
    '#6366F1', // Indigo
    '#22C55E', // Emerald
    '#EAB308', // Yellow
  ];
  // Use post ID to generate a consistent random color for each post
  // This ensures the same post always gets the same color
  const avatarColorIndex = post.id ? (Number(post.id) % avatarColors.length) : Math.floor(Math.random() * avatarColors.length);
  const avatarBgColor = avatarColors[avatarColorIndex];

  // Get user initials following the same pattern as ProfileNavbar
  const getUserInitials = () => {
    const postAny = post as any;
    if (postAny.firstName && postAny.lastName) {
      return `${postAny.firstName.charAt(0)}${postAny.lastName.charAt(0)}`.toUpperCase();
    }
    if (postAny.firstName) {
      return postAny.firstName.charAt(0).toUpperCase();
    }
    if (post.username) {
      return post.username.charAt(0).toUpperCase();
    }
    return "U";
  };
  
  const initials = getUserInitials();

  return (
    <>
      <Card
        key={post.id}
        className={cn(
          "bg-white rounded-xl shadow-sm border-0 mb-4 overflow-hidden",
          "shadow-[0_2px_2px_rgba(89,89,89,0.15)]",
          className
        )}
      >
        <CardContent className="p-3 md:p-4">
          <div className="flex gap-2.5 md:gap-3">
            {/* <Link to={isOwnPost ? `/profile` : `/user-profile/${post.userId}`}> */}
            <a href={isOwnPost ? `/profile` : `/user-profile/${post.userId}`}>
              <Avatar className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0">
                <AvatarImage
                  src={imageUrl ?? post.avatarUrl}
                  alt={post.username}
                />
                <AvatarFallback 
                  style={{ backgroundColor: avatarBgColor }}
                  className="text-white font-bold text-xs md:text-sm"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </a>
            {/* </Link> */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="flex-1 flex-wrap items-center">
                  <span className="text-xs md:text-sm font-semibold text-gray-900">{post.username}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] md:text-xs text-gray-500">{post.time}</span>
                    {post.org && (
                      <span 
                        className="px-2 md:px-2.5 py-0.5 md:py-1 rounded-xl text-[10px] md:text-[11px] font-medium text-white"
                        style={{ backgroundColor: tagBgColor }}
                      >
                        {post.org}
                      </span>
                    )}
                  </div>
                </div>
                {isOwnPost && (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                      }}
                      className="p-0.5 md:p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <EllipsisIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-500 cursor-pointer" />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 top-7 md:top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-32 md:w-36">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(false);
                            setShowShareModal(true);
                          }}
                          className="flex items-center gap-1.5 md:gap-2 w-full px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Share2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          Share Post
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(false);
                            setShowDeleteConfirm(true);
                          }}
                          className="flex items-center gap-1.5 md:gap-2 w-full px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-red-600 hover:bg-gray-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          Delete Post
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link to={`/post/${post.id}`} className="block">
              {/* <a href={`/post/${post.id}`} className="block"> */}
                <div className="text-xs md:text-sm text-gray-900 leading-5 mb-2 md:mb-3 whitespace-pre-line">
                  {post.text}
                </div>

                {/* Show preview card if previewDetails exists, otherwise show image */}
                {post.previewDetails ? (
                  <a
                    href={post.previewDetails.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="block w-full rounded-lg overflow-hidden mb-3 border border-gray-200 bg-white hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row bg-white">
                      {/* Preview Image */}
                      {post.previewDetails.image && (
                        <div className="w-full md:w-48 h-[200px] md:h-auto flex-shrink-0">
                          <img
                            src={post.previewDetails.image}
                            alt={post.previewDetails.title || 'Link preview'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {/* Preview Content */}
                      <div className="flex-1 p-2.5 md:p-3">
                        {post.previewDetails.site_name && (
                          <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">
                            {post.previewDetails.site_name}
                          </div>
                        )}
                        {post.previewDetails.title && (
                          <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-0.5 md:mb-1 line-clamp-2">
                            {post.previewDetails.title}
                          </h3>
                        )}
                        {post.previewDetails.description && (
                          <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1 line-clamp-2">
                            {post.previewDetails.description}
                          </p>
                        )}
                        {post.previewDetails.domain && (
                          <div className="text-[10px] md:text-[11px] text-gray-500 truncate">
                            {post.previewDetails.domain}
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                ) : post.imageUrl ? (
                  <div className="w-full rounded-lg overflow-hidden mb-2 md:mb-3 border border-gray-200">
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="w-full h-[180px] md:h-[200px] object-cover"
                    />
                  </div>
                ) : null}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 md:pt-3">
                  <div className="flex items-center gap-3 md:gap-4">
                    <button
                      onClick={handleLikeClick}
                      disabled={likeMutation.isPending || unlikeMutation.isPending}
                      className="flex items-center gap-1 md:gap-1.5 hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      {likeMutation.isPending || unlikeMutation.isPending ? (
                        <Loader2 className="w-4 h-4 md:w-[18px] md:h-[18px] animate-spin text-gray-500" />
                      ) : (
                        <Heart
                          className={`w-4 h-4 md:w-[18px] md:h-[18px] ${
                            isLiked ? "fill-[#ef4444] text-[#ef4444]" : "text-gray-500"
                          }`}
                        />
                      )}
                      <span className="text-xs md:text-sm text-gray-500">{likesCount}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowCommentsSheet(true);
                      }}
                      className="flex items-center gap-1 md:gap-1.5 hover:opacity-80 transition-opacity"
                    >
                      <MessageCircle className="w-4 h-4 md:w-[18px] md:h-[18px] text-gray-500" />
                      <span className="text-xs md:text-sm text-gray-500">{post.comments}</span>
                    </button>
                  </div>
                  <button
                    className="p-0.5 md:p-1 hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowShareModal(true);
                    }}
                  >
                    <Share2 className="w-4 h-4 md:w-[18px] md:h-[18px] text-gray-500" />
                  </button>
                </div>
              {/* </a> */}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <SharePost
        url={window.location.origin + `/post/${post.id}`}
        title={`${post.username} shared a post in ${post.org}`}
        description={post.text || `Check out this post from ${post.username} in the ${post.org} collective.`}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deletePostMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deletePostMutation.mutate();
              }}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />

      {/* Comments Bottom Sheet */}
      <CommentsBottomSheet
        isOpen={showCommentsSheet}
        onClose={() => setShowCommentsSheet(false)}
        post={{
          id: post.id,
          username: post.username,
          text: post.text,
          avatarUrl: post.avatarUrl,
          firstName: (post as any).firstName,
          lastName: (post as any).lastName,
        }}
      />
    </>
  );
}
