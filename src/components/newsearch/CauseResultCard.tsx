import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { truncateAtFirstPeriod } from '@/lib/utils';

interface CauseResultCardProps {
  cause: {
    id: number;
    name: string;
    city?: string;
    state?: string;
    mission?: string;
    description?: string;
    image?: string | null;
    sort_name?: string;
  };
}

// Get consistent color for avatar
const avatarColors = [
  '#F97316', // Orange
  '#EC4899', // Pink
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#A855F7', // Violet
];

const getConsistentColor = (id: number | string, colors: string[]) => {
  const hash = typeof id === 'number' ? id : id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};


export default function CauseResultCard({ cause }: CauseResultCardProps) {
  const navigate = useNavigate();
  const avatarBgColor = getConsistentColor(cause.id, avatarColors);
  const initials = cause.name
    ?.split(' ')
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'N';

  const location = [cause.city, cause.state].filter(Boolean).join(', ');
  const description = cause.mission || cause.description || 'No description available';
  const truncatedDescription = truncateAtFirstPeriod(description);

  return (
    <Card
      onClick={() => navigate(`/c/${cause.sort_name}`)}
      className="cursor-pointer hover:shadow-md py-0 transition-shadow border border-gray-200"
    >
      <CardContent className="p-3 md:p-6">
        <div className="flex items-start gap-2.5 md:gap-4">
          <Avatar className="w-8 h-8 md:w-12 md:h-12 rounded-lg flex-shrink-0">
            <AvatarImage src={cause.image || undefined} alt={cause.name} />
            <AvatarFallback
              style={{ backgroundColor: avatarBgColor }}
              className="text-white rounded-lg font-bold text-xs md:text-base"
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm xs:text-base md:text-lg text-foreground mb-0.5 md:mb-1">
              {cause.name}
            </h3>
            {location && (
              <p className="text-xs xs:text-sm md:text-base text-gray-600 mb-1 md:mb-2">{location}</p>
            )}
            <p className="text-xs xs:text-sm md:text-base text-gray-700">
              {truncatedDescription}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

