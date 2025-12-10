import React, { useState, useEffect } from "react";
import {
  Link,
  Mail,
  MessageCircle,
  Linkedin,
  Camera,
  X,
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

  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      handleClose();
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

  const handleEmailShare = () => {
    const emailSubject = title || 'Check this out';
    const emailBody = message ? `${message}\n\n${url}` : url;
    const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(emailUrl, '_blank');
    handleClose();
  };

  const handleTwitterShare = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title || message
    )}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
    handleClose();
  };

  const handleLinkedInShare = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
    handleClose();
  };

  const handleMessengerShare = () => {
    const shareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
    handleClose();
  };

  const handleInstagramShare = () => {
    const shareText = title ? `${title}\n\n${url}` : (message ? `${message}\n\n${url}` : url);
    const instagramUrl = `https://www.instagram.com/create/details/?mediaType=PHOTO`;
    window.open(instagramUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    handleClose();
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
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-4 mb-4" />

        {/* Header */}
        <div className="mb-6 px-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Share</h2>
          <p className="text-sm text-gray-600">
            Share this with your friends and community
          </p>
        </div>

        {/* Share Options Grid */}
        <div className="px-6 pb-8">
          <div className="grid grid-cols-3 gap-6 gap-y-8">
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <Link className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {copied ? 'Copied!' : 'Copy Link'}
              </span>
            </button>

            {/* Twitter */}
            <button
              onClick={handleTwitterShare}
              className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-gray-900" />
              </div>
              <span className="text-sm font-medium text-gray-900">Twitter</span>
            </button>

            {/* Messenger */}
            <button
              onClick={handleMessengerShare}
              className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Messenger</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={handleLinkedInShare}
              className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                <Linkedin className="w-6 h-6 text-gray-900" />
              </div>
              <span className="text-sm font-medium text-gray-900">LinkedIn</span>
            </button>

            {/* Email */}
            <button
              onClick={handleEmailShare}
              className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Email</span>
            </button>

            {/* Instagram */}
            <button
              onClick={handleInstagramShare}
              className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-gray-900" />
              </div>
              <span className="text-sm font-medium text-gray-900">Instagram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
