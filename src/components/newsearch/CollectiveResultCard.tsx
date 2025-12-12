import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface CollectiveResultCardProps {
  collective: {
    id: number;
    name: string;
    description?: string;
    image?: string;
    avatar?: string;
    logo?: string; // Logo URL from API
    color?: string; // Color from API
    created_by?: {
      id?: number | string;
      first_name?: string;
      last_name?: string;
      username?: string;
      profile_picture?: string;
    };
    causes_count?: number;
    supported_causes_count?: number;
    nonprofit_count?: number;
  };
}

// Generate color for icon if not provided (same as NewSuggestedCollectives)
const getIconColor = (index: number): string => {
  const colors = [
    "#1600ff", // Blue
    "#10B981", // Green
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#8B5CF6", // Purple
    "#EF4444", // Red
  ];
  return colors[index % colors.length];
};

// Get first letter of name for icon
const getIconLetter = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

// Get initials from name
const getInitials = (name: string): string => {
  if (!name) return 'C';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

export default function CollectiveResultCard({ collective }: CollectiveResultCardProps) {
  const navigate = useNavigate();
  
  // Priority: 1. Use color (with white text), 2. Use logo (image), 3. Fallback to generated color with letter
  const hasColor = collective.color;
  const hasLogo = collective.logo && (collective.logo.startsWith("http") || collective.logo.startsWith("/") || collective.logo.startsWith("data:"));
  const imageUrl = collective.logo || collective.image || collective.avatar;
  const iconColor = hasColor || (!hasLogo ? getIconColor(collective.id % 6) : undefined);
  const iconLetter = getIconLetter(collective.name || 'C');

  // Get founder information
  const founder = collective.created_by;
  const founderName = founder
    ? `${founder.first_name || ''} ${founder.last_name || ''}`.trim() || founder.username || 'Unknown'
    : 'Unknown';
  const founderInitials = founder
    ? getInitials(`${founder.first_name || ''} ${founder.last_name || ''}`.trim() || founder.username || 'U')
    : 'U';

  // Get nonprofit count
  const nonprofitCount = collective.causes_count || collective.supported_causes_count || collective.nonprofit_count || 0;

  return (
    <Card
      onClick={() => navigate(`/groupcrwd/${collective.id}`)}
      className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 bg-white rounded-lg"
    >
      <CardContent className="px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-start gap-3 md:gap-4">
          {/* Icon with priority: color > logo > generated color with letter */}
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={iconColor ? { backgroundColor: iconColor } : {}}
          >
            {hasLogo && imageUrl ? (
              <img
                src={imageUrl}
                alt={collective.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-white font-bold text-lg md:text-xl">
                {iconLetter}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="font-bold text-sm md:text-base text-gray-900 mb-0.5 md:mb-1">
              {collective.name}
            </h3>

            {/* Description */}
            <p className="text-xs md:text-sm text-gray-600 mb-2.5 md:mb-3">
              {collective.description || 'No description available'}
            </p>

            {/* Founder Information */}
            {founder && (
              <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                <Avatar className="w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0">
                  <AvatarImage src={founder.profile_picture} alt={founderName} />
                  <AvatarFallback
                    style={{
                      backgroundColor: '#9CA3AF',
                    }}
                    className="text-white text-[10px] md:text-xs font-bold"
                  >
                    {founderInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs md:text-sm text-gray-600">
                  Founded by {founderName}
                </span>
              </div>
            )}

            {/* Supporting nonprofits count */}
            <p className="text-xs md:text-sm text-gray-600">
              Supporting {nonprofitCount} nonprofit{nonprofitCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


