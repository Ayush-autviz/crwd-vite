import React, { useEffect, useState, useRef } from "react";
import { SharePost } from "@/components/ui/SharePost";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import ProfileBio from "@/components/profile/ProfileBio";
import CommunityPostCard from "@/components/newHome/CommunityPostCard";
import {
  Loader2,
  ChevronLeft,
  Users,
  DoorOpenIcon,
  Share2Icon,
  Ellipsis,
  Heart,
  Pencil,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Toast } from "../components/ui/toast";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
// import { getProfile } from "@/services/api/auth";
import {
  getPosts,
  getUserProfileById,
  getSupportedCausesByUserId,
  getUserFollowers,
  getUserFollowing,
  followUserById,
  unfollowUserById,
} from "@/services/api/social";
import { getJoinCollective } from "@/services/api/crwd";
import { logout } from "@/services/api/auth";
import { useAuthStore } from "@/stores/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getDonationBox } from "@/services/api/donation";
import { queryClient } from "@/lib/react-query/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { truncateAtFirstPeriod } from "@/lib/utils";
import UserProfileHeader from "../components/profile/ProfileHeader";

// Avatar colors for consistent fallback styling (same as NewCreateCollective.tsx)
const avatarColors = [
  '#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3',
  '#FFC107', '#E91E63', '#00BCD4', '#8BC34A', '#FF5722',
  '#673AB7', '#009688', '#FFEB3B', '#795548', '#607D8B',
];

