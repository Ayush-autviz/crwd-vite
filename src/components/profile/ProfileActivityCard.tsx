
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

// Format date to relative time or full date
const formatPostTime = (timeString: string): string => {
  // Check if it's already a relative time string (like "1h ago", "2d ago")
  if (timeString.includes('ago') || timeString.includes('just now')) {
    return timeString;
  }

  let date: Date;

  // Handle DD/MM/YYYY or DD/MM/YYYY format (e.g., "15/12/2025")
  const ddmmyyyyMatch = timeString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    // Create date in YYYY-MM-DD format for proper parsing
    date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  } else {
    // Try to parse as ISO date string or other date formats
    date = new Date(timeString);
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    // If parsing fails, return the original string
    return timeString;
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInSeconds / 3600);

  // Show relative time for recent posts (within 24 hours)
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else {
    // For older posts, show full date
    const currentYear = now.getFullYear();
    const postYear = date.getFullYear();

    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
    };

    // Add year only if it's not the current year
    if (postYear !== currentYear) {
      options.year = 'numeric';
    }

    return date.toLocaleDateString('en-US', options);
  }
};

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
  const getConsistentColor = (id: number | string, colors: string[]) => {
    const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Get post data with any additional fields
  const postAny = post as any;
  const avatarBgColor = postAny.color || post.color || getConsistentColor(post.id || post.userId || 'U', avatarColors);

  // Get user display name (first name + last name, or fallback to username)
  const getDisplayName = () => {
    if (postAny.firstName && postAny.lastName) {
      return `${postAny.firstName} ${postAny.lastName}`;
    }
    if (postAny.firstName) {
      return postAny.firstName;
    }
    return post.username || 'Unknown User';
  };

  // Get user initials following the same pattern as ProfileNavbar
  const getUserInitials = () => {
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

  const displayName = getDisplayName();
  const initials = getUserInitials();

  // Format the post time
  const formattedTime = formatPostTime(post.time);

  // Check if post has created_at or timestamp for more accurate date
  const actualDate = postAny.created_at || postAny.timestamp || postAny.time;
  const finalFormattedTime = actualDate ? formatPostTime(actualDate) : formattedTime;

  return (
    <>
      <Card
        key={post.id}
        // Base padding py-3 (increased from py-2), md remains py-3
        className={cn(
          "bg-white rounded-xl border-1 border-gray-200 mb-4 overflow-hidden shadow-none py-3 md:py-3",
          className
        )}
      >
        {/* Base padding px-4 (increased from px-3), md remains px-4 */}
        <CardContent className="px-4 md:px-4">
          <div className="flex gap-3 md:gap-3">
            {/* <Link to={isOwnPost ? `/profile` : `/user-profile/${post.userId}`}> */}
            <a href={isOwnPost ? `/profile` : `/u/${post.username}`}>
              {/* Increased mobile avatar size: h-10 w-10 (was 9) */}
              <Avatar className="h-10 w-10 md:h-10 md:w-10 flex-shrink-0">
                <AvatarImage
                  src={imageUrl ?? post.avatarUrl}
                  alt={displayName}
                />
                {/* Increased mobile font size */}
                <AvatarFallback
                  style={{ backgroundColor: avatarBgColor }}
                  className="text-white font-bold text-sm md:text-sm"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </a>
            {/* </Link> */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="flex-1 flex-wrap items-center">
                  {/* Increased mobile name text to text-sm */}
                  <span className="text-sm md:text-sm font-semibold text-gray-900">{displayName}</span>
                  <div className="flex items-center gap-1">
                    {/* Increased mobile time text to text-xs (was 10px) */}
                    <span className="text-xs md:text-xs text-gray-500">{finalFormattedTime}</span>
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
                      className="p-1 md:p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {/* Increased mobile icon size */}
                      <EllipsisIcon className="h-5 w-5 md:h-5 md:w-5 text-gray-500 cursor-pointer" />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 top-8 md:top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-36 md:w-36">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(false);
                            setShowShareModal(true);
                          }}
                          // Increased mobile menu text
                          className="flex items-center gap-2 md:gap-2 w-full px-3 md:px-3 py-2 md:py-2 text-sm md:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Share2 className="h-4 w-4 md:h-4 md:w-4" />
                          Share Post
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(false);
                            setShowDeleteConfirm(true);
                          }}
                          className="flex items-center gap-2 md:gap-2 w-full px-3 md:px-3 py-2 md:py-2 text-sm md:text-sm text-red-600 hover:bg-gray-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 md:h-4 md:w-4" />
                          Delete Post
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link to={post.fundraiser ? `/fundraiser/${post.fundraiser.id}` : `/post/${post.id}`} className="block">
                {/* <a href={post.fundraiser ? `/fundraiser/${post.fundraiser.id}` : `/post/${post.id}`} className="block"> */}
                {/* Fundraiser Post UI */}
                {post.fundraiser ? (
                  <>
                    {/* Fundraiser Cover Image/Color */}
                    <div className="w-full rounded-lg overflow-hidden mb-3 md:mb-3 aspect-[2/1]" style={{ maxWidth: '600px' }}>
                      {post.fundraiser.image ? (
                        <img
                          src={post.fundraiser.image}
                          alt={post.fundraiser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: post.fundraiser.color || '#1600ff' }}
                        >
                          <span className="text-white text-2xl md:text-2xl font-bold opacity-50">
                            {post.fundraiser.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Fundraiser Info */}
                    <div className="mb-3 md:mb-3">
                      <p className="text-sm md:text-sm text-gray-500 mb-1">Started a fundraiser</p>
                      <h3 className="text-base md:text-base font-bold text-gray-900 mb-3 md:mb-3">
                        {post.fundraiser.name}
                      </h3>

                      {/* Amount and Progress */}
                      <div className="mb-2">
                        <div className="flex items-baseline gap-2 mb-1.5">
                          {/* Increased amount size */}
                          <span className="text-xl md:text-xl font-bold text-[#1600ff]">
                            ${parseFloat(post.fundraiser.current_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-sm md:text-sm text-gray-500">
                            raised of ${parseFloat(post.fundraiser.target_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} goal
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-2 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1600ff] transition-all duration-300"
                            style={{ width: `${Math.min(post.fundraiser.progress_percentage || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Increased mobile post text to text-sm */}
                    <div className="text-sm md:text-sm text-gray-900 leading-6 mb-3 md:mb-3 whitespace-pre-line">
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
                            <div className="w-full md:w-48 aspect-[2/1] md:aspect-auto flex-shrink-0">
                              <img
                                src={post.previewDetails.image}
                                alt={post.previewDetails.title || 'Link preview'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {/* Preview Content */}
                          <div className="flex-1 p-3 md:p-3">
                            {post.previewDetails.site_name && (
                              <div className="text-[10px] md:text-[10px] text-gray-500 uppercase tracking-wide mb-1 md:mb-1">
                                {post.previewDetails.site_name}
                              </div>
                            )}
                            {post.previewDetails.title && (
                              <h3 className="text-sm md:text-sm font-semibold text-gray-900 mb-1 md:mb-1 line-clamp-2">
                                {post.previewDetails.title}
                              </h3>
                            )}
                            {post.previewDetails.description && (
                              <p className="text-xs md:text-xs text-gray-500 mb-1 md:mb-1 line-clamp-2">
                                {post.previewDetails.description}
                              </p>
                            )}
                            {post.previewDetails.domain && (
                              <div className="text-[11px] md:text-[11px] text-gray-500 truncate">
                                {post.previewDetails.domain}
                              </div>
                            )}
                          </div>
                        </div>
                      </a>
                    ) : post.imageUrl ? (
                      <a
                        href={post.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="block w-full rounded-lg overflow-hidden mb-3 md:mb-3 cursor-pointer hover:opacity-90 transition-opacity relative "
                        style={{ maxWidth: '600px', maxHeight: '300px' }}
                      >
                        <img
                          src={post.imageUrl}
                          alt="Post"
                          className="max-w-[600px] max-h-[300px] rounded-lg object-contain"
                        />
                      </a>
                    ) : null}
                  </>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 md:pt-3">
                  <div className="flex items-center gap-4 md:gap-4">
                    <button
                      onClick={handleLikeClick}
                      disabled={likeMutation.isPending || unlikeMutation.isPending}
                      className="flex items-center gap-1.5 md:gap-1.5 hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      {likeMutation.isPending || unlikeMutation.isPending ? (
                        <Loader2 className="w-5 h-5 md:w-5 md:h-5 animate-spin text-gray-500" />
                      ) : (
                        <Heart
                          // Increased mobile icon size to 5/20px (was 4/16px)
                          className={`w-5 h-5 md:w-5 md:h-5 ${isLiked ? "fill-[#ef4444] text-[#ef4444]" : "text-gray-500"
                            }`}
                        />
                      )}
                      <span className="text-sm md:text-sm text-gray-500">{likesCount}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowCommentsSheet(true);
                      }}
                      className="flex items-center gap-1.5 md:gap-1.5 hover:opacity-80 transition-opacity"
                    >
                      {/* Increased mobile icon size */}
                      <MessageCircle className="w-5 h-5 md:w-5 md:h-5 text-gray-500" />
                      <span className="text-sm md:text-sm text-gray-500">{post.comments}</span>
                    </button>
                  </div>
                  <button
                    className="p-1 md:p-1 hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowShareModal(true);
                    }}
                  >
                    <Share2 className="w-5 h-5 md:w-5 md:h-5 text-gray-500" />
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
        title={`${displayName} shared a post in ${post.org}`}
        description={post.text || `Check out this post from ${displayName} in the ${post.org} collective.`}
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
          username: displayName,
          text: post.text,
          avatarUrl: post.avatarUrl,
          firstName: postAny.firstName,
          lastName: postAny.lastName,
          color: postAny.color || post.color,
        }}
      />
    </>
  );
}