import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface SimilarNonprofitsProps {
  similarCauses: any[];
  isLoading?: boolean;
}

export default function SimilarNonprofits({ similarCauses, isLoading }: SimilarNonprofitsProps) {
  const navigate = useNavigate();

  // Get consistent color for avatar
  const avatarColors = [
    '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
    '#F97316', '#84CC16', '#A855F7', '#14B8A6', '#F43F5E', '#6366F1', '#22C55E', '#EAB308',
  ];
  const getConsistentColor = (id: number | string, colors: string[]) => {
    const hash = typeof id === 'number' ? id : id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Similar Nonprofits</h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!similarCauses || similarCauses.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Similar Nonprofits</h2>
      <div className="space-y-4">
        {similarCauses.map((cause) => {
          const avatarBgColor = getConsistentColor(cause.id || cause.name, avatarColors);
          const firstLetter = cause.name?.charAt(0).toUpperCase() || 'C';

          return (
            <Card
              key={cause.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/cause/${cause.id}`)}
            >
              <CardContent className="px-4">
                <div className="flex gap-4">
                  <Avatar className="w-14 h-14 rounded-lg flex-shrink-0">
                    <AvatarImage src={cause.image} alt={cause.name} />
                    <AvatarFallback
                      style={{ backgroundColor: avatarBgColor }}
                      className="text-white rounded-lg font-bold text-xl"
                    >
                      {firstLetter}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-foreground mb-1">
                      {cause.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {cause.mission || cause.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

