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
    <div className="px-4 mt-8 md:px-0 md:mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Featured Nonprofits</h2>
        <Link to={seeAllLink}>
          <Button variant="link" className="text-green-600 p-0 h-auto flex items-center">
            See all
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 w-max items-stretch">
          {nonprofits.map((nonprofit) => {
            const iconColor = getIconColor(nonprofit.id);
            const description = nonprofit.description || nonprofit.mission || "";

            return (
              <Link
                to={`/cause/${nonprofit.id}`}
                key={nonprofit.id}
                className="block"
              >
                <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors bg-white min-w-[280px] max-w-[320px] h-full">
                  {/* Avatar - Rounded square */}
                  <Avatar className="h-12 w-12 rounded-lg flex-shrink-0 border border-gray-200">
                    <AvatarImage src={nonprofit.image} />
                    <AvatarFallback
                      style={{
                        backgroundColor: iconColor,
                      }}
                      className="font-semibold rounded-lg text-white"
                    >
                      {nonprofit.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col h-full">
                    {/* Title */}
                    <h3 className="font-bold text-sm text-gray-900 mb-1">
                      {nonprofit.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
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