const getConsistentColor = (id: number | string, colors: string[]) => {
  const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getInitials = (firstName?: string, _lastName?: string, name?: string, username?: string) => {
  // if (firstName && lastName) {
  //   return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  // }
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  if (name) {
    const words = name.split(' ').filter(Boolean);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
    return words[0]?.charAt(0).toUpperCase() || 'U';
  }
  return username?.charAt(0).toUpperCase() || 'U';
};

export default function ProfilePage() {
  const [showMenu, setShowMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showStatsSheet, setShowStatsSheet] = useState(false);
  const [activeStatsTab, setActiveStatsTab] = useState<'causes' | 'following' | 'followers' | 'crwds'>('causes');
  const [showFounderSheet, setShowFounderSheet] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user: currentUser, logout: logoutStore } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    const from = location.state?.from;
    if (from === 'onboarding' || from === 'Login' || from === 'ClaimProfile' || location.key === 'default') {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

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
    // logoutMutation.mutate();
    // }
    logoutStore();
    queryClient.clear()
    navigate('/', { replace: true });
  };

  const [showShareModal, setShowShareModal] = useState(false);

  const handleShareProfile = () => {
    setShowMenu(false);
    setShowShareModal(true);
  };

  // // Fetch profile data using React Query
  // const profileQuery = useQuery({
  //   queryKey: ['profile'],
  //   queryFn: getProfile,
  //   enabled: true,
  // });

  // const profileData = profileQuery.data?.user || {};

  // gett user profile data
  const { data: profileData, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile', currentUser?.id],
    queryFn: () => getUserProfileById(currentUser?.id || ''),
    enabled: !!currentUser?.id,
  });

  const { data: donationBoxData, isLoading: donationBoxLoading } = useQuery({
    queryKey: ['donationBox'],
    queryFn: getDonationBox,
    enabled: !!currentUser?.id,
  });

  // Statistics bottom sheet queries
  const targetUserId = profileData?.id?.toString() || currentUser?.id?.toString() || '';

  const { data: statsCausesData, isLoading: statsCausesLoading } = useQuery({
    queryKey: ['supportedCauses', targetUserId],
    queryFn: () => getSupportedCausesByUserId(targetUserId),
    enabled: !!targetUserId && showStatsSheet && activeStatsTab === 'causes',
  });

  const { data: statsCollectivesData, isLoading: statsCollectivesLoading } = useQuery({
    queryKey: ['joinCollective', targetUserId],
    queryFn: () => getJoinCollective(targetUserId),
    enabled: !!targetUserId && showStatsSheet && activeStatsTab === 'crwds',
  });

  // Fetch all joined collectives to check for admin status
  const { data: allCollectivesData } = useQuery({
    queryKey: ['allCollectives', targetUserId],
    queryFn: () => getJoinCollective(targetUserId),
    enabled: !!targetUserId,
  });

  // Filter collectives to only show those where user is admin
  const adminCollectives = allCollectivesData?.data?.filter((item: any) => item.role === 'admin') || [];

  // Fetch admin collectives for founder bottom sheet (only when sheet is open)
  const { data: adminCollectivesData, isLoading: adminCollectivesLoading } = useQuery({
    queryKey: ['adminCollectives', targetUserId],
    queryFn: () => getJoinCollective(targetUserId),
    enabled: !!targetUserId && showFounderSheet,
  });

  // Filter collectives for bottom sheet to only show those where user is admin
  const adminCollectivesForSheet = adminCollectivesData?.data?.filter((item: any) => item.role === 'admin') || [];

  const { data: statsFollowersData, isLoading: statsFollowersLoading } = useQuery({
    queryKey: ['followers', targetUserId],
    queryFn: () => getUserFollowers(targetUserId),
    enabled: !!targetUserId && showStatsSheet && activeStatsTab === 'followers',
  });

  const { data: statsFollowingData, isLoading: statsFollowingLoading } = useQuery({
    queryKey: ['following', targetUserId],
    queryFn: () => getUserFollowing(targetUserId),
    enabled: !!targetUserId && showStatsSheet && activeStatsTab === 'following',
  });

  // Follow/Unfollow mutations
  const followUserMutation = useMutation({
    mutationFn: followUserById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', currentUser?.id] });
      // setToastMessage('Followed');
      setShowToast(true);
    },
    onError: (error) => {
      console.error('Error following user:', error);
      setToastMessage('Error following user');
      setShowToast(true);
    },
  });

  const unfollowUserMutation = useMutation({
    mutationFn: unfollowUserById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', currentUser?.id] });
      // setToastMessage('Unfollowed');
      setShowToast(true);
    },
    onError: (error) => {
      console.error('Error unfollowing user:', error);
      setToastMessage('Error unfollowing user');
      setShowToast(true);
    },
  });

  const handleFollowToggle = (userId: string, isFollowing: boolean) => {
    if (isFollowing) {
      unfollowUserMutation.mutate(userId);
    } else {
      followUserMutation.mutate(userId);
    }
  };

  const handleStatPress = (tab: 'causes' | 'following' | 'followers' | 'crwds') => {
    setActiveStatsTab(tab);
    setShowStatsSheet(true);
  };



  // Fetch user posts with pagination
  const {
    data: postsData,
    isLoading: postsLoading,
  } = useInfiniteQuery({
    queryKey: ['posts', currentUser?.id],
    queryFn: ({ pageParam = 1 }) => getPosts(currentUser?.id || '', '', pageParam),
    getNextPageParam: (lastPage) => {
      // Extract page number from next URL if available
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        const page = url.searchParams.get('page');
        return page ? parseInt(page) : undefined;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!currentUser?.id,
  });

  // Flatten pages into a single array
  const posts = postsData ? {
    results: postsData.pages.flatMap(page => page.results || []),
    next: postsData.pages[postsData.pages.length - 1]?.next || null,
    count: postsData.pages[0]?.count || 0,
  } : undefined;


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
        <div className="text-center max-w-md mx-auto p-4 md:p-8">
          {/* Icon */}
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
            Sign in to view your profile
          </h2>

          {/* Description */}
          <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 leading-relaxed">
            Sign in to view your profile, manage your causes, and connect with your community.
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
          >
            <Link to={`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`} className="flex items-center gap-1.5 md:gap-2">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Continue
            </Link>
          </Button>

          {/* Additional Info */}
          <p className="text-xs md:text-sm text-gray-500 mt-4 md:mt-6">
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
        <div className="flex items-center gap-2 md:gap-3 text-gray-600">
          <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
          <span className="text-sm md:text-base">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (profileError) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen">
        <div className="text-center py-8 md:py-10 px-4">
          <h2 className="text-lg md:text-xl font-semibold text-red-600 mb-2">
            Error loading profile
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            {(profileError as any)?.response?.data?.message || profileError.message}
          </p>
          <Button
            onClick={() => refetchProfile()}
            className="mt-3 md:mt-4 bg-gray-900 text-white hover:bg-gray-800 text-sm md:text-base py-2 md:py-2.5 px-4 md:px-6"
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

  // Transform posts data to match CommunityPostCard format
  const userPosts = posts?.results?.map((post: any) => ({
    id: post.id,
    user: {
      id: post.user?.id,
      name: post.user?.first_name && post.user?.last_name
        ? `${post.user.first_name} ${post.user.last_name}`
        : post.user?.username || 'Unknown User',
      firstName: post.user?.first_name,
      lastName: post.user?.last_name,
      username: post.user?.username || '',
      avatar: post.user?.profile_picture || '',
      color: post.user?.color || '',
    },
    collective: post.collective
      ? {
        name: post.collective.name,
        id: post.collective.id,
        sort_name: post.collective.sort_name,
      }
      : undefined,
    content: post.content || '',
    imageUrl: post.media || undefined,
    likes: post.likes_count || 0,
    comments: post.comments_count || 0,
    isLiked: post.is_liked || false,
    timestamp: post.created_at,
    mentions: post.mentions,
    previewDetails: post.preview_details || post.previewDetails ? {
      url: post.preview_details?.url || post.previewDetails?.url,
      title: post.preview_details?.title || post.previewDetails?.title,
      description: post.preview_details?.description || post.previewDetails?.description,
      image: post.preview_details?.image || post.previewDetails?.image,
      site_name: post.preview_details?.site_name || post.previewDetails?.site_name,
      domain: post.preview_details?.domain || post.previewDetails?.domain,
    } : undefined,
  })) || [];

  return (
    <div className="bg-white min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full flex items-center justify-between h-16 px-3 bg-white border-b transition-colors">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-1 -ml-1 text-gray-700 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">{fullName}</h1>
        </div>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-gray-700 hover:bg-gray-100 rounded-full">
            <Ellipsis size={20} strokeWidth={3} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] w-44 py-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <button
                onClick={() => { setShowMenu(false); handleShareProfile(); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Share2Icon size={16} /> Share Profile
              </button>
              <button
                onClick={() => { setShowMenu(false); handleLogout(); }}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gray-50 transition-colors"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="animate-spin text-red-600" size={16} />
                ) : (
                  <DoorOpenIcon size={16} />
                )}
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Activate Donation Box Prompt */}
      {!donationBoxData?.is_active && !donationBoxLoading && (
        <div
          onClick={() => navigate("/donation")}
          className="sticky top-16 z-20 w-full bg-red-50/95 backdrop-blur-md border-b border-red-100 py-3 flex justify-center shadow-sm transition-all hover:bg-red-50 cursor-pointer"
        >
          <div className="text-red-500 hover:text-red-600 font-semibold text-sm flex items-center gap-2 group">
            <Heart size={16} color="#EF4444" fill="#EF4444" />
            Activate your Donation Box
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* User Info Section */}
        <section className="px-4 py-6 space-y-5">
          <UserProfileHeader
            profileData={profileData}
            profilePicture={profileData?.profile_picture}
            firstName={profileData?.first_name}
            lastName={profileData?.last_name}
            username={profileData?.username}
            fullName={fullName}
            location={profileData?.location}
            followersCount={profileData?.followers_count}
            followingCount={profileData?.following_count}
            getInitials={getInitials}
            onStatPress={handleStatPress}
            isOwnProfile={true}
          />

          {/* Bio */}
          {profileData?.bio ? (
            <ProfileBio bio={profileData?.bio} />
          ) : (
            <button
              onClick={() => navigate("/settings")}
              className="text-sm font-semibold text-[#2222EE] hover:underline block mb-4"
            >
              Add a bio
            </button>
          )}

          {/* {profileData?.inspired_people_count > 0 && (
                <p className="text-xs md:text-sm lg:text-base mx-auto font-bold text-gray-900">{profileData?.inspired_people_count} {profileData?.inspired_people_count === 1 ? 'Person' : 'People'} Inspired</p>
              )} */}

          {/* Button */}
          <Button
            onClick={() => navigate("/settings")}
            variant="outline"
            className="w-full h-11 border border-gray-400 rounded-lg text-base font-semibold text-gray-900 hover:bg-gray-50"
          >
            Edit Profile
          </Button>
        </section>

        {/* Donation Box Section */}
        {profileData?.supported_causes_count > 0 && (
          <section className="border-t border-gray-200 pt-6 pb-2">
            <div
              className="px-4 mb-4 cursor-pointer"
              onClick={() => handleStatPress('causes')}
            >
              <h3 className="text-xs md:text-sm font-bold text-gray-500 hover:text-gray-700 uppercase">
                DONATION BOX · {profileData?.supported_causes_count || 0} NONPROFITS
              </h3>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 px-4 pb-4">
              {profileData?.recently_supported_causes?.slice(0, 3).map((cause: any) => (
                <Link
                  key={cause.id}
                  to={`/c/${cause.sort_name}`}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 sm:p-3 md:p-4 min-h-[96px] sm:min-h-[110px] md:min-h-[132px] flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 md:space-y-2.5 hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 !rounded-lg flex-shrink-0 border-none">
                    <AvatarImage src={cause.imasge || cause.lsogo} className="object-cover" />
                    <AvatarFallback
                      className="text-sm sm:text-base md:text-lg font-bold text-white border-none rounded-md"
                      style={{ backgroundColor: getConsistentColor(cause.id, avatarColors) }}
                    >
                      {cause.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 text-center leading-tight break-words">
                    {cause?.name || 'N'}
                  </span>
                </Link>
              ))}
              {profileData?.supported_causes_count > 3 && (
                <button
                  onClick={() => handleStatPress('causes')}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-lg p-2 sm:p-3 md:p-4 min-h-[96px] sm:min-h-[110px] md:min-h-[132px] flex items-center justify-center text-sm sm:text-base font-bold text-gray-600 hover:bg-gray-100 text-center"
                >
                  +{profileData.supported_causes_count - 3}
                </button>
              )}
              {(!profileData?.recently_supported_causes || profileData.recently_supported_causes.length === 0) && (
                <p className="text-sm text-gray-400 px-2">No nonprofits added yet.</p>
              )}
            </div>
          </section>
        )}

        {/* Groups Section */}
        {allCollectivesData?.data?.length > 0 && (
          <section className="border-t border-gray-200 pt-6 pb-2">
            <div
              className="px-4 mb-4 cursor-pointer  "
              onClick={() => handleStatPress('crwds')}
            >
              <h3 className="text-xs md:text-sm font-bold text-gray-500 hover:text-gray-700 uppercase">
                GROUPS · {allCollectivesData?.data?.length || 0}
              </h3>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 px-4 pb-4">
              {allCollectivesData?.data && allCollectivesData.data.length > 0 ? (
                allCollectivesData.data.slice(0, 3).map((item: any) => {
                  const collective = item.collective || item;
                  const hasLogo = collective.logo && (collective.logo.startsWith("http") || collective.logo.startsWith("/") || collective.logo.startsWith("data:"));
                  const imageUrl = hasLogo ? collective.logo : (collective.image || collective.avatar || undefined);
                  const iconColor = collective.color || (!hasLogo ? getConsistentColor(collective.id || collective.name, avatarColors) : undefined);

                  return (
                    <Link
                      key={collective.id}
                      to={`/g/${collective.sort_name}`}
                      className="w-full bg-white border border-gray-200 rounded-md p-2 sm:p-3 md:p-4 min-h-[96px] sm:min-h-[110px] md:min-h-[132px] flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 md:space-y-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-md flex-shrink-0 border-none">
                        <AvatarImage src={imageUrl} className="object-cover" />
                        <AvatarFallback
                          className="text-sm sm:text-base md:text-lg font-bold text-white border-none rounded-md"
                          style={iconColor ? { backgroundColor: iconColor } : { backgroundColor: '#E4F8F0', color: '#106D4E' }}
                        >
                          {collective.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 text-center leading-tight break-words">
                        {collective.name}
                      </span>
                    </Link>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400 px-2">No groups created yet.</p>
              )}
              {(allCollectivesData?.data?.length || 0) > 3 && (
                <button
                  onClick={() => handleStatPress('crwds')}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-md p-2 sm:p-3 md:p-4 min-h-[96px] sm:min-h-[110px] md:min-h-[132px] flex items-center justify-center text-sm sm:text-base font-bold text-gray-600 hover:bg-gray-100 text-center"
                >
                  +{(allCollectivesData?.data?.length || 0) - 3}
                </button>
              )}
            </div>
          </section>
        )}

        <section className="border-t border-gray-200 pt-6 pb-20">
          <div className="px-4  mb-2">
            {userPosts.length > 0 && (
              <>
                <h3 className="text-xs md:text-sm font-bold text-gray-500 uppercase">
                  POSTS
                </h3>
              </>
            )}
          </div>

          <div className="px-4">
            {postsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post: any) => (
                  <CommunityPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  Updates will appear here as you share and interact in your Giving Groups. Join a new group to get started!
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />

      {/* Statistics Bottom Sheet */}
      <Sheet open={showStatsSheet} onOpenChange={setShowStatsSheet}>
        <SheetContent side="bottom" className="h-[85vh] max-h-[85vh] p-0 flex flex-col rounded-t-3xl">
          {/* Drag Handle */}
          <div className="flex justify-center pt-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          <div className="px-3 md:px-4">
            <SheetHeader className="py-0">
              <SheetTitle className="text-xl  font-bold text-gray-900">
                {activeStatsTab === 'causes' && 'All Nonprofits'}
                {activeStatsTab === 'crwds' && 'Giving Groups'}
                {activeStatsTab === 'followers' && 'Followers'}
                {activeStatsTab === 'following' && 'Following'}
              </SheetTitle>
              <SheetDescription className="text-xs md:text-sm text-gray-500">
                {activeStatsTab === 'causes' && 'All nonprofits that you support'}
                {activeStatsTab === 'crwds' && "Giving Groups you're part of"}
                {activeStatsTab === 'followers' && 'People following you'}
                {activeStatsTab === 'following' && "People you're following"}
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Tabs */}
          <div className="px-1 md:px-4">
            <div className="flex justify-between gap-0.5 bg-gray-100 rounded-2xl p-0.5 md:p-1">
              {[
                { label: 'Nonprofits', value: 'causes' },
                { label: 'Groups', value: 'crwds' },
                { label: 'Followers', value: 'followers' },
                { label: 'Following', value: 'following' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveStatsTab(tab.value as typeof activeStatsTab)}
                  className={`flex-1 px-1.5 sm:px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[10px] xs:text-xs sm:text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${activeStatsTab === tab.value
                    ? 'bg-white text-gray-900'
                    : 'text-gray-600'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-3 md:px-4 pb-4 md:pb-6">
            {activeStatsTab === 'causes' && (
              <>
                {statsCausesLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 md:py-10">
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-blue-600" />
                    <p className="text-xs md:text-sm text-gray-600 mt-2 md:mt-2.5">Loading nonprofits...</p>
                  </div>
                ) : statsCausesData?.results?.length > 0 ? (
                  <div className="space-y-0">
                    {statsCausesData.results.map((item: any, index: number) => {
                      const cause = item.cause || item;
                      const causeBgColor = getConsistentColor(cause.id || cause.name || 'N', avatarColors);

                      return (
                        <Link
                          key={cause.id || index}
                          to={`/c/${cause.sort_name}`}
                          onClick={() => setShowStatsSheet(false)}
                          className="flex items-center gap-2.5 md:gap-3 py-3 md:py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          {cause.image || cause.logo ? (
                            <Avatar className="w-10 h-10 md:w-12 md:h-12 !rounded-lg flex-shrink-0">
                              <AvatarImage src={cause.image || cause.logo} alt={cause.name} />
                              <AvatarFallback
                                style={{ backgroundColor: causeBgColor }}
                                className="text-white !rounded-lg font-bold text-base md:text-lg"
                              >
                                {cause.name?.charAt(0)?.toUpperCase() || 'N'}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div
                              className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: causeBgColor }}
                            >
                              <span className="text-lg md:text-xl font-bold text-white">
                                {cause.name?.charAt(0)?.toUpperCase() || 'N'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm md:text-base font-semibold text-gray-900 mb-0.5 md:mb-1">
                              {cause.name || 'Unknown Cause'}
                            </p>
                            <p className="text-xs md:text-sm text-gray-500">
                              {truncateAtFirstPeriod(cause.mission || 'Supporting this cause')}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 md:py-10">
                    <p className="text-xs md:text-sm text-gray-500">No nonprofits found</p>
                  </div>
                )}
              </>
            )}

            {activeStatsTab === 'crwds' && (
              <>
                {statsCollectivesLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 md:py-10">
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-blue-600" />
                    <p className="text-xs md:text-sm text-gray-600 mt-2 md:mt-2.5">Loading Giving Groups...</p>
                  </div>
                ) : statsCollectivesData?.data?.length > 0 ? (
                  <div className="space-y-0">
                    {statsCollectivesData.data.map((item: any, index: number) => {
                      const collective = item.collective || item;

                      // Priority: 1. Use color from API, 2. Use logo, 3. Fallback to generated color with letter
                      const hasColor = collective.color;
                      const hasLogo = collective.logo && (collective.logo.startsWith("http") || collective.logo.startsWith("/") || collective.logo.startsWith("data:"));
                      const iconColor = hasColor || (!hasLogo ? getConsistentColor(collective.id || collective.name, avatarColors) : undefined);
                      const iconLetter = collective.name?.charAt(0)?.toUpperCase() || 'N';
                      const imageUrl = hasLogo ? collective.logo : (collective.image || collective.avatar || undefined);

                      return (
                        <div
                          key={collective.id || index}
                          className="flex items-center justify-between py-2.5 md:py-3 border-b border-gray-100 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Link
                            to={`/g/${collective.sort_name}`}
                            onClick={() => setShowStatsSheet(false)}
                            className="flex items-center gap-2.5 md:gap-3 flex-1 min-w-0"
                          >
                            <Avatar className="w-9 h-9 md:w-10 md:h-10 flex-shrink-0 !rounded-lg">
                              <AvatarImage src={imageUrl} alt={collective.name} />
                              <AvatarFallback
                                style={iconColor ? { backgroundColor: iconColor } : {}}
                                className="!rounded-lg text-white font-bold text-xs md:text-sm"
                              >
                                {iconLetter}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm md:text-base font-semibold text-gray-900 mb-0.5 md:mb-1">
                                {collective.name || 'Unknown Collective'}
                              </p>
                              <p className="text-xs md:text-sm text-gray-500 line-clamp-1">
                                {collective.member_count || 0} members
                              </p>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 md:py-10">
                    <p className="text-xs md:text-sm text-gray-500">No Giving Groups found</p>
                  </div>
                )}
              </>
            )}

            {activeStatsTab === 'followers' && (
              <>
                {statsFollowersLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 md:py-10">
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-blue-600" />
                    <p className="text-xs md:text-sm text-gray-600 mt-2 md:mt-2.5">Loading followers...</p>
                  </div>
                ) : statsFollowersData?.followers?.length > 0 ? (
                  <div className="space-y-0">
                    {statsFollowersData.followers.map((item: any, index: number) => {
                      const userData = item.follower || item.user || item;
                      const isFollowing = item.is_following ?? userData.is_following ?? false;
                      return (
                        <div
                          key={userData.id || index}
                          className="flex items-center justify-between py-2.5 md:py-3 border-b border-gray-100"
                        >
                          <Link
                            to={`/u/${userData.username}`}
                            onClick={() => setShowStatsSheet(false)}
                            className="flex items-center gap-2.5 md:gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <Avatar className="w-9 h-9 md:w-10 md:h-10 flex-shrink-0">
                              <AvatarImage src={userData.profile_picture || userData.avatar} />
                              <AvatarFallback
                                style={{ backgroundColor: userData.color || getConsistentColor(userData.id || userData.username || 'U', avatarColors) }}
                                className="text-white text-xs md:text-sm font-semibold"
                              >
                                {getInitials(userData.first_name, userData.last_name, userData.name, userData.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm md:text-base font-semibold text-gray-900">
                                {userData.first_name && userData.last_name
                                  ? `${userData.first_name} ${userData.last_name}`
                                  : userData.first_name || userData.name || 'Unknown User'}
                              </p>
                              <p className="text-xs md:text-sm text-gray-500 line-clamp-1">{userData.bio || userData.location}</p>
                            </div>
                          </Link>
                          {userData.id !== currentUser?.id && (
                            <Button
                              onClick={() => handleFollowToggle(userData.id.toString(), isFollowing)}
                              disabled={followUserMutation.isPending || unfollowUserMutation.isPending}
                              className={`text-[10px] md:text-xs px-3 md:px-4 py-1.5 md:py-2 rounded-full ${isFollowing
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                              {isFollowing ? 'Following' : 'Follow'}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 md:py-10">
                    <p className="text-xs md:text-sm text-gray-500">No followers found</p>
                  </div>
                )}
              </>
            )}

            {activeStatsTab === 'following' && (
              <>
                {statsFollowingLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 md:py-10">
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-blue-600" />
                    <p className="text-xs md:text-sm text-gray-600 mt-2 md:mt-2.5">Loading following...</p>
                  </div>
                ) : statsFollowingData?.following?.length > 0 ? (
                  <div className="space-y-0">
                    {statsFollowingData.following.map((item: any, index: number) => {
                      const userData = item.followee || item.following || item.user || item;
                      const isFollowing = true; // Always true for following tab
                      return (
                        <div
                          key={userData.id || index}
                          className="flex items-center justify-between py-2.5 md:py-3 border-b border-gray-100"
                        >
                          <Link
                            to={`/u/${userData.username}`}
                            onClick={() => setShowStatsSheet(false)}
                            className="flex items-center gap-2.5 md:gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <Avatar className="w-9 h-9 md:w-10 md:h-10 flex-shrink-0">
                              <AvatarImage src={userData.profile_picture || userData.avatar} />
                              <AvatarFallback
                                style={{ backgroundColor: userData.color || getConsistentColor(userData.id || userData.username || 'U', avatarColors) }}
                                className="text-white text-xs md:text-sm font-semibold"
                              >
                                {getInitials(userData.first_name, userData.last_name, userData.name, userData.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm md:text-base font-semibold text-gray-900">
                                {userData.first_name && userData.last_name
                                  ? `${userData.first_name} ${userData.last_name}`
                                  : userData.first_name || userData.name || 'Unknown User'}
                              </p>
                              <p className="text-xs md:text-sm text-gray-500 line-clamp-1">{userData.bio || userData.location}</p>
                            </div>
                          </Link>
                          {userData.id !== currentUser?.id && (
                            <Button
                              onClick={() => handleFollowToggle(userData.id.toString(), isFollowing)}
                              disabled={followUserMutation.isPending || unfollowUserMutation.isPending}
                              className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-[10px] md:text-xs px-3 md:px-4 py-1.5 md:py-2 rounded-full"
                            >
                              Following
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 md:py-10">
                    <p className="text-xs md:text-sm text-gray-500">No following found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Founder Collectives Bottom Sheet */}
      <Sheet open={showFounderSheet} onOpenChange={setShowFounderSheet}>
        <SheetContent side="bottom" className="max-h-[85vh] p-0 flex flex-col rounded-t-3xl">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 md:pb-6">
            {/* Header */}
            <div className="mb-4 md:mb-6">
              <p className="text-sm md:text-base text-gray-500">
                Giving Groups founded by {fullName}
              </p>
            </div>

            {adminCollectivesLoading ? (
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 animate-pulse"
                  >
                    <div className="flex items-start gap-3 md:gap-4">
                      {/* Avatar Skeleton */}
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-200 rounded-lg flex-shrink-0" />
                      {/* Text Skeleton */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 md:h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 md:h-4 bg-gray-200 rounded w-full" />
                        <div className="h-3 md:h-4 bg-gray-200 rounded w-5/6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : adminCollectivesForSheet.length > 0 ? (
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {adminCollectivesForSheet.map((item: any, index: number) => {
                  const collective = item.collective || item;

                  // Priority: 1. Use color from API, 2. Use logo, 3. Fallback to generated color with letter
                  const hasColor = collective.color;
                  const hasLogo = collective.logo && (collective.logo.startsWith("http") || collective.logo.startsWith("/") || collective.logo.startsWith("data:"));
                  const iconColor = hasColor || (!hasLogo ? getConsistentColor(collective.id || collective.name, avatarColors) : undefined);
                  const iconLetter = collective.name?.charAt(0)?.toUpperCase() || 'N';
                  const imageUrl = hasLogo ? collective.logo : (collective.image || collective.avatar || undefined);

                  return (
                    <div
                      key={collective.id || index}
                      onClick={() => {
                        setShowFounderSheet(false);
                        navigate(`/g/${collective.sort_name}`);
                      }}
                      className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        {/* Avatar */}
                        <Avatar className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 rounded-lg">
                          <AvatarImage src={imageUrl} alt={collective.name} />
                          <AvatarFallback
                            style={iconColor ? { backgroundColor: iconColor } : {}}
                            className="rounded-lg text-white font-bold text-sm md:text-base"
                          >
                            {iconLetter}
                          </AvatarFallback>
                        </Avatar>
                        {/* Collective Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-1 md:mb-2">
                            {collective.name || 'Unknown Collective'}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                            {collective.description || 'No description available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 md:py-10">
                <p className="text-xs md:text-sm text-gray-500">No collectives found</p>
              </div>
            )}

            {/* Motivational Message */}
            {adminCollectivesForSheet.length > 0 && (
              <div className="text-center mb-4 md:mb-6">
                <p className="text-xs md:text-sm text-gray-500">
                  Keep building your impact! Create another Collective to bring even more people together.
                </p>
              </div>
            )}

            {/* Create Another Collective Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setShowFounderSheet(false);
                  navigate('/create-crwd');
                }}
                className="w-full px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-semibold bg-[#1600ff] hover:bg-[#1400cc] text-white rounded-lg"
              >
                Create Another Collective
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Share Modal */}
      <SharePost
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={`${window.location.origin}/u/${currentUser?.username}`}
        title={`Check out ${fullName}'s profile on CRWD`}
        description={`See the causes and collectives supported by ${fullName} on CRWD.`}
      />

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
