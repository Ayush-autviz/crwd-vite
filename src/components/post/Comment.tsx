// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MessageCircle, EllipsisIcon, Trash2, Loader2 } from 'lucide-react';
// import { Button } from '../ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
// import { formatDistanceToNow } from 'date-fns';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '../ui/dialog';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { deleteComment } from '@/services/api/social';
// import { useAuthStore } from '@/stores/store';

// export interface CommentData {
//   id: number;
//   username: string;
//   firstName?: string;
//   lastName?: string;
//   avatarUrl: string;
//   color?: string;
//   content: string;
//   timestamp: Date;
//   likes: number;
//   replies: CommentData[];
//   repliesCount?: number;
//   parentComment?: any;
//   userId?: string | number; // User ID to check if comment belongs to current user
// }

// interface CommentProps extends CommentData {
//   onReply: (commentId: number, content: string) => void;
//   onLike: (commentId: number) => void;
//   onToggleReplies?: (commentId: number) => void;
//   isExpanded?: boolean;
//   isLoadingReplies?: boolean;
//   showReplyButton?: boolean;
//   onDelete?: (commentId: number) => void; // Callback when comment is deleted
// }

// export const Comment: React.FC<CommentProps> = ({
//   id,
//   username,
//   firstName,
//   lastName,
//   avatarUrl,
//   color,
//   content,
//   timestamp,
//   replies,
//   repliesCount = 0,
//   onReply,
//   onLike,
//   onToggleReplies,
//   isExpanded = false,
//   isLoadingReplies = false,
//   showReplyButton = true,
//   userId,
//   onDelete,
// }) => {
//   // Get display name (first name + last name, or fallback to username)
//   const displayName = firstName && lastName
//     ? `${firstName} ${lastName}`
//     : firstName || username;

//   // Get initials for avatar fallback
//   const getInitials = () => {
//     // if (firstName && lastName) {
//     //   return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
//     // }
//     if (firstName) {
//       return firstName.charAt(0).toUpperCase();
//     }
//     return username.charAt(0).toUpperCase();
//   };

//   const initials = getInitials();

//   // Avatar colors for consistent fallback styling
//   const avatarColors = [
//     '#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3',
//     '#FFC107', '#E91E63', '#00BCD4', '#8BC34A', '#FF5722',
//     '#673AB7', '#009688', '#FFEB3B', '#795548', '#607D8B',
//   ];

//   const getConsistentColor = (id: number | string, colors: string[]) => {
//     const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
//     return colors[hash % colors.length];
//   };

//   const avatarBgColor = color || getConsistentColor(userId || username || 'U', avatarColors);

//   const [showMenu, setShowMenu] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const menuRef = useRef<HTMLDivElement>(null);
//   const queryClient = useQueryClient();
//   const { user } = useAuthStore();
//   const isOwnComment = user?.id && userId && (user.id.toString() === userId.toString());

//   // Handle click outside to close menu
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setShowMenu(false);
//       }
//     };

//     if (showMenu) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showMenu]);

//   const navigate = useNavigate();

//   const handleReplyClick = () => {
//     onReply(id, `@${username} `);
//   };

//   const handleUserClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (userId) {
//       navigate(`/profile/${userId}`);
//     }
//   };

//   // Delete comment mutation
//   const deleteCommentMutation = useMutation({
//     mutationFn: () => deleteComment(id.toString()),
//     onSuccess: () => {
//       setShowDeleteConfirm(false);
//       setShowMenu(false);
//       // Call onDelete callback if provided
//       if (onDelete) {
//         onDelete(id);
//       }
//       // Invalidate comments queries to refresh the list
//       queryClient.invalidateQueries({ queryKey: ['postComments'] });
//     },
//     onError: (error) => {
//       console.error('Error deleting comment:', error);
//       setShowDeleteConfirm(false);
//       setShowMenu(false);
//     },
//   });

