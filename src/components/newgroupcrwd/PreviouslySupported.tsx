import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Nonprofit {
  id: number;
  name: string;
  mission?: string;
  image?: string;
  removed_at?: string;
  last_supported?: string;
  cause?: {
    id: number;
    name: string;
    mission?: string;
    image?: string;
  };
}

interface PreviouslySupportedProps {
  nonprofits: Nonprofit[];
  isLoading?: boolean;
}

// Helper function to calculate months ago from a date
const getMonthsAgo = (dateString?: string): string => {
  if (!dateString) {
    return '2 months ago'; // Default fallback
  }

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));

    if (diffInMonths < 1) {
      return 'Less than a month ago';
    } else if (diffInMonths === 1) {
      return '1 month ago';
    } else {
      return `${diffInMonths} months ago`;
    }
  } catch (error) {
    return '2 months ago'; // Fallback on error
  }
};

export default function PreviouslySupported({
  nonprofits,
  isLoading = false,
}: PreviouslySupportedProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="px-3 md:px-4 py-4 md:py-6">
        <h3 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 md:mb-4">
          PREVIOUSLY SUPPORTED
        </h3>
        <div className="flex items-center justify-center py-6 md:py-8">
          <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!nonprofits || nonprofits.length === 0) {
    return null;
  }

  // Generate vibrant avatar colors based on nonprofit ID for consistent colors
  const avatarColors = [
    '#EF4444', // Red
    '#10B981', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#84CC16', // Lime Green
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#A855F7', // Violet
    '#14B8A6', // Teal
    '#F43F5E', // Rose
    '#6366F1', // Indigo
    '#22C55E', // Emerald
    '#EAB308', // Yellow
  ];

  return (
    <div className="px-3 md:px-4 py-4 md:py-6">
      <h3 className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3 md:mb-4">
        PREVIOUSLY SUPPORTED
      </h3>
      <div className="space-y-2 md:space-y-3">
        {nonprofits.map((nonprofit) => {
          const cause = nonprofit.cause || nonprofit;
          const name = cause.name || nonprofit.name || 'Unknown Nonprofit';
          const image = cause.image || nonprofit.image || '';
          const causeId = cause.id || nonprofit.id;
          const nonprofitId = cause.id || nonprofit.id || name;
          const avatarColorIndex = nonprofitId ? (Number(nonprofitId) % avatarColors.length) : (name?.charCodeAt(0) || 0) % avatarColors.length;
          const avatarBgColor = avatarColors[avatarColorIndex];
          const lastSupported = getMonthsAgo(nonprofit.removed_at || nonprofit.last_supported);

          return (
            <div
              key={nonprofit.id}
              className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:shadow-md transition-shadow"
            >
              {/* Avatar/Image */}
              {image ? (
                <Avatar className="w-12 h-12 xs:w-14 xs:h-14 md:w-16 md:h-16 rounded-lg flex-shrink-0">
                  <AvatarImage src={image} alt={name} />
                  <AvatarFallback
                    style={{ backgroundColor: avatarBgColor }}
                    className="text-white rounded-lg font-semibold text-base xs:text-lg md:text-xl"
                  >
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div
                  className="w-12 h-12 xs:w-14 xs:h-14 md:w-16 md:h-16 rounded-lg flex-center justify-center flex-shrink-0 flex items-center"
                  style={{ backgroundColor: avatarBgColor }}
                >
                  <span className="text-lg xs:text-xl md:text-2xl font-semibold text-white">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Name and Last Supported */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm xs:text-base md:text-lg text-gray-900 mb-0.5 md:mb-1">
                  {name}
                </h4>
                {/* <p className="text-xs md:text-sm text-gray-500">
                  Last supported {lastSupported}
                </p> */}
              </div>

              {/* View Button */}
              <Button
                onClick={() => causeId && navigate(`/cause/${causeId}`)}
                variant="outline"
                className="flex-shrink-0 text-xs xs:text-sm md:text-base px-3 md:px-4 py-1.5 md:py-2 border-gray-300 hover:bg-gray-50"
              >
                View
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

