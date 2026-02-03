import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Nonprofit {
  id: number;
  name?: string;
  logo?: string;
  image?: string;
  description?: string;
  mission?: string;
  cause?: {
    id: number;
    name: string;
    image?: string;
    logo?: string;
    mission?: string;
    description?: string;
  };
}

interface JoinCollectiveBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  collectiveName: string;
  nonprofits: Nonprofit[];
  collectiveId: string;
  onJoin: (selectedNonprofits: Nonprofit[], collectiveId: string, shouldSetupDonationBox: boolean) => void;
  isJoining?: boolean;
  donationBox?: any;
  founderName?: string;
}

export default function JoinCollectiveBottomSheet({
  isOpen,
  onClose,
  collectiveName,
  nonprofits,
  collectiveId,
  onJoin,
  isJoining = false,
  donationBox,
  founderName,
}: JoinCollectiveBottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedNonprofitIds, setSelectedNonprofitIds] = useState<Set<number>>(new Set());
  const [hasInitialized, setHasInitialized] = useState(false);

  // Get existing cause IDs from donation box - memoized to prevent unnecessary re-renders
  const existingCauseIds = useMemo(() => {
    const ids = new Set<number>();
    if (donationBox?.box_causes && Array.isArray(donationBox.box_causes)) {
      donationBox.box_causes.forEach((boxCause: any) => {
        if (boxCause.cause?.id) {
          ids.add(boxCause.cause.id);
        }
      });
    }
    return ids;
  }, [donationBox?.box_causes]);

  // Check if donation box exists
  const hasDonationBox = donationBox && donationBox.id;

  // Check capacity: compare box_causes.length with capacity
  const currentCapacity = donationBox?.box_causes?.length || 0;
  const maxCapacity = donationBox?.capacity || 0;
  const isAtCapacity = hasDonationBox && currentCapacity >= maxCapacity;

  // Get available nonprofits (excluding those already in donation box)
  const availableNonprofits = nonprofits.filter((np) => {
    const cause = np.cause || np;
    const causeId = cause.id || np.id;
    return !existingCauseIds.has(causeId);
  });

  // Initialize all nonprofits as selected when modal first opens (excluding those already in donation box)
  // Only if not at capacity - only run once when modal opens
  useEffect(() => {
    if (isOpen && !hasInitialized) {
      if (nonprofits.length > 0 && !isAtCapacity) {
        const availableIds = nonprofits
          .map((np) => {
            const causeId = np.cause?.id || np.id;
            return existingCauseIds.has(causeId) ? null : causeId;
          })
          .filter((id): id is number => id !== null);

        setSelectedNonprofitIds(new Set(availableIds));
      } else if (isAtCapacity) {
        // Clear selection if at capacity
        setSelectedNonprofitIds(new Set());
      }
      setHasInitialized(true);
    } else if (!isOpen && hasInitialized) {
      // Reset initialization flag and selection when modal closes
      setHasInitialized(false);
      setSelectedNonprofitIds(new Set());
    }
  }, [isOpen, hasInitialized, nonprofits, existingCauseIds, isAtCapacity]);

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

  const handleToggleNonprofit = (id: number) => {
    // Don't allow toggling if at capacity or cause is already in donation box
    if (isAtCapacity || existingCauseIds.has(id)) {
      return;
    }

    setSelectedNonprofitIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeselectAll = () => {
    // Don't allow if at capacity
    if (isAtCapacity) {
      return;
    }

    if (selectedNonprofitIds.size === availableNonprofits.length) {
      // If all available selected, deselect all
      setSelectedNonprofitIds(new Set());
    } else {
      // If some/none selected, select all available
      setSelectedNonprofitIds(new Set(availableNonprofits.map((np) => {
        const cause = np.cause || np;
        return cause.id || np.id;
      })));
    }
  };

  const handleJoin = (shouldSetupDonationBox: boolean = false) => {
    // Get full nonprofit objects for selected IDs
    const selectedNonprofits = nonprofits.filter((np) => {
      const cause = np.cause || np;
      const nonprofitId = cause.id || np.id;
      return selectedNonprofitIds.has(nonprofitId);
    });
    onJoin(selectedNonprofits, collectiveId, shouldSetupDonationBox);
  };

  const selectedCount = selectedNonprofitIds.size;
  const allSelected = selectedCount === availableNonprofits.length && availableNonprofits.length > 0;

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
          "absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 max-h-[75vh] sm:max-h-[85vh] md:max-h-[90vh] overflow-hidden flex flex-col",
          isAnimating ? "translate-y-0" : "translate-y-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-2 sm:pt-3 pb-1.5 sm:pb-2">
          <div className="w-10 sm:w-12 h-1 sm:h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-b border-gray-200 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">
                You've joined {collectiveName}!
              </h2>
              <p className="text-xs sm:text-base md:text-base text-gray-600">
                {isAtCapacity
                  ? "Your donation box is at capacity. Increase your donation to add more nonprofits."
                  : `${founderName || collectiveName} chose these nonprofits to support. Add them to your donation box to support them too.`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-1.5 sm:ml-2 md:ml-4 p-1 sm:p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
          {/* Capacity Error Message */}
          {isAtCapacity && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6">
              <p className="text-xs sm:text-sm md:text-base text-red-800 font-medium">
                Amazing! Your donation box is at capacity. Increase your donation to add more nonprofits.
              </p>
            </div>
          )}

          {/* Deselect All / Select All - Only show if not at capacity and has donation box */}
          {!isAtCapacity && hasDonationBox && (
            <button
              onClick={handleDeselectAll}
              className="w-full flex items-center justify-between p-2.5 sm:p-3 md:p-4 mb-2 sm:mb-2.5 md:mb-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded border-2 flex items-center justify-center transition-colors",
                    allSelected
                      ? "bg-[#1600ff] border-[#1600ff]"
                      : "bg-white border-gray-300"
                  )}
                >
                  {allSelected && (
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm sm:text-base md:text-base font-medium text-gray-900">
                  {allSelected ? 'Deselect All' : 'Select All'}
                </span>
              </div>
              <span className="text-sm sm:text-base md:text-base font-medium text-[#1600ff]">
                {selectedCount} of {availableNonprofits.length} selected
              </span>
            </button>
          )}

          {/* Nonprofits List */}
          <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5 mb-3 sm:mb-4 md:mb-6">
            {nonprofits.map((nonprofit) => {
              const cause = nonprofit.cause || nonprofit;
              const nonprofitId = cause.id || nonprofit.id;
              const nonprofitName = cause.name || nonprofit.name || 'Unknown Nonprofit';
              const nonprofitImage = cause.image || cause.logo || nonprofit.image || nonprofit.logo;
              const isSelected = selectedNonprofitIds.has(nonprofitId);
              const isDisabled = existingCauseIds.has(nonprofitId);
              const avatarBgColor = getConsistentColor(nonprofitId, avatarColors);
              const initials = getInitials(nonprofitName);

              return (
                <button
                  key={nonprofit.id}
                  onClick={() => handleToggleNonprofit(nonprofitId)}
                  disabled={isDisabled || isAtCapacity}
                  className={cn(
                    "w-full flex items-center gap-2 sm:gap-3 md:gap-4 p-2.5 sm:p-3 md:p-4 bg-gray-50   border border-gray-200 rounded-lg transition-colors text-left",
                    (isDisabled || isAtCapacity)
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  )}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                      (isDisabled || isAtCapacity)
                        ? "bg-gray-200 border-gray-300"
                        : isSelected
                          ? "bg-[#1600ff] border-[#1600ff]"
                          : "bg-white border-gray-300"
                    )}
                  >
                    {(isDisabled || isAtCapacity) ? (
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isSelected ? (
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </div>

                  {/* Nonprofit Icon/Avatar */}
                  {nonprofitImage ? (
                    <img
                      src={nonprofitImage}
                      alt={nonprofitName}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        // Fallback to colored circle with initials if image fails
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                      !nonprofitImage ? "flex" : "hidden"
                    )}
                    style={{ backgroundColor: avatarBgColor }}
                  >
                    <span className="text-white font-bold text-xs sm:text-sm md:text-base">
                      {initials}
                    </span>
                  </div>

                  {/* Nonprofit Name */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-sm md:text-base text-gray-900 truncate">
                      {nonprofitName}
                    </h4>
                    {isDisabled && !isAtCapacity && (
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Already in your donation box</p>
                    )}
                    {isAtCapacity && (
                      <p className="text-[10px] sm:text-xs text-red-600 mt-0.5">At capacity</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Banner - Only show if not at capacity */}
          {!isAtCapacity && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6">
              <p className="text-xs sm:text-xs md:text-sm text-indigo-900 leading-relaxed">
                {/* {hasDonationBox
                  ? "Selected nonprofits will be added to your donation box. You can manage them anytime from your profile."
                  : "Set up your donation box to start supporting these nonprofits with a monthly donation."
                } */}
                Your donation box holds nonprofits you want to donate to. You can set up recurring or one-time donations anytime.
              </p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 border-t border-gray-200 bg-white space-y-2 sm:space-y-2.5 md:space-y-3">
          {!hasDonationBox ? (
            <>
              {/* No donation box - Show setup button and "Not now" */}
              <Button
                onClick={() => handleJoin(true)}
                disabled={isJoining || selectedCount === 0}
                className={cn(
                  "w-full text-white font-semibold py-3 sm:py-4 md:py-6 rounded-lg transition-all text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl",
                  isJoining || selectedCount === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#1600ff] hover:bg-[#1400cc]"
                )}
              >
                Set Up Donation Box
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium py-2 sm:py-2.5 md:py-3 rounded-lg text-xs sm:text-sm md:text-base"
              >
                Not Now
              </Button>
            </>
          ) : isAtCapacity ? (
            <>
              {/* At capacity - Just close button */}
              <Button
                onClick={onClose}
                className="w-full bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold py-3 sm:py-4 md:py-6 rounded-lg text-xs sm:text-sm md:text-base"
              >
                Got It
              </Button>
            </>
          ) : (
            <>
              {/* Has donation box and not at capacity - Add to box */}
              <Button
                onClick={() => handleJoin(false)}
                disabled={isJoining || selectedCount === 0}
                className={cn(
                  "w-full text-white font-semibold py-3 sm:py-4 md:py-6 rounded-lg transition-all text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl",
                  isJoining || selectedCount === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#1600ff] hover:bg-[#1400cc]"
                )}
              >
                Add to Donation Box
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium py-2 sm:py-2.5 md:py-3 rounded-lg text-xs sm:text-sm md:text-base"
              >
                Not Now
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

