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
    <div className="w-full px-4 mt-6 md:px-0 md:mt-8 lg:mt-10">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h2 className=" text-base xs:text-sm sm:text-base md:text-lg lg:text-2xl font-bold">Suggested Collectives</h2>
        <Link to={seeAllLink}>
          <Button variant="link" className="text-[#1600ff] p-0 h-auto flex items-center text-xs md:text-sm">
            See all
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 md:gap-4 w-max">
          {collectives.map((collective, index) => {
            // Priority: 1. Use color (with white text), 2. Use logo (image), 3. Fallback to generated color with letter
            const hasColor = collective.iconColor;
            const hasLogo = collective.icon && (collective.icon.startsWith("http") || collective.icon.startsWith("/") || collective.icon.startsWith("data:"));
            const iconColor = hasColor || (!hasLogo ? getIconColor(index) : undefined);
            const iconLetter = getIconLetter(collective.name);

            return (
              <Link
                to={`/groupcrwd/${collective.id}`}
                key={collective.id}
                className="block"
              >
                <div className="flex flex-col gap-2.5 md:gap-3 p-3 md:p-4 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors bg-gray-50 min-w-[240px] md:min-w-[280px] max-w-[280px] md:max-w-[320px]">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
                    style={iconColor ? { backgroundColor: iconColor } : {}}
                  >
                    {hasLogo ? (
                      <img
                        src={collective.icon}
                        alt={collective.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg md:text-xl">
                        {iconLetter}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm md:text-base text-black">
                    {collective.name}
                  </h3>

                  {/* Founder */}
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Avatar className="h-5 w-5 md:h-6 md:w-6">
                      <AvatarImage src={collective.founder.profile_picture} />
                      <AvatarFallback className="text-xs">
                        {collective.founder.name
                          .split(" ")
                          .map((n) => n.charAt(0))
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground">
                      Founded by {collective.founder.name}
                    </p>
                  </div>

                  {/* Nonprofits count */}
                  <p className="text-xs text-muted-foreground">
                    Supporting {collective.nonprofit_count} nonprofit
                    {collective.nonprofit_count !== 1 ? "s" : ""}
                  </p>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-none">
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

