import React from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageFullscreenProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name: string;
    username?: string;
    avatar: string;
    isVerified?: boolean;
  };
  caption?: string;
  likes?: number | string;
  comments?: number | string;
  shares?: number | string;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

const ImageFullscreen: React.FC<ImageFullscreenProps> = ({
  src,
  isOpen,
  onClose,
  user,
  caption,
  likes = 0,
  comments = 0,
  shares = 0,
  isLiked = false,
  onLike,
  onComment,
  onShare,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      onClose();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black flex items-center justify-center animate-in fade-in duration-500 cursor-default"
      onClick={(e) => e.stopPropagation()}
      style={{ fontFamily: 'Outfit, sans-serif' }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute cursor-pointer top-6 left-6 text-white/70 p-2 hover:bg-white/10 hover:text-white rounded-full transition-all z-[1100]"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <img
          src={src}
          className="w-full max-h-full object-contain z-10"
          alt={caption || 'Full screen image'}
        />

        {/* Right Side Interaction Bar */}
        <div className="absolute bottom-24 right-4 flex flex-col items-center gap-6 z-50">
          <button
            onClick={(e) => { e.stopPropagation(); onLike?.(); }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className={cn(
              isLiked ? " text-red-500" : "text-white"
            )}>
              <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
            </div>
            <span className="text-white text-xs font-semibold drop-shadow-md">{likes}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onComment?.(); }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="text-white">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-white text-xs font-semibold drop-shadow-md">{comments}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onShare?.(); }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="text-white">
              <Share2 className="w-6 h-6" />
            </div>
          </button>
        </div>

        {/* Bottom Metadata Overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-6 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-40">
          <div className="flex flex-col gap-4 max-w-[85%] pointer-events-auto">
            <div className="flex items-center gap-3 cursor-pointer group/user">
              <div className="w-11 h-11 rounded-full border-2 border-white p-0.5 overflow-hidden bg-white/20 transition-transform group-hover/user:scale-105">
                {user?.avatar && <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt={user.name} />}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-lg drop-shadow-md tracking-tight group-hover/user:underline">{user?.name || 'User'}</span>
                  {user?.isVerified && <CheckCircle2 className="w-4 h-4 text-white fill-white opacity-90" />}
                </div>
              </div>
            </div>
            {caption && (
              <div className="flex flex-col gap-1">
                <p className="text-white text-base md:text-lg transition-all duration-300 whitespace-pre-wrap leading-relaxed">
                  {(() => {
                    const words = caption.trim().split(/\s+/);
                    const isOverLimit = words.length > 30;

                    if (isExpanded || !isOverLimit) {
                      return (
                        <>
                          {caption}
                          {isExpanded && isOverLimit && (
                            <span
                              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                              className="text-white/70 hover:text-white font-bold text-sm ml-2 cursor-pointer select-none"
                            >
                              Read Less
                            </span>
                          )}
                        </>
                      );
                    }

                    return (
                      <>
                        {words.slice(0, 30).join(' ')}
                        <span
                          onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                          className="text-white/70 hover:text-white font-bold text-sm ml-1 cursor-pointer select-none"
                        >
                          ... Read More
                        </span>
                      </>
                    );
                  })()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageFullscreen;
