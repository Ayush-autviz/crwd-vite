import { X, Info, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { createOneTimeDonation, createFundraiserDonation } from "@/services/api/donation";
import CrwdAnimation from "@/assets/newLogo/CrwdAnimation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
          <div className="px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  Review Your Donation
                </h2>
                <p className="text-xs md:text-sm text-gray-600">
                  Review your donation details before proceeding to payment.
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-2 md:ml-4 p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
            {/* Summary Box */}
            <div className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 mb-4 md:mb-6 space-y-2.5 md:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-gray-600">Amount:</span>
                <span className="text-sm md:text-base font-semibold text-gray-900">${donationAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-gray-600">Split among:</span>
                <span className="text-sm md:text-base font-semibold text-gray-900">{totalCauses} cause{totalCauses !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 md:gap-1.5">
                  <span className="text-xs md:text-sm text-gray-600">Platform fee:</span>
                  <Info className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                </div>
                <span className="text-sm md:text-base font-semibold text-gray-900">${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-gray-600">Per cause:</span>
                <span className="text-sm md:text-base font-semibold text-gray-900">${perCause.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm md:text-base font-semibold text-gray-900">Total:</span>
                <span className="text-lg md:text-xl font-bold text-[#1600ff]">${donationAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] md:text-xs text-gray-500 mb-4 md:mb-6 leading-relaxed">
              Donations are distributed as grants through the CRWD Foundation, a 501(c)(3) (EIN: 41-2423690). Tax-deductible receipts sent via email.
            </p>

            {/* Selected Causes */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Your Selected Causes ({totalCauses})</h3>
              <div className="space-y-2 md:space-y-3">
                {selectedCauses.map((cause: any) => {
                  const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                  const initials = getInitials(cause.name);
                  return (
                    <div key={cause.id} className="flex items-center gap-2.5 md:gap-3 p-2.5 md:p-3 bg-gray-50 rounded-lg">
                      <Avatar className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex-shrink-0 border border-gray-200">
                        <AvatarImage src={cause.image} />
                        <AvatarFallback
                          style={{ backgroundColor: avatarBgColor }}
                          className="font-semibold rounded-lg text-white text-xs md:text-sm"
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs md:text-sm text-gray-900 truncate">
                          {cause.name}
                        </h4>
                      </div>
                      <div className="text-xs md:text-sm font-semibold text-gray-900">
                        ${perCause.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Button */}
          <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 bg-white">
            <button
              onClick={handleCompleteDonation}
              disabled={isProcessing || showLogoAnimation}
              className={cn(
                "w-full bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold py-3 md:py-4 rounded-full transition-colors text-sm md:text-base flex items-center justify-center gap-2",
                (isProcessing || showLogoAnimation) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                'Complete Donation'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

