import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { categories } from '@/constants/categories';
import { truncateAtFirstPeriod } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CauseProfileProps {
  causeData: any;
}

export default function CauseProfile({ causeData }: CauseProfileProps) {
  const navigate = useNavigate();
  // Get all matching categories from the category string (e.g., "MP" -> "M", "P")
  const displayedCategories = categories.filter(
    (cat) => cat.id && typeof causeData?.category === 'string' && causeData.category.includes(cat.id)
  );

  const handleCategoryClick = (cat: typeof categories[0]) => {
    navigate(`/search-results?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}&q=${encodeURIComponent(cat.name)}`);
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
            {causeData?.collective_count > 0 && (
              <span>in {causeData.collective_count} Collectives</span>
            )}
            {causeData?.collective_count > 0 && causeData?.donation_count > 0 && (
              <span> • </span>
            )}
            {causeData?.donation_count > 0 && (
              <span>in {causeData.donation_count} donations</span>
            )}
          </p>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="space-y-1.5 md:space-y-2">
        <p className="text-sm xs:text-base md:text-lg text-foreground">
          {truncateAtFirstPeriod(causeData?.mission || causeData?.description)}
        </p>

        {/* Category Tags */}
        {displayedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {displayedCategories.map((cat) => (
              <Badge
                key={cat.id}
                variant="secondary"
                onClick={() => handleCategoryClick(cat)}
                className="rounded-full px-2.5 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-medium text-white cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: cat.background,
                }}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

