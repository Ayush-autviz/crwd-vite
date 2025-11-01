import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Link, Mail, ChevronDown } from "lucide-react";
import {
  FacebookShareButton,
} from "react-share";
import { MobileShareModal } from "./MobileShareModal";

interface SharePostProps {
  url: string;
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SharePost({
  url,
  title,
  description = "",
  isOpen,
  onClose,
}: SharePostProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen && !isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, isMobile]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

  const handleInstagramShare = () => {
    const shareText = title ? `${title}\n\n${url}` : url;
    // Open Instagram in a new window (popup) similar to Facebook
    // Instagram doesn't have a direct share API, so we open the create post page
    const instagramUrl = `https://www.instagram.com/create/details/?mediaType=PHOTO`;
    window.open(instagramUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
    
    // Also copy to clipboard for convenience
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTikTokShare = () => {
    const shareText = title ? `${title}\n\n${url}` : url;
    // Open TikTok in a new window (popup) similar to Facebook
    // TikTok doesn't have a direct share API, so we open the upload page
    const tiktokUrl = `https://www.tiktok.com/upload`;
    window.open(tiktokUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
    
    // Also copy to clipboard for convenience
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleEmailShare = () => {
    const emailSubject = title || 'Check this out';
    const emailBody = description ? `${description}\n\n${url}` : url;
    // Open email in a new tab
    const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(emailUrl, '_blank');
  };

  if (!isOpen) return null;

  // Render mobile bottom sheet for mobile devices
  if (isMobile) {
    return (
      <MobileShareModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        message={description}
        url={url}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 items-center justify-center z-50 hidden md:flex">
      <div
        ref={modalRef}
        className="bg-white rounded-xl p-6 max-w-md w-[90%] md:w-[400px] shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          {/* <p className="text-sm text-gray-600">
            CRWDs are more impactful with people you know. Invite friends to
            join and give alongside you.
          </p> */}
        </div>

        {/* Primary Actions */}
        <div className="space-y-3 mb-6">
          <Button
            onClick={handleCopyLink}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            <Link className="w-4 h-4 mr-2" />
            {copied ? "Copied!" : "Copy Link"}
          </Button>

          <Button
            variant="outline"
            onClick={handleEmailShare}
            className="w-full py-3 border-gray-300 text-gray-900 hover:bg-gray-50"
          >
            <Mail className="w-4 h-4 mr-2" />
            Invite by Email
          </Button>
        </div>

        {/* Social Sharing */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Share directly:
          </label>
          <div className="flex gap-3">
            <FacebookShareButton
              url={url}
              hashtag="#CRWD"
              className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src="/socials/facebook.png"
                alt="Facebook"
                className="w-12 h-12"
              />
            </FacebookShareButton>

            <button
              onClick={handleInstagramShare}
              className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity border-none bg-transparent p-0"
            >
              <img
                src="/socials/instagram.png"
                alt="Instagram"
                className="w-12 h-12"
              />
            </button>

            <button
              onClick={handleTikTokShare}
              className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity border-none bg-transparent p-0"
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
        <div className="text-center">
          <button
            onClick={onClose}
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
