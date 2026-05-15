// import React, { useState, useEffect } from "react";
// import {
//   Link,
//   Mail,
//   MessageCircle,
//   Linkedin,
//   Camera,
//   X,
// } from "lucide-react";

// interface MobileShareModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title?: string;
//   message: string;
//   url?: string;
// }

// export function MobileShareModal({
//   isOpen,
//   onClose,
//   title = "",
//   message,
//   url = "",
// }: MobileShareModalProps) {
//   const [isVisible, setIsVisible] = useState(false);
//   const [isAnimating, setIsAnimating] = useState(false);

//   useEffect(() => {
//     let timer: NodeJS.Timeout;

//     if (isOpen) {
//       // mount the modal
//       setIsVisible(true);
//       setIsAnimating(false);
//       timer = setTimeout(() => setIsAnimating(true), 20);
//     } else if (isVisible) {
//       // start closing animation
//       setIsAnimating(false);
//       timer = setTimeout(() => setIsVisible(false), 300); // must match transition duration
//     }

//     return () => clearTimeout(timer);
//   }, [isOpen, isVisible]);

//   // Create a wrapper function to handle closing with animation
//   const handleClose = () => {
//     setIsAnimating(false);
//     setTimeout(() => {
//       onClose();
//     }, 300); // Wait for animation to complete before calling onClose
//   };

//   const [copied, setCopied] = useState(false);

//   const handleCopyLink = async () => {
//     try {
//       await navigator.clipboard.writeText(url);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//       handleClose();
//     } catch (err) {
//       console.error("Failed to copy link");
//     }
//   };

//   const handleEmailShare = () => {
//     const emailSubject = title || 'Check this out';
//     const emailBody = message ? `${message}\n\n${url}` : url;
//     const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
//     window.open(emailUrl, '_blank');
//     handleClose();
//   };

//   const handleTwitterShare = () => {
//     const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
//       title || message
//     )}&url=${encodeURIComponent(url)}`;
//     window.open(shareUrl, '_blank');
//     handleClose();
//   };

//   const handleLinkedInShare = () => {
//     const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
//     window.open(shareUrl, '_blank');
//     handleClose();
//   };

//   const handleMessengerShare = () => {
//     const shareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}`;
//     window.open(shareUrl, '_blank');
//     handleClose();
//   };

//   const handleInstagramShare = () => {
//     const shareText = title ? `${title}\n\n${url}` : (message ? `${message}\n\n${url}` : url);
//     const instagramUrl = `https://www.instagram.com/create/details/?mediaType=PHOTO`;
//     window.open(instagramUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
//     navigator.clipboard.writeText(shareText).then(() => {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     });
//     handleClose();
//   };

//   if (!isVisible) return null;

//   return (
//     <div
//       className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 transition-opacity duration-300 ${
//         isAnimating ? "opacity-100" : "opacity-0"
//       }`}
//       onClick={handleClose} // Use handleClose instead of onClose
//     >
//       <div
//         className={`bg-white rounded-t-3xl w-full transform transition-transform duration-300 ${
//           isAnimating ? "translate-y-0" : "translate-y-full"
//         }`}
//         style={{
//           transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Handle */}
//         <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-4 mb-4" />

//         {/* Header */}
//         <div className="mb-6 px-6">
//           <h2 className="text-xl font-bold text-gray-900 mb-2">Share</h2>
//           <p className="text-sm text-gray-600">
//             Share this with your friends and community
//           </p>
//         </div>

//         {/* Share Options Grid */}
//         <div className="px-6 pb-8">
//           <div className="grid grid-cols-3 gap-6 gap-y-8">
//             {/* Copy Link */}
//             <button
//               onClick={handleCopyLink}
//               className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
//             >
//               <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
//                 <Link className="w-6 h-6 text-blue-600" />
//               </div>
//               <span className="text-sm font-medium text-gray-900">
//                 {copied ? 'Copied!' : 'Copy Link'}
//               </span>
//             </button>

//             {/* Twitter */}
//             <button
//               onClick={handleTwitterShare}
//               className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
//             >
//               <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
//                 <X className="w-6 h-6 text-gray-900" />
//               </div>
//               <span className="text-sm font-medium text-gray-900">Twitter</span>
//             </button>

//             {/* Messenger */}
//             <button
//               onClick={handleMessengerShare}
//               className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
//             >
//               <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
//                 <MessageCircle className="w-6 h-6 text-blue-600" />
//               </div>
//               <span className="text-sm font-medium text-gray-900">Messenger</span>
//             </button>

