


import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Share2, Users } from "lucide-react";
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
  image?: string;
  logo?: string;
  color?: string;
  sort_name?: string;
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

  // Sort collectives: Admin first, then others
  const sortedCollectives = useMemo(() => {
    if (!collectives) return [];

    return [...collectives].sort((a, b) => {
      const isAAdmin = a.role === 'Admin';
      const isBAdmin = b.role === 'Admin';

      if (isAAdmin && !isBAdmin) return -1;
      if (!isAAdmin && isBAdmin) return 1;
      return 0;
    });
  }, [collectives]);

  if (!sortedCollectives || sortedCollectives.length === 0) {
    return null;
  }

  const currentCollective = sortedCollectives[currentIndex];
  const totalCollectives = sortedCollectives.length;
  // Helper to determine if we need to reserve space for arrows
  const showNavigation = totalCollectives > 1;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalCollectives - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalCollectives - 1 ? prev + 1 : 0));
  };

  const iconLetter = currentCollective.name?.charAt(0).toUpperCase() || 'C';

  const hasColor = currentCollective.color;
  const hasLogo = currentCollective.logo && (currentCollective.logo.startsWith("http") || currentCollective.logo.startsWith("/") || currentCollective.logo.startsWith("data:"));
  const iconColor = hasColor || (!hasLogo ? '#10B981' : undefined);
  const showImage = hasLogo && !hasColor;

  const isFounder = currentCollective.role === 'Admin' || currentCollective.role === 'Founder';

  const handleButtonClick = () => {
    if (isFounder) {
      navigate(`/edit-collective/${currentCollective.id}`);
    } else {
      navigate(`/g/${currentCollective.sort_name}`);
    }
  };

  return (
    <div className="w-full py-2 md:max-w-2xl md:mx-auto">
      <Card className=" py-2 md:py-4 shadow-none border border-gray-200 bg-white relative">
        <CardContent className="px-3 md:px-6 py-0 md:py-0">
          {/* Carousel Navigation */}
          {showNavigation && (
            <div className="absolute top-3 right-3 md:top-6 md:right-6 flex items-center gap-1 md:gap-2 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                aria-label="Previous collective"
              >
                <ChevronLeft className="h-3.5 w-3.5 md:h-5 md:w-5 text-gray-700" />
              </button>
              <span className="text-[10px] xs:text-xs md:text-sm text-gray-700 min-w-[45px] md:min-w-[60px] text-center font-medium">
                {currentIndex + 1} of {totalCollectives}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                aria-label="Next collective"
              >
                <ChevronRight className="h-3.5 w-3.5 md:h-5 md:w-5 text-gray-700" />
              </button>
            </div>
          )}

          <div className="flex flex-col items-start gap-2.5 md:gap-4">
            {/* Icon and Title/Badge Row */}
            <div
              // onClick={() => navigate(`/g/${currentCollective.sort_name}`)}
              className="flex flex-row items-center gap-2.5 md:gap-4 w-full"
            >
              {/* Circular Icon */}
              {/* <div
                className="w-8 h-8 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={iconColor ? { backgroundColor: iconColor } : {}}
              >
                {showImage ? (
                  <img
                    src={currentCollective.logo}
                    alt={currentCollective.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-white font-bold text-sm xs:text-base md:text-xl">
                    {iconLetter}
                  </span>
                )}
              </div> */}

              <div
                className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-600"
              >
                <Users className="w-3.5 h-3.5 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
              </div>

              {/* Title and Badge - Added padding-right logic here */}
              <div className={`flex-1 min-w-0 ${showNavigation ? 'pr-28 md:pr-36' : ''}`}>
                <h3 className="font-bold text-xs xs:text-base md:text-lg text-gray-900 mb-0.5 md:mb-1 truncate">
                  {/* {currentCollective.name} */}
                  My Collectives
                </h3>
                {/* {currentCollective.role === 'Admin' && (
                  <p className={`${currentCollective.role === 'Admin' ? 'bg-pink-100 text-red-600' : 'bg-[#a955f7] text-white'} text-[10px] xs:text-xs md:text-sm font-medium px-1.5 md:px-2 py-0.5 rounded-md whitespace-nowrap w-fit`}>
                    {currentCollective.role === 'Admin' ? 'Organizer' : currentCollective.role}
                  </p>
                )} */}
              </div>
            </div>

            {/* Content */}
            <div className="w-full text-left">
              <p className="text-xs xs:text-sm md:text-base font-medium text-gray-700 mb-2 md:mb-4 leading-relaxed text-left">
                <span onClick={() => navigate(`/g/${currentCollective.sort_name}`)} className="cursor-pointer text-gray-800 font-bold">{currentCollective.name} </span>
                has <span className="font-bold text-gray-800">{currentCollective.memberCount} {currentCollective.memberCount === 1 ? 'member' : 'members'}</span> donating{" "}
                to <span className="font-bold text-gray-800">{currentCollective.causeCount} {currentCollective.causeCount === 1 ? 'cause' : 'causes'}</span>.
              </p>

              {/* Action Buttons */}
              <div className="flex justify-start items-center gap-1.5 md:gap-2">
                <span
                  // className="text-[#1600ff] hover:text-[#1600ff]  text-base md:text-base font-semibold inline-flex items-center gap-1 hover:underline w-[35%] cursor-pointer"
                  className="text-[#1600ff] text-xs xs:text-sm   md:text-base font-semibold inline-flex items-center gap-1 hover:underline w-[35%] cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleButtonClick(); }}
                >
                  {isFounder ? "Manage" : "View"} <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2.5} />
                </span>
                {/* <Button
                  size="sm"
                  className="bg-[#1600ff] hover:bg-[#1400cc] text-white flex items-center justify-center gap-1 md:gap-1.5 text-sm md:text-base h-7 md:h-9 px-2 md:px-3 font-semibold w-[35%]"
                  onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }}
                >
                  Share
                </Button> */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      <SharePost
        url={window.location.origin + `/g/${currentCollective.sort_name}`}
        title={`Join ${currentCollective.name}`}
        description={`${currentCollective.memberCount} ${currentCollective.memberCount === 1 ? 'member' : 'members'} ${currentCollective.memberCount === 1 ? 'is' : 'are'} currently donating $${currentCollective.yearlyAmount.toLocaleString()} per year to ${currentCollective.causeCount} ${currentCollective.causeCount === 1 ? 'cause' : 'causes'}.`}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}