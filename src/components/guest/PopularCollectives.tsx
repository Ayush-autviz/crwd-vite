import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCollectives } from "@/services/api/crwd";

interface Collective {
  id: string | number;
  name: string;
  iconColor?: string;
  founder: {
    name: string;
    profile_picture?: string;
  };
  nonprofit_count: number;
  description: string;
}

interface PopularCollectivesProps {
  seeAllLink?: string;
}

export default function PopularCollectives({
  seeAllLink = "/circles",
}: PopularCollectivesProps) {
  // Fetch collectives data using React Query
  const { data: collectivesData, isLoading } = useQuery({
    queryKey: ["popular-collectives"],
    queryFn: getCollectives,
    enabled: true,
  });

  // Generate color for icon if not provided
  const getIconColor = (name: string): string => {
    const colors = [
      "#1600ff", // Blue
      "#10B981", // Green
      "#EC4899", // Pink
      "#F59E0B", // Amber
      "#8B5CF6", // Purple
      "#EF4444", // Red
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Transform API data to match component's expected format
  const transformedCollectives: Collective[] =
    collectivesData?.results?.slice(0, 4).map((collective: any, index: number) => {
      const founderName = collective.created_by
        ? `${collective.created_by.first_name || ""} ${collective.created_by.last_name || ""}`.trim() || "Unknown"
        : "Unknown";

      return {
        id: collective.id,
        name: collective.name || "Unknown Collective",
        color: collective.color, // Use color from API if available
        logo: collective.logo, // Use logo from API if available
        iconColor: collective.color || getIconColor(collective.name || "C"), // Fallback to generated color
        founder: {
          name: founderName,
          profile_picture: collective.created_by?.profile_picture || "",
        },
        nonprofit_count:
          collective.causes_count ||
          collective.supported_causes_count ||
          collective.cause_count ||
          0,
        description: collective.description || "No description available",
      };
    }) || [];

  const displayCollectives = transformedCollectives;

  // Get first letter of name for icon
  const getIconLetter = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="bg-card py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[800] text-foreground mb-6 md:mb-8" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            Popular Collectives
          </h2>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#1600ff]" />
          </div>
        </div>
      </div>
    );
  }

  if (!displayCollectives || displayCollectives.length === 0) {
    return null;
  }

  return (
    <div className="bg-card py-6 md:py-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2 className="font-[800] text-foreground mb-4 md:mb-8 text-lg md:text-2xl" style={{ fontSize: 'clamp(1.125rem, 3vw, 2.5rem)' }}>
          Popular Collectives
        </h2>

        {/* Grid Layout: 3 cards top row, 1 card bottom left */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-8">
          {displayCollectives.slice(0, 4).map((collective) => {
            // Priority: 1. If color is available, show color with letter, 2. If no color, show image, 3. Fallback to generated color with letter
            const hasColor = collective.color;
            const hasLogo = collective.logo && (collective.logo.startsWith("http") || collective.logo.startsWith("/") || collective.logo.startsWith("data:"));
            const iconColor = hasColor ? collective.color : (!hasLogo ? collective.iconColor : undefined);
            const iconLetter = getIconLetter(collective.name);
            const showImage = !hasColor && hasLogo;

            return (
              <Card key={collective.id} className="rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-3 md:p-6 lg:p-6 xl:p-6">
                    <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-3">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 md:w-16 md:h-16 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={iconColor ? { backgroundColor: iconColor } : {}}
                  >
                    {showImage ? (
                      <img
                        src={collective.logo}
                        alt={collective.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-base md:text-2xl">
                        {iconLetter}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm md:text-xl lg:text-2xl text-foreground">
                    {collective.name}
                  </h3>
                    </div>
                  {/* Founder */}
                  <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                    <Avatar className="h-4 w-4 md:h-6 md:w-6 lg:h-6 lg:w-6 xl:h-6 xl:w-6">
                      <AvatarImage src={collective.founder.profile_picture} />
                      <AvatarFallback className="text-[8px] md:text-[10px]">
                        {collective.founder.name
                          .split(" ")
                          .map((n) => n.charAt(0))
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-[10px] md:text-sm text-muted-foreground">
                      Founded by {collective.founder.name}
                    </p>
                  </div>

                  {/* Nonprofits count */}
                  <p className="text-[10px] md:text-sm text-muted-foreground mb-2 md:mb-3">
                    Supporting {collective.nonprofit_count} nonprofit{collective.nonprofit_count !== 1 ? "s" : ""}
                  </p>

                  {/* Description */}
                  <p className="text-xs md:text-base text-muted-foreground leading-relaxed mb-3 md:mb-4 line-clamp-3">
                    {collective.description}
                  </p>

                  {/* View Collective Button */}
                  {/* <Link to={`/groupcrwd/${collective.id}`}> */}
                  <a href={`/groupcrwd/${collective.id}`}>
                    <Button
                      variant="outline"
                      className="w-full border-[#a854f7] text-[#a854f7] hover:bg-[#a854f7] hover:text-white text-xs md:text-sm py-1.5 md:py-2"
                    >
                      View Collective
                    </Button>
                  </a>
                  {/* </Link> */}
                </CardContent>
              </Card>
            );
          })}

        </div>

        {/* See All Collectives Button */}
        <div className="flex justify-center">
          {/* <Link to={seeAllLink}> */}
          <a href={seeAllLink}>
            <Button
              variant="outline"
              className="border-[#a854f7] rounded-full text-[#a854f7] hover:bg-[#a854f7] hover:text-white px-4 md:px-8 py-1.5 md:py-3 text-xs md:text-lg font-medium"
            >
              See All Collectives
            </Button>
          </a>
          {/* </Link> */}
        </div>
      </div>
    </div>
  );
}

