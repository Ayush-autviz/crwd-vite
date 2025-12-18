import { useEffect, useState, useRef } from "react";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileBio from "../components/profile/ProfileBio";
import ProfileActivity from "../components/profile/ProfileActivity";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileStats from "../components/profile/ProfileStats";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Ellipsis,
  Share,
  Flag,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Toast } from "../components/ui/toast";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  getUserProfileById,
  followUserById,
  unfollowUserById,
  getPosts,
  getSupportedCausesByUserId,
  getUserFollowers,
  getUserFollowing,
} from "@/services/api/social";
import { getJoinCollective } from "@/services/api/crwd";
import { useAuthStore } from "@/stores/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function ProfilePage() {
  const { imageUrl } = useLocation().state || { imageUrl: "" };
  const { userId } = useParams();
  const [showMenu, setShowMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showStatsSheet, setShowStatsSheet] = useState(false);
  const [activeStatsTab, setActiveStatsTab] = useState<'causes' | 'crwds' | 'followers' | 'following'>('causes');
  const menuRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // Check if viewing own profile
  const isOwnProfile = currentUser?.id == userId;

  // Fetch user profile
  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfileById(userId || ''),
    enabled: !!userId,
  });

  // Fetch user posts with pagination
  const {
    data: postsData,
    isLoading: postsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts', userId],
    queryFn: ({ pageParam = 1 }) => getPosts(userId || '', '', pageParam),
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
    enabled: !!userId,
  });

  // Flatten pages into a single array
  const posts = postsData ? {
    results: postsData.pages.flatMap(page => page.results || []),
    next: postsData.pages[postsData.pages.length - 1]?.next || null,
    count: postsData.pages[0]?.count || 0,
  } : undefined;

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
    if (!currentUser?.id) {
      navigate('/onboarding');
      return;
    }
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const handleShareProfile = async () => {
    try {
      const profileUrl = `${window.location.origin}/user-profile/${userId}`;
      await navigator.clipboard.writeText(profileUrl);
      setToastMessage("Profile link copied to clipboard");
      setShowToast(true);
      setShowMenu(false);
    } catch (err) {
      console.error("Failed to copy profile link:", err);
      setToastMessage("Failed to copy profile link");
      setShowToast(true);
    }
  };

  // Statistics bottom sheet queries
  const targetUserId = userProfile?.id?.toString() || userId || '';

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

  // Follow/Unfollow mutations for users in bottom sheet
  const followUserMutation = useMutation({
    mutationFn: followUserById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['following', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      setToastMessage('Followed');
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
      queryClient.invalidateQueries({ queryKey: ['followers', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['following', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      setToastMessage('Unfollowed');
      setShowToast(true);
    },
    onError: (error) => {
      console.error('Error unfollowing user:', error);
      setToastMessage('Error unfollowing user');
      setShowToast(true);
    },
  });

  const handleFollowToggle = (targetUserId: string, isCurrentlyFollowing: boolean) => {
    if (isCurrentlyFollowing) {
      unfollowUserMutation.mutate(targetUserId);
    } else {
      followUserMutation.mutate(targetUserId);
    }
  };

  const handleStatPress = (tab: 'causes' | 'following' | 'followers' | 'crwds') => {
    setActiveStatsTab(tab);
    setShowStatsSheet(true);
  };

  // Initialize following state from API data
  useEffect(() => {
    if (userProfile) {
      setIsFollowing(userProfile.is_following || false);
    }
  }, [userProfile]);

  // Transform posts data to match PostDetail interface
  const userPosts = posts?.results?.map((post: any) => ({
    id: post.id,
    userId: post.user?.id,
    avatarUrl: post.user?.profile_picture || '/placeholder.svg',
    username: post.user?.username || post.user?.full_name || 'Unknown User',
    time: new Date(post.created_at).toLocaleDateString(),
    org: post.collective?.name || 'Unknown Collective',
    orgUrl: post.collective?.id,
    text: post.content || '',
    imageUrl: post.media || undefined,
    previewDetails: post.preview_details || null,
    likes: post.likes_count || 0,
    comments: post.comments_count || 0,
    shares: 0, // API doesn't provide shares count
    isLiked: post.is_liked || false,
  })) || [];

  // Redirect to own profile if viewing own profile
  useEffect(() => {
    if (isOwnProfile) {
      navigate('/profile', { replace: true });
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

  // Get user full name
  const fullName = userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : '';

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Header with back arrow, name, and menu dots */}
      <div className="sticky top-0 z-10 w-full flex items-center justify-between px-4 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-xl text-gray-900">
            {fullName || userProfile?.username || 'Profile'}
          </h1>
        </div>
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
                onClick={handleShareProfile}
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
      </div>

          <div className="md:max-w-[60%] mx-auto">
      <div className="md:grid md:grid-cols-12 md:gap-6 md:px-6 md:pt-2 md:pb-6">
        {/* Main Content */}
        <div className="md:col-span-12">
          <div className="flex flex-col space-y-4 px-4 md:px-0">
            <ProfileHeader
              avatarUrl={userProfile.profile_picture || imageUrl}
              name={`${userProfile.first_name} ${userProfile.last_name}`}
              location={userProfile.location || "Location not specified"}
              activeSince={userProfile.date_joined || "Not specified"}
              link={userProfile.username || ''}
            />


            <Button
              onClick={handleFollowClick}
              className="w-fit mx-auto px-10"
              variant={isFollowing ? "outline" : "default"}
              disabled={followMutation.isPending || unfollowMutation.isPending}
            >
              {followMutation.isPending || unfollowMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isFollowing ? "Following" : "Follow"}
            </Button>

            <ProfileStats
              profileId={userProfile.id?.toString() || ''}
              causes={userProfile.supported_causes_count || 0}
              crwds={userProfile.joined_collectives_count || 0}
              followers={userProfile.followers_count || 0}
              following={userProfile.following_count || 0}
              isLoadingCauses={isLoading}
              isLoadingCrwds={isLoading}
              isLoadingFollowers={isLoading}
              isLoadingFollowing={isLoading}
              onStatPress={handleStatPress}
            />

            {/* Divider */}
            <div className="h-px bg-gray-200 mx-2 mt-2"></div>

            {/* Supports Section */}
            {userProfile.recently_supported_causes && userProfile.recently_supported_causes.length > 0 && (
              <>
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Supports</h2>
                  </div>

                  {/* Grid Layout - Responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
                  <div className="flex flex-wrap -mx-1.5 sm:-mx-2">
                    {userProfile.recently_supported_causes.slice(0, 6).map((cause: any, i: number) => {
                      // Generate consistent color based on cause name
                      const colors = [
                        '#f97316', // orange
                        '#ec4899', // pink
                        '#3b82f6', // blue
                        '#ef4444', // red
                        '#10b981', // green
                        '#f97316', // orange (repeat)
                      ];
                      const bgColor = colors[i % colors.length];

                      return (
                        <Link
                          key={cause.id || i}
                          to={`/cause/${cause.id}`}
                          className="w-1/2 sm:w-1/3 lg:w-1/4 px-1.5 sm:px-2 mb-3"
                        >
                          <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-between h-[100px] sm:h-[120px]">
                            {cause.logo ? (
                              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg mb-2 flex-shrink-0">
                                <AvatarImage src={cause.logo} alt={cause.name} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs sm:text-sm font-semibold rounded-lg">
                                  {cause.name?.charAt(0)?.toUpperCase() || 'N'}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg mb-2 flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: bgColor }}
                              >
                                <span className="text-lg sm:text-xl font-semibold text-white">
                                  {cause.name?.charAt(0)?.toUpperCase() || 'N'}
                                </span>
                              </div>
                            )}
                            <p className="text-xs font-semibold text-gray-900 text-center line-clamp-2 flex-grow flex items-center justify-center">
                              {cause.name}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Show more causes text and link */}
                  {userProfile.recently_supported_causes.length > 6 && (
                    <div className="flex flex-col items-center gap-2 mt-4">
                      <p className="text-sm text-gray-500">
                        + {userProfile.recently_supported_causes.length - 6} more causes
                      </p>
                      <Link to="/interests">
                        <span className="text-sm text-blue-600 font-medium">
                          See all {userProfile.recently_supported_causes.length} →
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
            <div className="h-px bg-gray-200 mx-2 mt-4"></div>

              </>
            )}

            {/* Divider */}

            <ProfileBio bio={userProfile.bio} />

            <div className="py-4">
              <ProfileActivity
                title="Recent Activity"
                posts={userPosts}
                showLoadMore={true}
                onLoadMore={() => fetchNextPage()}
                hasMore={hasNextPage}
                isLoadingMore={isFetchingNextPage}
                isLoading={postsLoading}
                error={null}
              />
            </div>
          </div>
        </div>

        {/* Sidebar - Only visible on desktop */}
        <div className="hidden md:col-span-4">
          <ProfileSidebar />
        </div>
      </div>

      </div>

      {/* Footer */}
      <div className="">
        <Footer />
      </div>

      {/* Statistics Bottom Sheet */}
      <Sheet open={showStatsSheet} onOpenChange={setShowStatsSheet}>
        <SheetContent side="bottom" className="h-[75vh] max-h-[75vh] p-0 flex flex-col">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          <div className="px-4">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-gray-900">
                {activeStatsTab === 'causes' && 'Causes'}
                {activeStatsTab === 'crwds' && 'Collectives'}
                {activeStatsTab === 'followers' && 'Followers'}
                {activeStatsTab === 'following' && 'Following'}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                {activeStatsTab === 'causes' && 'Causes they support'}
                {activeStatsTab === 'crwds' && "Collectives they're part of"}
                {activeStatsTab === 'followers' && 'People following them'}
                {activeStatsTab === 'following' && 'People they follow'}
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Tabs */}
          <div className="px-4 mb-2">
            <div className="flex gap-0.5 bg-gray-100 rounded-2xl p-1">
              {[
                { label: 'Causes', value: 'causes' },
                { label: 'Collectives', value: 'crwds' },
                { label: 'Followers', value: 'followers' },
                { label: 'Following', value: 'following' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveStatsTab(tab.value as typeof activeStatsTab)}
                  className={`flex-1 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${activeStatsTab === tab.value
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
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {activeStatsTab === 'causes' && (
              <>
                {statsCausesLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600 mt-2.5">Loading causes...</p>
                  </div>
                ) : statsCausesData?.results?.length > 0 ? (
                  <div className="space-y-0">
                    {statsCausesData.results.map((item: any, index: number) => {
                      const cause = item.cause || item;
                      const causeColors = [
                        '#f97316', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
                      ];
                      const colorIndex = (cause.name?.charCodeAt(0) || 0) % causeColors.length;
                      const causeBgColor = causeColors[colorIndex];

                      return (
                        <Link
                          key={cause.id || index}
                          to={`/cause/${cause.id}`}
                          onClick={() => setShowStatsSheet(false)}
                          className="flex items-center gap-3 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: causeBgColor }}
                          >
                            <span className="text-xl font-bold text-white">
                              {cause.name?.charAt(0)?.toUpperCase() || 'N'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              {cause.name || 'Unknown Cause'}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {cause.mission || 'Supporting this cause'}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-sm text-gray-500">No causes found</p>
                  </div>
                )}
              </>
            )}

            {activeStatsTab === 'crwds' && (
              <>
                {statsCollectivesLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600 mt-2.5">Loading collectives...</p>
                  </div>
                ) : statsCollectivesData?.data?.length > 0 ? (
                  <div className="space-y-0">
                    {statsCollectivesData.data.map((item: any, index: number) => {
                      const collective = item.collective || item;
                      
                      // Generate consistent color for avatar fallback
                      const avatarColors = [
                        '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
                        '#F97316', '#84CC16', '#A855F7', '#14B8A6', '#F43F5E', '#6366F1', '#22C55E', '#EAB308',
                      ];
                      const getConsistentColor = (id: number | string, colors: string[]) => {
                        const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                        return colors[hash % colors.length];
                      };
                      
                      // Priority: 1. Use color from API, 2. Use logo, 3. Fallback to generated color with letter
                      const hasColor = collective.color;
                      const hasLogo = collective.logo && (collective.logo.startsWith("http") || collective.logo.startsWith("/") || collective.logo.startsWith("data:"));
                      const iconColor = hasColor || (!hasLogo ? getConsistentColor(collective.id || collective.name, avatarColors) : undefined);
                      const iconLetter = collective.name?.charAt(0)?.toUpperCase() || 'N';
                      const imageUrl = hasLogo ? collective.logo : (collective.image || collective.avatar || undefined);
                      
                      return (
                        <div
                          key={collective.id || index}
                          className="flex items-center justify-between py-3 border-b border-gray-100"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="w-10 h-10 flex-shrink-0 rounded-lg">
                              <AvatarImage src={imageUrl} alt={collective.name} />
                              <AvatarFallback 
                                style={iconColor ? { backgroundColor: iconColor } : {}}
                                className="rounded-lg text-white font-bold"
                              >
                                {iconLetter}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[10px] font-semibold w-fit mb-1">
                                Collective
                              </div>
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                {collective.name || 'Unknown Collective'}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {collective.description || ''}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              setShowStatsSheet(false);
                              navigate(`/groupcrwd/${collective.id}`);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg"
                          >
                            View Details
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-sm text-gray-500">No collectives found</p>
                  </div>
                )}
              </>
            )}

            {activeStatsTab === 'followers' && (
              <>
                {statsFollowersLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600 mt-2.5">Loading followers...</p>
                  </div>
                ) : statsFollowersData?.followers?.length > 0 ? (
                  <div className="space-y-0">
                    {statsFollowersData.followers.map((item: any, index: number) => {
                      const userData = item.follower || item.user || item;
                      const isCurrentlyFollowing = item.is_following ?? userData.is_following ?? false;
                      return (
                        <div
                          key={userData.id || index}
                          className="flex items-center justify-between py-3 border-b border-gray-100"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="w-10 h-10 flex-shrink-0">
                              <AvatarImage src={userData.profile_picture || userData.avatar} />
                              <AvatarFallback>
                                {userData.first_name && userData.last_name
                                  ? `${userData.first_name[0]}${userData.last_name[0]}`
                                  : (userData.name || 'U').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {userData.first_name && userData.last_name
                                  ? `${userData.first_name} ${userData.last_name}`
                                  : userData.first_name || userData.name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-gray-500">@{userData.username || 'unknown'}</p>
                            </div>
                          </div>
                          {userData.id !== currentUser?.id && (
                            <Button
                              onClick={() => handleFollowToggle(userData.id.toString(), isCurrentlyFollowing)}
                              disabled={followUserMutation.isPending || unfollowUserMutation.isPending}
                              className={`text-xs px-4 py-2 rounded-full ${isCurrentlyFollowing
                                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                              {isCurrentlyFollowing ? 'Following' : 'Follow'}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-sm text-gray-500">No followers found</p>
                  </div>
                )}
              </>
            )}

            {activeStatsTab === 'following' && (
              <>
                {statsFollowingLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600 mt-2.5">Loading following...</p>
                  </div>
                ) : statsFollowingData?.following?.length > 0 ? (
                  <div className="space-y-0">
                    {statsFollowingData.following.map((item: any, index: number) => {
                      const userData = item.followee || item.following || item.user || item;
                      const isCurrentlyFollowing = true; // Always true for following tab
                      return (
                        <div
                          key={userData.id || index}
                          className="flex items-center justify-between py-3 border-b border-gray-100"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="w-10 h-10 flex-shrink-0">
                              <AvatarImage src={userData.profile_picture || userData.avatar} />
                              <AvatarFallback>
                                {userData.first_name && userData.last_name
                                  ? `${userData.first_name[0]}${userData.last_name[0]}`
                                  : (userData.name || 'U').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {userData.first_name && userData.last_name
                                  ? `${userData.first_name} ${userData.last_name}`
                                  : userData.first_name || userData.name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-gray-500">@{userData.username || 'unknown'}</p>
                            </div>
                          </div>
                          {userData.id !== currentUser?.id && (
                            <Button
                              onClick={() => handleFollowToggle(userData.id.toString(), isCurrentlyFollowing)}
                              disabled={followUserMutation.isPending || unfollowUserMutation.isPending}
                              className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs px-4 py-2 rounded-full"
                            >
                              Following
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-sm text-gray-500">No following found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

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
