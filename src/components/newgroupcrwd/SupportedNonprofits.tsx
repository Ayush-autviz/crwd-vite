import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { truncateAtFirstPeriod } from '@/lib/utils';

interface Nonprofit {
  id: number;
  name: string;
  mission?: string;
  image?: string;
  sort_name?: string;
  cause?: {
    id: number;
    name: string;
    mission?: string;
    image?: string;
    sort_name?: string
  };
}

interface SupportedNonprofitsProps {
  nonprofits: Nonprofit[];
  isLoading?: boolean;
  onSeeAllClick?: () => void;
}

// Generate color for icon (same as NewFeaturedNonprofits)
const getIconColor = (id: number | string): string => {
  const colors = [
    "#1600ff", // Blue
    "#10B981", // Green
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#8B5CF6", // Purple
    "#EF4444", // Red
  ];
  const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function SupportedNonprofits({
  nonprofits,
  isLoading = false,
  onSeeAllClick,
}: SupportedNonprofitsProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="px-3 md:px-4 py-4 md:py-6">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h2 className="text-base xs:text-lg md:text-xl font-bold">Supported Nonprofits</h2>
        </div>
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
    <div className="w-full px-3 md:px-4 mt-6 md:mt-8">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h2 className="text-base xs:text-lg md:text-xl font-bold">Supported Nonprofits</h2>
        {onSeeAllClick && (
          <Button
            variant="link"
            onClick={onSeeAllClick}
            className="text-[#1600ff] p-0 h-auto flex items-center text-sm xs:text-base md:text-lg"
          >
            See all
          </Button>
        )}
      </div>
      <div className="overflow-x-auto pb-2 -mx-3 md:-mx-4 px-3 md:px-4  ">
        <div className="flex gap-3 md:gap-4 w-max items-stretch">
          {nonprofits.map((nonprofit) => {
            const cause = nonprofit.cause || nonprofit;
            const name = cause.name || nonprofit.name || 'Unknown Nonprofit';
            const image = cause.image || nonprofit.image || '';
            const description = cause.mission || nonprofit.mission || '';
            const causeId = cause.id || nonprofit.id;
            const iconColor = getIconColor(causeId);
            const sort_name = cause?.sort_name || nonprofit?.sort_name || '';

            return (
              <div
                key={nonprofit.id}
                onClick={() => causeId && navigate(`/c/${sort_name}`)}
                className="block cursor-pointer"
              >
                <div className="flex items-start gap-2.5 md:gap-3 p-3 md:p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors bg-white min-w-[240px] md:min-w-[280px] max-w-[280px] md:max-w-[320px] h-full">
                  {/* Avatar - Rounded square */}
                  <Avatar className="h-10 w-10 xs:h-12 xs:w-12 md:h-14 md:w-14 rounded-lg flex-shrink-0 border border-gray-200">
                    <AvatarImage src={image} />
                    <AvatarFallback
                      style={{
                        backgroundColor: iconColor,
                      }}
                      className="font-semibold rounded-lg text-white text-xs xs:text-sm md:text-base"
                    >
                      {name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col h-full">
                    {/* Title */}
                    <h3 className="font-bold text-sm xs:text-base md:text-lg text-gray-900 mb-1 line-clamp-1">
                      {name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs xs:text-sm md:text-base text-gray-600 leading-relaxed line-clamp-3 ">
                      {truncateAtFirstPeriod(description)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

