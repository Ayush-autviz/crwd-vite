import { X, Info, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { createOneTimeDonation, createFundraiserDonation } from "@/services/api/donation";
import CrwdAnimation from "@/assets/newLogo/CrwdAnimation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import PlatformFeeInfoBottomSheet from "./PlatformFeeInfoBottomSheet";

interface OneTimeDonationReviewBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  donationAmount: number;
  selectedCauses: any[];
  fundraiserId?: number;
  onComplete: () => void;
}

export default function OneTimeDonationReviewBottomSheet({
  isOpen,
  onClose,
  donationAmount,
  selectedCauses,
  fundraiserId,
  onComplete,
}: OneTimeDonationReviewBottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLogoAnimation, setShowLogoAnimation] = useState(false);
  const [isPlatformFeeInfoOpen, setIsPlatformFeeInfoOpen] = useState(false);

  // One-time donation mutation
  const oneTimeDonationMutation = useMutation({
    mutationFn: createOneTimeDonation,
    onSuccess: (response) => {
      console.log('One-time donation response:', response);
      // Show logo animation
      setShowLogoAnimation(true);
      // Wait for animation to complete (3 seconds for one full cycle) before navigating
      setTimeout(() => {
        setShowLogoAnimation(false);
        // Redirect to checkout URL if provided
        if (response?.checkout_url) {
          window.location.href = response.checkout_url;
        } else {
          // If no checkout URL, call onComplete callback
          onComplete();
        }
      }, 3000);
    },
    onError: (error: any) => {
      console.error('One-time donation error:', error);
      setShowLogoAnimation(false);
    },
  });

  // Fundraiser donation mutation
  const fundraiserDonationMutation = useMutation({
    mutationFn: createFundraiserDonation,
    onSuccess: (response) => {
      console.log('Fundraiser donation response:', response);
      // Show logo animation
      setShowLogoAnimation(true);
      // Wait for animation to complete before navigating
      setTimeout(() => {
        setShowLogoAnimation(false);
        if (response.checkout_url) {
          window.location.href = response.checkout_url;
        } else {
          onComplete();
        }
      }, 3000);
    },
    onError: (error: any) => {
      console.error('Fundraiser donation error:', error);
      setShowLogoAnimation(false);
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setIsVisible(true);
      setIsPlatformFeeInfoOpen(false);
      setIsAnimating(false);
      timer = setTimeout(() => setIsAnimating(true), 20);
    } else if (isVisible) {
      setIsAnimating(false);
      timer = setTimeout(() => setIsVisible(false), 300);
    }
    return () => clearTimeout(timer);
  }, [isOpen, isVisible]);

  if (!isVisible) return null;

  // Calculate fees using the provided formula
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

  const actualDonationAmount = parseFloat(donationAmount.toString());
  const fees = calculateFees(actualDonationAmount);

  // Platform fee = CRWD fee (covers all platform + processing costs)
  const platformFee = fees.crwdFee;

  // Calculate totals - only count causes (not collectives)
  const totalCauses = selectedCauses.length;
  const perCause = totalCauses > 0 ? fees.net / totalCauses : 0;

  // Avatar colors for consistent coloring
  const avatarColors = [
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F97316', // Orange
    '#10B981', // Green
    '#3B82F6', // Blue
  ];

  const getConsistentColor = (id: number | string, colors: string[]) => {
    const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getInitials = (name: string) => {
    if (!name) return 'N';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const handleCompleteDonation = () => {
    // If this is a fundraiser donation, use the fundraiser API
    if (fundraiserId) {
      const selectedCauseIds = selectedCauses.map((cause: any) => cause.id);

      const requestBody = {
        fundraiser_id: fundraiserId,
        amount: donationAmount.toString(),
        selected_cause_ids: selectedCauseIds.length > 0 ? selectedCauseIds : [0],
      };

      console.log('Sending fundraiser donation request:', requestBody);
      fundraiserDonationMutation.mutate(requestBody);
      return;
    }

    // Regular one-time donation
    // Prepare request body according to API specification
    // Format: { amount: string, causes: [{ cause_id: number, attributed_collective?: number }] }
    const causes: Array<{ cause_id: number; attributed_collective?: number }> = [];

    // Process selected causes and build causes array
    selectedCauses.forEach((cause: any) => {
      const causeId = cause.id;
      const causeEntry: { cause_id: number; attributed_collective?: number } = {
        cause_id: causeId,
      };

      // Only include attributed_collective if it exists and is not "manual"
      if (cause.attributed_collective &&
        cause.attributed_collective > 0 &&
        cause.attributed_collective !== 'manual' &&
        cause.attributed_collective !== 'Manual') {
        causeEntry.attributed_collective = cause.attributed_collective;
      }

      causes.push(causeEntry);
    });

    // Build request body
    const requestBody: {
      amount: string;
      causes: Array<{ cause_id: number; attributed_collective?: number }>;
    } = {
      amount: donationAmount.toString(),
      causes: causes.length > 0 ? causes : [{ cause_id: 0 }],
    };

    console.log('Sending one-time donation request:', requestBody);
    oneTimeDonationMutation.mutate(requestBody);
  };

  const isProcessing = oneTimeDonationMutation.isPending || fundraiserDonationMutation.isPending;

  return (
    <>
      {/* Logo Animation Overlay */}
      {showLogoAnimation && (
        <div className="fixed inset-0 bg-white z-[60] flex items-center justify-center">
          <CrwdAnimation size="lg" className="items-center justify-center" />
        </div>
      )}

      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          isAnimating ? 'opacity-100' : 'opacity-0',
          showLogoAnimation && 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Bottom Sheet */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl md:rounded-t-3xl shadow-2xl transition-transform duration-300 max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col",
            isAnimating ? 'translate-y-0' : 'translate-y-full'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle Bar */}
          <div className="flex justify-center pt-2 md:pt-3 pb-1.5 md:pb-2">
            <div className="w-10 md:w-12 h-1 md:h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 md:px-7 pt-4 md:pt-6 pb-4 md:pb-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1.5 leading-tight">
                  Review your donation
                </h2>
                <p className="text-xs md:text-sm text-gray-600 font-medium">
                  Review and confirm. You can change this anytime.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 -mt-1"
                aria-label="Close"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
            {/* Summary Box */}
            <div className="bg-[#FEFCE8] rounded-2xl p-4 md:p-6 mb-5 md:mb-7 space-y-3 md:space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200/50 pb-3 md:pb-4">
                <span className="text-sm md:text-base text-gray-600">Amount</span>
                <span className="text-sm md:text-base font-bold text-gray-900">${donationAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200/50 pb-3 md:pb-4">
                <span className="text-sm md:text-base text-gray-600">Split among</span>
                <span className="text-sm md:text-base font-bold text-gray-900">{totalCauses} nonprofit{totalCauses !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200/50 pb-3 md:pb-4">
                <button
                  type="button"
                  className="flex items-center gap-1.5 group cursor-pointer"
                  onClick={() => setIsPlatformFeeInfoOpen(true)}
                >
                  <span className="text-sm md:text-base text-gray-600">Platform fee</span>
                  <div className="bg-gray-200/50 p-0.5 rounded-full text-gray-400 group-hover:text-gray-600 transition-colors">
                    <Info className="w-4 h-4" />
                  </div>
                </button>
                <span className="text-sm md:text-base font-bold text-gray-900">${platformFee.toFixed(2)}</span>
              </div>
              <div className="pt-1 flex justify-between items-center">
                <span className="text-base md:text-lg font-bold text-gray-900">Total</span>
                <span className="text-xl md:text-2xl font-bold text-[#1600ff]">${donationAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] md:text-xs text-gray-500 mb-4 md:mb-6 leading-relaxed">
              Donations are distributed as grants through the CRWD Foundation, a 501(c)(3) (EIN: 41-2423690). Tax-deductible receipts sent via email.
            </p>

            {/* Selected Causes */}
            <div className="mb-6 md:mb-8">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Your Donation Box</h3>
              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {selectedCauses.map((cause: any) => {
                  const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                  const initials = getInitials(cause.name);
                  return (
                    <div key={cause.id} className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-white hover:bg-gray-50 transition-colors">
                      <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex-shrink-0 border border-gray-100">
                        <AvatarImage src={cause.image || cause.logo} className="object-cover" />
                        <AvatarFallback
                          style={{ backgroundColor: avatarBgColor + '15', color: avatarBgColor }}
                          className="font-bold rounded-xl text-[10px] md:text-xs"
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm md:text-base text-gray-900 truncate">
                          {cause.name}
                        </h4>
                      </div>
                      <div className="text-sm md:text-lg font-bold text-[#1600ff]">
                        ${perCause.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Button */}
          <div className="px-5 md:px-7 py-4 md:py-6 border-t border-gray-100 bg-white">
            <button
              onClick={handleCompleteDonation}
              disabled={isProcessing || showLogoAnimation}
              className={cn(
                "w-full bg-[#1600ff] hover:bg-[#1400cc] text-white font-bold py-4 md:py-5 rounded-2xl transition-all shadow-lg shadow-blue-200 text-base md:text-lg flex items-center justify-center gap-3 cursor-pointer",
                (isProcessing || showLogoAnimation) && 'opacity-60'
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                'Confirm Donation'
              )}
            </button>
            {/* <div className="mt-4 flex flex-col items-center">
              <button
                onClick={onClose}
                className="text-[#64748b] font-bold text-sm md:text-base hover:text-gray-900 transition-colors py-2 cursor-pointer"
              >
                Go Back
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <PlatformFeeInfoBottomSheet
        isOpen={isPlatformFeeInfoOpen}
        onClose={() => setIsPlatformFeeInfoOpen(false)}
      />
    </>
  );
}

