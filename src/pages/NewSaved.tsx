import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Stars } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getFavoriteCauses, getFavoriteCollectives } from '@/services/api/social';
import { getCauses, getCollectives } from '@/services/api/crwd';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

type TabType = 'Nonprofits' | 'Collectives';

// Get consistent color for avatar
const avatarColors = [
  '#10B981', // Green
  '#3B82F6', // Blue
  '#F97316', // Orange
  '#EC4899', // Pink/Red
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#A855F7', // Violet
];

const getConsistentColor = (id: number | string, colors: string[]) => {
  const hash = typeof id === 'number' ? id : id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getInitials = (name: string) => {
  const words = name.split(' ');
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function NewSavedPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('Nonprofits');

  // Fetch favorite causes
  const { data: favoriteCausesData, isLoading: isLoadingCauses } = useQuery({
    queryKey: ['favoriteCauses'],
    queryFn: getFavoriteCauses,
    enabled: activeTab === 'Nonprofits',
  });

  // Fetch favorite collectives
  const { data: favoriteCollectivesData, isLoading: isLoadingCollectives } = useQuery({
    queryKey: ['favoriteCollectives'],
    queryFn: getFavoriteCollectives,
    enabled: activeTab === 'Collectives',
  });

  // Fetch suggested causes (for when no favorites)
  const { data: suggestedCausesData, isLoading: isLoadingSuggestedCauses } = useQuery({
    queryKey: ['suggestedCauses'],
    queryFn: getCauses,
    enabled: activeTab === 'Nonprofits',
  });

  // Fetch suggested collectives (for when no favorites)
  const { data: suggestedCollectivesData, isLoading: isLoadingSuggestedCollectives } = useQuery({
    queryKey: ['suggestedCollectives'],
    queryFn: getCollectives,
    enabled: activeTab === 'Collectives',
  });

  const favoriteCauses = favoriteCausesData?.results || [];
  const favoriteCollectives = favoriteCollectivesData?.results || [];
  const suggestedCauses = suggestedCausesData?.results || [];
  const suggestedCollectives = suggestedCollectivesData?.results || [];

  // Filter out favorites from suggested items
  const favoriteCauseIds = useMemo(() => {
    return new Set(favoriteCauses.map((item: any) => {
      const cause = item.cause || item;
      return cause.id;
    }));
  }, [favoriteCauses]);

  const favoriteCollectiveIds = useMemo(() => {
    return new Set(favoriteCollectives.map((item: any) => {
      const collective = item.collective || item;
      return collective.id;
    }));
  }, [favoriteCollectives]);

  const filteredSuggestedCauses = useMemo(() => {
    return suggestedCauses.filter((cause: any) => !favoriteCauseIds.has(cause.id)).slice(0, 3);
  }, [suggestedCauses, favoriteCauseIds]);

  const filteredSuggestedCollectives = useMemo(() => {
    return suggestedCollectives.filter((collective: any) => !favoriteCollectiveIds.has(collective.id)).slice(0, 3);
  }, [suggestedCollectives, favoriteCollectiveIds]);

  const isLoading = activeTab === 'Nonprofits' ? isLoadingCauses : isLoadingCollectives;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 w-full flex items-center gap-4 px-4 py-4 border-b bg-white">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="font-bold text-xl text-foreground flex-1">Favorites</h1>
      </div>

      <div className="md:max-w-[60%]  md:mx-auto">
        {/* Tabs */}
        <div className="px-4 mt-4">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-4 md:mb-6 overflow-x-auto">
            {['Nonprofits', 'Collectives'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as TabType)}
                className={`flex-1 px-2 md:px-3 py-1.5 rounded-xl text-xs xs:text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : activeTab === 'Nonprofits' ? (
            favoriteCauses.length > 0 ? (
              <div className="space-y-4">
                {favoriteCauses.map((item: any) => {
                  const cause = item.cause || item;
                  const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                  const initials = getInitials(cause.name || 'N');

                  return (
                    <Card
                      key={cause.id}
                      onClick={() => navigate(`/c/${cause.sort_name}`)}
                      className="py-0 cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
                    >
                      <CardContent className="px-3 py-2 md:px-4 md:py-3">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12 rounded-lg flex-shrink-0 border border-gray-200">
                            <AvatarImage src={cause.image} alt={cause.name} />
                            <AvatarFallback
                              style={{ backgroundColor: avatarBgColor }}
                              className="text-white rounded-lg font-bold text-base"
                            >
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base text-foreground mb-1">
                              {cause.name}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {cause.mission || cause.description || 'No description available'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  {/* Star Icon with Plus */}
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <div className="relative">
                      <Stars className="w-8 h-8 md:w-10 md:h-10 text-blue-600 fill-blue-600" strokeWidth={2.5} />
                      <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 md:w-4 md:h-4 bg-blue-600 rounded-full flex items-center justify-center border-2 border-blue-50">
                        <span className="text-white text-[10px] md:text-xs font-bold leading-none">+</span>
                      </div>
                    </div>
                  </div>
                  <h2 className="font-bold text-lg md:text-xl text-gray-900 mb-2">
                    No favorites yet
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 text-center max-w-md">
                    Start building your collection! Tap the star on any nonprofit to save it here.
                  </p>
                </div>

                {/* Suggested for you */}
                {isLoadingSuggestedCauses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : filteredSuggestedCauses.length > 0 && (
                  <div className="mt-6 md:mt-8">
                    <h3 className="font-bold text-sm md:text-lg text-gray-900 mb-3 md:mb-4">
                      Suggested for you
                    </h3>
                    <div className="space-y-3 md:space-y-4">
                      {filteredSuggestedCauses.map((cause: any) => {
                        const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                        const initials = getInitials(cause.name || 'N');

                        return (
                          <Card
                            key={cause.id}
                            onClick={() => navigate(`/c/${cause.sort_name}`)}
                            className="py-0 cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
                          >
                            <CardContent className="px-3 py-2 md:px-4 md:py-3">
                              <div className="flex items-start gap-3 md:gap-4">
                                <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 border border-gray-200">
                                  <AvatarImage src={cause.image} alt={cause.name} />
                                  <AvatarFallback
                                    style={{ backgroundColor: avatarBgColor }}
                                    className="text-white rounded-lg font-bold text-sm md:text-base"
                                  >
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-sm md:text-base text-foreground mb-1 line-clamp-1">
                                    {cause.name}
                                  </h3>
                                  <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                                    {cause.mission || cause.description || 'No description available'}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )
          ) : favoriteCollectives.length > 0 ? (
            <div className="space-y-4">
              {favoriteCollectives.map((item: any, index: number) => {
                const collective = item.collective || item;

                // Generate color for icon if not provided (same logic as NewSuggestedCollectives)
                const getIconColor = (index: number): string => {
                  const colors = [
                    "#1600ff", // Blue
                    "#10B981", // Green
                    "#EC4899", // Pink
                    "#F59E0B", // Amber
                    "#8B5CF6", // Purple
                    "#EF4444", // Red
                  ];
                  return colors[index % colors.length];
                };

                // Get first letter of name for icon
                const getIconLetter = (name: string): string => {
                  return name.charAt(0).toUpperCase();
                };

                // Priority: 1. If color is available, show color with letter, 2. If no color, show image, 3. Fallback to generated color with letter
                const hasColor = collective.color;
                const hasLogo = collective.logo && (collective.logo.startsWith("http") || collective.logo.startsWith("/") || collective.logo.startsWith("data:"));
                const iconColor = hasColor ? collective.color : (!hasLogo ? getIconColor(index) : undefined);
                const iconLetter = getIconLetter(collective.name || 'C');
                const showImage = !hasColor && hasLogo;

                const founder = collective.created_by;
                const memberCount = collective.member_count || 0;

                return (
                  <Card
                    key={collective.id}
                    onClick={() => navigate(`/g/${collective.sort_name}`)}
                    className="py-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
                  >
                    <CardContent className="px-3 py-0 md:px-4 md:py-3">
                      {/* <div className="flex items-start gap-4"> */}
                      <Avatar className="w-12 h-12 rounded-lg flex-shrink-0">
                        {showImage ? (
                          <AvatarImage src={collective.logo} alt={collective.name} className="rounded-lg" />
                        ) : null}
                        <AvatarFallback
                          style={iconColor ? { backgroundColor: iconColor } : {}}
                          className="text-white font-bold text-xl rounded-lg"
                        >
                          {iconLetter}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-foreground my-1">
                          {collective.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {collective.description || 'No description available'}
                        </p>
                        {founder && (
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="w-6 h-6 rounded-full">
                              <AvatarImage src={founder.profile_picture} alt={founder.username} />
                              <AvatarFallback
                                style={{
                                  backgroundColor: getConsistentColor(founder.id, avatarColors),
                                }}
                                className="text-white text-xs font-bold"
                              >
                                {founder.first_name?.charAt(0) || founder.username?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">
                              Founded by {founder.first_name} {founder.last_name}
                            </span>
                          </div>
                        )}
                        <p className="text-sm text-gray-500">
                          {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                      {/* </div> */}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center py-12 px-4">
                {/* Star Icon with Plus */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-pink-50 flex items-center justify-center mb-4">
                  <div className="relative">
                    <Stars className="w-8 h-8 md:w-10 md:h-10 text-pink-500 fill-pink-500" strokeWidth={2.5} />
                    <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 md:w-4 md:h-4 bg-pink-500 rounded-full flex items-center justify-center border-2 border-pink-50">
                      <span className="text-white text-[10px] md:text-xs font-bold leading-none">+</span>
                    </div>
                  </div>
                </div>
                <h2 className="font-bold text-lg md:text-xl text-gray-900 mb-2">
                  No favorites yet
                </h2>
                <p className="text-sm md:text-base text-gray-600 text-center max-w-md">
                  Discover collectives and save your favorites to keep track of the communities you care about.
                </p>
              </div>

              {/* Suggested for you */}
              {isLoadingSuggestedCollectives ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : filteredSuggestedCollectives.length > 0 && (
                <div className="mt-6 md:mt-8">
                  <h3 className="font-bold text-sm md:text-lg text-gray-900 mb-3 md:mb-4">
                    Suggested for you
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {filteredSuggestedCollectives.map((collective: any, index: number) => {
                      // Generate color for icon if not provided
                      const getIconColor = (index: number): string => {
                        const colors = [
                          "#1600ff", // Blue
                          "#10B981", // Green
                          "#EC4899", // Pink
                          "#F59E0B", // Amber
                          "#8B5CF6", // Purple
                          "#EF4444", // Red
                        ];
                        return colors[index % colors.length];
                      };

                      // Get first letter of name for icon
                      const getIconLetter = (name: string): string => {
                        return name.charAt(0).toUpperCase();
                      };

                      // Priority: 1. If color is available, show color with letter, 2. If no color, show image, 3. Fallback to generated color with letter
                      const hasColor = collective.color;
                      const hasLogo = collective.logo && (collective.logo.startsWith("http") || collective.logo.startsWith("/") || collective.logo.startsWith("data:"));
                      const iconColor = hasColor ? collective.color : (!hasLogo ? getIconColor(index) : undefined);
                      const iconLetter = getIconLetter(collective.name || 'C');
                      const showImage = !hasColor && hasLogo;

                      const founder = collective.created_by;
                      const memberCount = collective.member_count || 0;

                      return (
                        <Card
                          key={collective.id}
                          onClick={() => navigate(`/g/${collective.sort_name}`)}
                          className="py-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
                        >
                          <CardContent className="px-3 py-0 md:px-4 md:py-3">
                            <div className="flex flex-col items-start gap-3 md:gap-4">
                              <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0">
                                {showImage ? (
                                  <AvatarImage src={collective.logo} alt={collective.name} className="rounded-lg" />
                                ) : null}
                                <AvatarFallback
                                  style={iconColor ? { backgroundColor: iconColor } : {}}
                                  className="text-white font-bold text-lg md:text-xl rounded-lg"
                                >
                                  {iconLetter}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm md:text-base text-foreground mb-1">
                                  {collective.name}
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">
                                  {collective.description || 'No description available'}
                                </p>
                                {founder && (
                                  <div className="flex items-center gap-2 mb-1">
                                    <Avatar className="w-5 h-5 md:w-6 md:h-6 rounded-full">
                                      <AvatarImage src={founder.profile_picture} alt={founder.username} />
                                      <AvatarFallback
                                        style={{
                                          backgroundColor: getConsistentColor(founder.id, avatarColors),
                                        }}
                                        className="text-white text-[10px] md:text-xs font-bold"
                                      >
                                        {founder.first_name?.charAt(0) || founder.username?.charAt(0) || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs md:text-sm text-gray-600">
                                      Founded by {founder.first_name} {founder.last_name}
                                    </span>
                                  </div>
                                )}
                                <p className="text-xs md:text-sm text-gray-500">
                                  {memberCount} {memberCount === 1 ? 'member' : 'members'}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

