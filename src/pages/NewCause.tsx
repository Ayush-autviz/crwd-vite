import { useState } from 'react';
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
import { Toast } from '@/components/ui/toast';
import { getCausesBySearch } from '@/services/api/crwd';
import Footer from '@/components/Footer';
import AddToDonationBoxBottomSheet from '@/components/newcause/AddToDonationBoxBottomSheet';

export default function NewCausePage() {
  const { causeId } = useParams<{ causeId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddToBoxModal, setShowAddToBoxModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

  // Fetch donation box to check if cause is already added
  const { data: donationBoxData } = useQuery({
    queryKey: ['donationBox', currentUser?.id],
    queryFn: getDonationBox,
    enabled: !!currentUser?.id,
  });

  // Check if current cause is already in the donation box
  const isCauseInBox = donationBoxData?.box_causes?.some((boxCause: any) => {
    const cause = boxCause.cause || boxCause;
    return cause?.id?.toString() === causeId || boxCause.cause_id?.toString() === causeId;
  }) || false;

  // Add cause to donation box mutation
  const addToDonationBoxMutation = useMutation({
    mutationFn: async () => {
      if (!causeId) throw new Error('Cause ID is missing');
      // Use correct API format: { causes: [{ cause_id: 0 }] } without attributed_collective
      return addCausesToBox({ 
        causes: [{ 
          cause_id: parseInt(causeId) 
        }] 
      });
    },
    onSuccess: async () => {
      setShowAddToBoxModal(false);
      queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
      
      // Show custom toast
      setToastMessage('Cause added to donation box!');
      setShowToast(true);
      
      // Always navigate to setup tab explicitly
      navigate('/donation?tab=setup', {
        replace: true,
      });
    },
    onError: (error: any) => {
      console.error('Error adding cause to donation box:', error);
      if (error.response?.status === 403) {
        navigate('/onboarding');
      } else {
        setToastMessage('Failed to add cause to donation box.');
        setShowToast(true);
      }
    },
  });

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

  const handleConfirmAddToBox = async () => {
    // Check if donation box exists first
    try {
      const donationBox = await getDonationBox();
      
      // If donation box is not set up, navigate to donation page with cause preselected
      if (!donationBox || !donationBox.id || donationBox.message === "Donation box not found") {
        setShowAddToBoxModal(false);
        navigate('/donation?tab=setup', {
          state: {
            preselectedItem: {
              id: causeId || '',
              type: 'cause',
              data: causeData,
            },
            preselectedCauses: causeId ? [parseInt(causeId)] : [],
            preselectedCausesData: causeData ? [{
              id: causeData.id,
              name: causeData.name,
              description: causeData.description || causeData.mission || '',
              mission: causeData.mission || '',
              logo: causeData.image || causeData.logo || '',
            }] : [],
          },
        });
        return;
      }
      
      // If donation box exists, check capacity before adding cause
      // Calculate fees and capacity
      // For donations < $10.00: Flat fee of $1.00
      // For donations ≥ $10.00: 10% of total (covers all platform + processing costs)
      const calculateFees = (grossAmount: number) => {
        const gross = grossAmount;
        let crwdFee: number;
        let net: number;
        
        if (gross < 10.00) {
          // Flat fee of $1.00
          crwdFee = 1.00;
          net = gross - crwdFee;
        } else {
          // 10% of total
          crwdFee = gross * 0.10;
          net = gross - crwdFee;
        }
        
        return {
          crwdFee: Math.round(crwdFee * 100) / 100,
          net: Math.round(net * 100) / 100,
        };
      };

      const monthlyAmount = parseFloat(donationBox.monthly_amount || '0');
      const fees = calculateFees(monthlyAmount);
      const net = fees.net;
      const maxCapacity = Math.floor(net / 0.20);
      
      // Count current causes in the box
      const boxCauses = donationBox.box_causes || [];
      const currentCapacity = boxCauses.length;
      
      // Check if adding this cause would exceed capacity
      if (currentCapacity >= maxCapacity) {
        setToastMessage(`Your donation box is full. You can only support up to ${maxCapacity} cause${maxCapacity !== 1 ? 's' : ''} for $${monthlyAmount} per month. Please increase your donation amount or remove a cause to add this one.`);
        setShowToast(true);
        setShowAddToBoxModal(false);
        return;
      }
      
      // If capacity check passes, proceed with adding
      addToDonationBoxMutation.mutate();
    } catch (error) {
      console.error('Error checking donation box:', error);
      // If there's an error (might be "Donation box not found"), navigate to setup with preselected cause
      setShowAddToBoxModal(false);
      navigate('/donation?tab=setup', {
        state: {
          preselectedItem: {
            id: causeId || '',
            type: 'cause',
            data: causeData,
          },
          preselectedCauses: causeId ? [parseInt(causeId)] : [],
          preselectedCausesData: causeData ? [{
            id: causeData.id,
            name: causeData.name,
            description: causeData.description || causeData.mission || '',
            mission: causeData.mission || '',
            logo: causeData.image || causeData.logo || '',
          }] : [],
        },
      });
    }
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
        isAlreadyInBox={isCauseInBox}
      />
      

      <VerifiedNonprofitInfo causeData={causeData} />

      <OrganizationMission causeData={causeData} />

      <CauseDetails causeData={causeData} />

      <SimilarNonprofits similarCauses={similarCauses} isLoading={isLoadingSimilar} />

</div>

      <Footer />

      {/* Add to Donation Box Bottom Sheet */}
      {causeData && (
        <AddToDonationBoxBottomSheet
          isOpen={showAddToBoxModal}
          onClose={() => setShowAddToBoxModal(false)}
          causeData={causeData}
          donationBoxCount={donationBoxData?.box_causes?.length || 0}
          onConfirm={handleConfirmAddToBox}
          isPending={addToDonationBoxMutation.isPending}
        />
      )}

      <SharePost
        url={window.location.href}
        title={`Check out this Nonprofit: ${causeData?.name || 'Nonprofit'}`}
        description={causeData?.mission || causeData?.description || 'Join us in supporting this important cause.'}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Custom Toast */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
      />
    </div>
  );
}

