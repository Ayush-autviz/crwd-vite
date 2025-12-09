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

// Avatar colors for collectives
const avatarColors = [
  '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
  '#F97316', '#84CC16', '#A855F7', '#14B8A6', '#F43F5E', '#6366F1', '#22C55E', '#EAB308',
];

const getConsistentColor = (id: number | string, colors: string[]) => {
  const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
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
  const firstLetter = collective.name?.charAt(0).toUpperCase() || 'C';
  const imageUrl = collective.image || collective.avatar;
  const avatarBgColor = getConsistentColor(collective.id, avatarColors);

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
      <CardContent className="px-4">
        <div className="flex items-start gap-4">
          {/* Circular avatar with dynamic color */}
          <Avatar className="w-12 h-12 rounded-full flex-shrink-0">
            <AvatarImage src={imageUrl} alt={collective.name} />
            <AvatarFallback
              style={{ backgroundColor: avatarBgColor }}
              className="text-white rounded-full font-bold text-base"
            >
              {firstLetter}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="font-bold text-base text-gray-900 mb-1">
              {collective.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-3">
              {collective.description || 'No description available'}
            </p>

            {/* Founder Information */}
            {founder && (
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-6 h-6 rounded-full flex-shrink-0">
                  <AvatarImage src={founder.profile_picture} alt={founderName} />
                  <AvatarFallback
                    style={{
                      backgroundColor: '#9CA3AF',
                    }}
                    className="text-white text-xs font-bold"
                  >
                    {founderInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">
                  Founded by {founderName}
                </span>
              </div>
            )}

            {/* Supporting nonprofits count */}
            <p className="text-sm text-gray-600">
              Supporting {nonprofitCount} nonprofit{nonprofitCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


