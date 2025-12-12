import { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';
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
  onJoin: (selectedNonprofits: Nonprofit[], collectiveId: string) => void;
  isJoining?: boolean;
}

export default function JoinCollectiveBottomSheet({
  isOpen,
  onClose,
  collectiveName,
  nonprofits,
  collectiveId,
  onJoin,
  isJoining = false,
}: JoinCollectiveBottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedNonprofitIds, setSelectedNonprofitIds] = useState<Set<number>>(new Set());

  // Initialize all nonprofits as selected when modal opens
  useEffect(() => {
    if (isOpen && nonprofits.length > 0) {
      setSelectedNonprofitIds(new Set(nonprofits.map((np) => {
        // Use cause.id if available, otherwise use np.id
        return np.cause?.id || np.id;
      })));
    }
  }, [isOpen, nonprofits]);

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
    if (selectedNonprofitIds.size === nonprofits.length) {
      // If all selected, deselect all
      setSelectedNonprofitIds(new Set());
    } else {
      // If some/none selected, select all
      setSelectedNonprofitIds(new Set(nonprofits.map((np) => {
        const cause = np.cause || np;
        return cause.id || np.id;
      })));
    }
  };

  const handleJoin = () => {
    // Get full nonprofit objects for selected IDs
    const selectedNonprofits = nonprofits.filter((np) => {
      const cause = np.cause || np;
      const nonprofitId = cause.id || np.id;
      return selectedNonprofitIds.has(nonprofitId);
    });
    onJoin(selectedNonprofits, collectiveId);
  };

  const selectedCount = selectedNonprofitIds.size;
  const allSelected = selectedCount === nonprofits.length;

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
          "absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 max-h-[90vh] overflow-hidden flex flex-col",
          isAnimating ? "translate-y-0" : "translate-y-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                Join {collectiveName}
              </h2>
              <p className="text-xs md:text-sm text-gray-600">
                Optionally add these nonprofits to your donation box. You can manage them anytime from your profile.
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-2 md:ml-4 p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
          {/* Deselect All / Select All */}
          <button
            onClick={handleDeselectAll}
            className="w-full flex items-center justify-between p-3 md:p-4 mb-2 md:mb-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div
                className={cn(
                  "w-5 h-5 md:w-6 md:h-6 rounded border-2 flex items-center justify-center transition-colors",
                  allSelected
                    ? "bg-[#1600ff] border-[#1600ff]"
                    : "bg-white border-gray-300"
                )}
              >
                {allSelected && (
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm md:text-base font-medium text-gray-900">
                {allSelected ? 'Deselect All' : 'Select All'}
              </span>
            </div>
            <span className="text-sm md:text-base font-medium text-[#1600ff]">
              {selectedCount} of {nonprofits.length} selected
            </span>
          </button>

          {/* Nonprofits List */}
          <div className="space-y-2 md:space-y-2.5 mb-4 md:mb-6">
            {nonprofits.map((nonprofit) => {
              const cause = nonprofit.cause || nonprofit;
              const nonprofitId = cause.id || nonprofit.id;
              const nonprofitName = cause.name || nonprofit.name || 'Unknown Nonprofit';
              const nonprofitImage = cause.image || cause.logo || nonprofit.image || nonprofit.logo;
              const isSelected = selectedNonprofitIds.has(nonprofitId);
              const avatarBgColor = getConsistentColor(nonprofitId, avatarColors);
              const initials = getInitials(nonprofitName);
              
              return (
                <button
                  key={nonprofit.id}
                  onClick={() => handleToggleNonprofit(nonprofitId)}
                  className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      "w-5 h-5 md:w-6 md:h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                      isSelected
                        ? "bg-[#1600ff] border-[#1600ff]"
                        : "bg-white border-gray-300"
                    )}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Nonprofit Icon/Avatar */}
                  {nonprofitImage ? (
                    <img
                      src={nonprofitImage}
                      alt={nonprofitName}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0"
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
                      "w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                      !nonprofitImage ? "flex" : "hidden"
                    )}
                    style={{ backgroundColor: avatarBgColor }}
                  >
                    <span className="text-white font-bold text-sm md:text-base">
                      {initials}
                    </span>
                  </div>

                  {/* Nonprofit Name */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm md:text-base text-gray-900 truncate">
                      {nonprofitName}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Banner */}
          <div className="bg-[#fff3c7] border border-yellow-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
            <p className="text-xs md:text-sm text-yellow-900 leading-relaxed">
              Selected nonprofits will be added to your donation box. You can manage them anytime from your profile.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-4 md:px-6 py-4 md:py-5 border-t border-gray-200 bg-white space-y-2.5 md:space-y-3">
          <Button
            onClick={handleJoin}
            disabled={isJoining || selectedCount === 0}
            className={cn(
              "w-full text-white font-semibold py-4 md:py-6 rounded-lg transition-all text-sm md:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl",
              isJoining || selectedCount === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#1600ff] hover:bg-[#1400cc]"
            )}
          >
            {isJoining ? (
              <>
                <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Joining...</span>
              </>
            ) : (
              <>
                <span>Join Collective</span>
            
              </>
            )}
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium py-2.5 md:py-3 rounded-lg text-sm md:text-base"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