//             {/* LinkedIn */}
//             <button
//               onClick={handleLinkedInShare}
//               className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
//             >
//               <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
//                 <Linkedin className="w-6 h-6 text-gray-900" />
//               </div>
//               <span className="text-sm font-medium text-gray-900">LinkedIn</span>
//             </button>

//             {/* Email */}
//             <button
//               onClick={handleEmailShare}
//               className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
//             >
//               <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
//                 <Mail className="w-6 h-6 text-red-600" />
//               </div>
//               <span className="text-sm font-medium text-gray-900">Email</span>
//             </button>

//             {/* Instagram */}
//             <button
//               onClick={handleInstagramShare}
//               className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
//             >
//               <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center">
//                 <Camera className="w-6 h-6 text-gray-900" />
//               </div>
//               <span className="text-sm font-medium text-gray-900">Instagram</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }














import React, { useState, useEffect } from "react";
import {
  Link,
  Mail,
  MessageCircle,
  Linkedin,
  Camera,
  X,
  Search,
  Repeat,
  Check,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getConversations,
  searchConversations,
  sendChatMessage,
  ConversationResponse,
} from "@/services/api/chat";
import { repostPost } from "@/services/api/social";
import { useAuthStore } from "@/stores/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { decodePostId } from "@/lib/utils";
import { Toast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface MobileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  url?: string;
  entityId?: string | number;
  entityType?: string;
}

