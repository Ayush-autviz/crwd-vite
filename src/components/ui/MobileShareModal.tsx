import React, { useState, useEffect } from "react";
import {
  Share2,
  MessageCircle,
  Mail,
  Phone,
  Linkedin,
  MessageSquare,
  Link,
  ChevronDown,
} from "lucide-react";

interface MobileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  url?: string;
}

export function MobileShareModal({
  isOpen,
  onClose,
  title = "",
  message,
  url = "",
}: MobileShareModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isOpen) {
      // mount the modal
      setIsVisible(true);
      setIsAnimating(false);
      timer = setTimeout(() => setIsAnimating(true), 20);
    } else if (isVisible) {
      // start closing animation
      setIsAnimating(false);
      timer = setTimeout(() => setIsVisible(false), 300); // must match transition duration
    }

    return () => clearTimeout(timer);
  }, [isOpen, isVisible]);

  // Create a wrapper function to handle closing with animation
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete before calling onClose
  };

  const handleShare = async (platform?: string) => {
    try {
      let shareUrl = url || "";

      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}&quote=${encodeURIComponent(message)}`;
          window.open(shareUrl, "_blank");
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            message
          )}&url=${encodeURIComponent(url)}`;
          window.open(shareUrl, "_blank");
          break;
        case "linkedin":
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url
          )}&summary=${encodeURIComponent(message)}`;
          window.open(shareUrl, "_blank");
          break;
        case "whatsapp":
          shareUrl = `https://wa.me/?text=${encodeURIComponent(
            message + (url ? "\n" + url : "")
          )}`;
          window.open(shareUrl, "_blank");
          break;
        case "telegram":
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(message)}`;
          window.open(shareUrl, "_blank");
          break;
        case "email":
          {
            const emailSubject = title || 'Check this out';
            const emailBody = message ? `${message}\n\n${url}` : url;
            // Open email in a new tab
            shareUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            window.open(shareUrl, '_blank');
          }
          break;
        case "sms":
          shareUrl = `sms:?body=${encodeURIComponent(
            message + (url ? "\n" + url : "")
          )}`;
          window.open(shareUrl);
          break;
        case "instagram":
          {
            const shareText = title ? `${title}\n\n${url}` : (message ? `${message}\n\n${url}` : url);
            // Open Instagram in a new window (popup) similar to Facebook
            const instagramUrl = `https://www.instagram.com/create/details/?mediaType=PHOTO`;
            window.open(instagramUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
            // Also copy to clipboard for convenience
            await navigator.clipboard.writeText(shareText);
          }
          break;
        case "tiktok":
          {
            const shareText = title ? `${title}\n\n${url}` : (message ? `${message}\n\n${url}` : url);
            // Open TikTok in a new window (popup) similar to Facebook
            const tiktokUrl = `https://www.tiktok.com/upload`;
            window.open(tiktokUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
            // Also copy to clipboard for convenience
            await navigator.clipboard.writeText(shareText);
          }
          break;
        default:
          if (navigator.share) {
            await navigator.share({ title, text: message, url });
          } else {
            await navigator.clipboard.writeText(
              message + (url ? "\n" + url : "")
            );
            alert("Content copied to clipboard!");
          }
      }

      handleClose(); // Use handleClose instead of onClose
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Error sharing content");
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose} // Use handleClose instead of onClose
    >
      <div
        className={`bg-white rounded-t-3xl w-full transform transition-transform duration-300 ${
          isAnimating ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-5 mb-5" />

        {/* Header */}
        <div className="text-center mb-6 px-6">
          <h2 className="text-xl font-bold mb-2">Check out this nonprofit</h2>
        </div>

        {/* Primary Actions */}
        <div className="space-y-3 mb-6 px-6">
          <button
            onClick={() => {
              navigator.clipboard.writeText(url);
              alert("Link copied!");
              handleClose(); // Use handleClose instead of onClose
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center"
          >
            <Link className="w-4 h-4 mr-2" />
            Copy Invite Link
          </button>

          <button
            onClick={() => handleShare("email")}
            className="w-full py-3 border border-gray-300 text-gray-900 hover:bg-gray-50 rounded-lg flex items-center justify-center"
          >
            <Mail className="w-4 h-4 mr-2" />
            Invite by Email
          </button>
        </div>

        {/* Social Sharing */}
        <div className="mb-6 px-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Share directly:
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => handleShare("facebook")}
              className="cursor-pointer hover:opacity-80 transition-opacity border-none bg-transparent p-0"
            >
              <img
                src="/socials/facebook.png"
                alt="Facebook"
                className="w-12 h-12"
              />
            </button>

            <button
              onClick={() => handleShare("instagram")}
              className="cursor-pointer hover:opacity-80 transition-opacity border-none bg-transparent p-0"
            >
              <img
                src="/socials/instagram.png"
                alt="Instagram"
                className="w-12 h-12"
              />
            </button>

            <button
              onClick={() => handleShare("tiktok")}
              className="cursor-pointer hover:opacity-80 transition-opacity border-none bg-transparent p-0"
            >
              <img
                src="/socials/tiktok.png"
                alt="TikTok"
                className="w-12 h-12"
              />
            </button>
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center px-6 pb-8">
          <button
            onClick={handleClose} // Use handleClose instead of onClose
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center mx-auto gap-1 transition-colors"
          >
            Skip for now
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
