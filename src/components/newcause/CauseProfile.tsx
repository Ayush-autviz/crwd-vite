import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { categories } from '@/constants/categories';
import { useNavigate } from 'react-router-dom';

interface CauseProfileProps {
  causeData: any;
}

export default function CauseProfile({ causeData }: CauseProfileProps) {
  const navigate = useNavigate();
  const category = categories.find((cat) => cat.id === causeData?.category);
  
  const handleCategoryClick = () => {
    if (category) {
      // Navigate to search with category name as search query
      // This will trigger a search for that category
      navigate('/search', {
        state: {
          searchQuery: category.name,
          categoryId: category.id,
        },
      });
    }
  };
  
  // Get first letter for avatar fallback
  const firstLetter = causeData?.name?.charAt(0).toUpperCase() || 'C';
  
  // Get consistent color for avatar
  const avatarColors = [
    '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
    '#F97316', '#84CC16', '#A855F7', '#14B8A6', '#F43F5E', '#6366F1', '#22C55E', '#EAB308',
  ];
  const getConsistentColor = (id: number | string, colors: string[]) => {
    const hash = typeof id === 'number' ? id : id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  const avatarBgColor = getConsistentColor(causeData?.id || 'default', avatarColors);

  return (
    <div className="px-3 md:px-4 py-4 md:py-6 space-y-3 md:space-y-4">
      {/* Profile Section */}
      <div className="flex items-start gap-3 md:gap-4">
        <Avatar className="w-14 h-14 md:w-16 md:h-16 rounded-lg flex-shrink-0">
          <AvatarImage src={causeData?.image} alt={causeData?.name} />
          <AvatarFallback
            style={{ backgroundColor: avatarBgColor }}
            className="text-white rounded-lg font-bold text-xl md:text-2xl"
          >
            {firstLetter}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-lg md:text-xl text-foreground mb-0.5 md:mb-1">
            {causeData?.name}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            in {causeData?.collective_count || 0} Collectives • {causeData?.donation_count || 0} donations
          </p>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="space-y-1.5 md:space-y-2">
        <p className="text-sm md:text-base text-foreground">
          {causeData?.mission || causeData?.description}
        </p>
        
        {/* Category Tag */}
        {category && (
          <Badge
            variant="secondary"
            onClick={handleCategoryClick}
            className="rounded-full px-2.5 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-medium text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: category.background,
            }}
          >
            {category.name}
          </Badge>
        )}
      </div>
    </div>
  );
}

