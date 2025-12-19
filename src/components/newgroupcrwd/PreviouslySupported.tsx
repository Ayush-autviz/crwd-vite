import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

interface Nonprofit {
  id: number;
  name: string;
  mission?: string;
  image?: string;
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

export default function PreviouslySupported({
  nonprofits,
  isLoading = false,
}: PreviouslySupportedProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="px-3 md:px-4 py-4 md:py-6">
        <h3 className="font-bold text-base md:text-lg lg:text-xl text-foreground mb-3 md:mb-4">
          Previously Supported
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

  return (
    <div className="px-3 md:px-4 py-4 md:py-6">
      <h3 className="font-bold text-base md:text-lg lg:text-xl text-foreground mb-3 md:mb-4">
        Previously Supported
      </h3>
      <div className="flex overflow-x-auto pb-2 md:pb-3 gap-2 md:gap-3 scrollbar-hide -mx-3 md:-mx-4 px-3 md:px-4">
        {nonprofits.map((nonprofit, index) => {
          const cause = nonprofit.cause || nonprofit;
          const name = cause.name || nonprofit.name || 'Unknown Nonprofit';
          const image = cause.image || nonprofit.image || '';

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
          const nonprofitId = cause.id || nonprofit.id || name;
          const avatarColorIndex = nonprofitId ? (Number(nonprofitId) % avatarColors.length) : (name?.charCodeAt(0) || 0) % avatarColors.length;
          const avatarBgColor = avatarColors[avatarColorIndex];

          const causeId = cause.id || nonprofit.id;

          return (
            <div
              key={nonprofit.id}
              onClick={() => causeId && navigate(`/cause/${causeId}`)}
              className="flex-shrink-0 w-[120px] sm:w-[140px] md:w-[160px] cursor-pointer"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-1.5 sm:p-2 md:p-3 flex flex-col items-center justify-between h-[90px] sm:h-[100px] md:h-[120px] hover:shadow-md transition-shadow opacity-75">
                {image ? (
                  <Avatar className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg mb-1.5 md:mb-2 flex-shrink-0">
                    <AvatarImage src={image} alt={name} />
                    <AvatarFallback 
                      style={{ backgroundColor: avatarBgColor }}
                      className="text-white rounded-lg font-semibold text-[10px] sm:text-xs md:text-sm"
                    >
                      {name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg mb-1.5 md:mb-2 flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: avatarBgColor }}
                  >
                    <span className="text-base sm:text-lg md:text-xl font-semibold text-white">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <p className="text-[10px] sm:text-xs font-semibold text-gray-900 text-center line-clamp-2 flex-grow flex items-center justify-center">
                  {name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

