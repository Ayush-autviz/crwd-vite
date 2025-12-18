import { useNavigate, Link } from 'react-router-dom';
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

// Get consistent color for avatar
const avatarColors = [
  '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
  '#F97316', '#84CC16', '#A855F7', '#14B8A6', '#F43F5E', '#6366F1', '#22C55E', '#EAB308',
];

const getConsistentColor = (id: number | string, colors: string[]) => {
  const hash =
    typeof id === 'number'
      ? id
      : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function CollectiveResultCard({ collective }: CollectiveResultCardProps) {
  const navigate = useNavigate();
  
  // Priority: 1. If color is available, show color with letter, 2. If no color, show image, 3. Fallback to generated color with letter
  const hasColor = collective.color;
  const hasLogo = collective.logo && (collective.logo.startsWith("http") || collective.logo.startsWith("/") || collective.logo.startsWith("data:"));
  const imageUrl = collective.logo || collective.image || collective.avatar;
  const iconColor = hasColor ? collective.color : (!hasLogo ? getIconColor(collective.id % 6) : undefined);
  const iconLetter = getIconLetter(collective.name || 'C');
  const showImage = !hasColor && hasLogo;

  // Get founder information
  const founder = collective.created_by;
  const founderName = founder
    ? `${founder.first_name || ''} ${founder.last_name || ''}`.trim() || founder.username || 'Unknown'
    : 'Unknown';
  // Get founder initials from first name and last name
  const founderInitials = founder
    ? (founder.first_name && founder.last_name
        ? `${founder.first_name.charAt(0)}${founder.last_name.charAt(0)}`.toUpperCase()
        : founder.first_name
        ? founder.first_name.charAt(0).toUpperCase()
        : getInitials(founderName))
    : 'U';
  
  const founderAvatarBgColor = founder ? getConsistentColor(founder.id || founderName, avatarColors) : '#9CA3AF';

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
            {showImage && imageUrl ? (
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
                      backgroundColor: founderAvatarBgColor,
                    }}
                    className="text-white text-[10px] md:text-xs font-bold"
                  >
                    {founderInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs md:text-sm text-gray-600">
                  Founded by{' '}
                  {founder.id ? (
                    <Link
                      to={`/user-profile/${founder.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      {founderName}
                    </Link>
                  ) : (
                    founderName
                  )}
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


