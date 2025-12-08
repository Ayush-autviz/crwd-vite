import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

interface Nonprofit {
  id: number;
  name: string;
  mission?: string;
  image?: string;
  cause?: {
    id: number;
    name: string;
    mission?: string;
    image?: string;
  };
}

interface SupportedNonprofitsProps {
  nonprofits: Nonprofit[];
  isLoading?: boolean;
}

export default function SupportedNonprofits({
  nonprofits,
  isLoading = false,
}: SupportedNonprofitsProps) {
  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <h3 className="font-bold text-lg md:text-xl text-foreground mb-4">
          Supported Nonprofits
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!nonprofits || nonprofits.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <h3 className="font-bold text-lg md:text-xl text-foreground mb-4">
        Supported Nonprofits
      </h3>
      <div className="space-y-3">
        {nonprofits.map((nonprofit) => {
          const cause = nonprofit.cause || nonprofit;
          const name = cause.name || nonprofit.name || 'Unknown Nonprofit';
          const mission = cause.mission || nonprofit.mission || '';
          const image = cause.image || nonprofit.image || '';

          // Generate vibrant avatar colors based on nonprofit ID for consistent colors
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
          const nonprofitId = cause.id || nonprofit.id || name;
          const avatarColorIndex = nonprofitId ? (Number(nonprofitId) % avatarColors.length) : (name?.charCodeAt(0) || 0) % avatarColors.length;
          const avatarBgColor = avatarColors[avatarColorIndex];

          return (
            <Card key={nonprofit.id} className="border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <CardContent className="p-0 px-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 md:w-12 md:h-12 rounded-lg flex-shrink-0">
                    <AvatarImage src={image} alt={name} />
                    <AvatarFallback 
                      style={{ backgroundColor: avatarBgColor }}
                      className="text-white rounded-lg font-semibold text-3xl"
                    >
                      {name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base md:text-lg text-foreground mb-1">
                      {name}
                    </h4>
                    {mission && (
                      <p className="text-sm md:text-base text-muted-foreground">
                        {mission}
                      </p>
                    )}
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

