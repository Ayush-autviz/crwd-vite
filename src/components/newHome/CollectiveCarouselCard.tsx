import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Share2, Settings, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharePost } from "@/components/ui/SharePost";

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
    <div className="w-full mt-4 md:mt-6 lg:mt-8 max-w-full md:max-w-[95%] lg:max-w-[70%] mx-auto">
      <div className="bg-white rounded-xl p-4 md:p-6 relative border border-purple-100">
        {/* Carousel Navigation */}
        {totalCollectives > 1 && (
          <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-1 md:gap-2">
            <button
              onClick={handlePrevious}
              className="p-1 rounded hover:bg-white/50 transition-colors"
              aria-label="Previous collective"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
            </button>
            <span className="text-xs md:text-sm text-gray-700 min-w-[50px] md:min-w-[60px] text-center font-medium">
              {currentIndex + 1} of {totalCollectives}
            </span>
            <button
              onClick={handleNext}
              className="p-1 rounded hover:bg-white/50 transition-colors"
              aria-label="Next collective"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
            </button>
          </div>
        )}

        <div className="flex items-start gap-3 md:gap-4">
          {/* Circular Icon */}
          <div className="w-12 h-12 md:w-14 md:h-14 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg md:text-xl">
              {iconLetter}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-12 md:pr-20">
            {/* <div className="flex items-center gap-2 mb-1.5 md:mb-2 flex-wrap"> */}
              <h3 className="font-bold text-base md:text-lg text-gray-900">{currentCollective.name}</h3>
              {currentCollective.role && (
                <p className={`${currentCollective.role === 'Admin' ? '  bg-pink-100 text-red-600' : 'bg-[#a955f7] text-white      '} text-xs font-medium px-2 py-0.5 md:py-1 rounded-md whitespace-nowrap w-fit`}>
                  {currentCollective.role === 'Admin' ? 'Founder' : currentCollective.role}
                </p>
              )}
            {/* </div> */}
            <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-5 leading-relaxed">
              <span className="font-bold text-gray-900">{currentCollective.memberCount}</span> members are currently donating{" "}
              {/* <span className="font-bold text-gray-900">
                 ${currentCollective.yearlyAmount.toLocaleString()} per year
              </span>{" "} */}
              to <span className="font-bold text-gray-900">{currentCollective.causeCount} causes</span>.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 md:gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm h-9 md:h-10 px-3 md:px-4 font-semibold"
                onClick={handleButtonClick}
              >
                {isFounder ? (
                  <>
                    <Settings className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Manage
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    View
                  </>
                )}
              </Button>
              <Button 
                size="sm" 
                className="bg-[#1600ff] hover:bg-[#1400cc] text-white flex items-center gap-1.5 md:gap-2 text-xs md:text-sm h-9 md:h-10 px-3 md:px-4 font-semibold"
                onClick={() => setShowShareModal(true)}
              >
                <Share2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

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

