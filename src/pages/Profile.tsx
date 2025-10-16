import { useEffect, useState, useRef } from "react";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileBio from "../components/profile/ProfileBio";
import Footer from "@/components/Footer";

import ProfileActivity from "../components/profile/ProfileActivity";
import ProfileNavbar from "../components/profile/ProfileNavbar";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileStats from "../components/profile/ProfileStats";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Ellipsis,
  Share,
  Flag,
  Pencil,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Toast } from "../components/ui/toast";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/services/api/auth";
import { getPosts } from "@/services/api/social";



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
  const [showToast, setShowToast] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch profile data using React Query
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: true,
  });

  const profileData = profileQuery.data?.user || {};

  // Fetch user posts
  const postsQuery = useQuery({
    queryKey: ['posts'],
    queryFn: () => getPosts(profileData.id, ''),
    enabled: !!profileData.id,
  });


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

  // Loading state
  if (profileQuery.isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (profileQuery.error) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error loading profile
          </h2>
          <p className="text-gray-600">
            {(profileQuery.error as any)?.response?.data?.message || profileQuery.error.message}
          </p>
          <Button
            onClick={() => profileQuery.refetch()}
            className="mt-4 bg-gray-900 text-white hover:bg-gray-800"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  console.log('postsQuery', postsQuery?.data?.results);

  // Extract profile data

  // Transform posts data to match PostDetail interface
  const userPosts = postsQuery?.data?.results?.map((post: any) => ({
    id: post.id,
    userId: post.user?.id,
    avatarUrl: post.user?.profile_picture || '/placeholder.svg',
    username: post.user?.username || post.user?.full_name || 'Unknown User',
    time: new Date(post.created_at).toLocaleDateString(),
    org: post.collective?.name || 'Unknown Collective',
    orgUrl: post.collective?.id,
    text: post.content || '',
    imageUrl: post.media || undefined,
    likes: post.likes_count || 0,
    comments: post.comments_count || 0,
    shares: 0, // API doesn't provide shares count
    isLiked: post.is_liked || false,
  })) || [];

  console.log('userPosts', userPosts);

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
              <Link
                to="/profile/edit"
              >
                <button onClick={() => {
                  setShowMenu(false);
                }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </button>
              </Link>
            </div>
          )}
        </div>
        {/* <Button
          onClick={handleFollowClick}
          variant={isFollowing ? "outline" : "default"}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button> */}
      </div>

      <div className="md:grid md:grid-cols-12 md:gap-6 md:px-6 md:pt-2 md:pb-6">
        {/* Main Content */}
        <div className="md:col-span-12">
          <div className="flex flex-col space-y-4 px-4 md:px-0">
            <ProfileHeader
              avatarUrl={profileData.profile_picture}
              name={profileData.full_name}
              location={profileData.location}
              link={profileData.username}
              activeSince={profileData.date_joined}
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

            <ProfileBio bio={profileData.bio} />
            <div className="py-4">
              <ProfileActivity
                // showLabel
                title="Recent Activity"
                posts={userPosts}
                showLoadMore={true}
                isLoading={postsQuery.isLoading}
                error={postsQuery.error}
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

      {/* Toast notification */}
      <Toast
        message="Profile updated successfully!"
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
    </div>
  );
}
