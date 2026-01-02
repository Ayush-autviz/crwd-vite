import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface CollectiveProfileProps {
  name: string;
  image?: string;
  logo?: string | null;
  color?: string | null;
  founder?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    profile_picture?: string;
    color?: string;
  };
  description?: string;
  isJoined?: boolean;
}

export default function CollectiveProfile({
  name,
  image,
  logo,
  color,
  founder,
  description,
  isJoined = false,
}: CollectiveProfileProps) {
  const navigate = useNavigate();

  const founderName = founder
    ? `${founder.first_name || ''} ${founder.last_name || ''}`.trim() || founder.username
    : 'Unknown';

  const handleFounderClick = () => {
    if (founder?.id) {
      navigate(`/user-profile/${founder.id}`);
    }
  };

  // Generate color for icon if not provided (same logic as NewSuggestedCollectives)
  const getIconColor = (name: string): string => {
    const colors = [
      "#1600ff", // Blue
      "#10B981", // Green
      "#EC4899", // Pink
      "#F59E0B", // Amber
      "#8B5CF6", // Purple
      "#EF4444", // Red
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Get first letter of name for icon
  const getIconLetter = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  // Priority: 1. If color is available, show color with letter, 2. If no color, show image, 3. Fallback to generated color with letter
  const hasColor = color;
  const hasLogo = logo && (logo.startsWith("http") || logo.startsWith("/") || logo.startsWith("data:"));
  const iconColor = hasColor ? color : (!hasLogo ? getIconColor(name) : undefined);
  const iconLetter = getIconLetter(name);
  // Fallback to image prop if logo is not available (for backward compatibility)
  const imageUrl = !hasColor && hasLogo ? logo : (!hasColor ? (image || undefined) : undefined);
  const showImage = !hasColor && hasLogo;

  return (
    <div className="px-3 md:px-4 py-4 md:py-6">
      <div className="flex items-start gap-3 md:gap-4 mb-2.5 md:mb-3">
        <Avatar className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl flex-shrink-0">
          {showImage ? (
            <AvatarImage src={imageUrl} alt={name} />
          ) : null}
          <AvatarFallback 
            style={iconColor ? { backgroundColor: iconColor } : {}}
            className="rounded-xl text-white font-bold text-2xl md:text-3xl"
          >
            {iconLetter}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap mb-1 md:mb-1.5">
            <h2 className="font-[800] text-xl md:text-2xl lg:text-3xl text-foreground">
              {name}
            </h2>
            {isJoined && (
              <span className="bg-green-100 text-green-700 text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-0.5 md:py-1 rounded-full">
                Joined
              </span>
            )}
          </div>
          {founder && (
            <div className="flex items-center gap-1.5 md:gap-2">
              <Avatar className="w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0">
                <AvatarImage src={founder?.profile_picture || undefined} alt={founderName || 'Founder'} />
                <AvatarFallback 
                  style={{ 
                    backgroundColor: founder.color || (() => {
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
                      const founderId = founder.id || founderName || 'Founder';
                      const colorIndex = founderId ? (String(founderId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length) : 0;
                      return avatarColors[colorIndex];
                    })()
                  }}
                  className="text-white font-semibold text-xs md:text-sm"
                >
                  {(founderName || 'F').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground text-xs md:text-sm lg:text-base">
                Founded by{' '}
                <button
                  onClick={handleFounderClick}
                  className="text-[#1600ff] hover:underline font-medium"
                >
                  {founderName}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
      {description && (
        <p className="text-foreground text-xs md:text-sm lg:text-base leading-relaxed mt-4 md:mt-5">
          {description}
        </p>
      )}
    </div>
  );
}

