import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Share2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteCollective, unfavoriteCollective } from '@/services/api/social';
import { useAuthStore } from '@/stores/store';

interface CollectiveHeaderProps {
  title: string;
  collectiveId?: string;
  isFavorite?: boolean;
  onShare?: () => void;
  onMore?: () => void;
}

export default function CollectiveHeader({ 
  title, 
  collectiveId,
  isFavorite: initialIsFavorite = false,
  onShare, 
  onMore 
}: CollectiveHeaderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  // Update favorite state when prop changes
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

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

  const isLoading = favoriteMutation.isPending || unfavoriteMutation.isPending;

  return (
    <div className="sticky top-0 z-10 w-full flex items-center justify-between p-4 border-b bg-white">
      <button
        onClick={() => navigate(-1)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700" />
      </button>
      
      <h1 className="font-bold text-xl text-foreground flex-1 px-4">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading || !currentUser}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star 
            className={`w-5 h-5 transition-colors ${
              isFavorite 
                ? "text-yellow-500 fill-yellow-500" 
                : "text-gray-700"
            }`} 
          />
        </button>
        <button
          onClick={onShare}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Share"
        >
          <Share2 className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={onMore}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}

