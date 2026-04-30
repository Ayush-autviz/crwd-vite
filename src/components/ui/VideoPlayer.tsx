import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  Loader2,
  Maximize
} from 'lucide-react';
import { cn } from '@/lib/utils';
import VideoFullscreen from './VideoFullscreen';

interface VideoPlayerProps {
  src: string;
  className?: string;
  poster?: string;
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

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  className,
  poster,
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => { });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLoadedMetadata = () => {
    setIsLoading(false);
    setHasLoaded(true);
  };

  const handleFullscreenOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
    if (videoRef.current) videoRef.current.pause();
    setIsPlaying(false);
  };

  const handleFullscreenClose = () => {
    setIsModalOpen(false);
    setIsPlaying(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className={cn(
        "relative group rounded-xl overflow-hidden transition-all duration-300 flex items-center justify-center w-fit bg-black/5",
        !hasLoaded && "aspect-video min-h-[200px]",
        className
      )}
      onMouseMove={handleMouseMove}
      onClick={disableFullscreen ? undefined : handleFullscreenOpen}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-20">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className={`block w-auto max-h-[300px] ${disableFullscreen ? 'cursor-default' : 'cursor-pointer'} z-10 object-contain rounded-lg`}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true); // Fixes play icon bug when video starts automatically
        }}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        muted={isMuted}
        loop
        autoPlay
        playsInline
      />

      {/* Minimal Overlay Controls */}
      {!isLoading && hasLoaded && (
        <div className="absolute bottom-1.5 left-3 right-3 flex items-center justify-between z-20">
          <div className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg text-white text-[10px] font-medium tabular-nums border border-white/10" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {formatTime(currentTime)}
          </div>
          <button
            onClick={toggleMute}
            className="bg-black/40 backdrop-blur-md p-1.5 rounded-full text-white hover:bg-black/60 transition-all active:scale-90 border border-white/10"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* Fullscreen Modal Component */}
      {!disableFullscreen && (
        <VideoFullscreen
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
      )}
    </div>
  );
};

export default VideoPlayer;
