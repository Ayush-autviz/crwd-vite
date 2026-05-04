import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  X,
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle2,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoFullscreenProps {
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

const VideoFullscreen: React.FC<VideoFullscreenProps> = ({
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [seekFeedback, setSeekFeedback] = useState<{ type: 'forward' | 'backward', visible: boolean }>({ type: 'forward', visible: false });

  const progressBarRef = useRef<HTMLDivElement>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && duration === 0) {
      const interval = setInterval(() => {
        if (videoRef.current?.duration) {
          setDuration(videoRef.current.duration);
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isOpen, duration]);

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      onClose();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
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

  const handleSeek = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration,
        Math.max(0, videoRef.current.currentTime + amount)
      );
    }
  };

  const triggerSeekFeedback = (type: 'forward' | 'backward') => {
    setSeekFeedback({ type, visible: true });
    setTimeout(() => setSeekFeedback(prev => ({ ...prev, visible: false })), 500);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      clickTimerRef.current = setTimeout(() => {
        togglePlay();
        clickCountRef.current = 0;
      }, 250);
    } else if (clickCountRef.current === 2) {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isRightSide = x > rect.width / 2;

      handleSeek(isRightSide ? 5 : -5);
      triggerSeekFeedback(isRightSide ? 'forward' : 'backward');
      clickCountRef.current = 0;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      if (total) {
        setProgress((current / total) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatRemainingTime = (current: number, total: number) => {
    const videoTotal = total || videoRef.current?.duration || 0;
    if (!videoTotal || isNaN(videoTotal)) return "-0:00";
    const remaining = Math.max(0, videoTotal - current);
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return `-${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressSeek = (clientX: number) => {
    if (videoRef.current && videoRef.current.duration && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const progressValue = Math.max(0, Math.min(1, x / rect.width));

      // Update state immediately for zero-lag UI
      setProgress(progressValue * 100);
      setCurrentTime(progressValue * videoRef.current.duration);

      // Update video element
      videoRef.current.currentTime = progressValue * videoRef.current.duration;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleProgressSeek(e.clientX);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      handleProgressSeek(clientX);
    };

    const handleUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  useEffect(() => {
    let animationFrameId: number;

    const updateProgress = () => {
      if (videoRef.current && isPlaying && !isDragging) {
        const current = videoRef.current.currentTime;
        const total = videoRef.current.duration;
        setCurrentTime(current);
        if (total) {
          setProgress((current / total) * 100);
        }
      }
      animationFrameId = requestAnimationFrame(updateProgress);
    };

    if (isPlaying && !isDragging) {
      animationFrameId = requestAnimationFrame(updateProgress);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, isDragging]);

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?.username) {
      onClose();
      navigate(`/u/${user.username}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black flex items-center justify-center animate-in fade-in duration-500"
      onClick={(e) => e.stopPropagation()}
      style={{ fontFamily: 'Outfit, sans-serif' }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 text-white/70 p-2 hover:bg-white/10 hover:text-white rounded-full transition-all z-[1100]"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Loader2 className="w-10 h-10 text-white/50 animate-spin" />
          </div>
        )}

        <video
          ref={videoRef}
          src={src}
          className="w-full max-h-full object-contain z-10 cursor-pointer"
          onClick={handleVideoClick}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onDurationChange={handleLoadedMetadata}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => {
            setIsLoading(false);
            setIsPlaying(true);
          }}
          onEnded={() => setIsPlaying(false)}
          muted={isMuted}
          autoPlay
          playsInline
          loop
        />

        {/* Seek Feedback Overlays */}
        {seekFeedback.visible && (
          <div className={cn(
            "absolute inset-0 z-40 flex items-center justify-center pointer-events-none transition-opacity duration-300",
            seekFeedback.visible ? "opacity-100" : "opacity-0"
          )}>
            <div className={cn(
              "flex flex-col items-center gap-2 px-8 py-6",
              seekFeedback.type === 'backward' ? "mr-auto ml-[15%]" : "ml-auto mr-[15%]"
            )}>
              {seekFeedback.type === 'forward' ? (
                <SkipForward className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white" />
              ) : (
                <SkipBack className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white" />
              )}
              <span className="text-white font-bold text-lg">5s</span>
            </div>
          </div>
        )}

        {/* Play/Pause Overlay - Only visible when NOT playing */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20">
              <Play className="w-10 h-10 text-white fill-white ml-1.5" />
            </div>
          </div>
        )}

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
            className="flex flex-col items-center gap-1 group cursor-pointer mb-4"
          >
            <div className="text-white">
              <Share2 className="w-6 h-6" />
            </div>
            {/* <span className="text-white text-xs font-semibold drop-shadow-md">{shares}</span> */}
          </button>

          {/* <button
            onClick={toggleMute}
            className=" text-white cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button> */}
        </div>

        {/* Bottom Metadata Overlay */}
        <div className="absolute bottom-[72px] left-0 right-0 px-4 py-6 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-40">
          <div className="flex flex-col gap-4 max-w-[85%] pointer-events-auto">
            <div className="flex items-center gap-3 cursor-pointer group/user" onClick={handleUserClick}>
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

        {/* Footer with Controls and Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          {/* Interactive Progress Bar with Scrubbing */}
          <div
            ref={progressBarRef}
            className="relative w-full h-1.5 mb-6 cursor-pointer group/progress flex items-center pointer-events-auto"
            onMouseDown={(e) => { e.stopPropagation(); setIsDragging(true); handleProgressSeek(e.clientX); }}
            onTouchStart={(e) => { e.stopPropagation(); setIsDragging(true); handleProgressSeek(e.touches[0].clientX); }}
          >
            <div className="w-full h-1 bg-white/20 rounded-full overflow-visible">
              <div
                className="relative h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                style={{ width: `${progress}%` }}
              >
                {/* Scrubber Thumb */}
                <div className={cn(
                  "absolute right-[-6px] top-1/2 translate-y-[-50%] w-3.5 h-3.5 bg-white rounded-full shadow-lg transition-transform",
                  (isDragging || progress > 0) ? "scale-100" : "scale-0",
                  "group-hover/progress:scale-125",
                  isDragging && "scale-150"
                )} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-6">
              <button
                onClick={togglePlay}
                className="text-white hover:scale-110 transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>

              <span className="text-white/90 font-medium text-sm tabular-nums tracking-tight">
                {formatRemainingTime(currentTime, duration)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleMute}
                className="text-white hover:scale-110 transition-transform active:scale-95"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoFullscreen;
