import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface UserResultCardProps {
  user: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
    bio?: string;
    color?: string;
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

export default function UserResultCard({ user }: UserResultCardProps) {
  const navigate = useNavigate();
  const avatarBgColor = user.color || getConsistentColor(user.id, avatarColors);
  const initials = user.first_name && user.last_name
    ? `${user.first_name.charAt(0)}`.toUpperCase()
    : user.username?.charAt(0).toUpperCase() || 'U';

  // Get full name
  const fullName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.first_name || user.username || 'Unknown User';

  return (
    <Card
      onClick={() => navigate(`/user-profile/${user.username}`)}
      className="cursor-pointer py-0 hover:shadow-md transition-shadow border border-gray-200 bg-white rounded-lg"
    >
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center gap-2.5 md:gap-4">
          <Avatar className="w-8 h-8 md:w-12 md:h-12 rounded-full flex-shrink-0">
            <AvatarImage src={user.profile_picture} alt={fullName} />
            <AvatarFallback
              style={{ backgroundColor: avatarBgColor }}
              className="text-white font-bold text-xs md:text-base"
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {/* First Name and Last Name */}
            <h3 className="font-bold text-sm xs:text-base md:text-lg text-gray-900">
              {fullName}
            </h3>
            {/* Bio */}
            {user.bio && (
              <p className="text-xs xs:text-sm md:text-base text-gray-600 mt-0.5 md:mt-1">{user.bio}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


