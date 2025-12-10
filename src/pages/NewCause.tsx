import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getCauseById } from '@/services/api/crwd';
import { addCausesToBox } from '@/services/api/donation';
import { getDonationBox } from '@/services/api/donation';
import CauseHeader from '@/components/newcause/CauseHeader';
import CauseProfile from '@/components/newcause/CauseProfile';
import CauseActionButtons from '@/components/newcause/CauseActionButtons';
import VerifiedNonprofitInfo from '@/components/newcause/VerifiedNonprofitInfo';
import CauseDetails from '@/components/newcause/CauseDetails';
import OrganizationMission from '@/components/newcause/OrganizationMission';
import SimilarNonprofits from '@/components/newcause/SimilarNonprofits';
import { SharePost } from '@/components/ui/SharePost';
import { useAuthStore } from '@/stores/store';
import { toast } from 'sonner';
import { getCausesBySearch } from '@/services/api/crwd';
import Footer from '@/components/Footer';

export default function NewCausePage() {
  const { causeId } = useParams<{ causeId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddToBoxModal, setShowAddToBoxModal] = useState(false);
  const addToBoxModalRef = useRef<HTMLDivElement>(null);

  // Fetch cause data
  const { data: causeData, isLoading: isLoadingCause, error: causeError } = useQuery({
    queryKey: ['cause', causeId],
    queryFn: () => getCauseById(causeId || ''),
    enabled: !!causeId,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Fetch similar causes (same category, excluding current cause)
  const { data: similarCausesData, isLoading: isLoadingSimilar } = useQuery({
    queryKey: ['similar-causes', causeData?.category, causeId],
    queryFn: () => getCausesBySearch('', causeData?.category, 1),
    enabled: !!causeData?.category && !!causeId,
  });

  // Filter out current cause and limit to 2 similar causes
  const similarCauses = similarCausesData?.results
    ?.filter((cause: any) => cause.id.toString() !== causeId)
    .slice(0, 2) || [];

  // Add cause to donation box mutation
  const addToDonationBoxMutation = useMutation({
    mutationFn: async () => {
      if (!causeId) throw new Error('Cause ID is missing');
      return addCausesToBox({ cause_ids: [parseInt(causeId)] });
    },
    onSuccess: async () => {
      setShowAddToBoxModal(false);
      queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
      toast.success('Cause added to donation box!');
      
      // Check if donation box exists and navigate accordingly
      try {
        const donationBoxData = await getDonationBox();
        if (!donationBoxData || !donationBoxData.id) {
          // Navigate to donation box setup
          navigate('/donation?tab=setup', {
            state: {
              preselectedItem: {
                id: causeId,
                type: 'cause',
                data: causeData,
              },
              activeTab: 'nonprofits',
            },
          });
        } else {
          // Navigate to donation box with cause preselected
          navigate('/donation', {
            state: {
              preselectedItem: {
                id: causeId,
                type: 'cause',
                data: causeData,
              },
              activeTab: 'nonprofits',
            },
          });
        }
      } catch (error) {
        console.error('Error checking donation box:', error);
      }
    },
    onError: (error: any) => {
      console.error('Error adding cause to donation box:', error);
      if (error.response?.status === 403) {
        navigate('/onboarding');
      } else {
        toast.error('Failed to add cause to donation box.');
      }
    },
  });

  // Handle outside click for add to box modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addToBoxModalRef.current &&
        !addToBoxModalRef.current.contains(event.target as Node)
      ) {
        setShowAddToBoxModal(false);
      }
    };

    if (showAddToBoxModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddToBoxModal]);

  // Loading state
  if (isLoadingCause) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state
  if (causeError || !causeData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-3 md:px-4">
        <div className="text-center">
          <p className="text-base md:text-lg font-semibold text-gray-900 mb-1.5 md:mb-2">
            Nonprofit not found
          </p>
          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
            The nonprofit you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/')} variant="outline" className="text-sm md:text-base py-2 md:py-2.5 px-3 md:px-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToDonationBox = () => {
    if (!currentUser?.id) {
      navigate('/onboarding');
      return;
    }
    setShowAddToBoxModal(true);
  };

  const handleConfirmAddToBox = () => {
    addToDonationBoxMutation.mutate();
  };

  const handleDonate = () => {
    if (!currentUser?.id) {
      navigate('/onboarding');
      return;
    }
    // Navigate to one-time donation flow
    navigate('/donation', {
      state: {
        preselectedItem: {
          id: causeId,
          type: 'cause',
          data: causeData,
        },
        activeTab: 'nonprofits',
      },
    });
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <CauseHeader
        title={causeData.name || 'Nonprofit'}
        causeId={causeId}
        isFavorite={causeData.is_favorite}
        onShare={handleShare}
      />

        <div className='lg:max-w-[60%] lg:mx-auto'>

      <CauseProfile causeData={causeData} />

      <CauseActionButtons
        onAddToDonationBox={handleAddToDonationBox}
        onDonate={handleDonate}
      />
      

      <VerifiedNonprofitInfo causeData={causeData} />

      <OrganizationMission causeData={causeData} />

      <CauseDetails causeData={causeData} />

      <SimilarNonprofits similarCauses={similarCauses} isLoading={isLoadingSimilar} />

</div>

      <Footer />

      {/* Add to Donation Box Confirmation Modal */}
      {showAddToBoxModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4">
          <div
            ref={addToBoxModalRef}
            className="bg-white rounded-lg max-w-md w-full mx-3 md:mx-4 p-4 md:p-6 relative"
          >
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1.5 md:mb-2">
              Add to Donation Box?
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              This will add {causeData?.name} to your donation box. You can manage your donations anytime.
            </p>
            <div className="flex items-center justify-center gap-2.5 md:gap-3">
              <Button
                onClick={() => setShowAddToBoxModal(false)}
                variant="outline"
                disabled={addToDonationBoxMutation.isPending}
                className="text-sm md:text-base py-2 md:py-2.5 px-3 md:px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAddToBox}
                disabled={addToDonationBoxMutation.isPending}
                className="bg-[#84CC16] hover:bg-[#6BB00F] text-white text-sm md:text-base py-2 md:py-2.5 px-3 md:px-4"
              >
                {addToDonationBoxMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add to Box'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <SharePost
        url={window.location.href}
        title={`Check out this Nonprofit: ${causeData?.name || 'Nonprofit'}`}
        description={causeData?.mission || causeData?.description || 'Join us in supporting this important cause.'}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}

