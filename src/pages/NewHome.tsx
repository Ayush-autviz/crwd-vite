import { useQuery, useQueries, useQueryClient, useIsFetching } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import CommentsBottomSheet from "@/components/post/CommentsBottomSheet";
import NewSuggestedCollectives from "@/components/newHome/NewSuggestedCollectives";
import NewFeaturedNonprofits from "@/components/newHome/NewFeaturedNonprofits";
import HelloGreeting from "@/components/newHome/HelloGreeting";
import MyDonationBoxCard from "@/components/newHome/MyDonationBoxCard";
import DonationBoxPrompt from "@/components/newHome/DonationBoxPrompt";
import CollectiveCarouselCard from "@/components/newHome/CollectiveCarouselCard";
import CreateCollectiveCard from "@/components/newHome/CreateCollectiveCard";
import CommunityPostCard from "@/components/newHome/CommunityPostCard";
import { NotificationSummary } from "@/components/newHome/CommunityUpdates";
import ExploreCards from "@/components/newHome/ExploreCards";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { getCollectives, getCauses, getJoinCollective } from "@/services/api/crwd";
import { getDonationBox } from "@/services/api/donation";
import { getUserProfileById, getCommunityUpdatesPosts } from "@/services/api/social";
import { useAuthStore } from "@/stores/store";
import GuestHome from "@/components/GuestHome";
import Footer from "@/components/Footer";
import { X } from "lucide-react";


