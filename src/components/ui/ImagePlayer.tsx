import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import ImageFullscreen from './ImageFullscreen';

interface ImagePlayerProps {
  src: string;
  className?: string;
  alt?: string;
  // Metadata for Fullscreen view
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
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
  disableFullscreen?: boolean;
}

const ImagePlayer: React.FC<ImagePlayerProps> = ({
  src,
  className,
  alt,
  user,
  caption,
  likes = 0,
  comments = 0,
  shares = 0,
  onLike,
  onComment,
  onShare,
  isLiked = false,
  disableFullscreen = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFullscreenOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disableFullscreen) return;
    setIsModalOpen(true);
  };

  const handleFullscreenClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      className={cn(
        "relative group transition-all duration-300 cursor-pointer",
        className
      )}
      onClick={handleFullscreenOpen}
    >
      <img
        src={src}
        alt={alt || caption || "Post image"}
        className="max-h-[300px] w-auto h-auto object-contain rounded-lg"
      />

      {/* Fullscreen Modal Component */}
      <ImageFullscreen
        src={src}
        isOpen={isModalOpen}
        onClose={handleFullscreenClose}
        user={user}
        caption={caption}
        likes={likes}
        comments={comments}
        shares={shares}
        isLiked={isLiked}
        onLike={onLike}
        onComment={onComment}
        onShare={onShare}
      />
    </div>
  );
};

export default ImagePlayer;
