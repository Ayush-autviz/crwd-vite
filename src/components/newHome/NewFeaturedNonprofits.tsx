import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Nonprofit {
  id: string | number;
  name: string;
  image?: string;
  description?: string;
  mission?: string;
}

interface NewFeaturedNonprofitsProps {
  nonprofits?: Nonprofit[];
  seeAllLink?: string;
}

// Generate color for icon (same as Suggested Collectives)
const getIconColor = (id: number | string): string => {
  const colors = [
    "#1600ff", // Blue
    "#10B981", // Green
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#8B5CF6", // Purple
    "#EF4444", // Red
  ];
  const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function NewFeaturedNonprofits({
  nonprofits = [],
  seeAllLink = "/search",
}: NewFeaturedNonprofitsProps) {
  if (!nonprofits || nonprofits.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-4 mt-6 md:px-0 md:mt-8 lg:mt-10 xl:mt-12 2xl:mt-14">
      <div className="flex justify-between items-center mb-3 md:mb-4 lg:mb-6 xl:mb-8">
        <h2 className="text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold">Featured Nonprofits</h2>
        <Link to={seeAllLink}>
          <Button variant="link" className="text-green-600 p-0 h-auto flex items-center text-xs md:text-sm lg:text-base xl:text-lg">
            See all
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 md:gap-4 lg:gap-6 xl:gap-8 w-max items-stretch">
          {nonprofits.map((nonprofit) => {
            const iconColor = getIconColor(nonprofit.id);
            const description = nonprofit.description || nonprofit.mission || "";

            return (
              <Link
                to={`/cause/${nonprofit.id}`}
                key={nonprofit.id}
                className="block"
              >
                <div className="flex items-start gap-2.5 md:gap-3 lg:gap-4 p-3 md:p-4 lg:p-5 xl:p-6 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors bg-white min-w-[240px] md:min-w-[280px] lg:min-w-[300px] xl:min-w-[320px] max-w-[280px] md:max-w-[320px] lg:max-w-[340px] xl:max-w-[360px] h-full">
                  {/* Avatar - Rounded square */}
                  <Avatar className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 rounded-lg flex-shrink-0 border border-gray-200">
                    <AvatarImage src={nonprofit.image} />
                    <AvatarFallback
                      style={{
                        backgroundColor: iconColor,
                      }}
                      className="font-semibold rounded-lg text-white text-xs md:text-sm lg:text-sm xl:text-base"
                    >
                      {nonprofit.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col h-full">
                    {/* Title */}
                    <h3 className="font-bold text-xs md:text-sm lg:text-sm xl:text-base text-gray-900 mb-1 lg:mb-2">
                      {nonprofit.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs md:text-sm lg:text-sm xl:text-base text-gray-600 leading-relaxed line-clamp-3">
                      {description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