export function MobileShareModal({
  isOpen,
  onClose,
  title = "",
  message,
  url = "",
  entityId,
  entityType,
}: MobileShareModalProps) {
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());
  const [isSending, setIsSending] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastState, setToastState] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const isPostOnly = entityType === "post" || (!entityType && url.includes("/post/") && !url.includes("/fundraiser/"));

  // Fetch conversations data dynamically
  const { data: convData, isLoading: isConversationsLoading } = useQuery({
    queryKey: ["share-conversations", searchQuery],
    queryFn: () =>
      searchQuery ? searchConversations(searchQuery) : getConversations(),
    enabled: isOpen,
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(false);
      timer = setTimeout(() => setIsAnimating(true), 20);
    } else if (isVisible) {
      setIsAnimating(false);
      timer = setTimeout(() => setIsVisible(false), 300);
    }

    return () => clearTimeout(timer);
  }, [isOpen, isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      // Reset inner states on close
      setSearchQuery("");
      setSentIds(new Set());
    }, 300);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      handleClose();
    } catch {
      console.error("Failed to copy link");
    }
  };

  const handleRepost = async () => {
    try {
      let postIdToRepost: string | null = entityId ? entityId.toString() : null;

      // If entityId isn't provided, try to extract from URL
      if (!postIdToRepost && url.includes("/post/")) {
        const parts = url.split("/post/");
        if (parts.length > 1) {
          const encoded = parts[1].split(/[/?#]/)[0];
          if (encoded) {
            try {
              const decoded = decodePostId(encoded);
              if (decoded) {
                postIdToRepost = decoded.toString();
              }
            } catch {
              // fallback below
            }
          }
        }
      }

      if (!postIdToRepost) {
        throw new Error("No post ID found to repost");
      }

      await repostPost(postIdToRepost);
      setToastState({ show: true, message: "Post successfully reposted" });

      // Delay closing to show the toast
      setTimeout(() => {
        setToastState(prev => ({ ...prev, show: false }));
        handleClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to repost:", err);
      setToastState({ show: true, message: "Already Reposted." });
      setTimeout(() => setToastState(prev => ({ ...prev, show: false })), 1500);
    }
  };

  const handleEmailShare = () => {
    const emailSubject = title || "Check this out";
    const emailBody = message ? `${message}\n\n${url}` : url;
    const emailUrl = `mailto:?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.open(emailUrl, "_blank");
    handleClose();
  };

  const handleTwitterShare = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title || message
    )}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank");
    handleClose();
  };

  const handleLinkedInShare = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`;
    window.open(shareUrl, "_blank");
    handleClose();
  };

  const handleMessengerShare = () => {
    const shareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
      url
    )}`;
    window.open(shareUrl, "_blank");
    handleClose();
  };

  const handleInstagramShare = () => {
    const shareText = title
      ? `${title}\n\n${url}`
      : message
        ? `${message}\n\n${url}`
        : url;
    const instagramUrl = `https://www.instagram.com/create/details/?mediaType=PHOTO`;
    window.open(
      instagramUrl,
      "_blank",
      "width=600,height=700,scrollbars=yes,resizable=yes"
    );
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    handleClose();
  };

  const handleSendToChat = async (convId: number, userName: string) => {
    try {
      setIsSending(convId);
      const formData = new FormData();
      formData.append("conversation_id", convId.toString());

      // Use explicit entity properties if available, otherwise check URL path
      let extractedId: string | null = entityId ? entityId.toString() : null;
      let entityTypeToSend: string | null = entityType || null;

      if (!extractedId || !entityTypeToSend) {
        if (url.includes("/post/")) {
          const parts = url.split("/post/");
          if (parts.length > 1) {
            const encoded = parts[1].split(/[/?#]/)[0];
            if (encoded) {
              try {
                const decoded = decodePostId(encoded);
                if (decoded) {
                  extractedId = decoded.toString();
                  entityTypeToSend = "post";
                }
              } catch {
                // ignore decode errors
              }
            }
          }
        } else if (url.includes("/fundraiser/")) {
          const parts = url.split("/fundraiser/");
          if (parts.length > 1) {
            const encoded = parts[1].split(/[/?#]/)[0];
            if (encoded) {
              try {
                const decoded = decodePostId(encoded);
                if (decoded) {
                  extractedId = decoded.toString();
                  entityTypeToSend = "fundraiser";
                }
              } catch {
                // ignore decode errors
              }
              if (!extractedId) {
                extractedId = encoded;
                entityTypeToSend = "fundraiser";
              }
            }
          }
        } else if (url.includes("/c/")) {
          const parts = url.split("/c/");
          if (parts.length > 1) {
            const extracted = parts[1].split(/[/?#]/)[0];
            if (extracted) {
              extractedId = extracted;
              entityTypeToSend = "cause";
            }
          }
        } else if (url.includes("/cause/")) {
          const parts = url.split("/cause/");
          if (parts.length > 1) {
            const extracted = parts[1].split(/[/?#]/)[0];
            if (extracted) {
              extractedId = extracted;
              entityTypeToSend = "cause";
            }
          }
        } else if (url.includes("/g/")) {
          const parts = url.split("/g/");
          if (parts.length > 1) {
            const extracted = parts[1].split(/[/?#]/)[0];
            if (extracted) {
              extractedId = extracted;
              entityTypeToSend = "collective";
            }
          }
        } else if (url.includes("/groupcrwd/")) {
          const parts = url.split("/groupcrwd/");
          if (parts.length > 1) {
            const extracted = parts[1].split(/[/?#]/)[0];
            if (extracted) {
              extractedId = extracted;
              entityTypeToSend = "collective";
            }
          }
        } else if (url.includes("/u/")) {
          const parts = url.split("/u/");
          if (parts.length > 1) {
            const extracted = parts[1].split(/[/?#]/)[0];
            if (extracted) {
              extractedId = extracted;
              entityTypeToSend = "profile";
            }
          }
        }
      }

      if (entityTypeToSend && extractedId) {
        formData.append("entity_type", entityTypeToSend);
        formData.append("entity_id", extractedId);
      } else {
        const textContent = message ? `${message}\n${url}` : url;
        formData.append("content", textContent);
      }

      await sendChatMessage(formData);
      setSentIds(prev => new Set(prev).add(convId));

      // Trigger custom UI toast displaying target recipient's name
      setToastState({ show: true, message: `shared to ${userName}` });

      // Delay modal closure slightly to allow visual confirmation of toast notification
      setTimeout(() => {
        setToastState(prev => ({ ...prev, show: false }));
        handleClose();
      }, 1200);
    } catch {
      console.error("Failed to share to chat");
      setToastState({ show: true, message: "Failed to share post" });
      setTimeout(() => setToastState(prev => ({ ...prev, show: false })), 1500);
    } finally {
      setIsSending(null);
    }
  };

  if (!isVisible) return null;

  const conversations = (convData?.results || []).slice(0, 5);

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-end justify-center z-100 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"
        }`}
      onClick={handleClose}
    >
      {/* Absolute UI Toast notification layering */}
      <Toast
        show={toastState.show}
        message={toastState.message}
        onHide={() => setToastState(prev => ({ ...prev, show: false }))}
      />

      <div
        className={`bg-white rounded-t-3xl w-full transform transition-transform duration-300 flex flex-col max-h-[85vh] ${isAnimating ? "translate-y-0" : "translate-y-full"
          }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top pill indicator */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />

        {/* Header Title & Close button */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900">Share</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="px-4 pt-3 pb-2 flex-shrink-0">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Section Title */}
        <div className="px-4 pt-1 pb-1 flex-shrink-0">
          <span className="text-[11px] font-bold text-gray-500">Recent</span>
        </div>

        {/* User / Chat Conversations List Container */}
        <div className="px-4 overflow-y-auto divide-y divide-gray-50 flex-grow min-h-[120px] max-h-[220px] scrollbar-thin scrollbar-thumb-gray-200">
          {isConversationsLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-2">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="flex flex-col gap-1.5 flex-grow">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="h-2 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-8 text-center text-xs font-medium text-gray-400">
              No conversations found
            </div>
          ) : (
            conversations.map((conv: ConversationResponse) => {
              const otherUser =
                conv.participants.find(p => p.id !== user?.id) ||
                conv.participants[0];
              if (!otherUser) return null;

              const isSent = sentIds.has(conv.id);
              const isCurrentSending = isSending === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    if (!isSent && !isCurrentSending) {
                      handleSendToChat(conv.id, otherUser.full_name);
                    }
                  }}
                  className={`flex items-center justify-between py-2.5 px-2 rounded-lg transition-colors gap-2 ${isSent || isCurrentSending
                    ? "opacity-60 cursor-default"
                    : "cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-grow">
                    <Avatar className="w-9 h-9 border border-gray-100 flex-shrink-0">
                      <AvatarImage
                        src={otherUser.profile_picture || undefined}
                        alt={otherUser.full_name}
                      />
                      <AvatarFallback
                        style={{ backgroundColor: otherUser.color || "#ccc" }}
                        className="text-white font-bold text-xs"
                      >
                        {otherUser.full_name
                          ? otherUser.full_name.charAt(0).toUpperCase()
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-xs font-bold text-gray-900 truncate">
                        {otherUser.full_name}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400 truncate">
                        @{otherUser.username}
                      </span>
                    </div>
                  </div>

                  {isSent && (
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" /> Sent
                    </span>
                  )}
                  {isCurrentSending && (
                    <span className="text-[10px] font-bold text-blue-600 animate-pulse flex-shrink-0">
                      Sending...
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* External Social Links Multi-Column Grid */}
        <div className="px-4 pt-4 pb-6 border-t border-gray-100 flex-shrink-0 mt-2">
          <div className="grid grid-cols-3 gap-y-5 gap-x-2 max-w-7xl mx-auto">
            {/* Repost on crwd */}
            {isPostOnly && (
              <div className="flex justify-center">
                <button
                  onClick={handleRepost}
                  className="inline-flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity w-auto"
                >
                  <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center">
                    <Repeat className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-800 text-center">
                    Repost on crwd
                  </span>
                </button>
              </div>
            )}

            {/* Copy Link */}
            <div className="flex justify-center">
              <button
                onClick={handleCopyLink}
                className="inline-flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity w-auto"
              >
                <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center">
                  <Link className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[10px] font-bold text-gray-800 text-center">
                  {copied ? "Copied!" : "Copy Link"}
                </span>
              </button>
            </div>

            {/* Twitter */}
            <div className="flex justify-center">
              <button
                onClick={handleTwitterShare}
                className="inline-flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity w-auto"
              >
                <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-800" />
                </div>
                <span className="text-[10px] font-bold text-gray-800 text-center">
                  Twitter
                </span>
              </button>
            </div>

            {/* Messenger */}
            <div className="flex justify-center">
              <button
                onClick={handleMessengerShare}
                className="inline-flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity w-auto"
              >
                <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[10px] font-bold text-gray-800 text-center">
                  Messenger
                </span>
              </button>
            </div>

            {/* LinkedIn */}
            <div className="flex justify-center">
              <button
                onClick={handleLinkedInShare}
                className="inline-flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity w-auto"
              >
                <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center">
                  <Linkedin className="w-4 h-4 text-gray-800" />
                </div>
                <span className="text-[10px] font-bold text-gray-800 text-center">
                  LinkedIn
                </span>
              </button>
            </div>

            {/* Email */}
            <div className="flex justify-center">
              <button
                onClick={handleEmailShare}
                className="inline-flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity w-auto"
              >
                <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-[10px] font-bold text-gray-800 text-center">
                  Email
                </span>
              </button>
            </div>

            {/* Instagram */}
            <div className="flex justify-center">
              <button
                onClick={handleInstagramShare}
                className="inline-flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity w-auto"
              >
                <div className="w-11 h-11 bg-pink-50 rounded-full flex items-center justify-center">
                  <Camera className="w-4 h-4 text-pink-600" />
                </div>
                <span className="text-[10px] font-bold text-gray-800 text-center">
                  Instagram
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}