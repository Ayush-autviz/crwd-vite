import { useState, useRef, useEffect } from "react";
import { Link, Mail, MessageCircle, Linkedin, Camera, X } from "lucide-react";
import {
  TwitterShareButton,
  LinkedinShareButton,
  FacebookMessengerShareButton,
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

  const handleLinkedInShare = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=700');
  };

  const handleMessengerShare = () => {
    // Messenger share via Facebook Messenger
    const shareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=YOUR_APP_ID`;
    window.open(shareUrl, '_blank', 'width=600,height=700');
  };

  if (!isOpen) return null;

  // Render mobile bottom sheet for mobile devices
  // if (isMobile) {
  return (
    <MobileShareModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={description}
      url={url}
    />
  );
  // }

  const shareOptions = [
    {
      id: 'copy',
      label: 'Copy Link',
      icon: Link,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      onClick: handleCopyLink,
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: X,
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-900',
      onClick: () => { },
      shareButton: true,
    },
    {
      id: 'messenger',
      label: 'Messenger',
      icon: MessageCircle,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      onClick: handleMessengerShare,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-900',
      onClick: handleLinkedInShare,
      shareButton: true,
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      onClick: handleEmailShare,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: Camera,
      bgColor: 'bg-pink-100',
      iconColor: 'text-gray-900',
      onClick: handleInstagramShare,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 items-center justify-center z-50 hidden md:flex">
      <div
        ref={modalRef}
        className="bg-white rounded-xl p-6 max-w-md w-[90%] md:w-[450px] shadow-2xl"
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Share</h2>
          <p className="text-sm text-gray-600">
            Share this with your friends and community
          </p>
        </div>

        {/* Share Options Grid */}
        <div className="grid grid-cols-3 gap-6 gap-y-8">
          {shareOptions.map((option) => {
            const IconComponent = option.icon;

            if (option.id === 'twitter' && option.shareButton) {
              return (
                <TwitterShareButton
                  key={option.id}
                  url={url}
                  title={title}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className={`w-14 h-14 ${option.bgColor} rounded-full flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${option.iconColor}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{option.label}</span>
                </TwitterShareButton>
              );
            }

            if (option.id === 'linkedin' && option.shareButton) {
              return (
                <LinkedinShareButton
                  key={option.id}
                  url={url}
                  title={title}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className={`w-14 h-14 ${option.bgColor} rounded-full flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${option.iconColor}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{option.label}</span>
                </LinkedinShareButton>
              );
            }

            return (
              <button
                key={option.id}
                onClick={option.onClick}
                className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className={`w-14 h-14 ${option.bgColor} rounded-full flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${option.iconColor}`} />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {option.id === 'copy' && copied ? 'Copied!' : option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
