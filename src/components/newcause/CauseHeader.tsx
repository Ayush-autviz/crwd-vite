import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Star, MoreHorizontal, Share2, Link2, Flag, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteCause, unfavoriteCause } from '@/services/api/social';
import { useAuthStore } from '@/stores/store';
import { toast } from 'sonner';

interface CauseHeaderProps {
  title: string;
  causeId?: string;
  isFavorite?: boolean;
  onShare?: () => void;
  onOneTimeDonation?: () => void;
}

export default function CauseHeader({
  title,
  causeId,
  isFavorite: initialIsFavorite = false,
  onShare,
  onOneTimeDonation,
}: CauseHeaderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const favoriteMutation = useMutation({
    mutationFn: (id: string) => favoriteCause(id),
    onSuccess: () => {
      setIsFavorite(true);
      queryClient.invalidateQueries({ queryKey: ['cause', causeId] });
      toast.success('Added to favorites!');
    },
    onError: (error: any) => {
      console.error('Favorite error:', error);
      if (error.response?.status === 403) {
        navigate('/onboarding');
      }
      toast.error('Failed to add to favorites.');
    },
  });

  const unfavoriteMutation = useMutation({
    mutationFn: (id: string) => unfavoriteCause(id),
    onSuccess: () => {
      setIsFavorite(false);
      queryClient.invalidateQueries({ queryKey: ['cause', causeId] });
      toast.success('Removed from favorites!');
    },
    onError: (error: any) => {
      console.error('Unfavorite error:', error);
      if (error.response?.status === 403) {
        navigate('/onboarding');
      }
      toast.error('Failed to remove from favorites.');
    },
  });

  const handleFavoriteClick = () => {
    if (!currentUser?.id) {
      navigate('/onboarding');
      return;
    }
    if (causeId) {
      if (isFavorite) {
        unfavoriteMutation.mutate(causeId);
      } else {
        favoriteMutation.mutate(causeId);
      }
    }
  };

  const handleFavoriteFromDropdown = () => {
    setShowDropdown(false);
    handleFavoriteClick();
  };

  const handleShareClick = () => {
    setShowDropdown(false);
    onShare?.();
  };

  const handleCopyLink = async () => {
    setShowDropdown(false);
    if (causeId) {
      const url = `${window.location.origin}/cause/${causeId}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
        toast.error('Failed to copy link.');
      }
    }
  };

  const handleReport = () => {
    setShowDropdown(false);
    toast.info('Report functionality coming soon!');
  };

  const isLoading = favoriteMutation.isPending || unfavoriteMutation.isPending;

  return (
    <div className="sticky top-0 z-10 w-full flex items-center justify-between p-3 md:p-4 border-b bg-white">
      <div className="flex items-center  min-w-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>

        <h1 className="font-bold text-sm sm:text-base md:text-lg text-foreground flex-1 text-center truncate px-2">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
        <button
          onClick={handleFavoriteClick}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Favorite"
          disabled={isLoading}
        >
          <Star className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}`} />
        </button>
        <div className="relative">
          <button
            ref={moreButtonRef}
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>

          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-40 md:w-48 bg-white rounded-lg shadow-lg z-20 py-1 border border-gray-200"
            >
              <button
                onClick={handleShareClick}
                className="w-full font-semibold flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground hover:bg-gray-100 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={2.5} />
                Share
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full font-semibold flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground hover:bg-gray-100 transition-colors"
              >
                <Link2 className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={2.5} />
                Copy link
              </button>
              <button
                onClick={handleFavoriteFromDropdown}
                disabled={isLoading || !currentUser}
                className="w-full font-semibold flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Star className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} strokeWidth={2.5} />
                {isFavorite ? 'Remove favorite' : 'Add to favorites'}
              </button>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onOneTimeDonation?.();
                }}
                disabled={!onOneTimeDonation}
                className="w-full font-semibold flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={2.5} />
                One Time Donation
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={handleReport}
                className="w-full font-semibold flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground hover:bg-gray-100 transition-colors"
              >
                <Flag className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={2.5} />
                Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

