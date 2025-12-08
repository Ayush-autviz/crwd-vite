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
  };
}

// Get consistent color for avatar
const avatarColors = [
  '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
  '#F97316', '#84CC16', '#A855F7', '#14B8A6', '#F43F5E', '#6366F1', '#22C55E', '#EAB308',
];

const getConsistentColor = (id: number | string, colors: string[]) => {
  const hash = typeof id === 'number' ? id : id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function CollectiveResultCard({ collective }: CollectiveResultCardProps) {
  const navigate = useNavigate();
  const avatarBgColor = getConsistentColor(collective.id, avatarColors);
  const firstLetter = collective.name?.charAt(0).toUpperCase() || 'C';
  const imageUrl = collective.image || collective.avatar;

  return (
    <Card
      onClick={() => navigate(`/groupcrwd/${collective.id}`)}
      className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12 rounded-lg flex-shrink-0">
            <AvatarImage src={imageUrl} alt={collective.name} />
            <AvatarFallback
              style={{ backgroundColor: avatarBgColor }}
              className="text-white rounded-lg font-bold text-base"
            >
              {firstLetter}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-foreground mb-1">
              {collective.name}
            </h3>
            <p className="text-sm text-gray-700">
              {collective.description || 'No description available'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

