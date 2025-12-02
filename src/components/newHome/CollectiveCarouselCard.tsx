import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, ChevronLeft, ChevronRight, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Collective {
  id: string | number;
  name: string;
  memberCount: number;
  yearlyAmount: number;
  causeCount: number;
  role?: string; // "Member", "Admin", etc.
  image?: string; // Collective cover image or avatar
}

interface CollectiveCarouselCardProps {
  collectives?: Collective[];
}

export default function CollectiveCarouselCard({
  collectives = [],
}: CollectiveCarouselCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  if (!collectives || collectives.length === 0) {
    return null;
  }

  const currentCollective = collectives[currentIndex];
  const totalCollectives = collectives.length;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalCollectives - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalCollectives - 1 ? prev + 1 : 0));
  };

  return (
    <div className="px-4 mt-6 md:px-0 md:mt-8 max-w-[95%] md:max-w-[70%] mx-auto hover:shadow-lg transition-shadow duration-300 rounded-xl">
      <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
        {/* Carousel Navigation */}
        {totalCollectives > 1 && (
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              aria-label="Previous collective"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {currentIndex + 1} of {totalCollectives}
            </span>
            <button
              onClick={handleNext}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              aria-label="Next collective"
            >
              <ChevronRight className="h-5 w-5 text-[#8B5CF6]" />
            </button>
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Image or Icon */}
          {currentCollective.image && !imageError[currentIndex] ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={currentCollective.image}
                alt={currentCollective.name}
                className="w-full h-full object-cover"
                onError={() => {
                  setImageError((prev) => ({ ...prev, [currentIndex]: true }));
                }}
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-[#8B5CF6] rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6 text-white" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 pr-20">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg text-gray-900">{currentCollective.name}</h3>
              {currentCollective.role && (
                <span className="bg-[#8B5CF6] text-white text-xs font-medium px-2 py-1 rounded-full">
                  {currentCollective.role}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {currentCollective.memberCount} members are currently donating{" "}
              <span className="font-bold text-gray-900">
                ${currentCollective.yearlyAmount.toLocaleString()} per year
              </span>{" "}
              to <span className="font-bold text-gray-900">{currentCollective.causeCount} causes</span>.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link to={`/groupcrwd/${currentCollective.id}`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </Link>
              <Button className="bg-[#0047FF] text-white flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

