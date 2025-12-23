import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Collective {
  id: string | number;
  name: string;
  icon?: string; // Optional logo URL, if not provided will use first letter
  iconColor?: string; // Optional color for the icon background (from API color field)
  founder: {
    name: string;
    profile_picture?: string;
  };
  nonprofit_count: number;
  description: string;
}

interface NewSuggestedCollectivesProps {
  collectives?: Collective[];
  seeAllLink?: string;
}

export default function NewSuggestedCollectives({
  collectives = [],
  seeAllLink = "/search",
}: NewSuggestedCollectivesProps) {
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

  if (!collectives || collectives.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-4 mt-6 md:px-0 md:mt-8 lg:mt-10 xl:mt-12 2xl:mt-14">
      <div className="flex justify-between items-center mb-3 md:mb-4 lg:mb-6 xl:mb-8">
        <h2 className="text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold">Suggested Collectives</h2>
        <Link to={seeAllLink}>
          <Button variant="link" className="text-[#1600ff] p-0 h-auto flex items-center text-xs md:text-sm lg:text-base xl:text-lg">
            See all
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 md:gap-4 lg:gap-6 xl:gap-8 w-max">
          {collectives.map((collective, index) => {
            // Priority: 1. If color is available, show color with letter, 2. If no color, show image, 3. Fallback to generated color with letter
            const hasColor = collective.iconColor;
            const hasLogo = collective.icon && (collective.icon.startsWith("http") || collective.icon.startsWith("/") || collective.icon.startsWith("data:"));
            const iconColor = hasColor ? collective.iconColor : (!hasLogo ? getIconColor(index) : undefined);
            const iconLetter = getIconLetter(collective.name);
            const showColorWithLetter = hasColor || !hasLogo;
            const showImage = !hasColor && hasLogo;

            return (
              <Link
                to={`/groupcrwd/${collective.id}`}
                key={collective.id}
                className="block"
              >
                <div className="flex flex-col gap-2.5 md:gap-3 lg:gap-4 p-3 md:p-4 lg:p-6 xl:p-8 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors min-w-[240px] md:min-w-[280px] lg:min-w-[320px] xl:min-w-[360px] max-w-[280px] md:max-w-[320px] lg:max-w-[360px] xl:max-w-[400px] h-[220px] md:h-[240px] lg:h-[280px] xl:h-[320px]">
                  {/* Icon */}
                  <div className="flex items-center gap-2 lg:gap-3">
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={iconColor ? { backgroundColor: iconColor } : {}}
                  >
                    {showImage ? (
                      <img
                        src={collective.icon}
                        alt={collective.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg md:text-xl lg:text-2xl xl:text-3xl">
                        {iconLetter}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm md:text-base lg:text-lg xl:text-xl text-black flex-shrink-0">
                    {collective.name}
                  </h3>
                  </div>

                  {/* Founder */}
                  <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 flex-shrink-0">
                    <Avatar className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10">
                      <AvatarImage src={collective.founder.profile_picture} />
                      <AvatarFallback 
                        style={{ 
                          backgroundColor: (() => {
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
                            const founderId = collective.founder.name || collective.id;
                            const colorIndex = founderId ? (String(founderId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length) : 0;
                            return avatarColors[colorIndex];
                          })()
                        }}
                        className="text-white text-xs md:text-sm lg:text-base font-semibold"
                      >
                        {collective.founder.name
                          .split(" ")
                          .map((n) => n.charAt(0))
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs md:text-sm lg:text-base xl:text-lg text-muted-foreground">
                      Founded by <span className="font-semibold text-gray-600">{collective.founder.name}</span>
                    </p>
                  </div>

                  {/* Nonprofits count */}
                  <p className="text-xs md:text-sm lg:text-base xl:text-lg text-muted-foreground flex-shrink-0">
                    Supporting {collective.nonprofit_count} nonprofit
                    {collective.nonprofit_count !== 1 ? "s" : ""}
                  </p>

                  {/* Description */}
                  <p className="text-xs md:text-sm lg:text-base xl:text-lg text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                    {collective.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

