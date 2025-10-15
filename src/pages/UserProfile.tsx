import React, { useEffect, useState, useRef } from "react";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileBio from "../components/profile/ProfileBio";
import ProfileActivity from "../components/profile/ProfileActivity";
import ProfileNavbar from "../components/profile/ProfileNavbar";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import { profileActivity } from "../lib/profile/profileActivity";
import ProfileStats from "../components/profile/ProfileStats";
import { useLocation } from "react-router-dom";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Ellipsis,
  Share,
  Flag,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Toast } from "../components/ui/toast";

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
  const { imageUrl, name } = useLocation().state || { imageUrl: "", name: "" };
  const [showMenu, setShowMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
    if (isFollowing) {
      setToastMessage("Unfollowed");
    } else {
      setToastMessage("Followed");
    }
    setShowToast(true);
  };

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
      <ProfileNavbar title="Profile" />

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
        <Button
          onClick={handleFollowClick}
          variant={isFollowing ? "outline" : "default"}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      </div>

      <div className="md:grid md:grid-cols-12 md:gap-6 md:px-6 md:pt-2 md:pb-6">
        {/* Main Content */}
        <div className="md:col-span-12">
          <div className="flex flex-col space-y-4 px-4 md:px-0">
            <ProfileHeader
              avatarUrl={imageUrl}
              name={name}
              location="Atlanta, GA"
              link="thisisaurl.com"
            />
            <ProfileStats
              profileId="123"
              causes={10}
              crwds={3}
              followers={58}
              following={8}
            />
            
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
                <div key={i} className="flex flex-col items-center">
                  <img
                    src={src.image}
                    alt="org"
                    className="w-14 h-14 rounded-md first:ml-0"
                  />
                  <p className="text-xs font-semibold mt-1 text-gray-500">
                    {src.name}
                  </p>
                </div>
              ))}
            </div>

            <ProfileBio bio="This is a bio about Mya and how she likes to help others and give back to her community. She also loves ice cream." />
            
            <div className="py-4">
              <ProfileActivity
                title="Recent Activity"
                posts={profileActivity}
                showLoadMore={true}
              />
            </div>
          </div>
        </div>

        {/* Sidebar - Only visible on desktop */}
        <div className="hidden md:col-span-4">
          <ProfileSidebar />
        </div>
      </div>

      {/* Footer */}
      <div className="">
        <Footer />
      </div>

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
    </div>
  );
}
