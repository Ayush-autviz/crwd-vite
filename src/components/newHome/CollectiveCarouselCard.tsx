import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Share2, Settings, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharePost } from "@/components/ui/SharePost";
import { Card, CardContent } from "@/components/ui/card";

interface Collective {
  id: string | number;
  name: string;
  memberCount: number;
  yearlyAmount: number;
  causeCount: number;
  role?: string; // "Member", "Admin", etc.
  image?: string; // Collective cover image or avatar
  logo?: string; // Collective logo
  color?: string; // Collective color for icon background
}

interface CollectiveCarouselCardProps {
  collectives?: Collective[];
}

export default function CollectiveCarouselCard({
  collectives = [],
}: CollectiveCarouselCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const navigate = useNavigate();

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

  // Get first letter of collective name for icon
  const iconLetter = currentCollective.name?.charAt(0).toUpperCase() || 'C';

  // Priority: 1. Use color (with white text), 2. Use logo (image), 3. Fallback to generated color with letter
  const hasColor = currentCollective.color;
  const hasLogo = currentCollective.logo && (currentCollective.logo.startsWith("http") || currentCollective.logo.startsWith("/") || currentCollective.logo.startsWith("data:"));
  const iconColor = hasColor || (!hasLogo ? '#10B981' : undefined); // Default teal if no color/logo
  const showImage = hasLogo && !hasColor; // Show logo only if no color is available

  // Check if user is founder/admin
  const isFounder = currentCollective.role === 'Admin' || currentCollective.role === 'Founder';

  // Handle button click - navigate to edit if founder, otherwise view
  const handleButtonClick = () => {
    if (isFounder) {
      navigate(`/edit-collective/${currentCollective.id}`);
    } else {
      navigate(`/groupcrwd/${currentCollective.id}`);
    }
  };

  return (
    <div className="w-full py-2 md:max-w-2xl lg:max-w-3xl xl:max-w-4xl md:mx-auto">
      <Card className="cursor-pointer py-2 md:py-4 lg:py-6 xl:py-8 shadow-none border border-gray-200 bg-white relative">
        <CardContent className="px-3 md:px-6 lg:px-8 xl:px-10 py-0 md:py-0">
          {/* Carousel Navigation */}
          {totalCollectives > 1 && (
            <div className="absolute top-3 right-3 md:top-6 md:right-6 lg:top-8 lg:right-8 xl:top-10 xl:right-10 flex items-center gap-1 md:gap-2">
              <button
                onClick={handlePrevious}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                aria-label="Previous collective"
              >
                <ChevronLeft className="h-3.5 w-3.5 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-gray-700" />
              </button>
              <span className="text-xs md:text-sm lg:text-base xl:text-lg text-gray-700 min-w-[45px] md:min-w-[60px] lg:min-w-[80px] text-center font-medium">
                {currentIndex + 1} of {totalCollectives}
              </span>
              <button
                onClick={handleNext}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                aria-label="Next collective"
              >
                <ChevronRight className="h-3.5 w-3.5 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-gray-700" />
              </button>
            </div>
          )}

          <div className="flex flex-col items-start gap-2.5 md:gap-4 lg:gap-6">
            {/* Icon and Title/Badge Row */}
            <div className="flex flex-row items-center gap-2.5 md:gap-4 lg:gap-6 w-full">
              {/* Circular Icon */}
              <div 
                className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-lg flex items-center justify-center flex-shrink-0"
                style={iconColor ? { backgroundColor: iconColor } : {}}
              >
                {showImage ? (
                  <img
                    src={currentCollective.logo}
                    alt={currentCollective.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-white font-bold text-base md:text-xl lg:text-2xl xl:text-3xl">
                    {iconLetter}
                  </span>
                )}
              </div>

              {/* Title and Badge */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm md:text-lg lg:text-xl xl:text-2xl text-gray-900 mb-0.5 md:mb-1 lg:mb-2">{currentCollective.name}</h3>
                {currentCollective.role && (
                  <p className={`${currentCollective.role === 'Admin' ? 'bg-pink-100 text-red-600' : 'bg-[#a955f7] text-white'} text-xs md:text-sm lg:text-base font-medium px-1.5 md:px-2 lg:px-3 py-0.5 lg:py-1 rounded-md whitespace-nowrap w-fit`}>
                    {currentCollective.role === 'Admin' ? 'Founder' : currentCollective.role}
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="w-full text-left">
              <p className="text-xs md:text-base lg:text-lg xl:text-xl text-gray-700 mb-2 md:mb-4 lg:mb-6 leading-relaxed text-left">
                <span className="font-bold text-gray-900">{currentCollective.memberCount}</span> members are currently donating{" "}
                to <span className="font-bold text-gray-900">{currentCollective.causeCount} causes</span>.
              </p>

              {/* Action Buttons */}
              <div className="flex justify-start items-center gap-1.5 md:gap-2 lg:gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50 flex items-center justify-center gap-1 md:gap-1.5 lg:gap-2 text-xs md:text-sm lg:text-base xl:text-lg h-7 md:h-9 lg:h-11 xl:h-12 px-2 md:px-3 lg:px-4 xl:px-5 font-semibold w-[30%]"
                  onClick={handleButtonClick}
                >
                  {isFounder ? (
                    <>
                      <Settings className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                      Manage
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                      View
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-[#1600ff] hover:bg-[#1400cc] text-white flex items-center justify-center gap-1 md:gap-1.5 lg:gap-2 text-xs md:text-sm lg:text-base xl:text-lg h-7 md:h-9 lg:h-11 xl:h-12 px-2 md:px-3 lg:px-4 xl:px-5 font-semibold w-[30%]"
                  onClick={() => setShowShareModal(true)}
                >
                  <Share2 className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      <SharePost
        url={window.location.origin + `/groupcrwd/${currentCollective.id}`}
        title={`Join ${currentCollective.name}`}
        description={`${currentCollective.memberCount} members are currently donating $${currentCollective.yearlyAmount.toLocaleString()} per year to ${currentCollective.causeCount} causes.`}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}

