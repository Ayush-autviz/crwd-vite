"use client";
import React, { useRef, useState } from "react";
import CauseHeader from "@/components/cause/CauseHeader";
import CauseProfileCard from "@/components/cause/CauseProfileCard";
import CauseRecentDonations from "@/components/cause/CauseRecentDonations";
import CauseAboutCard from "@/components/cause/CauseAboutCard";
import CauseDonateBar from "@/components/cause/CauseDonateBar";
import HighLights from "@/components/cause/highlight/HighLights";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { SharePost } from "@/components/ui/SharePost";

const CausePage: React.FC = () => {
  const aboutCardRef = useRef<HTMLDivElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const scrollToAboutCard = () => {
    aboutCardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen md:h-full bg-white flex flex-col pb-28">
      {/* <CauseHeader /> */}
      <ProfileNavbar title="Helping Humanity" />
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
        <CauseProfileCard onLearnMoreClick={scrollToAboutCard} />
        {/* <HighLights /> */}
        <CauseRecentDonations showEmpty={true} />
        <div ref={aboutCardRef}>
          <CauseAboutCard />
        </div>
      </div>
      {/* <CauseDonateBar /> */}
      <SharePost
        url={window.location.origin + `/groupcrwd/`}
        title={`Check out this Nonprofit`}
        description="Join us in supporting families experiencing food insecurity in the greater Atlanta area."
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
};

export default CausePage;
