import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSuggestedCrwds } from "@/services/api/crwd";

interface DiscoverMoreCollectivesProps {
  collectiveId?: string;
}

export default function DiscoverMoreCollectives({ collectiveId }: DiscoverMoreCollectivesProps) {
  // Fetch suggested collectives
  const { data: suggestedData, isLoading, error } = useQuery({
    queryKey: ['suggestedCrwds', collectiveId],
    queryFn: () => getSuggestedCrwds(collectiveId || ''),
    enabled: !!collectiveId,
  });

  // Transform API data
  const suggestedCollectives = Array.isArray(suggestedData)
    ? suggestedData.slice(0, 3) // Show only first 3
    : (suggestedData?.results || suggestedData?.data || []).slice(0, 3);

  // Generate color for icon if not provided
  const getIconColor = (index: number, collective: any): string => {
    // Priority: 1. Use API color, 2. Use generated color
    if (collective.color && collective.color.trim() !== '') {
      return collective.color;
    }
    const colors = [
      "#10B981", // Green (teal)
      "#EC4899", // Pink
      "#8B5CF6", // Purple
      "#3B82F6", // Blue
      "#F59E0B", // Amber
      "#EF4444", // Red
    ];
    return colors[index % colors.length];
  };

  // Get first letter of name for icon
  const getIconLetter = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="px-3 md:px-4 mt-6 md:mt-8">
        <h2 className="text-base xs:text-lg md:text-xl font-bold mb-4 md:mb-6">Discover More Collectives</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm md:text-base text-gray-600">Loading collectives...</span>
        </div>
      </div>
    );
  }

  if (error || !suggestedCollectives || suggestedCollectives.length === 0) {
    return null; // Don't show the section if there's an error or no data
  }

  return (
    <div className="px-3 md:px-4 mt-6 md:mt-8">
      <h2 className="text-base xs:text-lg md:text-xl font-bold mb-4 md:mb-6">Discover More Collectives</h2>

      <div className="space-y-4 md:space-y-5">
        {suggestedCollectives.map((collective: any, index: number) => {
          const hasLogo = collective.logo && (
            collective.logo.startsWith('http') ||
            collective.logo.startsWith('/') ||
            collective.logo.startsWith('data:')
          );
          const iconColor = getIconColor(index, collective);
          const iconLetter = getIconLetter(collective.name || 'C');
          const founder = collective.created_by || collective.founder || {};
          const founderName = founder.first_name && founder.last_name
            ? `${founder.first_name} ${founder.last_name}`
            : founder.username || founder.name || 'Unknown';
          const nonprofitCount = collective.nonprofit_count || collective.causes_count || 0;

          return (
            <Link
              to={`/groupcrwd/${collective.id}`}
              key={collective.id || index}
              className="block"
            >
              <div className="flex flex-col  gap-1 md:gap-2 p-3 md:p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                {/* Icon */}
                <div
                  className="w-12 h-12 xs:w-14 xs:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: hasLogo ? undefined : iconColor }}
                >
                  {hasLogo ? (
                    <img
                      src={collective.logo}
                      alt={collective.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-white font-bold text-xl xs:text-2xl md:text-3xl">
                      {iconLetter}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Name */}
                  <h3 className="font-bold text-base xs:text-lg md:text-xl text-black mb-1 md:mb-2">
                    {collective.name || 'Unknown Collective'}
                  </h3>

                  {/* Description */}
                  <p className="text-sm xs:text-base md:text-lg text-gray-700 mb-2 md:mb-3 leading-relaxed">
                    {collective.description || ''}
                  </p>

                  {/* Founder */}
                  <div className="flex items-center gap-2 mb-1 md:mb-2">
                    <Avatar className="h-5 w-5 md:h-6 md:w-6">
                      <AvatarImage src={founder.profile_picture || founder.avatar} />
                      <AvatarFallback
                        style={{
                          backgroundColor: founder.color || '#6B7280',
                        }}
                        className="text-white text-xs font-semibold"
                      >
                        {founderName
                          .split(' ')
                          .map((n: string) => n.charAt(0))
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs xs:text-sm md:text-base text-gray-600">
                      Founded by <span className="font-semibold">{founderName}</span>
                    </p>
                  </div>

                  {/* Nonprofits count */}
                  <p className="text-xs xs:text-sm md:text-base text-gray-600">
                    Supporting {nonprofitCount} nonprofit{nonprofitCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Browse All Collectives Button */}
      <div className="mt-6 md:mt-8 flex justify-center">
        <Link to="/circles">
          <Button
            variant="outline"
            className="border-[#1600ff] border-2 text-[#1600ff] hover:bg-[#1600ff] hover:text-white font-semibold px-6 md:px-8 py-2 md:py-3 rounded-lg text-sm xs:text-base md:text-lg"
          >
            Browse All Collectives
          </Button>
        </Link>
      </div>
    </div>
  );
}

