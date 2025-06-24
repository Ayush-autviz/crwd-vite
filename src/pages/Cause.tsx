"use client";
import React, { useRef } from 'react';
import CauseHeader from '@/components/cause/CauseHeader';
import CauseProfileCard from '@/components/cause/CauseProfileCard';
import CauseRecentDonations from '@/components/cause/CauseRecentDonations';
import CauseAboutCard from '@/components/cause/CauseAboutCard';
import CauseDonateBar from '@/components/cause/CauseDonateBar';
import HighLights from '@/components/cause/highlight/HighLights';
import ProfileNavbar from '@/components/profile/ProfileNavbar';

const CausePage: React.FC = () => {
  const aboutCardRef = useRef<HTMLDivElement>(null);

  const scrollToAboutCard = () => {
    aboutCardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen md:h-full bg-white flex flex-col pb-28">
      {/* <CauseHeader /> */}
      <ProfileNavbar title="Helping Humanity" />
      <div className="flex flex-col space-y-6 py-4">
        <CauseProfileCard onLearnMoreClick={scrollToAboutCard} />
        <HighLights />
        <CauseRecentDonations />
        <div ref={aboutCardRef}>
          <CauseAboutCard />
        </div>
      </div>
      <CauseDonateBar />
    </div>
  );
};

export default CausePage;
