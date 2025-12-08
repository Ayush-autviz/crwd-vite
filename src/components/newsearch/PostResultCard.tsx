import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface PostResultCardProps {
  post: {
    id: number;
    text: string;
    user?: {
      id: number;
      username: string;
      first_name?: string;
      last_name?: string;
      profile_picture?: string;
    };
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

export default function PostResultCard({ post }: PostResultCardProps) {
  const navigate = useNavigate();
  const user = post.user;
  const avatarBgColor = user ? getConsistentColor(user.id, avatarColors) : '#6B7280';
  const initials = user?.first_name && user?.last_name
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : user?.username?.charAt(0).toUpperCase() || 'U';

  return (
    <Card
      onClick={() => navigate(`/post/${post.id}`)}
      className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {user && (
            <Avatar className="w-10 h-10 rounded-full flex-shrink-0">
              <AvatarImage src={user.profile_picture} alt={user.username} />
              <AvatarFallback
                style={{ backgroundColor: avatarBgColor }}
                className="text-white font-bold"
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            {user && (
              <h3 className="font-semibold text-sm text-foreground mb-1">
                @{user.username}
              </h3>
            )}
            <p className="text-sm text-gray-700 line-clamp-3">
              {post.text}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

