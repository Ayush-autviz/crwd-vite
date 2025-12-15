import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getCollectiveById, getCollectiveCauses, getCollectiveStats, joinCollective, leaveCollective } from '@/services/api/crwd';
import { getPosts } from '@/services/api/social';
import { getDonationBox, addCausesToBox } from '@/services/api/donation';
import CollectiveHeader from '@/components/newgroupcrwd/CollectiveHeader';
import CollectiveProfile from '@/components/newgroupcrwd/CollectiveProfile';
import CollectiveStats from '@/components/newgroupcrwd/CollectiveStats';
import DonationInfoBox from '@/components/newgroupcrwd/DonationInfoBox';
import SupportedNonprofits from '@/components/newgroupcrwd/SupportedNonprofits';
import CommunityActivity from '@/components/newgroupcrwd/CommunityActivity';
import CollectiveStatisticsModal from '@/components/newgroupcrwd/CollectiveStatisticsModal';
import JoinCollectiveBottomSheet from '@/components/newgroupcrwd/JoinCollectiveBottomSheet';
import { SharePost } from '@/components/ui/SharePost';
import { useAuthStore } from '@/stores/store';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

export default function NewGroupCrwdPage() {
  const { crwdId } = useParams<{ crwdId: string }>();
  const navigate = useNavigate();
  const { user: currentUser, token } = useAuthStore();
  const queryClient = useQueryClient();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [statisticsTab, setStatisticsTab] = useState<'Nonprofits' | 'Members' | 'Donations'>('Nonprofits');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch collective data
  const { data: crwdData, isLoading: isLoadingCrwd, error: crwdError } = useQuery({
    queryKey: ['crwd', crwdId],
    queryFn: () => getCollectiveById(crwdId || ''),
    enabled: !!crwdId,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Fetch collective causes (nonprofits)
  const { data: causesData, isLoading: isLoadingCauses } = useQuery({
    queryKey: ['collective-causes', crwdId],
    queryFn: () => getCollectiveCauses(crwdId || ''),
    enabled: !!crwdId,
  });

  // Fetch donation box to check for existing causes and capacity
  const { data: donationBoxData, refetch: refetchDonationBox } = useQuery({
    queryKey: ['donationBox'],
    queryFn: getDonationBox,
    enabled: !!currentUser?.id && !!token?.access_token, // Fetch when user is logged in
  });

  // Fetch collective stats
  const { data: statsData } = useQuery({
    queryKey: ['collective-stats', crwdId],
    queryFn: () => getCollectiveStats(crwdId || ''),
    enabled: !!crwdId && !!token?.access_token,
  });

  // Fetch posts
  const {
    data: postsData,
    isLoading: isLoadingPosts,
  } = useInfiniteQuery({
    queryKey: ['posts', crwdId],
    queryFn: ({ pageParam = 1 }) => getPosts('', crwdId, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        const page = url.searchParams.get('page');
        return page ? parseInt(page) : undefined;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!crwdId,
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

  // Extract stats
  const nonprofitCount = nonprofits.length || 0;
  const memberCount = crwdData?.member_count || statsData?.member_count || 0;
  const donationCount = statsData?.contributions_count || statsData?.donation_count || 0;

  // Join collective mutation
  const joinCollectiveMutation = useMutation({
    mutationFn: joinCollective,
    onSuccess: async (response) => {
      console.log('Join collective successful:', response);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['crwd', crwdId] });
      queryClient.invalidateQueries({ queryKey: ['joined-collectives'] });
      queryClient.invalidateQueries({ queryKey: ['joined-collectives', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['joined-collectives-manage'] });
      queryClient.invalidateQueries({ queryKey: ['joinedCollectives'] });
      
      // Refetch donation box to get latest data including capacity
      await refetchDonationBox();
      
      // Always show the drawer sheet after joining
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
    onSuccess: async (response) => {
      console.log('Leave collective successful:', response);
      setShowConfirmDialog(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['crwd', crwdId] });
      queryClient.invalidateQueries({ queryKey: ['joined-collectives'] });
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
      // If not logged in, navigate to onboarding with redirectTo parameter
      navigate(`/onboarding?redirectTo=/groupcrwd/${crwdId}`);
      return;
    }

    // Don't show join/unjoin if user is the creator/admin
    if (currentUser.id === crwdData.created_by?.id) {
      return;
    }

    if (crwdData.is_joined) {
      // If already joined, show unjoin confirmation
      setShowConfirmDialog(true);
    } else {
      // Join immediately - drawer will show after successful join
      joinCollectiveMutation.mutate(crwdId || '');
    }
  };

  // Check if current user is the admin/creator
  const isAdmin = currentUser?.id === crwdData?.created_by?.id;

  const handleJoinConfirm = async (selectedNonprofits: any[], collectiveId: string, shouldSetupDonationBox: boolean) => {
    if (!crwdId) return;

    // If no donation box and user wants to set it up
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

      // Close the drawer
      setShowJoinModal(false);
      
      // Navigate to donation setup with preselected causes
      navigate('/donation?tab=setup', {
        state: {
          preselectedCauses: preselectedCauseIds,
          preselectedCausesData: preselectedCauses,
          preselectedCollectiveId: parseInt(collectiveId),
          returnTo: `/groupcrwd/${crwdId}`, // Return to collective after setup
        },
      });
      return;
    }

    // If donation box exists and causes are selected, add them
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
        toast.success('Nonprofits added to your donation box!');
      } catch (error) {
        console.error('Error adding causes to donation box:', error);
        toast.error('Failed to add nonprofits to donation box. Please try again.');
      }
    }

    // Close the drawer
    setShowJoinModal(false);
  };

  const handleCloseJoinModal = () => {
    setShowJoinModal(false);
  };

  const handleConfirmUnjoin = () => {
    if (!leaveCollectiveMutation.isPending && crwdId) {
      leaveCollectiveMutation.mutate(crwdId);
    }
  };

  const handleOneTimeDonation = () => {
    if (!currentUser || !token?.access_token) {
      // If not logged in, navigate to onboarding with redirectTo parameter
      navigate(`/onboarding?redirectTo=/groupcrwd/${crwdId}`);
      return;
    }

    // Get causes from the collective
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

    // Navigate to one-time donation tab with preselected causes
    navigate('/donation?tab=onetime', {
      state: {
        preselectedItem: {
          id: crwdId,
          type: 'collective',
          data: crwdData,
        },
        activeTab: 'onetime',
        preselectedCauses: causeIds,
        preselectedCausesData: collectiveCauses,
        preselectedCollectiveId: parseInt(crwdId || '0'),
      },
    });
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleManageCollective = () => {
    if (crwdId) {
      navigate(`/edit-collective/${crwdId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <CollectiveHeader
        title={crwdData.name || 'Collective'}
        collectiveId={crwdId}
        isFavorite={crwdData.is_favorite}
        isAdmin={isAdmin}
        onShare={handleShare}
        onManageCollective={handleManageCollective}
      />

    <div className='lg:max-w-[60%] lg:mx-auto'>


      <CollectiveProfile
        name={crwdData.name || 'Collective'}
        image={crwdData.avatar || crwdData.image}
        logo={crwdData.logo}
        color={crwdData.color}
        founder={crwdData.created_by}
        description={crwdData.description}
        isJoined={crwdData.is_joined}
      />

      <CollectiveStats
        nonprofitCount={nonprofitCount}
        memberCount={memberCount}
        donationCount={donationCount}
        onStatClick={(tab) => {
          if (!currentUser || !token?.access_token) {
            // If not logged in, navigate to onboarding with redirectTo parameter
            navigate(`/onboarding?redirectTo=/groupcrwd/${crwdId}`);
            return;
          }
          setStatisticsTab(tab);
          setShowStatisticsModal(true);
        }}
      />

      <DonationInfoBox nonprofitCount={nonprofitCount} />

      {/* Action Buttons */}
      <div className="px-3 md:px-4 mb-4 md:mb-6 flex flex-col sm:flex-row gap-2.5 md:gap-3">
        {isAdmin ? (
          <>
            {/* Joined Button - Non-clickable for admin */}
            <Button
              disabled
              className="w-full sm:flex-1 font-semibold py-4 md:py-5 rounded-lg text-sm md:text-base bg-white border-2 border-green-500 text-green-500 cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 inline" />
              Joined
            </Button>
            {/* Share Button */}
            <Button
              onClick={handleShare}
              className="w-full sm:flex-1 font-semibold py-4 md:py-5 rounded-lg text-sm md:text-base bg-[#1600ff] hover:bg-[#1400cc] text-white shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 inline" />
              Share
            </Button>
          </>
        ) : crwdData.is_joined ? (
          <>
            {/* Joined Button - Clickable for non-admin, prompts to unjoin */}
            <Button
              onClick={handleJoinCollective}
              disabled={leaveCollectiveMutation.isPending}
              className="w-full sm:flex-1 font-semibold py-4 md:py-5 rounded-lg text-sm md:text-base bg-white border-2 border-green-500 text-green-500 hover:bg-green-50"
            >
              {leaveCollectiveMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 animate-spin inline" />
                  Leaving...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 inline" />
                  Joined
                </>
              )}
            </Button>
            {/* Share Button */}
            <Button
              onClick={handleShare}
              className="w-full sm:flex-1 font-semibold py-4 md:py-5 rounded-lg text-sm md:text-base bg-[#1600ff] hover:bg-[#1400cc] text-white shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 inline" />
              Share
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleJoinCollective}
              disabled={joinCollectiveMutation.isPending}
              className="w-full sm:flex-1 font-semibold py-4 md:py-5 rounded-lg text-sm md:text-base bg-[#1600ff] hover:bg-[#1400cc] text-white"
            >
              {joinCollectiveMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 animate-spin inline" />
                  Joining...
                </>
              ) : (
                'Join Collective'
              )}
            </Button>
            <Button
              onClick={handleOneTimeDonation}
              variant="outline"
              className="w-full sm:flex-1 border-[#1600ff] text-[#1600ff] hover:bg-[#1600ff] hover:text-white font-semibold py-4 md:py-5 rounded-lg text-sm md:text-base"
            >
              Make a One-Time Donation
            </Button>
          </>
        )}
      </div>

      <SupportedNonprofits nonprofits={nonprofits} isLoading={isLoadingCauses} />

      <CommunityActivity
        posts={posts?.results || []}
        isLoading={isLoadingPosts}
        collectiveId={crwdId}
        isJoined={crwdData.is_joined}
        collectiveData={crwdData}
      />

      {/* Legal Disclaimer */}
      <div className="px-3 md:px-4 py-4 md:py-6 border-t border-gray-200 mt-6 md:mt-8">
        <p className="text-[10px] md:text-xs text-gray-500 text-center leading-relaxed">
          All donations are made to CRWD Foundation Inc. (EIN: XX-XXXXXXX), a 501(c)(3) nonprofit organization. CRWD Foundation grants funds to qualified 501(c)(3) organizations selected by donors.
        </p>
      </div>

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
        collectiveId={crwdId}
        collectiveName={crwdData.name}
        initialTab={statisticsTab}
      />
      </div>

      <Footer />

      {/* Join Collective Bottom Sheet */}
      <JoinCollectiveBottomSheet
        isOpen={showJoinModal}
        onClose={handleCloseJoinModal}
        collectiveName={crwdData.name || 'Collective'}
        nonprofits={nonprofits}
        collectiveId={crwdId || ''}
        onJoin={handleJoinConfirm}
        isJoining={false}
        donationBox={donationBoxData}
      />

      {/* Unjoin Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Collective</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this collective? You can always join back later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={leaveCollectiveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

