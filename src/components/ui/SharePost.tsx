import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { X, Link, Mail, ChevronDown } from "lucide-react";
import {
  FacebookShareButton,
  // InstagramShareButton,
  FacebookIcon,
  // InstagramIcon,
  InstapaperIcon,
  InstapaperShareButton,
} from "react-share";

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-xl p-6 max-w-md w-[90%] md:w-[400px] shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">
            ✨ Bring friends to your CRWD!
          </h2>
          <p className="text-sm text-gray-600">
            CRWDs are more impactful with people you know. Invite friends to
            join and give alongside you.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="space-y-3 mb-6">
          <Button
            onClick={handleCopyLink}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            <Link className="w-4 h-4 mr-2" />
            {copied ? "Copied!" : "Copy Invite Link"}
          </Button>

          <Button
            variant="outline"
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
              className="flex-shrink-0"
            >
              <img
                src="/socials/facebook.png"
                alt="Facebook"
                className="w-12 h-12"
              />
            </FacebookShareButton>

            <img
              src="/socials/instagram.png"
              alt="Instagram"
              className="w-12 h-12"
            />

            <img src="/socials/tiktok.png" alt="TikTok" className="w-12 h-12" />
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