//   return (
//     <div className="space-y-2 md:space-y-4">
//       <div className="flex gap-2 md:gap-3">
//         <div
//           onClick={handleUserClick}
//           className="cursor-pointer hover:opacity-80 transition-opacity"
//         >
//           <Avatar className="h-6 w-6 md:h-8 md:w-8">
//             <AvatarImage src={avatarUrl} alt={displayName} />
//             <AvatarFallback
//               style={{ backgroundColor: avatarBgColor }}
//               className="text-white text-[10px] md:text-sm font-bold"
//             >
//               {initials}
//             </AvatarFallback>
//           </Avatar>
//         </div>
//         <div className="flex-1">
//           <div className="bg-muted p-2 md:p-3 rounded-lg">
//             <div className="flex items-center justify-between mb-0.5 md:mb-1">
//               <span
//                 onClick={handleUserClick}
//                 className="font-medium text-xs md:text-sm cursor-pointer hover:underline"
//               >
//                 {displayName}
//               </span>
//               {isOwnComment && (
//                 <div className="relative" ref={menuRef}>
//                   <button
//                     onClick={(e) => {
//                       e.preventDefault();
//                       e.stopPropagation();
//                       setShowMenu(!showMenu);
//                     }}
//                     className="p-0.5 md:p-1 rounded-full hover:bg-gray-100 transition-colors"
//                   >
//                     <EllipsisIcon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground cursor-pointer" />
//                   </button>
//                   {showMenu && (
//                     <div className="absolute right-0 top-6 md:top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-28 md:w-32">
//                       <button
//                         onClick={(e) => {
//                           e.preventDefault();
//                           e.stopPropagation();
//                           setShowMenu(false);
//                           setShowDeleteConfirm(true);
//                         }}
//                         className="flex items-center gap-1.5 md:gap-2 w-full px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-red-600 hover:bg-gray-50 transition-colors"
//                       >
//                         <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
//                         Delete
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//             <p className="text-xs md:text-sm">{content}</p>
//           </div>
//           <div className="flex items-center gap-2 md:gap-4 mt-1 md:mt-2 text-xs md:text-sm">
//             <span className="text-muted-foreground">
//               {formatDistanceToNow(timestamp, { addSuffix: true })}
//             </span>
//             {showReplyButton && (
//               <button
//                 onClick={handleReplyClick}
//                 className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
//               >
//                 <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
//                 Reply
//               </button>
//             )}
//             {repliesCount > 0 && onToggleReplies && (
//               <button
//                 onClick={() => onToggleReplies(id)}
//                 disabled={isLoadingReplies}
//                 className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
//               >
//                 {isLoadingReplies ? (
//                   <>
//                     <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
//                     <span className="hidden sm:inline">Loading...</span>
//                   </>
//                 ) : (
//                   <>
//                     <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
//                     <span className="hidden sm:inline">{isExpanded ? 'Hide' : 'View'} </span>
//                     {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
//                   </>
//                 )}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Render replies - only for main comments when expanded */}
//       {isExpanded && replies.length > 0 && (
//         <div className="ml-7 md:ml-10 space-y-2 md:space-y-4">
//           {replies.map((reply) => (
//             <Comment
//               key={reply.id}
//               {...reply}
//               onReply={onReply}
//               onLike={onLike}
//               showReplyButton={false} // Replies cannot have replies
//               onDelete={onDelete} // Pass onDelete to replies as well
//             />
//           ))}
//         </div>
//       )}

//       {/* Delete Confirmation Dialog */}
//       <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
//         <DialogContent className="p-4 md:p-6">
//           <DialogHeader>
//             <DialogTitle className="text-sm md:text-base">Delete Comment</DialogTitle>
//             <DialogDescription className="text-xs md:text-sm">
//               Are you sure you want to delete this comment? This action cannot be undone.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter className="gap-2">
//             <Button
//               variant="outline"
//               onClick={() => setShowDeleteConfirm(false)}
//               disabled={deleteCommentMutation.isPending}
//               className="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2"
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={() => {
//                 deleteCommentMutation.mutate();
//               }}
//               disabled={deleteCommentMutation.isPending}
//               className="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2"
//             >
//               {deleteCommentMutation.isPending ? (
//                 <>
//                   <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin" />
//                   Deleting...
//                 </>
//               ) : (
//                 "Delete"
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }; 















import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, EllipsisIcon, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteComment } from '@/services/api/social';
import { useAuthStore } from '@/stores/store';

export interface CommentData {
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
  parentComment?: any;
  userId?: string | number; // User ID to check if comment belongs to current user
}

interface CommentProps extends CommentData {
  onReply: (commentId: number, content: string) => void;
  onLike: (commentId: number) => void;
  onToggleReplies?: (commentId: number) => void;
  isExpanded?: boolean;
  isLoadingReplies?: boolean;
  showReplyButton?: boolean;
  onDelete?: (commentId: number) => void; // Callback when comment is deleted
}

