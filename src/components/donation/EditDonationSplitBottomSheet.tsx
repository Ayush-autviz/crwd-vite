"use client";

import { useState, useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDonationBox } from "@/services/api/donation";
import { toast } from "sonner";

interface EditDonationSplitBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  causes: any[];
  monthlyAmount: number;
  boxCauses?: any[]; // Optional: to get existing percentages
}

// Slider colors for each nonprofit
const sliderColors = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

const avatarColors = [
  '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
  '#F97316', '#84CC16', '#A855F7', '#14B8A6', '#F43F5E', '#6366F1', '#22C55E', '#EAB308',
];

const getConsistentColor = (id: number | string, colors: string[]) => {
  const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getInitials = (name: string) => {
  const words = name.split(' ');
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function EditDonationSplitBottomSheet({
  isOpen,
  onClose,
  causes,
  monthlyAmount,
  boxCauses = [],
}: EditDonationSplitBottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [percentages, setPercentages] = useState<Record<number, number>>({});
  const [inputValues, setInputValues] = useState<Record<number, string>>({});

  // Initialize percentages - use existing if available, otherwise equal split
  useEffect(() => {
    if (causes.length > 0 && isOpen) {
      const minPercentage = calculateMinPercentage();
      const initialPercentages: Record<number, number> = {};
      const initialInputs: Record<number, string> = {};
      
      // Check if we have existing percentages from boxCauses
      const hasExistingPercentages = boxCauses.some((bc: any) => bc.percentage != null && bc.percentage !== undefined);
      
      if (hasExistingPercentages) {
        // Use existing percentages, but ensure they're at least minimum
        causes.forEach((cause: any) => {
          const boxCause = boxCauses.find((bc: any) => bc.cause?.id === cause.id);
          const existingPercentage = boxCause?.percentage || (100 / causes.length);
          initialPercentages[cause.id] = Math.max(minPercentage, existingPercentage);
          initialInputs[cause.id] = Math.max(minPercentage, existingPercentage).toFixed(2);
        });
      } else {
        // Equal split, but ensure each is at least minimum
        const equalPercentage = 100 / causes.length;
        if (equalPercentage < minPercentage) {
          // If equal split would be below minimum, set all to minimum
          causes.forEach((cause: any) => {
            initialPercentages[cause.id] = minPercentage;
            initialInputs[cause.id] = minPercentage.toFixed(2);
          });
        } else {
          causes.forEach((cause: any) => {
            initialPercentages[cause.id] = equalPercentage;
            initialInputs[cause.id] = equalPercentage.toFixed(2);
          });
        }
      }
      
      // Validate total is 100 and adjust if needed
      let total = causes.reduce((sum, cause) => sum + initialPercentages[cause.id], 0);
      if (Math.abs(total - 100) > 0.01) {
        const adjustment = (100 - total) / causes.length;
        causes.forEach((cause: any) => {
          const adjusted = initialPercentages[cause.id] + adjustment;
          initialPercentages[cause.id] = Math.max(minPercentage, adjusted);
          initialInputs[cause.id] = Math.max(minPercentage, adjusted).toFixed(2);
        });
      }
      
      setPercentages(initialPercentages);
      setInputValues(initialInputs);
    }
  }, [causes, isOpen, boxCauses, monthlyAmount]);

  // Handle animation
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

  // Calculate minimum percentage based on $0.20 minimum donation
  const calculateMinPercentage = () => {
    const netAmount = monthlyAmount * 0.9; // 90% after fees
    const MIN_DONATION = 0.20;
    return (MIN_DONATION / netAmount) * 100;
  };

  const adjustPercentages = (changedId: number, newPercentage: number) => {
    const otherCauses = causes.filter((c: any) => c.id !== changedId);
    const otherCount = otherCauses.length;
    const minPercentage = calculateMinPercentage();

    if (otherCount === 0) return;

    const newPercentages: Record<number, number> = { ...percentages };
    const newInputValues: Record<number, string> = { ...inputValues };

    // Ensure the changed percentage is at least the minimum
    const clampedNewPercentage = Math.max(minPercentage, Math.min(100, newPercentage));
    newPercentages[changedId] = clampedNewPercentage;
    newInputValues[changedId] = clampedNewPercentage.toFixed(2);

    // Calculate remaining percentage after the change
    const remainingPercentage = 100 - clampedNewPercentage;
    
    // Calculate total of current percentages for other causes
    const currentTotalOthers = otherCauses.reduce((sum, cause) => sum + (percentages[cause.id] || 0), 0);
    
    if (currentTotalOthers === 0) {
      // If others have no percentages yet, distribute equally
      const perOther = remainingPercentage / otherCount;
      if (perOther < minPercentage) {
        // If equal split would be below minimum, set all to minimum and adjust changed one
        otherCauses.forEach((cause: any) => {
          newPercentages[cause.id] = minPercentage;
          newInputValues[cause.id] = minPercentage.toFixed(2);
        });
        const totalForOthers = minPercentage * otherCount;
        const adjustedPercentage = 100 - totalForOthers;
        newPercentages[changedId] = Math.max(minPercentage, adjustedPercentage);
        newInputValues[changedId] = Math.max(minPercentage, adjustedPercentage).toFixed(2);
      } else {
        otherCauses.forEach((cause: any) => {
          newPercentages[cause.id] = perOther;
          newInputValues[cause.id] = perOther.toFixed(2);
        });
      }
    } else {
      // Preserve relative ratios of other causes, scale them to fit remaining percentage
      let scaleFactor = remainingPercentage / currentTotalOthers;
      
      // First pass: scale all others proportionally and check for minimum violations
      const scaledValues: Record<number, number> = {};
      let needsAdjustment = false;
      
      otherCauses.forEach((cause: any) => {
        const scaled = (percentages[cause.id] || 0) * scaleFactor;
        scaledValues[cause.id] = scaled;
        if (scaled < minPercentage) {
          needsAdjustment = true;
        }
      });
      
      if (!needsAdjustment) {
        // All scaled values are above minimum, use them directly
        otherCauses.forEach((cause: any) => {
          newPercentages[cause.id] = scaledValues[cause.id];
          newInputValues[cause.id] = scaledValues[cause.id].toFixed(2);
        });
      } else {
        // Some values would be below minimum, need to adjust
        // Set all below minimum to minimum first
        let remainingAfterMin = remainingPercentage;
        const causesBelowMin: any[] = [];
        const causesAboveMin: any[] = [];
        
        otherCauses.forEach((cause: any) => {
          if (scaledValues[cause.id] < minPercentage) {
            newPercentages[cause.id] = minPercentage;
            newInputValues[cause.id] = minPercentage.toFixed(2);
            remainingAfterMin -= minPercentage;
            causesBelowMin.push(cause);
          } else {
            causesAboveMin.push({ cause, originalValue: scaledValues[cause.id] });
          }
        });
        
        // Redistribute remaining among causes that were above minimum
        if (causesAboveMin.length > 0 && remainingAfterMin > 0) {
          const totalOriginalAboveMin = causesAboveMin.reduce((sum, item) => sum + item.originalValue, 0);
          if (totalOriginalAboveMin > 0) {
            const newScaleFactor = remainingAfterMin / totalOriginalAboveMin;
            causesAboveMin.forEach((item) => {
              const newValue = item.originalValue * newScaleFactor;
              // Ensure it's still above minimum after rescaling
              newPercentages[item.cause.id] = Math.max(minPercentage, newValue);
              newInputValues[item.cause.id] = Math.max(minPercentage, newValue).toFixed(2);
            });
          }
        }
        
        // Final check: ensure all are at least minimum and total is 100
        let finalTotal = clampedNewPercentage;
        otherCauses.forEach((cause: any) => {
          finalTotal += newPercentages[cause.id];
        });
        
        // If total doesn't equal 100, adjust the changed cause
        if (Math.abs(finalTotal - 100) > 0.01) {
          const adjustment = 100 - finalTotal;
          const newChangedValue = clampedNewPercentage + adjustment;
          if (newChangedValue >= minPercentage) {
            newPercentages[changedId] = newChangedValue;
            newInputValues[changedId] = newChangedValue.toFixed(2);
          }
        }
      }
    }
    
    // Final validation: ensure all causes are at least minimum
    let finalTotal = 0;
    causes.forEach((cause: any) => {
      if (newPercentages[cause.id] < minPercentage) {
        newPercentages[cause.id] = minPercentage;
        newInputValues[cause.id] = minPercentage.toFixed(2);
      }
      finalTotal += newPercentages[cause.id];
    });
    
    // If total exceeds 100 due to minimums, adjust the changed cause
    if (finalTotal > 100) {
      const excess = finalTotal - 100;
      const newChangedValue = newPercentages[changedId] - excess;
      if (newChangedValue >= minPercentage) {
        newPercentages[changedId] = newChangedValue;
        newInputValues[changedId] = newChangedValue.toFixed(2);
      }
    }

    setPercentages(newPercentages);
    setInputValues(newInputValues);
  };

  const handlePercentageChange = (causeId: number, value: number) => {
    const minPercentage = calculateMinPercentage();
    const clampedValue = Math.max(minPercentage, Math.min(100, value));
    adjustPercentages(causeId, clampedValue);
  };

  const handleInputChange = (causeId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputValues({ ...inputValues, [causeId]: value });
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      handlePercentageChange(causeId, numValue);
    }
  };

  const handleInputBlur = (causeId: number) => {
    const minPercentage = calculateMinPercentage();
    const numValue = parseFloat(inputValues[causeId] || '0') || 0;
    const clampedValue = Math.max(minPercentage, Math.min(100, numValue));
    // Format the input value to 2 decimal places
    setInputValues({ ...inputValues, [causeId]: clampedValue.toFixed(2) });
    adjustPercentages(causeId, clampedValue);
  };

  const handleDecrease = (causeId: number) => {
    const minPercentage = calculateMinPercentage();
    const current = percentages[causeId] || 0;
    if (current > minPercentage) {
      handlePercentageChange(causeId, Math.max(minPercentage, current - 1));
    }
  };

  const handleIncrease = (causeId: number) => {
    const current = percentages[causeId] || 0;
    if (current < 100) {
      handlePercentageChange(causeId, Math.min(100, current + 1));
    }
  };

  const handleReset = () => {
    const minPercentage = calculateMinPercentage();
    const equalPercentage = 100 / causes.length;
    const newPercentages: Record<number, number> = {};
    const newInputValues: Record<number, string> = {};
    
    if (equalPercentage < minPercentage) {
      // If equal split would be below minimum, set all to minimum
      causes.forEach((cause: any) => {
        newPercentages[cause.id] = minPercentage;
        newInputValues[cause.id] = minPercentage.toFixed(2);
      });
    } else {
      causes.forEach((cause: any) => {
        newPercentages[cause.id] = equalPercentage;
        newInputValues[cause.id] = equalPercentage.toFixed(2);
      });
    }
    
    setPercentages(newPercentages);
    setInputValues(newInputValues);
  };

  const queryClient = useQueryClient();

  // Mutation for updating donation box
  const updateDonationBoxMutation = useMutation({
    mutationFn: (data: any) => updateDonationBox(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationBox'] });
      toast.success('Donation split updated successfully');
      onClose();
    },
    onError: (error: any) => {
      console.error('Update donation box error:', error);
      toast.error(error?.response?.data?.message || 'Failed to update donation split');
    },
  });

  const handleSave = () => {
    // Check if there are any changes by comparing with initial percentages
    const hasChanges = causes.some((cause: any) => {
      const currentPercentage = percentages[cause.id] || 0;
      // Get initial percentage from boxCauses or calculate equal split
      const boxCause = boxCauses?.find((bc: any) => bc.cause?.id === cause.id);
      const initialPercentage = boxCause?.percentage || (100 / causes.length);
      
      // Compare with tolerance for floating point differences
      return Math.abs(currentPercentage - initialPercentage) > 0.01;
    });

    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    // Format request body according to the provided structure
    const causesData = causes.map((cause: any) => {
      const percentage = percentages[cause.id] || 0;
      // Find the boxCause to get attributed_collective
      const boxCause = boxCauses?.find((bc: any) => bc.cause?.id === cause.id);
      // Get attributed_collective - it can be an array or a single value
      let attributedCollective = null;
      if (boxCause?.attributed_collectives && Array.isArray(boxCause.attributed_collectives) && boxCause.attributed_collectives.length > 0) {
        // If it's an array, get the first value (usually a collective ID)
        attributedCollective = typeof boxCause.attributed_collectives[0] === 'object' 
          ? boxCause.attributed_collectives[0]?.id || boxCause.attributed_collectives[0]
          : boxCause.attributed_collectives[0];
      } else if (boxCause?.attributed_collective) {
        // If it's a single value
        attributedCollective = typeof boxCause.attributed_collective === 'object'
          ? boxCause.attributed_collective?.id || boxCause.attributed_collective
          : boxCause.attributed_collective;
      }
      
      // Build cause object - only include attributed_collective if it exists and is not "manual"
      const causeData: any = {
        cause_id: cause.id,
        percentage: parseFloat(percentage.toFixed(2)), // Number, not string
      };
      
      // Only add attributed_collective if it exists, is not null/undefined, and is not "manual"
      if (attributedCollective !== null && 
          attributedCollective !== undefined && 
          attributedCollective !== 'manual' &&
          attributedCollective !== 'Manual') {
        causeData.attributed_collective = attributedCollective;
      }
      
      return causeData;
    });

    const requestData = {
      monthly_amount: monthlyAmount.toString(),
      causes: causesData,
    };

    updateDonationBoxMutation.mutate(requestData);
    
    // Note: onSave is no longer called here to prevent double API calls
    // The API is now called directly via updateDonationBoxMutation
  };

  if (!isVisible) return null;

  const netAmount = monthlyAmount * 0.9; // 90% after fees (for display purposes)

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
          "absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 max-h-[85vh] flex flex-col",
          isAnimating ? "translate-y-0" : "translate-y-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Edit Donation Split</h2>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Adjust how your ${monthlyAmount}/month is split across nonprofits.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          <div className="space-y-4">
            {causes.map((cause: any, index: number) => {
              const percentage = percentages[cause.id] || 0;
              const amount = (netAmount * percentage) / 100;
              const avatarBgColor = getConsistentColor(cause.id, avatarColors);
              const initials = getInitials(cause.name || 'N');
              const sliderColor = sliderColors[index % sliderColors.length];

              return (
                <div key={cause.id} className="bg-white border border-gray-300 rounded-lg p-4">
                  {/* Cause Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0">
                      <AvatarImage src={cause.image} alt={cause.name} />
                      <AvatarFallback
                        style={{ backgroundColor: avatarBgColor }}
                        className="text-white font-bold text-sm md:text-base"
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm md:text-base text-gray-900 truncate">
                        {cause.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600">
                        ${amount.toFixed(2)}/mo
                      </p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecrease(cause.id)}
                      disabled={percentage <= calculateMinPercentage()}
                      className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Minus className="w-4 h-4 text-gray-700" />
                    </button>

                    {/* <div className="flex-1 relative"> */}
                      {/* Percentage Input - Above slider */}
                      {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 z-10"> */}
                        <div className="flex flex-1 flex-col items-center">
                          <Input
                            type="number"
                            step="0.01"
                            value={inputValues[cause.id] || '0'}
                            onChange={(e) => handleInputChange(cause.id, e.target.value)}
                            onBlur={() => handleInputBlur(cause.id)}
                            className="w-full text-center text-sm md:text-base font-semibold border-gray-300 rounded-lg bg-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                            min="0"
                            max="100"
                          />
                        </div>
                      {/* </div>s */}

                    
                    {/* </div> */}

                    <button
                      onClick={() => handleIncrease(cause.id)}
                      disabled={percentage >= 100}
                      className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 text-gray-700" />
                    </button>
                    
                  </div>

                  <span className="text-xs  text-gray-500 flex justify-center  mt-4">percent</span>

                    {/* Slider */}
                    <div className="relative h-2 bg-gray-200 rounded-full mt-4">
                      
                        <input
                          type="range"
                          min={calculateMinPercentage()}
                          max="100"
                          step="0.01"
                          value={percentage}
                          onChange={(e) => handlePercentageChange(cause.id, parseFloat(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          style={{ 
                            WebkitAppearance: 'none', 
                            appearance: 'none',
                            background: 'transparent',
                          }}
                        />
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-200 pointer-events-none"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: sliderColor,
                          }}
                        />
                      </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleReset}
            className="w-full flex flex-col items-center gap-1 px-3 py-3 border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 transition-colors mb-3"
          >
            <span className="text-xs md:text-sm text-center">Reset to equal split</span>
          </button>
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateDonationBoxMutation.isPending}
              className="flex-1 bg-[#1600ff] hover:bg-[#1400cc] text-white disabled:opacity-50"
            >
              {updateDonationBoxMutation.isPending ? 'Saving...' : 'Save Split'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