export default function NewHome() {
    const { user, token } = useAuthStore();
    const queryClient = useQueryClient();
    const isFetching = useIsFetching();
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

    // Fetch community updates (posts and notifications mixed)
    const { data: communityUpdatesPostsData, isLoading: communityUpdatesLoading } = useQuery({
        queryKey: ["communityUpdatesPosts"],
        queryFn: getCommunityUpdatesPosts,
        enabled: !!token?.access_token,
    });

    useEffect(() => {
        if (communityUpdatesPostsData) {
            console.log("Community Updates Posts Result:", communityUpdatesPostsData);
        }
    }, [communityUpdatesPostsData]);

    // Extract unique user IDs from notifications in the feed
    const uniqueUserIds = useMemo(() => {
        const notifications = communityUpdatesPostsData?.results?.filter((n: any) => n.item_type === "notification") || [];
        return Array.from(new Set(
            notifications
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
    }, [communityUpdatesPostsData]);

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

    // Transform feed data (posts and notifications)
    const transformedFeedItems = useMemo(() => {
        return communityUpdatesPostsData?.results
            ?.map((item: any) => {
                if (item.item_type === 'post') {
                    // Start of post transformation
                    return {
                        uniqueKey: `post-${item.id}`,
                        type: 'post',
                        data: {
                            id: item.id,
                            user: {
                                id: item.user?.id,
                                name: item.user?.first_name && item.user?.last_name
                                    ? `${item.user.first_name} ${item.user.last_name}`
                                    : item.user?.username || 'Unknown User',
                                firstName: item.user?.first_name,
                                lastName: item.user?.last_name,
                                username: item.user?.username || '',
                                avatar: item.user?.profile_picture || '',
                                color: item.user?.color,
                            },
                            collective: item.collective
                                ? {
                                    name: item.collective.name,
                                    id: item.collective.id,
                                }
                                : undefined,
                            content: item.content || '',
                            imageUrl: item.media || undefined,
                            likes: item.likes_count || 0,
                            comments: item.comments_count || 0,
                            isLiked: item.is_liked || false,
                            timestamp: item.created_at,
                            fundraiser: item.fundraiser ? {
                                id: item.fundraiser.id,
                                name: item.fundraiser.name,
                                description: item.fundraiser.description,
                                image: item.fundraiser.image,
                                color: item.fundraiser.color,
                                target_amount: item.fundraiser.target_amount,
                                current_amount: item.fundraiser.current_amount,
                                progress_percentage: item.fundraiser.progress_percentage,
                                is_active: item.fundraiser.is_active,
                                total_donors: item.fundraiser.total_donors,
                                end_date: item.fundraiser.end_date,
                            } : undefined,
                            previewDetails: item.preview_details || item.previewDetails ? {
                                url: item.preview_details?.url || item.previewDetails?.url,
                                title: item.preview_details?.title || item.previewDetails?.title,
                                description: item.preview_details?.description || item.previewDetails?.description,
                                image: item.preview_details?.image || item.previewDetails?.image,
                                site_name: item.preview_details?.site_name || item.previewDetails?.site_name,
                                domain: item.preview_details?.domain || item.previewDetails?.domain,
                            } : undefined,
                        }
                    };
                } else if (item.item_type === 'notification') {
                    // Notification Logic
                    const notification = item;

                    // Extract username from body if it contains @username pattern
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
                        // Try pattern: "to [collective name]"
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

                    // Extract cleaner action text
                    let actionText = notification.body || notification.message || "";
                    if (actionText && username) {
                        actionText = actionText.replace(`@${username} `, "").trim();
                        actionText = actionText.charAt(0).toUpperCase() + actionText.slice(1);
                    }

                    // Check if this is a join notification
                    const isJoinNotification =
                        notification.body?.toLowerCase().includes('joined') ||
                        notification.data?.new_member_id !== undefined ||
                        notification.title?.toLowerCase().includes('new member');

                    const collectiveId = notification.data?.collective_id ||
                        notification.data?.collectiveId ||
                        notification.data?.crwd_id ||
                        null;

                    return {
                        uniqueKey: `notification-${notification.id}`,
                        type: 'notification',
                        data: {
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
                            likesCount: 0,
                            commentsCount: 0,
                            postId: notification.data?.post_id || null,
                            isJoinNotification: isJoinNotification,
                            data: {
                                profile_picture: notification.data?.user_profile_picture,
                                color: notification.data?.user_color,
                            }
                        }
                    };
                }
                return null;
            })
            .filter(Boolean) || [];
    }, [communityUpdatesPostsData, userProfilesMap]);

    const feedPart1 = transformedFeedItems.slice(0, 2);
    const feedPart2 = transformedFeedItems.slice(2, 4);
    const feedPart3 = transformedFeedItems.slice(4);

    // Helper to render feed items
    const renderFeedItem = (item: any) => {
        if (item.type === 'post') {
            return (
                <CommunityPostCard
                    key={item.uniqueKey}
                    post={item.data}
                    onCommentPress={(post) => {
                        setSelectedPost({
                            // Ensure numeric ID if possible
                            id: typeof post.id === 'string' ? parseInt(post.id) : post.id,
                            text: post.content,
                            username: post.user.username,
                            firstName: post.user.firstName,
                            lastName: post.user.lastName,
                            avatarUrl: post.user.avatar,
                            color: post.user.color,
                        });
                        setShowCommentsSheet(true);
                    }}
                    isHomeFeed={true}
                />
            );
        } else if (item.type === 'notification') {
            return (
                <NotificationSummary key={item.uniqueKey} update={item.data} />
            );
        }
        return null;
    };


    const handleLogoClick = () => {
        // Scroll to top fast
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Refetch all queries related to home screen
        queryClient.invalidateQueries();
    };

    if (!user?.id) {
        return <GuestHome />;
    }

    return (
        <div className="relative">

            <ProfileNavbar
                title="Home"
                showMobileMenu={true}
                showDesktopMenu={true}
                showBackButton={false}
                onLogoClick={handleLogoClick}
            />
            {/* Main Content */}
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 px-4 md:px-6 py-2 md:py-6">
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
            </div>

            <div className="w-full max-w-7xl mx-auto">
                <div className="mx-0 md:mx-6">
                    {/* Feed Part 1 - 2 Items */}
                    {token?.access_token && (
                        <div className="w-full px-4 my-4 mb-6 md:px-0 md:my-8 md:mb-10">
                            {/* Heading for the feed */}
                            {feedPart1.length > 0 && (
                                <div className="mb-3 md:mb-6">
                                    <h2 className="text-base xs:text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                                        Community Updates
                                    </h2>
                                    <p className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-gray-600">
                                        Updates, and discoveries from your community
                                    </p>
                                </div>
                            )}
                            <div className="space-y-2.5 md:space-y-4">
                                {communityUpdatesLoading && (
                                    <div className="bg-white rounded-lg border border-gray-200 p-2.5 md:p-4 animate-pulse">
                                        <div className="flex items-start gap-2 md:gap-4">
                                            <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {feedPart1.map(renderFeedItem)}
                            </div>
                        </div>
                    )}

                    {/* Featured Nonprofits Section */}
                    {nonprofitsLoading ? (
                        <div className="py-4 md:py-6">
                            {/* ... loading skeleton ... */}
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

                    {/* Feed Part 2 - 2 Items */}
                    {token?.access_token && (
                        <div className="w-full px-4 my-4 mb-6 md:px-0 md:my-8 md:mb-10">
                            <div className="space-y-2.5 md:space-y-4">
                                {feedPart2.map(renderFeedItem)}
                            </div>
                        </div>
                    )}

                    {/* Suggested Collectives Section */}
                    {collectivesLoading ? (
                        <div className="py-4 md:py-6">
                            {/* ... loading skeleton ... */}
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                            </div>
                            <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                                <div className="flex gap-3 md:gap-4 w-max">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex flex-col gap-3 p-4 rounded-lg bg-gray-50 min-w-[240px] md:min-w-[280px] animate-pulse">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
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

                    {/* Feed Part 3 - Rest of Items */}
                    {token?.access_token && (
                        <div className="w-full px-4 my-4 mb-6 md:px-0 md:my-8 md:mb-10">
                            <div className="space-y-2.5 md:space-y-4">
                                {feedPart3.map(renderFeedItem)}
                            </div>
                        </div>
                    )}

                </div>
            </div>

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
                        <a
                            href="https://apps.apple.com/us/app/crwd-collective-giving/id6748994882"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 md:gap-4 flex-1 cursor-pointer"
                        >
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
                        </a>
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
