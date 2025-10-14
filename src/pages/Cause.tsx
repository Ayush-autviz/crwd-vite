"use client";
import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCauseById } from "@/services/api/crwd";
import CauseProfileCard from "@/components/cause/CauseProfileCard";
import CauseRecentDonations from "@/components/cause/CauseRecentDonations";
import CauseAboutCard from "@/components/cause/CauseAboutCard";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { SharePost } from "@/components/ui/SharePost";
import { Loader2 } from "lucide-react";

const CausePage: React.FC = () => {
  const aboutCardRef = useRef<HTMLDivElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const { causeId } = useLocation().state;
  
  // For demo purposes, using a hardcoded cause ID. In real app, this would come from route params or props
  // const causeId = "1"; // This should be dynamic based on your routing
  
  // Fetch cause data using React Query
  const { data: causeData, isLoading: isLoadingCause, error: causeError } = useQuery({
    queryKey: ['cause', causeId],
    queryFn: () => getCauseById(causeId),
    enabled: !!causeId,
  });

  const scrollToAboutCard = () => {
    aboutCardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Show loading state
  if (isLoadingCause) {
    return (
      <div className="min-h-screen md:h-full bg-white flex items-center justify-center">
        {/* <div className="flex items-center justify-center py-20"> */}
         <Loader2 className="w-8 h-8 animate-spin" />
        {/* </div> */}
      </div>
    );
  }

  // Show error state
  if (causeError) {
    return (
      <div className="min-h-screen md:h-full bg-white flex items-center justify-center">
        {/* <div className="flex items-center justify-center py-20"> */}
          <div className="text-lg text-red-500">Failed to load cause details</div>
        {/* </div> */}
      </div>
    );
  }

  return (
    <div className="min-h-screen md:h-full bg-white flex flex-col ">
      {/* <CauseHeader /> */}
      <ProfileNavbar title={"Nonprofit"} />
      <div className="flex items-center gap-2 pt-6 pb-4 px-4 sticky top-16 z-10 bg-white">
        <div className="text-lg font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
          Nonprofit
        </div>
        <div className="flex-grow" />
        <Button variant="secondary" onClick={() => setShowShareModal(true)}>
          {/* <Share2 size={20} /> */}
          Share
        </Button>

        <Link to="/donation">
          <Button>Donate</Button>
        </Link>
      </div>

      <div className="flex flex-col space-y-6 pt-4">
        <CauseProfileCard onLearnMoreClick={scrollToAboutCard} causeData={causeData} />
        {/* <HighLights /> */}
        <CauseRecentDonations showEmpty={true} />
        <div ref={aboutCardRef}>
          <CauseAboutCard causeData={causeData} />
        </div>
      </div>
      {/* <CauseDonateBar /> */}
      <SharePost
        url={window.location.origin + `/cause/`}
        title={`Check out this Nonprofit: ${causeData?.name || 'Cause'}`}
        description={causeData?.description || "Join us in supporting this important cause."}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Footer */}
      <div className="">
        <Footer />
      </div>
    </div>
  );
};

export default CausePage;
