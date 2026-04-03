import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { getCollectiveByName, getCollectiveCauses, getCollectiveStats, joinCollective, leaveCollective } from '@/services/api/crwd';
import { favoriteCollective, unfavoriteCollective } from '@/services/api/social';
import { getPosts } from '@/services/api/social';
import { getDonationBox, addCausesToBox } from '@/services/api/donation';
import GivingGroupHeader from '@/components/newGivingGroup/GivingGroupHeader';
import CommunityActivity from '@/components/newgroupcrwd/CommunityActivity';
import CollectiveStatisticsModal from '@/components/newgroupcrwd/CollectiveStatisticsModal';
import { SharePost } from '@/components/ui/SharePost';
import { Toast } from '@/components/ui/toast';
import AddToDonationBoxBottomSheet from '@/components/newcause/AddToDonationBoxBottomSheet';
import { useAuthStore } from '@/stores/store';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import LoggedOutHeader from '@/components/LoggedOutHeader';
import JoinGroupBottomsheet from '@/components/newGivingGroup/JoinGroupBottomsheet';
import CreatePostBottomSheet from '@/components/post/CreatePostBottomSheet';
import GivingGroupDetailsBottomSheet from '@/components/newGivingGroup/GivingGroupDetailsBottomSheet';

export default function NewGivingGroupPage() {
    const { crwdId } = useParams<{ crwdId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user: currentUser, token } = useAuthStore();
    const queryClient = useQueryClient();

    const handleBack = () => {
        const fromScreen = (location.state as any)?.from;
        const fromCreate = (location.state as any)?.fromCreate;
        console.log(fromScreen);
        const specialFlows = ['NewNonprofitInterests', 'NewCompleteDonation', 'Login', 'onboarding', 'ClaimProfile'];

        if ((fromScreen && specialFlows.includes(fromScreen)) || fromCreate || location.key === 'default') {
            navigate('/');
        } else {
            navigate(-1);
        }
    };
    const [showShareModal, setShowShareModal] = useState(false);
    const [showStatisticsModal, setShowStatisticsModal] = useState(false);
    const [showCreatePostModal, setShowCreatePostModal] = useState(false);
    const [statisticsTab, setStatisticsTab] = useState<'Nonprofits' | 'Members' | 'Donations'>('Nonprofits');
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showDonationChoiceModal, setShowDonationChoiceModal] = useState(false);

    // Fetch collective data by name/slug
    const { data: crwdData, isLoading: isLoadingCrwd, error: crwdError } = useQuery({
        queryKey: ['crwd', crwdId],
        queryFn: () => getCollectiveByName(crwdId || ''),
        enabled: !!crwdId,
        refetchOnMount: 'always',
        staleTime: 0,
        gcTime: 0,
    });

    const collectiveId = crwdData?.id?.toString() ?? crwdId;

    // Fetch collective causes (nonprofits) - use resolved collective id
    const { data: causesData } = useQuery({
        queryKey: ['collective-causes', collectiveId],
        queryFn: () => getCollectiveCauses(crwdData?.id || ''),
        enabled: !!crwdData?.id,
        refetchOnMount: 'always',
        staleTime: 0,
        gcTime: 0,
    });

    // Fetch donation box to check for existing causes and capacity
    const { data: donationBoxData, refetch: refetchDonationBox } = useQuery({
        queryKey: ['donationBox'],
        queryFn: getDonationBox,
        enabled: !!currentUser?.id && !!token?.access_token, // Fetch when user is logged in
        refetchOnMount: 'always',
        staleTime: 0,
        gcTime: 0,
    });

    // Fetch collective stats - use resolved collective id
    const { data: statsData } = useQuery({
        queryKey: ['collective-stats', collectiveId],
        queryFn: () => getCollectiveStats(crwdData?.id || ''),
        enabled: !!crwdData?.id && !!token?.access_token,
        refetchOnMount: 'always',
        staleTime: 0,
        gcTime: 0,
    });

    // Fetch posts - use resolved collective id
    const {
        data: postsData,
        isLoading: isLoadingPosts,
    } = useInfiniteQuery({
        queryKey: ['posts', collectiveId],
        queryFn: ({ pageParam = 1 }) => getPosts('', crwdData?.id || '', pageParam),
        getNextPageParam: (lastPage) => {
            if (lastPage.next) {
                const url = new URL(lastPage.next);
                const page = url.searchParams.get('page');
                return page ? parseInt(page) : undefined;
            }
            return undefined;
        },
        initialPageParam: 1,
        enabled: !!crwdData?.id,
        refetchOnMount: 'always',
        staleTime: 0,
        gcTime: 0,
    });

    // Flatten posts
    const posts = postsData
        ? {
            results: postsData.pages.flatMap((page) => page.results || []),
            next: postsData.pages[postsData.pages.length - 1]?.next || null,
            count: postsData.pages[0]?.count || 0,
        }
        : undefined;

    // Transform causes data for SupportedNonprofits component
    const nonprofits = causesData?.results || causesData || [];

    // Transform inactive causes data for CollectiveStatisticsModal component
    const inactiveCauses = crwdData?.inactive_causes || [];

    // Extract stats
    const nonprofitCount = nonprofits.length || 0;
    const memberCount = crwdData?.member_count || statsData?.member_count || 0;
    const donationCount = crwdData?.total_donation_count || statsData?.contributions_count || statsData?.donation_count || 0;

    // Join collective mutation
    const joinCollectiveMutation = useMutation({
        mutationFn: joinCollective,
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['crwd', crwdId] });
            queryClient.invalidateQueries({ queryKey: ['crwd', collectiveId] });
            queryClient.invalidateQueries({ queryKey: ['joined-collectives'] });
            queryClient.invalidateQueries({ queryKey: ['join-collective'] });
            queryClient.invalidateQueries({ queryKey: ['joined-collectives', currentUser?.id] });
            queryClient.invalidateQueries({ queryKey: ['joined-collectives-manage'] });
            queryClient.invalidateQueries({ queryKey: ['joinedCollectives'] });

            await refetchDonationBox();

            setToastMessage('You\'ve joined the collective!');
            setShowToast(true);

            setShowJoinModal(true);
        },
        onError: (error: any) => {
            console.error('Join collective error:', error);
            toast.error('Failed to join collective. Please try again.');
        },
    });

    // Leave collective mutation
    const leaveCollectiveMutation = useMutation({
        mutationFn: leaveCollective,
        onSuccess: async () => {
            setShowConfirmDialog(false);

            queryClient.invalidateQueries({ queryKey: ['crwd', crwdId] });
            queryClient.invalidateQueries({ queryKey: ['crwd', collectiveId] });
            queryClient.invalidateQueries({ queryKey: ['joined-collectives'] });
            queryClient.invalidateQueries({ queryKey: ['join-collective'] });
            queryClient.invalidateQueries({ queryKey: ['joined-collectives', currentUser?.id] });
            queryClient.invalidateQueries({ queryKey: ['joined-collectives-manage'] });
            queryClient.invalidateQueries({ queryKey: ['joinedCollectives'] });
            await queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
            await queryClient.refetchQueries({ queryKey: ['donationBox', currentUser?.id] });
        },
        onError: (error: any) => {
            console.error('Leave collective error:', error);
        },
    });


    // Toggle favorite mutation
    const toggleFavoriteMutation = useMutation({
        mutationFn: () => {
            if (crwdData?.is_favorite) {
                return unfavoriteCollective(crwdData.id || '');
            }
            return favoriteCollective(crwdData.id || '');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crwd', crwdId] });
            queryClient.invalidateQueries({ queryKey: ['crwd', collectiveId] });
        },
        onError: (error: any) => {
            console.error('Toggle favorite error:', error);
            toast.error('Failed to update favorite. Please try again.');
        },
    });

    const isJoined = crwdData?.is_joined || false;


    // Loading state
    if (isLoadingCrwd) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    // Error state
    if (crwdError || !crwdData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-3 md:px-4">
                <div className="text-center">
                    <p className="text-base md:text-lg font-semibold text-gray-900 mb-1.5 md:mb-2">
                        Collective not found
                    </p>
                    <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                        The collective you're looking for doesn't exist or has been removed.
                    </p>
                    <Button onClick={() => navigate('/')} variant="outline" className="text-sm md:text-base py-2 md:py-2.5 px-3 md:px-4">
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }

    const handleJoinCollective = () => {
        if (!currentUser || !token?.access_token) {
            navigate(`/onboarding?redirectTo=/g/${crwdData?.sort_name}`);
            return;
        }

        if (currentUser.id === crwdData.created_by?.id) {
            return;
        }

        if (crwdData.is_joined) {
            setShowConfirmDialog(true);
        } else {
            joinCollectiveMutation.mutate(collectiveId || '');
        }
    };

    const isAdmin = currentUser?.id === crwdData?.created_by?.id;
    const founder = crwdData?.created_by;
    const founderName = founder
        ? (founder.first_name
            ? `${founder.first_name} ${founder.last_name || ''}`.trim()
            : founder.username)
        : undefined;

    const handleJoinConfirm = async (selectedNonprofits: any[], collectiveId: string, shouldSetupDonationBox: boolean) => {
        if (!crwdId) return;

        if (shouldSetupDonationBox && (!donationBoxData || !donationBoxData.id)) {
            const preselectedCauses = selectedNonprofits.map((np) => {
                const cause = np.cause || np;
                return {
                    id: cause.id || np.id,
                    name: cause.name || np.name || 'Unknown Nonprofit',
                    description: cause.mission || cause.description || np.mission || np.description || '',
                    mission: cause.mission || np.mission || '',
                    logo: cause.image || cause.logo || np.image || np.logo || '',
                };
            });

            const preselectedCauseIds = preselectedCauses.map((cause) => cause.id);

            setShowJoinModal(false);

            navigate('/donation?tab=setup', {
                state: {
                    preselectedCauses: preselectedCauseIds,
                    preselectedCausesData: preselectedCauses,
                    preselectedCollectiveId: parseInt(collectiveId),
                    collectiveName: crwdData.name,
                    returnTo: `/g/${crwdData?.sort_name}`,
                },
            });
            return;
        }

        if (donationBoxData && donationBoxData.id && selectedNonprofits.length > 0) {
            const causes = selectedNonprofits.map((np) => {
                const cause = np.cause || np;
                const causeId = cause.id || np.id;
                const causeEntry: { cause_id: number; attributed_collective?: number } = {
                    cause_id: causeId,
                    attributed_collective: parseInt(collectiveId),
                };
                return causeEntry;
            });

            try {
                await addCausesToBox({ causes });
                queryClient.invalidateQueries({ queryKey: ['donationBox'] });
                await refetchDonationBox();
                // toast.success('Nonprofits added to your donation box!');
            } catch (error) {
                console.error('Error adding causes to donation box:', error);
                toast.error('Failed to add nonprofits to donation box. Please try again.');
            }
        }

        setShowJoinModal(false);
    };

    const handleCloseJoinModal = () => {
        setShowJoinModal(false);
    };

    const handleConfirmUnjoin = () => {
        if (!leaveCollectiveMutation.isPending && collectiveId) {
            leaveCollectiveMutation.mutate(collectiveId);
        }
    };

    const handleOneTimeDonation = () => {
        if (!currentUser || !token?.access_token) {
            navigate(`/onboarding?redirectTo=/g/${crwdData?.sort_name}`);
            return;
        }

        const collectiveCauses = nonprofits.map((np: any) => {
            const cause = np.cause || np;
            return {
                id: cause.id || np.id,
                name: cause.name || np.name || 'Unknown Nonprofit',
                description: cause.mission || cause.description || np.mission || np.description || '',
                mission: cause.mission || np.mission || '',
                logo: cause.image || cause.logo || np.image || np.logo || '',
            };
        });

        const causeIds = collectiveCauses.map((cause: any) => cause.id);

        navigate('/one-time-donation', {
            state: {
                preselectedItem: {
                    id: crwdId,
                    type: 'collective',
                    data: crwdData,
                },
                activeTab: 'onetime',
                preselectedCauses: causeIds,
                preselectedCausesData: collectiveCauses,
                preselectedCollectiveId: parseInt(collectiveId || '0'),
                collectiveName: crwdData.name,
            },
        });
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    return (
        <div className="min-h-screen bg-white">
            {!currentUser?.id &&
                <LoggedOutHeader redirectTo={window.location.pathname} />
            }
            <GivingGroupHeader
                title={crwdData.name || 'Collective'}
                memberCount={memberCount}
                avatar={crwdData.logo || crwdData.image}
                color={crwdData.color}
                isAdmin={isAdmin}
                isJoined={crwdData.is_joined}
                onShare={handleShare}
                onBack={handleBack}
                onJoin={handleJoinCollective}
                onMore={() => setShowDetailsModal(true)}
            />

            <div className='lg:max-w-[60%] lg:mx-auto'>

                <CommunityActivity
                    fromCollective={true}
                    posts={posts?.results || []}
                    isLoading={isLoadingPosts}
                    collectiveId={collectiveId}
                    isJoined={crwdData.is_joined}
                    collectiveData={crwdData}
                    onJoin={handleJoinCollective}
                />


                {/* Legal Disclaimer */}
                {!currentUser?.id && (
                    <div className="px-3 md:px-4 py-4 md:py-6 border-t border-gray-200 mt-6 md:mt-8">
                        <p className="text-xs md:text-sm text-gray-500 text-center leading-relaxed">
                            All donations are made to CRWD Foundation Inc. (EIN: 41-2423690), a 501(c)(3) nonprofit organization. CRWD Foundation grants funds to qualified 501(c)(3) organizations selected by donors.
                        </p>
                    </div>
                )}

                {/* Share Modal */}
                {showShareModal && (
                    <SharePost
                        isOpen={showShareModal}
                        onClose={() => setShowShareModal(false)}
                        url={window.location.href}
                        title={crwdData.name || 'Collective'}
                    />
                )}

                {/* Statistics Modal */}
                <CollectiveStatisticsModal
                    isOpen={showStatisticsModal}
                    onClose={() => setShowStatisticsModal(false)}
                    collectiveId={collectiveId}
                    collectiveName={crwdData.name}
                    initialTab={statisticsTab}
                    previouslySupported={inactiveCauses}
                />

                {/* Details Modal */}
                <GivingGroupDetailsBottomSheet
                    isOpen={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    groupData={{
                        id: crwdData.id,
                        name: crwdData.name,
                        founderName: founderName,
                        memberCount: memberCount,
                        donationCount: donationCount,
                        nonprofitCount: nonprofitCount,
                        description: crwdData.description,
                        avatar: crwdData.avatar,
                        color: crwdData.color,
                    }}
                    nonprofits={nonprofits}
                    isAdmin={isAdmin}
                    isJoined={isJoined}
                    isFavorited={crwdData?.is_favorite}
                    onInvite={() => {
                        setShowDetailsModal(false);
                        setShowShareModal(true);
                    }}
                    onFavorite={() => toggleFavoriteMutation.mutate()}
                    onNotifications={() => {
                        setShowDetailsModal(false);
                        toast.info("Notification settings coming soon!");
                    }}
                    onJoin={() => {
                        setShowDetailsModal(false);
                        if (crwdData?.is_joined) {
                            setShowJoinModal(true);
                        } else {
                            handleJoinCollective();
                        }
                    }}
                    onLeave={() => {
                        setShowDetailsModal(false);
                        setShowConfirmDialog(true);
                    }}
                    onStatClick={(tab) => {
                        setShowDetailsModal(false);
                        setStatisticsTab(tab);
                        setShowStatisticsModal(true);
                    }}
                    onManage={() => {
                        setShowDetailsModal(false);
                        navigate(`/edit-collective/${collectiveId}`);
                    }}
                    onDelete={() => {
                        setShowDetailsModal(false);
                        // Handle delete logic or confirm dialog
                    }}
                    donationBox={donationBoxData}
                />

            </div>

            <Footer />

            {/* Donation Choice Bottom Sheet */}
            <AddToDonationBoxBottomSheet
                isOpen={showDonationChoiceModal}
                onClose={() => setShowDonationChoiceModal(false)}
                hasDonationBox={!!donationBoxData?.id}
                onConfirm={() => {
                    setShowDonationChoiceModal(false);
                    setShowJoinModal(true);
                }}
                onOneTimeDonation={() => {
                    setShowDonationChoiceModal(false);
                    handleOneTimeDonation();
                }}
            />

            {/* Join Collective Bottom Sheet */}
            <JoinGroupBottomsheet
                isOpen={showJoinModal}
                onClose={handleCloseJoinModal}
                collectiveName={crwdData.name || 'Collective'}
                nonprofits={nonprofits}
                collectiveId={collectiveId || ''}
                onJoin={handleJoinConfirm}
                isJoining={false}
                donationBox={donationBoxData}
                founderName={founderName}
            />

            {/* Leave Collective Bottom Sheet */}
            <Sheet open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <SheetContent side="bottom" className="rounded-t-[20px] p-6 mx-auto">
                    <SheetHeader className="text-center p-0">
                        <SheetTitle className="text-xl font-bold text-gray-900">
                            Leave Collective
                        </SheetTitle>
                        <SheetDescription className="text-gray-500 mt-2">
                            Are you sure you want to leave this collective? You can always join back later.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col gap-3 mt-6 ">
                        <Button
                            variant="destructive"
                            className="w-full py-6 rounded-xl font-bold text-base"
                            onClick={handleConfirmUnjoin}
                            disabled={leaveCollectiveMutation.isPending}
                        >
                            {leaveCollectiveMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Leaving...
                                </>
                            ) : (
                                'Leave Collective'
                            )}
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full py-6 rounded-xl font-semibold text-base bg-gray-100 border-none hover:bg-gray-200"
                            onClick={() => setShowConfirmDialog(false)}
                            disabled={leaveCollectiveMutation.isPending}
                        >
                            Cancel
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Custom Toast */}
            <Toast
                message={toastMessage}
                show={showToast}
                onHide={() => setShowToast(false)}
            />

            {/* Create Post Bottom Sheet */}
            <CreatePostBottomSheet
                isOpen={showCreatePostModal}
                onClose={() => setShowCreatePostModal(false)}
                collectiveData={crwdData}
            />

            {/* New Fixed Thread Bar */}
            {crwdData?.is_joined && (
                <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-300 p-4 pb-4 z-40">
                    <div className=" mx-auto md:px-0">
                        <div
                            onClick={() => setShowCreatePostModal(true)}
                            className="flex items-center gap-3 bg-[#f6f5ed] hover:bg-[#efeee5] p-2.5 rounded-full cursor-pointer transition-all "
                        >
                            <div className="flex-1 text-sm md:text-base text-gray-600 font-medium ml-3">
                                Start a thread...
                            </div>
                            <div className="bg-[#1600ff] w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform active:scale-95">
                                <Plus className="w-5 h-5" strokeWidth={3} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

