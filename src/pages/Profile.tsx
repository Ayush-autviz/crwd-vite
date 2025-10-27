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
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "../components/ui/toast";
import { useQuery, useMutation } from "@tanstack/react-query";
// import { getProfile } from "@/services/api/auth";
import { getPosts, getUserProfileById } from "@/services/api/social";
import { logout } from "@/services/api/auth";
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
  const [showMenu, setShowMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const { user: currentUser, logout: logoutStore } = useAuthStore();
  const navigate = useNavigate();

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      console.log('Logout successful');
      // Clear auth store
      logoutStore();
      // Show success message
      setToastMessage("Logged out successfully!");
      setShowToast(true);
      // Navigate to login page after a short delay
      // setTimeout(() => {
        navigate('/login', { replace: true });
      // }, 1500);
    },
    onError: (error: any) => {
      console.error('Logout error:', error);
      setToastMessage(`Logout failed: ${error.response?.data?.message || error.message}`);
      setShowToast(true);
    },
  });

  const handleLogout = () => {
    // if (window.confirm('Are you sure you want to logout?')) {
      logoutMutation.mutate();
    // }
  };

  // // Fetch profile data using React Query
  // const profileQuery = useQuery({
  //   queryKey: ['profile'],
  //   queryFn: getProfile,
  //   enabled: true,
  // });

  // const profileData = profileQuery.data?.user || {};

  // gett user profile data
  const {data: profileData, isLoading: profileLoading, error: profileError, refetch: refetchProfile} = useQuery({
    queryKey: ['userProfile', currentUser?.id],
    queryFn: () => getUserProfileById(currentUser?.id || ''),
    enabled: !!currentUser?.id,
  });



  // Fetch user posts
  const postsQuery = useQuery({
    queryKey: ['posts', currentUser?.id],
    queryFn: () => getPosts(currentUser?.id || '', ''),
    enabled: !!currentUser?.id,
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
            Sign in to view your profile
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

  // Loading state
  if (profileLoading) {
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
  if (profileError) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error loading profile
          </h2>
          <p className="text-gray-600">
            {(profileError as any)?.response?.data?.message || profileError.message}
          </p>
          <Button
            onClick={() => refetchProfile()}
            className="mt-4 bg-gray-900 text-white hover:bg-gray-800"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }


  // Extract profile data and construct full name
  const fullName = profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : '';
  const activeSince = profileData?.date_joined;

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
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleLogout();
                }}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </button>
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
              avatarUrl={profileData?.profile_picture || '/placeholder.svg'}
              name={fullName}
              location={profileData?.location || 'No location specified'}
              link={profileData?.username || ''}
              activeSince={activeSince}
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
              profileId={profileData?.id?.toString() || ''}
              causes={profileData?.favorite_causes_count || 0}
              crwds={profileData?.joined_collectives_count || 0}
              followers={profileData?.followers_count || 0}
              following={profileData?.following_count || 0}
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

            <ProfileBio bio={profileData?.bio || 'No bio available'} />
            <div className="py-4">
              <ProfileActivity
                // showLabel
                title="Recent Activity"
                posts={userPosts}
                showLoadMore={postsQuery.data?.next}
                // onLoadMore={handleLoadMore}
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
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  );
}
