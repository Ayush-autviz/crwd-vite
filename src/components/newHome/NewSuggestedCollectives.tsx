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
    color?: string;
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
  seeAllLink = "/circles",
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
    <div className="w-full px-4 mt-6 md:px-0 md:mt-8">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h2 className="text-base xs:text-lg sm:text-2xl md:text-3xl font-bold">Suggested Collectives</h2>
        <Link to={seeAllLink}>
          <Button variant="link" className="text-[#1600ff] p-0 h-auto flex items-center text-[10px] xs:text-sm md:text-base">
            See all
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 md:gap-4 w-max">
          {collectives.map((collective, index) => {
            // Priority: 1. If logo exists, show logo, 2. If no logo but color exists (and is not empty), show color with letter, 3. Fallback to generated color with letter
            const hasLogo = collective.icon && (collective.icon.startsWith("http") || collective.icon.startsWith("/") || collective.icon.startsWith("data:"));
            const hasColor = collective.iconColor && collective.iconColor.trim() !== ""; // Check if color exists and is not empty string
            // If logo exists, no background color needed. Otherwise, use API color if available, else use generated color
            const iconColor = hasLogo ? undefined : (hasColor ? collective.iconColor : getIconColor(index));
            const iconLetter = getIconLetter(collective.name);
            const showImage = hasLogo;

            return (
              <Link
                to={`/groupcrwd/${collective.id}`}
                key={collective.id}
                className="block"
              >
                <div className="flex flex-col gap-2.5 md:gap-3 p-3 md:p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors min-w-[240px] md:min-w-[280px] max-w-[280px] md:max-w-[320px] h-[190px] md:h-[200px]">
                  {/* Icon */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={showImage ? {} : (iconColor ? { backgroundColor: iconColor } : { backgroundColor: getIconColor(index) })}
                    >
                      {showImage ? (
                        <img
                          src={collective.icon}
                          alt={collective.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-white font-bold text-base xs:text-lg md:text-xl">
                          {iconLetter}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-xs xs:text-base text-black line-clamp-1">
                      {collective.name}
                    </h3>
                  </div>

                  {/* Founder */}
                  <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                    <Avatar className="h-5 w-5 md:h-6 md:w-6">
                      <AvatarImage src={collective.founder.profile_picture} />
                      <AvatarFallback
                        style={{
                          backgroundColor: (() => {
                            const color = collective.founder.color;
                            return color ? color : undefined;
                          })()
                        }}
                        className="text-white text-[10px] xs:text-xs md:text-sm font-semibold"
                      >
                        {collective.founder.name
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs xs:text-sm md:text-base text-muted-foreground">
                      Founded by <span className="font-semibold text-gray-600">{collective.founder.name}</span>
                    </p>
                  </div>

                  {/* Nonprofits count */}
                  <p className="text-xs xs:text-sm md:text-base text-muted-foreground flex-shrink-0">
                    Supporting {collective.nonprofit_count} nonprofit
                    {collective.nonprofit_count !== 1 ? "s" : ""}
                  </p>

                  {/* Description */}
                  <p className="text-xs xs:text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-2">
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

