import { useEffect, useState, useRef } from "react";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileBio from "../components/profile/ProfileBio";
import ProfileActivity from "../components/profile/ProfileActivity";
import ProfileNavbar from "../components/profile/ProfileNavbar";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileStats from "../components/profile/ProfileStats";
import { useLocation, useParams } from "react-router-dom";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfileById, followUserById, unfollowUserById } from "@/services/api/social";
import { useAuthStore } from "@/stores/store";


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
  const { imageUrl } = useLocation().state || { imageUrl: "" };
  const { userId } = useParams();
  const [showMenu, setShowMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === userId;

  // Fetch user profile
  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfileById(userId || ''),
    enabled: !!userId,
  });

  // Follow user mutation
  const followMutation = useMutation({
    mutationFn: () => followUserById(userId || ''),
    onSuccess: () => {
      setIsFollowing(true);
      setToastMessage("Followed successfully!");
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: (error) => {
      console.error('Error following user:', error);
      setToastMessage("Failed to follow user");
      setShowToast(true);
    },
  });

  // Unfollow user mutation
  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUserById(userId || ''),
    onSuccess: () => {
      setIsFollowing(false);
      setToastMessage("Unfollowed successfully!");
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: (error) => {
      console.error('Error unfollowing user:', error);
      setToastMessage("Failed to unfollow user");
      setShowToast(true);
    },
  });

  const handleFollowClick = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  // Initialize following state from API data
  useEffect(() => {
    if (userProfile) {
      setIsFollowing(userProfile.is_following || false);
    }
  }, [userProfile]);

  // Redirect to own profile if viewing own profile
  useEffect(() => {
    if (isOwnProfile) {
      window.location.href = '/profile';
    }
  }, [isOwnProfile]);

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
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load profile</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Don't render if no user profile data
  if (!userProfile) {
    return null;
  }

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
          disabled={followMutation.isPending || unfollowMutation.isPending}
        >
          {followMutation.isPending || unfollowMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isFollowing ? "Following" : "Follow"}
        </Button>
      </div>

      <div className="md:grid md:grid-cols-12 md:gap-6 md:px-6 md:pt-2 md:pb-6">
        {/* Main Content */}
        <div className="md:col-span-12">
          <div className="flex flex-col space-y-4 px-4 md:px-0">
            <ProfileHeader
              avatarUrl={userProfile.profile_picture || imageUrl}
              name={`${userProfile.first_name} ${userProfile.last_name}`}
              location={userProfile.location || "Location not specified"}
              activeSince={userProfile.date_joined || "Not specified"}
              link="thisisaurl.com"
            />
            <ProfileStats
              profileId={userProfile.id}
              causes={userProfile.favorite_causes_count || 0}
              crwds={userProfile.joined_collectives_count || 0}
              followers={userProfile.followers_count || 0}
              following={userProfile.following_count || 0}
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

            <ProfileBio bio={userProfile.bio || "No bio available"} />
            
            <div className="py-4">
              <ProfileActivity
                title="Recent Activity"
                posts={[]}
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
