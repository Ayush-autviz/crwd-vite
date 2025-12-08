import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, X, Check } from 'lucide-react';
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
import { getDonationBox, addCollectiveToDonation } from '@/services/api/donation';
import CollectiveHeader from '@/components/newgroupcrwd/CollectiveHeader';
import CollectiveProfile from '@/components/newgroupcrwd/CollectiveProfile';
import CollectiveStats from '@/components/newgroupcrwd/CollectiveStats';
import DonationInfoBox from '@/components/newgroupcrwd/DonationInfoBox';
import SupportedNonprofits from '@/components/newgroupcrwd/SupportedNonprofits';
import CommunityActivity from '@/components/newgroupcrwd/CommunityActivity';
import CollectiveStatisticsModal from '@/components/newgroupcrwd/CollectiveStatisticsModal';
import { SharePost } from '@/components/ui/SharePost';
import { useAuthStore } from '@/stores/store';

export default function NewGroupCrwdPage() {
  const { crwdId } = useParams<{ crwdId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [statisticsTab, setStatisticsTab] = useState<'Nonprofits' | 'Members' | 'Donations'>('Nonprofits');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const joinModalRef = useRef<HTMLDivElement>(null);

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

  // Fetch collective stats
  const { data: statsData } = useQuery({
    queryKey: ['collective-stats', crwdId],
    queryFn: () => getCollectiveStats(crwdId || ''),
    enabled: !!crwdId,
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
  const donationCount = statsData?.total_donations || statsData?.donation_count || 0;

  // Join collective mutation
  const joinCollectiveMutation = useMutation({
    mutationFn: joinCollective,
    onSuccess: async (response) => {
      console.log('Join collective successful:', response);
      setShowJoinModal(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['crwd', crwdId] });
      queryClient.invalidateQueries({ queryKey: ['joined-collectives'] });
      queryClient.invalidateQueries({ queryKey: ['joined-collectives', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['joined-collectives-manage'] });
      queryClient.invalidateQueries({ queryKey: ['joinedCollectives'] });
      queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
      
      // Check if donation box exists and add collective
      try {
        const donationBoxData = await getDonationBox();
        
        if (!donationBoxData || !donationBoxData.id) {
          navigate('/donation?tab=setup', {
            state: {
              preselectedItem: {
                id: crwdId,
                type: 'collective',
                data: crwdData
              },
              activeTab: 'collectives'
            }
          });
        } else {
          try {
            if (!crwdId) {
              throw new Error('Collective ID is missing');
            }
            await addCollectiveToDonation(crwdId);
            await queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
            await queryClient.refetchQueries({ queryKey: ['donationBox', currentUser?.id] });
            
            navigate('/donation?tab=setup', {
              state: {
                preselectedItem: {
                  id: crwdId,
                  type: 'collective',
                  data: crwdData
                },
                activeTab: 'collectives'
              }
            });
          } catch (addError) {
            console.error('Error adding collective to donation box:', addError);
            navigate('/donation?tab=setup', {
              state: {
                preselectedItem: {
                  id: crwdId,
                  type: 'collective',
                  data: crwdData
                },
                activeTab: 'collectives'
              }
            });
          }
        }
      } catch (error) {
        console.error('Error checking donation box:', error);
      }
    },
    onError: (error: any) => {
      console.error('Join collective error:', error);
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

  // Handle outside click for join modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        joinModalRef.current &&
        !joinModalRef.current.contains(event.target as Node)
      ) {
        setShowJoinModal(false);
      }
    };

    if (showJoinModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showJoinModal]);

  // Loading state
  if (isLoadingCrwd) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state
  if (crwdError || !crwdData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            Collective not found
          </p>
          <p className="text-gray-600 mb-4">
            The collective you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleJoinCollective = () => {
    if (!currentUser) {
      // If not logged in, navigate to login/onboarding
      navigate('/onboarding');
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
      // If not joined, show join modal
      setShowJoinModal(true);
    }
  };

  // Check if current user is the admin/creator
  const isAdmin = currentUser?.id === crwdData?.created_by?.id;

  const handleJoinConfirm = () => {
    if (crwdId) {
      joinCollectiveMutation.mutate(crwdId);
    }
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
    // Navigate to one-time donation flow
    navigate(`/donation?collective=${crwdId}`);
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
    <div className="min-h-screen bg-white pb-20">
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
        founder={crwdData.created_by}
        description={crwdData.description}
        isJoined={crwdData.is_joined}
      />

      <CollectiveStats
        nonprofitCount={nonprofitCount}
        memberCount={memberCount}
        donationCount={donationCount}
        onStatClick={(tab) => {
          setStatisticsTab(tab);
          setShowStatisticsModal(true);
        }}
      />

      <DonationInfoBox nonprofitCount={nonprofitCount} />

      {/* Action Buttons */}
      <div className="px-4 mb-6 space-y-3">
        {!isAdmin && (
          <Button
            onClick={handleJoinCollective}
            disabled={joinCollectiveMutation.isPending || leaveCollectiveMutation.isPending}
            className={`w-full font-bold py-5 rounded-lg text-base ${
              crwdData.is_joined
                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                : 'bg-[#1600ff] hover:bg-[#1400cc] text-white'
            }`}
          >
            {joinCollectiveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                Joining...
              </>
            ) : leaveCollectiveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                Leaving...
              </>
            ) : crwdData.is_joined ? (
              <>
                <Check className="w-4 h-4 mr-2 inline" />
                Joined
              </>
            ) : (
              'Join Collective'
            )}
          </Button>
        )}
        <Button
          onClick={handleOneTimeDonation}
          variant="outline"
          className="w-full border-[#1600ff] text-[#1600ff] hover:bg-[#1600ff] hover:text-white font-bold py-5 rounded-lg text-base"
        >
          Make a One-Time Donation
        </Button>
      </div>

      <SupportedNonprofits nonprofits={nonprofits} isLoading={isLoadingCauses} />

      <CommunityActivity
        posts={posts?.results || []}
        isLoading={isLoadingPosts}
        collectiveId={crwdId}
        isJoined={crwdData.is_joined}
      />

      {/* Legal Disclaimer */}
      <div className="px-4 py-6 border-t border-gray-200 mt-8">
        <p className="text-xs text-gray-500 text-center leading-relaxed">
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

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            ref={joinModalRef}
            className="bg-white rounded-lg max-w-md w-full mx-4 p-6 relative"
          >
            <button
              onClick={handleCloseJoinModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Join {crwdData.name}?
              </h2>

              <p className="text-gray-600 mb-6">
                This Collective includes {nonprofitCount} nonprofits.
              </p>

              <div className="flex items-center justify-center gap-3">
                <Button onClick={handleCloseJoinModal} variant="outline">
                  Learn More
                </Button>
                <Button onClick={handleJoinConfirm} disabled={joinCollectiveMutation.isPending}>
                  {joinCollectiveMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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

