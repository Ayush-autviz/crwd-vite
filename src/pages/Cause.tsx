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
import { useAuthStore } from "@/stores/store";

const CausePage: React.FC = () => {
  const aboutCardRef = useRef<HTMLDivElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const { causeId } = useLocation().state;
  const { user: currentUser } = useAuthStore();
  
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

  if (!currentUser?.id) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-md mx-auto p-8">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Sign in to view this Nonprofit
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Sign in to view your profile, manage your causes, and connect with your community.
          </p>
          
          {/* CTA Button */}
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Link to="/login" className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Continue
            </Link>
          </Button>
          
          {/* Additional Info */}
          <p className="text-sm text-gray-500 mt-6">
            Don't have an account? 
            <Link to="/claim-profile" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
              Create one here
            </Link>
          </p>
        </div>
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
