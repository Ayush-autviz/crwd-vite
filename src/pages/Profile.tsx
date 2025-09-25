import React, { useEffect, useState, useRef } from "react";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileBio from "../components/profile/ProfileBio";
import Footer from "@/components/Footer";

import ProfileInterests from "../components/profile/ProfileInterests";
import ProfileActivity from "../components/profile/ProfileActivity";
import ProfileRecentDonations from "../components/profile/ProfileRecentDonations";
import ProfileNavbar from "../components/profile/ProfileNavbar";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import { profileActivity } from "../lib/profile/profileActivity";
import ProfileStats from "../components/profile/ProfileStats";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Ellipsis,
  Share,
  Flag,
} from "lucide-react";
import { Link } from "react-router-dom";

const interestsData = [
  {
    id: 1,
    name: "Shriners Children",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/9/9d/Shriners_Hospitals_for_Children_Logo.svg/500px-Shriners_Hospitals_for_Children_Logo.svg.png",
    color: "#3B82F6",
  },
  {
    id: 2,
    name: "Change",
    image:
      "https://images.squarespace-cdn.com/content/v1/5fd7e20940f9b820fac1e013/d442cb1f-e175-4b8d-bc81-44102583a6a5/thumbnail-05.png",
    color: "#EF4444",
  },
  {
    id: 3,
    name: "The Water Trust",
    image:
      "https://media.licdn.com/dms/image/v2/C4E0BAQEHqcfGhnH29g/company-logo_200_200/company-logo_200_200/0/1630573980553/the_water_trust_logo?e=2147483647&v=beta&t=fjyZGioRcUDheVZH_f8dxxSvR7840DFgAp6XrGwo8hw",
    color: "#10B981",
  },
  {
    id: 4,
    name: "WWF",
    image:
      "https://i0.wp.com/acrossthegreen.com/wp-content/uploads/2021/03/75E8B176-DAFE-4956-ABC5-9F221ACB2094.png?fit=1020%2C680&ssl=1",
    color: "#F59E0B",
  },
];

const InterestCard = ({
  interest,
}: {
  interest: (typeof interestsData)[0];
}) => {
  return (
    <div className={`p-2 w-full bg-white rounded-lg overflow-hidden  `}>
      <img
        src={interest.image}
        alt={interest.name}
        className="w-4/5 h-12 md:h-16 mx-auto object-contain mb-2 md:mb-3"
      />
      <div className="p-1 md:p-2">
        <h3 className="text-xs md:text-sm font-medium text-gray-800 text-center leading-tight">
          {interest.name}
        </h3>
      </div>
    </div>
  );
};

const orgAvatars = [
  {
    name: "ASPCA",
    image: "/ngo/aspca.jpg",
  },
  {
    name: "CRI",
    image: "/ngo/CRI.jpg",
  },
  {
    name: "CureSearch",
    image: "/ngo/cureSearch.png",
  },
  {
    name: "Paws",
    image: "/ngo/paws.jpeg",
  },
];

export default function ProfilePage() {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="">
      <ProfileNavbar title="Me" />

      <div className="flex items-center gap-4 justify-end pt-6 pb-2 px-4 sticky top-16 z-10 bg-white">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 cursor-pointer rounded-full transition-colors"
          >
            <Ellipsis className="w-6 h-6" strokeWidth={3} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-md shadow-lg z-20 w-36">
              <button
                onClick={() => {
                  setShowMenu(false);
                  // Handle share profile
                  console.log("Share profile");
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Share className="h-4 w-4" />
                Share Profile
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  // Handle report profile
                  console.log("Report profile");
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
              >
                <Flag className="h-4 w-4" />
                Report Profile
              </button>
            </div>
          )}
        </div>
        <Button>Follow</Button>
      </div>

      <div className="md:grid md:grid-cols-12 md:gap-6 md:px-6 md:pt-2 md:pb-6">
        {/* Main Content */}
        <div className="md:col-span-12">
          <div className="flex flex-col space-y-4 px-4 md:px-0">
            <ProfileHeader
              avatarUrl="https://randomuser.me/api/portraits/women/44.jpg"
              name="Mya"
              location="Atlanta, GA"
              link="thisisaurl.com"
            />
            {/* <ProfileBio bio="This is a bio about Mya and how she likes to help others and give back to her community. She also loves ice cream." /> */}
            {/* <div className="flex justify-center md:justify-start gap-4">
              <Button className="bg-blue-500 text-white px-10">Follow</Button>
              <Button variant="outline" className=" px-10">
                <Share className="w-4 h-4" />
                Share Profile
              </Button>
            </div> */}
            <ProfileStats
              profileId="123"
              causes={10}
              crwds={3}
              followers={58}
              following={8}
            />
            {/* <ProfileInterests
              interests={[
                "Environment",
                "Food Insecurity",
                "Education",
                "Healthcare",
              ]}
            /> */}
            {/* <div className="py-4">
              <ProfileRecentDonations />
            </div> */}
            <div className="flex justify-between items-center px-4">
              <h2 className="text-lg font-semibold">Recently Supported</h2>
              <Link
                to="/interests"
                className="text-sm text-blue-500 underline flex items-center gap-1"
              >
                More
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-center px-4 justify-between">
              {orgAvatars.map((src, i) => (
                <div className="flex flex-col items-center">
                  <img
                    key={i}
                    src={src.image}
                    alt="org"
                    className="w-14 h-14 rounded-md   first:ml-0"
                  />
                  <p className="text-xs font-semibold  mt-1 text-gray-500">
                    {src.name}
                  </p>
                </div>
              ))}
            </div>

            <ProfileBio bio="This is a bio about Mya and how she likes to help others and give back to her community. She also loves ice cream." />
            <div className="py-4">
              <ProfileActivity
                // showLabel
                title="Recent Activity"
                posts={profileActivity}
                showLoadMore={true}
              />
            </div>
          </div>
        </div>

        {/* Sidebar - Only visible on desktop */}
        <div className="hidden  md:col-span-4">
          <ProfileSidebar />
        </div>
      </div>

      {/* Footer */}
      <div className="">
        <Footer />
      </div>
    </div>
  );
}
