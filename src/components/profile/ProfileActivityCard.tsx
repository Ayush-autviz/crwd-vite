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
import { IoArrowRedoOutline } from "react-icons/io5";
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

export default function ProfileActivityCard({
  post,
  className,
  showDelete = false,
  imageUrl,
}: {
  post: PostDetail;
  showDelete?: boolean;
  className?: string;
  imageUrl?: string;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
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

  return (
    <>
      <Card
        key={post.id}
        className={cn(
          "overflow-hidden border-0 shadow-sm lg:max-w-[600px] ",
          className
        )}
      >
        <CardContent className="">
          {/* <Link to={`/posts/${post.id}`} className='w-full'> */}
          <div className="flex gap-3">
            {/* <div
              onClick={() =>
                navigate(`/user-profile`, {
                  state: { imageUrl: post.avatarUrl, name: post.username },
                })
              }
              className="cursor-pointer"
            > */}
            <Link to={isOwnPost ? `/profile` : `/user-profile/${post.userId}`}>
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage
                  src={imageUrl ?? post.avatarUrl}
                  alt={post.username}
                />
                <AvatarFallback>{post.username.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
            <Link to={`/post/${post.id}`} className="w-full">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="">
                    <span className="font-medium text-sm">{post.username}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      • {post.time}
                    </span>
                  </div>
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                      }}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <EllipsisIcon className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-36">
                        {showDelete && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowMenu(false);
                              setShowDeleteConfirm(true);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Post
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(false);
                            setShowShareModal(true);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Share2 className="h-4 w-4" />
                          Share Post
                        </button>
                        {/* <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(false);
                            // Handle report post
                            console.log("Report post");
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Flag className="h-4 w-4" />
                          Report Post
                        </button> */}
                        {/* delete post */}
                        {isOwnPost && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(false);
                            setShowDeleteConfirm(true);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Post
                        </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Link to={'/groupcrwd'} state={{ crwdId: post.orgUrl }} >
                  <div className="text-xs text-primary -mt-[2px] hover:underline">
                    {post.org}
                  </div>
                </Link>

                <div className="text-sm mt-2 mb-3 whitespace-pre-line leading-snug">
                  {post.text}
                </div>

                {post.imageUrl && (
                  <div className="w-full h-48 rounded-lg overflow-hidden mb-3">
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 text-muted-foreground mt-2">
                  <button
                    onClick={handleLikeClick}
                    disabled={likeMutation.isPending || unlikeMutation.isPending}
                    className="flex items-center gap-1 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    {likeMutation.isPending || unlikeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Heart
                        className={`w-4 h-4 ${
                          isLiked ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    )}
                    <span className="text-xs">{likesCount}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{post.comments}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowShareModal(true);
                    }}
                  >
                    <IoArrowRedoOutline className="w-4 h-4" />
                    {/* <span className="text-xs">{post.shares}</span> */}
                  </button>
                </div>
              </div>
            </Link>
          </div>
          {/* </Link> */}
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
    </>
  );
}