export const Comment: React.FC<CommentProps> = ({
  id,
  username,
  firstName,
  lastName,
  avatarUrl,
  color,
  content,
  timestamp,
  replies,
  repliesCount = 0,
  onReply,
  onLike,
  onToggleReplies,
  isExpanded = false,
  isLoadingReplies = false,
  showReplyButton = true,
  userId,
  onDelete,
}) => {
  // Get display name (first name + last name, or fallback to username)
  const displayName = firstName && lastName
    ? `${firstName} ${lastName}`
    : firstName || username;

  // Get initials for avatar fallback
  const getInitials = () => {
    // if (firstName && lastName) {
    //   return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    // }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return username.charAt(0).toUpperCase();
  };

  const initials = getInitials();

  // Avatar colors for consistent fallback styling
  const avatarColors = [
    '#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3',
    '#FFC107', '#E91E63', '#00BCD4', '#8BC34A', '#FF5722',
    '#673AB7', '#009688', '#FFEB3B', '#795548', '#607D8B',
  ];

  const getConsistentColor = (id: number | string, colors: string[]) => {
    const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const avatarBgColor = color || getConsistentColor(userId || username || 'U', avatarColors);

  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isOwnComment = user?.id && userId && (user.id.toString() === userId.toString());

  // Handle click outside to close menu
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

  const navigate = useNavigate();

  const handleReplyClick = () => {
    onReply(id, `@${username} `);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOwnComment) {
      navigate(`/profile/`);
    }
    else {
      navigate(`/user-profile/${userId}`);
    }
  };

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: () => deleteComment(id.toString()),
    onSuccess: () => {
      setShowDeleteConfirm(false);
      setShowMenu(false);
      // Call onDelete callback if provided
      if (onDelete) {
        onDelete(id);
      }
      // Invalidate comments queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['postComments'] });
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      setShowDeleteConfirm(false);
      setShowMenu(false);
    },
  });

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex gap-3 md:gap-4">
        <div
          onClick={handleUserClick}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          {/* Increased Avatar Size: h-8 w-8 (was h-6) */}
          <Avatar className="h-8 w-8 md:h-10 md:w-10">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback
              style={{ backgroundColor: avatarBgColor }}
              // Increased font size
              className="text-white text-xs md:text-sm font-bold"
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          {/* Increased Padding: p-3 (was p-2) */}
          <div className="bg-muted p-3 md:p-4 rounded-lg">
            <div className="flex items-center justify-between mb-1 md:mb-1.5">
              <span
                onClick={handleUserClick}
                // Increased Name Size: text-sm (was text-xs)
                className="font-medium text-sm md:text-base cursor-pointer hover:underline"
              >
                {displayName}
              </span>
              {isOwnComment && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="p-1 md:p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {/* Increased Icon Size: h-4 w-4 (was h-3) */}
                    <EllipsisIcon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground cursor-pointer" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-7 md:top-9 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-32 md:w-36">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowMenu(false);
                          setShowDeleteConfirm(true);
                        }}
                        // Increased Menu Text/Icon
                        className="flex items-center gap-2 md:gap-2.5 w-full px-3 md:px-3 py-2 md:py-2 text-sm md:text-base text-red-600 hover:bg-gray-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Increased Content Size: text-sm (was text-xs) */}
            <p className="text-sm md:text-base text-gray-800 break-words whitespace-pre-wrap">{content}</p>
          </div>
          {/* Increased Action Text Size: text-xs/sm (was text-xs) */}
          <div className="flex items-center gap-3 md:gap-4 mt-1.5 md:mt-2 text-xs md:text-sm">
            <span className="text-muted-foreground">
              {(() => {
                const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
                return timeAgo === 'less than a minute ago' ? 'just now' : timeAgo;
              })()}
            </span>
            {showReplyButton && (
              <button
                onClick={handleReplyClick}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              >
                {/* Increased Icon Size */}
                <MessageCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Reply
              </button>
            )}
            {repliesCount > 0 && onToggleReplies && (
              <button
                onClick={() => onToggleReplies(id)}
                disabled={isLoadingReplies}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              >
                {isLoadingReplies ? (
                  <>
                    <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                    <span className="hidden sm:inline">Loading...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">{isExpanded ? 'Hide' : 'View'} </span>
                    {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Render replies - only for main comments when expanded */}
      {isExpanded && replies.length > 0 && (
        <div className="ml-8 md:ml-12 space-y-3 md:space-y-4">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              {...reply}
              onReply={onReply}
              onLike={onLike}
              showReplyButton={false} // Replies cannot have replies
              onDelete={onDelete} // Pass onDelete to replies as well
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="p-5 md:p-6 max-w-[90%] md:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Delete Comment</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteCommentMutation.isPending}
              className="text-sm md:text-base px-4 md:px-5 py-2 md:py-2.5 h-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteCommentMutation.mutate();
              }}
              disabled={deleteCommentMutation.isPending}
              className="text-sm md:text-base px-4 md:px-5 py-2 md:py-2.5 h-auto"
            >
              {deleteCommentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};