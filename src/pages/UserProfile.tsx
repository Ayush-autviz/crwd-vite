import React from "react";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileBio from "../components/profile/ProfileBio";

import ProfileInterests from "../components/profile/ProfileInterests";
import ProfileActivity from "../components/profile/ProfileActivity";
import ProfileNavbar from "../components/profile/ProfileNavbar";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import { profileActivity } from "../lib/profile/profileActivity";
import ProfileStats from "../components/profile/ProfileStats";
import { useLocation } from "react-router-dom";
import ProfileRecentDonations from "../components/profile/ProfileRecentDonations";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const { imageUrl, name } = useLocation().state || { imageUrl: "", name: "" };
  return (
    <div className="pb-16 md:pb-0">
      <ProfileNavbar title="Profile" />
      <div className="md:grid md:grid-cols-12 md:gap-6 md:p-6">
        {/* Main Content */}
        <div className="md:col-span-8">
          <div className="flex flex-col space-y-4 px-4 md:px-0">
            <ProfileHeader
              avatarUrl={imageUrl}
              name={name}
              location="Atlanta, GA"
              link="thisisaurl.com"
              follow={true}
            />
            <ProfileBio bio="This is a bio about Mya and how she likes to help others and give back to her community. She also loves ice cream." />
            <ProfileStats
              profileId="123"
              causes={10}
              crwds={3}
              followers={58}
              following={8}
            />
            <ProfileInterests
              interests={[
                "Environment",
                "Food Insecurity",
                "Education",
                "Healthcare",
              ]}
            />

            <div className="py-4">
              <ProfileRecentDonations />
            </div>

            <div className="py-4">
              <ProfileActivity
                imageUrl={imageUrl}
                posts={profileActivity}
                showLoadMore={true}
              />
            </div>
          </div>
        </div>

        {/* Sidebar - Only visible on desktop */}
        <div className="hidden md:block md:col-span-4">
          <ProfileSidebar extraInfo={false} />
        </div>
      </div>

      {/* Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
