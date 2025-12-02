import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Collective {
  id: string | number;
  name: string;
  icon?: string; // Optional icon URL, if not provided will use first letter
  iconColor?: string; // Optional color for the icon background
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
      "#0047FF", // Blue
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
    <div className="px-4 mt-8 md:px-0 md:mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Suggested Collectives</h2>
        <Link to={seeAllLink}>
          <Button variant="link" className="text-primary p-0 h-auto flex items-center">
            See all <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 w-max">
          {collectives.map((collective, index) => {
            const iconColor = collective.iconColor || getIconColor(index);
            const iconLetter = collective.icon || getIconLetter(collective.name);

            return (
              <Link
                to={`/groupcrwd/${collective.id}`}
                key={collective.id}
                className="block"
              >
                <div className="flex flex-col gap-3 p-4 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors bg-gray-50 min-w-[280px] max-w-[320px]">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: iconColor }}
                  >
                    {collective.icon && collective.icon.startsWith("http") ? (
                      <img
                        src={collective.icon}
                        alt={collective.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-white font-bold text-xl">
                        {iconLetter}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-base text-black">
                    {collective.name}
                  </h3>

                  {/* Founder */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={collective.founder.profile_picture} />
                      <AvatarFallback>
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
                  <p className="text-sm text-muted-foreground leading-relaxed">
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

