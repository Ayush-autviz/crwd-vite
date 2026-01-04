import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Star, Share2, MoreHorizontal, Edit, Link2, Flag, DollarSign, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteCollective, unfavoriteCollective } from '@/services/api/social';
import { useAuthStore } from '@/stores/store';

interface CollectiveHeaderProps {
  title: string;
  collectiveId?: string;
  isFavorite?: boolean;
  isAdmin?: boolean;
  isJoined?: boolean;
  onShare?: () => void;
  onManageCollective?: () => void;
  onDonate?: () => void;
}

export default function CollectiveHeader({ 
  title, 
  collectiveId,
  isFavorite: initialIsFavorite = false,
  isAdmin = false,
  isJoined = false,
  onShare, 
  onManageCollective,
  onDonate
}: CollectiveHeaderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update favorite state when prop changes
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: (id: string) => favoriteCollective(id),
    onSuccess: () => {
      setIsFavorite(true);
      queryClient.invalidateQueries({ queryKey: ['crwd', collectiveId] });
    },
    onError: (error: any) => {
      console.error('Favorite error:', error);
    },
  });

  // Unfavorite mutation
  const unfavoriteMutation = useMutation({
    mutationFn: (id: string) => unfavoriteCollective(id),
    onSuccess: () => {
      setIsFavorite(false);
      queryClient.invalidateQueries({ queryKey: ['crwd', collectiveId] });
    },
    onError: (error: any) => {
      console.error('Unfavorite error:', error);
    },
  });

  const handleFavoriteClick = () => {
    if (!currentUser) {
      // If not logged in, navigate to login
      navigate('/onboarding');
      return;
    }

    if (!collectiveId) return;

    if (isFavorite) {
      unfavoriteMutation.mutate(collectiveId);
    } else {
      favoriteMutation.mutate(collectiveId);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setShowDropdown(false);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleManageCollective = () => {
    if (onManageCollective) {
      onManageCollective();
    } else if (collectiveId) {
      navigate(`/edit-collective/${collectiveId}`);
    }
    setShowDropdown(false);
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    }
    setShowDropdown(false);
  };

  const handleFavoriteFromDropdown = () => {
    handleFavoriteClick();
    setShowDropdown(false);
  };

  const handleCreateFundraiser = () => {
    if (collectiveId) {
      navigate(`/create-fundraiser/${collectiveId}`);
    }
    setShowDropdown(false);
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    console.log('Report clicked');
    setShowDropdown(false);
  };

  const handleDonate = () => {
    if (onDonate) {
      onDonate();
    }
    setShowDropdown(false);
  };

  const isLoading = favoriteMutation.isPending || unfavoriteMutation.isPending;

  return (
    <div className="sticky top-0 z-10 w-full flex items-center justify-between p-3 md:p-4 border-b bg-white">
      <button
        onClick={() => navigate('/')}
        className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
      </button>
      
      <h1 className="font-bold text-lg md:text-xl text-foreground flex-1 px-2 md:px-4">
        {title}
      </h1>

      <div className="flex items-center gap-1.5 md:gap-2 relative">
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading || !currentUser}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star 
            className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
              isFavorite 
                ? "text-yellow-500 fill-yellow-500" 
                : "text-gray-700"
            }`} 
          />
        </button>
        <button
          onClick={onShare}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 md:w-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {isAdmin && (
                <>
                  <button
                    onClick={handleManageCollective}
                    className="w-full font-semibold flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
                    Manage collective
                  </button>
                  <button
                    onClick={handleCreateFundraiser}
                    className="w-full font-semibold border-t border-gray-200 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground hover:bg-gray-100 transition-colors"
                  >
                    <Heart className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
                    Create Fundraiser
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                </>
              )}
              {isJoined && (
                <button
                  onClick={handleDonate}
                  className="w-full font-semibold flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground hover:bg-gray-100 transition-colors"
                >
                  <DollarSign className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
                  Donate
                </button>
              )}
              <button
                onClick={handleShareClick}
                className="w-full font-semibold flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground hover:bg-gray-100 transition-colors"
              >
                <Share2 className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
                Share
              </button>
             
              <button
                onClick={handleCopyLink}
                className="w-full font-semibold flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground hover:bg-gray-100 transition-colors"
              >
                <Link2 className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
                Copy link
              </button>
              
              <button
                onClick={handleFavoriteFromDropdown}
                disabled={isLoading || !currentUser}
                className="w-full font-semibold flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Star className={`w-3 h-3 md:w-4 md:h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} strokeWidth={2.5} />
                {isFavorite ? 'Remove favorite' : 'Add to favorites'}
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={handleReport}
                className="w-full font-semibold flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground hover:bg-gray-100 transition-colors"
              >
                <Flag className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
                Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

