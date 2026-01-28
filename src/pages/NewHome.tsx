import { useQuery, useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import CommentsBottomSheet from "@/components/post/CommentsBottomSheet";
import NewSuggestedCollectives from "@/components/newHome/NewSuggestedCollectives";
import NewFeaturedNonprofits from "@/components/newHome/NewFeaturedNonprofits";
import HelloGreeting from "@/components/newHome/HelloGreeting";
import MyDonationBoxCard from "@/components/newHome/MyDonationBoxCard";
import DonationBoxPrompt from "@/components/newHome/DonationBoxPrompt";
import CollectiveCarouselCard from "@/components/newHome/CollectiveCarouselCard";
import CreateCollectiveCard from "@/components/newHome/CreateCollectiveCard";
import CommunityUpdates from "@/components/newHome/CommunityUpdates";
import CommunityPosts from "@/components/newHome/CommunityPosts";
import ExploreCards from "@/components/newHome/ExploreCards";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { getCollectives, getCauses, getJoinCollective } from "@/services/api/crwd";
import { getDonationBox } from "@/services/api/donation";
import { getNotifications } from "@/services/api/notification";
import { getUserProfileById } from "@/services/api/social";
import { useAuthStore } from "@/stores/store";
import GuestHome from "@/components/GuestHome";
import Footer from "@/components/Footer";
import { X } from "lucide-react";
import { NewLogo } from "@/assets/newLogo";

export default function NewHome() {
    const { user, token } = useAuthStore();
    const [showAppBanner, setShowAppBanner] = useState(true);
    const [showCommentsSheet, setShowCommentsSheet] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);

    // Fetch collectives data using React Query
    const { data: collectivesData, isLoading: collectivesLoading } = useQuery({
        queryKey: ["collectives"],
        queryFn: getCollectives,
        enabled: true,
    });

    // Fetch nonprofits/causes data using React Query
    const { data: nonprofitsData, isLoading: nonprofitsLoading } = useQuery({
        queryKey: ["nonprofitts"],
        queryFn: getCauses,
        enabled: true,
    });

    // Fetch donation box data
    const { data: donationBoxData, isLoading: donationBoxLoading } = useQuery({
        queryKey: ["donationBox", user?.id],
        queryFn: getDonationBox,
        enabled: !!user?.id && !!token?.access_token,
    });

    // Fetch joined collectives
    const { data: joinedCollectivesData, isLoading: joinedCollectivesLoading } = useQuery({
        queryKey: ["joinedCollectives", user?.id],
        queryFn: () => getJoinCollective(user?.id?.toString() || ''),
        enabled: !!user?.id && !!token?.access_token,
    });

    // Fetch community updates (notifications)
    const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
        queryKey: ["notifications", "community"],
        queryFn: getNotifications,
        enabled: !!token?.access_token,
    });

    // Extract unique user IDs from community notifications
    const uniqueUserIds = useMemo(() => {
        const communityNotifications = notificationsData?.results?.filter((n: any) => n.type === "community") || [];
        return Array.from(new Set(
            communityNotifications
                .slice(0, 5)
                .map((notification: any) => {
                    const usernameMatch = notification.body?.match(/@(\w+)/);
                    if (usernameMatch) {
                        return notification.data?.donor_id ||
                            notification.data?.follower_id ||
                            notification.data?.creator_id ||
                            notification.data?.new_member_id ||
                            null;
                    }
                    return notification.data?.donor_id ||
                        notification.data?.follower_id ||
                        notification.data?.creator_id ||
                        notification.data?.new_member_id ||
                        null;
                })
                .filter((id: any) => id !== null)
        )) as (string | number)[];
    }, [notificationsData]);

    // Fetch user profiles for all unique user IDs
    const userProfileQueries = useQueries({
        queries: uniqueUserIds.map((userId: string | number) => ({
            queryKey: ["userProfile", userId],
            queryFn: () => getUserProfileById(userId.toString()),
            enabled: !!token?.access_token && !!userId,
        })),
    });

    // Create a map of user ID to user profile (reactive to query results)
    const userProfilesMap = useMemo(() => {
        const map = new Map();
        userProfileQueries.forEach((query, index) => {
            if (query.data && uniqueUserIds[index]) {
                map.set(uniqueUserIds[index].toString(), query.data);
            }
        });
        return map;
    }, [userProfileQueries, uniqueUserIds]);

    // Transform API data to match component's expected format
    const transformedCollectives =
        collectivesData?.results?.map((collective: any) => {
            const founderName = collective.created_by
                ? `${collective.created_by.first_name || ""} ${collective.created_by.last_name || ""
                    }`.trim()
                : "Unknown";

            return {
                id: collective.id,
                name: collective.name || "Unknown Collective",
                iconColor: collective.color, // Use color from API if available
                icon: collective.logo || undefined, // Use logo from API if available
                founder: {
                    name: founderName,
                    profile_picture: collective.created_by?.profile_picture || "",
                    color: collective.created_by?.color || "",
                },
                nonprofit_count:
                    collective.causes_count ||
                    collective.supported_causes_count ||
                    collective.cause_count ||
                    0,
                description: collective.description || "No description available",
            };
        }) || [];

    // Get list of joined collective IDs to filter them out from suggested collectives
    const joinedCollectiveIds = useMemo(() => {
        if (joinedCollectivesData?.data) {
            return new Set(joinedCollectivesData.data.map((item: any) => item.collective.id));
        }
        return new Set();
    }, [joinedCollectivesData]);

    // Filter out collectives that user has already joined
    const filteredSuggestedCollectives = useMemo(() => {
        return transformedCollectives.filter((collective: any) => !joinedCollectiveIds.has(collective.id));
    }, [transformedCollectives, joinedCollectiveIds]);

    // Transform nonprofits data to match component's expected format
    const transformedNonprofits =
        nonprofitsData?.results?.map((nonprofit: any) => ({
            id: nonprofit.id,
            name: nonprofit.name || "Unknown Nonprofit",
            image: nonprofit.image || "",
            description: nonprofit.mission || nonprofit.description || "",
            mission: nonprofit.mission || "",
        })) || [];

    // Check if donation box exists
    // API returns {"status_code":200,"message":"Donation box not found"} when not set up
    const isDonationBoxNotFound = donationBoxData?.message === "Donation box not found";
    const isDonationBoxActive = donationBoxData?.is_active === true;

    // Get list of cause IDs from donation box to filter them out from featured nonprofits
    const donationBoxCauseIds = useMemo(() => {
        if (donationBoxData && !isDonationBoxNotFound && donationBoxData.box_causes) {
            return new Set(
                donationBoxData.box_causes
                    .map((boxCause: any) => boxCause.cause?.id)
                    .filter((id: any) => id != null)
            );
        }
        return new Set();
    }, [donationBoxData, isDonationBoxNotFound]);

    // Filter out nonprofits that are already in the donation box
    const filteredFeaturedNonprofits = useMemo(() => {
        return transformedNonprofits.filter((nonprofit: any) => !donationBoxCauseIds.has(nonprofit.id));
    }, [transformedNonprofits, donationBoxCauseIds]);

    // Transform donation box data
    const donationBoxInfo = donationBoxData && !isDonationBoxNotFound && isDonationBoxActive
        ? {
            monthlyAmount: donationBoxData.monthly_amount || donationBoxData.amount || 10,
            causeCount:
                (donationBoxData.manual_causes?.length || 0) +
                (donationBoxData.attributing_collectives?.length || 0),
        }
        : null;

    // Get cause count for inactive donation box - count unique causes from box_causes
    const inactiveBoxCauseCount = donationBoxData && !isDonationBoxNotFound && !isDonationBoxActive
        ? (() => {
            const boxCauses = donationBoxData.box_causes || [];
            const uniqueCauseIds = new Set(boxCauses.map((bc: any) => bc.cause?.id).filter(Boolean));
            return uniqueCauseIds.size || 0;
        })()
        : 0;

    // Transform joined collectives for carousel
    const transformedAttributingCollectives = useMemo(() => {
        if (joinedCollectivesData?.data) {
            return joinedCollectivesData.data.map((item: any) => {
                const collective = item.collective;
                // Check if user is admin (role is "admin" from API)
                const isAdmin = item.role === "admin";

                return {
                    id: collective.id,
                    name: collective.name || "Unknown Collective",
                    memberCount: collective.member_count || 0,
                    yearlyAmount: parseFloat(collective.total_donated || "0") * 12, // Convert monthly to yearly estimate
                    causeCount: collective.causes_count || 0,
                    role: isAdmin ? "Admin" : "Member",
                    image: collective.logo || collective.created_by?.profile_picture || "",
                    logo: collective.logo || undefined,
                    color: collective.color || undefined,
                };
            });
        }
        return [];
    }, [joinedCollectivesData]);

    // Use only attributing collectives from donation box

    // Transform notifications data for community updates
    // Only show type "community" (not "community_post")
    // Filter out items with postId (post type items)
    // Use useMemo to make it reactive to userProfilesMap changes
    const transformedCommunityUpdates = useMemo(() => {
        return notificationsData?.results
            ?.filter((notification: any) =>
                notification.type === "community" &&
                !notification.data?.post_id // Filter out post type items
            )
            .map((notification: any) => {
                // Extract username from body if it contains @username pattern
                // Example: "@drake_ji donated $7.0 to test" -> "drake_ji"
                let username = '';
                const usernameMatch = notification.body?.match(/@(\w+)/);
                if (usernameMatch) {
                    username = usernameMatch[1];
                } else {
                    // Fallback to data fields
                    username = notification.data?.follower_username ||
                        notification.data?.donor_id ||
                        notification.data?.creator_id ||
                        notification.data?.new_member_id ||
                        'unknown';
                }

                let collectiveName = '';
                if (notification.body) {
                    // Try pattern: "to [collective name]" (for donations)
                    const toMatch = notification.body.match(/to (.+)$/);
                    if (toMatch) {
                        collectiveName = toMatch[1].trim();
                    } else {
                        // Try pattern: "in [collective name]"
                        const inMatch = notification.body.match(/in (.+)$/);
                        if (inMatch) {
                            collectiveName = inMatch[1].trim();
                        } else if (notification.body.includes('joined')) {
                            // Try pattern: "joined [collective name]"
                            const joinMatch = notification.body.match(/joined (.+)$/);
                            if (joinMatch) {
                                collectiveName = joinMatch[1].trim();
                            }
                        }
                    }
                }

                // If not found in body, try extracting from title
                if (!collectiveName && notification.title) {
                    const titleMatch = notification.title.match(/in (.+)$/);
                    if (titleMatch) {
                        collectiveName = titleMatch[1].trim();
                    }
                }

                // Extract user ID from notification data
                const userId = notification.data?.donor_id ||
                    notification.data?.follower_id ||
                    notification.data?.creator_id ||
                    notification.data?.new_member_id ||
                    username;

                // Get user profile from the fetched profiles map
                const userProfile = userId ? userProfilesMap.get(userId.toString()) : null;

                // Use first_name and last_name from profile, fallback to username
                // Handle both flat structure and nested "user" structure
                const profileUser = userProfile?.user || userProfile;
                let firstName = profileUser?.first_name || '';
                let lastName = profileUser?.last_name || '';
                let fullName = '';

                if (firstName && lastName) {
                    fullName = `${firstName} ${lastName}`;
                } else if (profileUser?.full_name) {
                    fullName = profileUser.full_name;
                } else {
                    fullName = username || "Unknown User";
                }

                // Get avatar from profile if available
                const avatar = profileUser?.profile_picture || "";

                // Extract cleaner action text (remove @username from body)
                // Example: "@drake_ji donated $7.0 to test" -> "Donated $7.0 to test"
                let actionText = notification.body || notification.message || "";
                if (actionText && username) {
                    // Remove @username from the beginning
                    actionText = actionText.replace(`@${username} `, "").trim();
                    // Capitalize first letter
                    actionText = actionText.charAt(0).toUpperCase() + actionText.slice(1);
                }

                // Check if this is a join notification
                const isJoinNotification =
                    notification.body?.toLowerCase().includes('joined') ||
                    notification.data?.new_member_id !== undefined ||
                    notification.title?.toLowerCase().includes('new member');

                // Extract collective ID from notification data if available
                const collectiveId = notification.data?.collective_id ||
                    notification.data?.collectiveId ||
                    notification.data?.crwd_id ||
                    null;

                return {
                    id: notification.id,
                    user: {
                        id: userId,
                        name: fullName,
                        firstName: firstName,
                        lastName: lastName,
                        username: username,
                        avatar: avatar,
                    },
                    collective: collectiveName
                        ? {
                            name: collectiveName,
                            id: collectiveId,
                        }
                        : undefined,
                    content: actionText,
                    timestamp: notification.created_at || notification.timestamp,
                    likesCount: 0, // Not available in notification API
                    commentsCount: 0, // Not available in notification API
                    postId: notification.data?.post_id || null, // Extract post_id if available
                    isJoinNotification: isJoinNotification, // Flag for join notifications
                    data: {
                        profile_picture: notification.data?.user_profile_picture,
                        color: notification.data?.user_color,
                    }
                };
            }) || [];
    }, [notificationsData, userProfilesMap]);

    // All community updates (no splitting needed - show all below suggested collectives)
    const allCommunityUpdates = transformedCommunityUpdates;


    if (!user?.id) {
        return <GuestHome />;
    }

    return (
        <div className="">
            <ProfileNavbar
                title="Home"
                showMobileMenu={true}
                showDesktopMenu={true}
                showBackButton={false}
            />
            {/* Main Content - Takes full width on mobile, 12 columns on desktop */}
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 px-4 md:px-6 py-2 md:py-6">
                {/* Personalized Greeting */}

                {/* My Donation Box Card or Prompt */}
                {token?.access_token && (
                    donationBoxLoading ? (
                        <div className="w-full max-w-md mx-auto mt-2 md:mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-6 shadow-sm animate-pulse">
                                <div className="flex items-center gap-2.5 md:gap-4">
                                    <div className="w-10 h-10 md:w-16 md:h-16 bg-gray-200 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-2.5 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="mt-3 md:mt-6 space-y-1.5">
                                    <div className="h-2.5 bg-gray-200 rounded"></div>
                                    <div className="h-2.5 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        </div>
                    ) : donationBoxInfo ? (
                        <>
                            <HelloGreeting />
                            <MyDonationBoxCard
                                monthlyAmount={donationBoxInfo.monthlyAmount}
                                causeCount={donationBoxInfo.causeCount}
                            />
                        </>
                    ) : donationBoxData && !isDonationBoxNotFound && !isDonationBoxActive && inactiveBoxCauseCount > 0 ? (
                        // Donation box exists but is not active - show prompt with cause count
                        <DonationBoxPrompt
                            causeCount={inactiveBoxCauseCount}
                            hasJoinedCollectives={transformedAttributingCollectives.length > 0}
                        />
                    ) : (
                        <DonationBoxPrompt
                            hasJoinedCollectives={transformedAttributingCollectives.length > 0}
                        />
                    )
                )}

                {/* Collective Carousel Card - Show joined collectives or Create Collective Card */}
                {token?.access_token && (
                    joinedCollectivesLoading ? (
                        <div className="w-full mt-2 md:mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-6 shadow-none animate-pulse">
                                <div className="space-y-3">
                                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-24 md:h-40 bg-gray-200 rounded-lg"></div>
                                    <div className="flex gap-2 justify-center">
                                        <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                        <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : transformedAttributingCollectives.length > 0 ? (
                        <CollectiveCarouselCard collectives={transformedAttributingCollectives} />
                    ) : (
                        <CreateCollectiveCard />
                    )
                )}

                {/* Explore Cards */}

            </div>

            {/* <div className="md:grid md:grid-cols-12 md:gap-6 md:pt-6 md:px-6">
                <div className="md:col-span-12"> */}

            <div className="w-full max-w-7xl mx-auto">
                <div className="mx-0 md:mx-6">
                    {/* 2 Posts - Above Featured Nonprofits */}
                    {token?.access_token && (
                        <CommunityPosts
                            limit={2}
                            startIndex={0}
                            showHeading={true}
                            onCommentPress={(post) => {
                                setSelectedPost({
                                    id: typeof post.id === 'string' ? parseInt(post.id) : post.id,
                                    username: post.user.username,
                                    text: post.content,
                                    avatarUrl: post.user.avatar,
                                    firstName: post.user.firstName,
                                    lastName: post.user.lastName,
                                    color: post.user.color,
                                });
                                setShowCommentsSheet(true);
                            }}
                        />
                    )}

                    {/* Featured Nonprofits Section */}
                    {nonprofitsLoading ? (
                        <div className="py-4 md:py-6">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                                <div className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                            </div>
                            <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                                <div className="flex gap-3 md:gap-4 w-max">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white min-w-[240px] md:min-w-[280px] animate-pulse">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <NewFeaturedNonprofits
                            nonprofits={filteredFeaturedNonprofits}
                            seeAllLink="/search"
                        />
                    )}

                    {/* 1 Post - After Featured Nonprofits */}
                    {token?.access_token && (
                        <CommunityPosts
                            limit={2}
                            startIndex={2}
                            showHeading={false}
                            onCommentPress={(post) => {
                                setSelectedPost({
                                    id: typeof post.id === 'string' ? parseInt(post.id) : post.id,
                                    username: post.user.username,
                                    text: post.content,
                                    avatarUrl: post.user.avatar,
                                    firstName: post.user.firstName,
                                    lastName: post.user.lastName,
                                    color: post.user.color,
                                });
                                setShowCommentsSheet(true);
                            }}
                        />
                    )}

                    {/* Suggested Collectives Section */}
                    {collectivesLoading ? (
                        <div className="py-4 md:py-6">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                                <div className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                            </div>
                            <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                                <div className="flex gap-3 md:gap-4 w-max">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex flex-col gap-3 p-4 rounded-lg bg-gray-50 min-w-[240px] md:min-w-[280px] animate-pulse">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                                            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <NewSuggestedCollectives
                            collectives={filteredSuggestedCollectives}
                            seeAllLink="/circles"
                        />
                    )}

                    {/* All Community Updates - Below Suggested Collectives */}
                    {token?.access_token && (
                        notificationsLoading ? (
                            null
                        ) : allCommunityUpdates.length > 0 ? (
                            <CommunityUpdates updates={allCommunityUpdates.slice(0, 10)} showHeading={false} />
                        ) : null
                    )}

                </div>
            </div>

            {/* </div>
            </div> */}
            <ExploreCards />

            <Footer />

            {/* Comments Bottom Sheet */}
            {selectedPost && (
                <CommentsBottomSheet
                    isOpen={showCommentsSheet}
                    onClose={() => {
                        setShowCommentsSheet(false);
                        setSelectedPost(null);
                    }}
                    post={selectedPost}
                />
            )}

            {/* Fixed iOS App Banner */}
            {showAppBanner && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 md:px-6 py-3 md:py-4 z-40 shadow-lg block sm:hidden">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-4">
                        {/* <NewLogo /> */}
                        <img src="/icons/FullLogo.png" width={75} height={75} />
                        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                            <p className="text-xs xs:text-sm md:text-base font-bold text-gray-900">
                                Get the full experience on iOS
                            </p>
                            <p className="text-xs xs:text-sm md:text-sm text-gray-500">
                                Easily manage all of your giving
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAppBanner(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                            aria-label="Close banner"
                        >
                            <X className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

