import { useState, useEffect } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface AddToDonationBoxBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  causeData: {
    id: number;
    name: string;
    mission?: string;
    description?: string;
    image?: string;
    logo?: string;
    category?: string;
  };
  donationBoxCount: number;
  onConfirm: () => void;
  isPending?: boolean;
}

export default function AddToDonationBoxBottomSheet({
  isOpen,
  onClose,
  causeData,
  donationBoxCount,
  onConfirm,
  isPending = false,
}: AddToDonationBoxBottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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

  // Get icon color for avatar fallback
  const getIconColor = (id: number | string): string => {
    const colors = [
      '#1600ff', // Blue
      '#10B981', // Green
      '#EC4899', // Pink
      '#F59E0B', // Amber
      '#8B5CF6', // Purple
      '#EF4444', // Red
    ];
    const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const iconColor = getIconColor(causeData.id);
  const iconLetter = causeData.name.charAt(0).toUpperCase();
  const imageUrl = causeData.logo || causeData.image || '';
  const hasImage = imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/') || imageUrl.startsWith('data:'));

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-300",
        isAnimating ? "opacity-100" : "opacity-0"
      )}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />

      {/* Bottom Sheet */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 max-h-[60vh] sm:max-h-[50vh] flex flex-col",
          isAnimating ? "translate-y-0" : "translate-y-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-2 sm:pt-3 pb-1.5 sm:pb-2">
          <div className="w-10 sm:w-12 h-0.5 sm:h-1.5 bg-gray-300 rounded-full" />
        </div>


        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {/* Title */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">
            Add to Donation Box
          </h2>

          {/* Donation Box Count */}
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4">
            You have {donationBoxCount} nonprofit{donationBoxCount !== 1 ? 's' : ''} in your donation box
          </p>

          {/* Cause Card */}
          <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border border-gray-200 bg-white mb-4 sm:mb-6">
            {/* Image */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
              {hasImage ? (
                <img
                  src={imageUrl}
                  alt={causeData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Avatar className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg">
                  <AvatarFallback
                    className="text-white text-lg sm:text-2xl font-bold"
                    style={{ backgroundColor: iconColor }}
                  >
                    {iconLetter}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                {causeData.name}
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mb-1 sm:mb-2 line-clamp-2">
                {causeData.mission || causeData.description || ''}
              </p>

            </div>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="w-full bg-[#aeff30] hover:bg-[#6BB00F] text-black text-sm sm:text-base md:text-lg font-medium py-2.5 sm:py-3 md:py-3.5 mb-2 sm:mb-3 rounded-full"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2" />
                <span className="mr-1.5 sm:mr-2">Confirm & Add</span>
              </>
            )}
          </Button>

          {/* Cancel Link */}
          <button
            onClick={onClose}
            disabled={isPending}
            className="w-full text-center text-gray-600 text-xs sm:text-sm md:text-base font-medium py-1.5 sm:py-2 hover:text-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

