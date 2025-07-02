import { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { X } from 'lucide-react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
} from 'react-share';

interface SharePostProps {
  url: string;
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SharePost({ url, title, description = '', isOpen, onClose }: SharePostProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-[90%] md:w-[400px] shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Share this post</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground mb-6">
          Share this post with your network and help spread the word about this cause.
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FacebookShareButton 
            url={url} 
            hashtag="#CRWD"
            className="w-full"
          >
            <div className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white p-3 rounded-lg w-full transition-colors">
              <FacebookIcon size={24} round />
              <span className="font-medium">Facebook</span>
            </div>
          </FacebookShareButton>

          <TwitterShareButton 
            url={url} 
            title={title}
            className="w-full"
          >
            <div className="flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white p-3 rounded-lg w-full transition-colors">
              <TwitterIcon size={24} round />
              <span className="font-medium">Twitter</span>
            </div>
          </TwitterShareButton>

          <LinkedinShareButton 
            url={url} 
            title={title} 
            summary={description}
            className="w-full"
          >
            <div className="flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white p-3 rounded-lg w-full transition-colors">
              <LinkedinIcon size={24} round />
              <span className="font-medium">LinkedIn</span>
            </div>
          </LinkedinShareButton>

          <WhatsappShareButton 
            url={url} 
            title={title}
            className="w-full"
          >
            <div className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white p-3 rounded-lg w-full transition-colors">
              <WhatsappIcon size={24} round />
              <span className="font-medium">WhatsApp</span>
            </div>
          </WhatsappShareButton>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
            <input 
              type="text" 
              value={url} 
              readOnly 
              className="flex-1 bg-transparent border-none text-sm focus:outline-none"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(url);
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 