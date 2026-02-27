"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDonationBox } from "@/services/api/donation";
import { Toast } from "@/components/ui/toast";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

interface EditDonationSplitBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  causes: any[];
  monthlyAmount: number;
  boxCauses?: any[];
}

// Slider colors for each nonprofit
const sliderColors = [
  '#3B82F6', '#EF4444', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#F97316',
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
  const [toastState, setToastState] = useState({ show: false, message: "" });

  // Track focused input to prevent overwrite while typing
  const [focusedInput, setFocusedInput] = useState<number | null>(null);

  // Helper: Minimum donation percentage (e.g. $0.20 minimum)
  const calculateMinPercentage = useCallback(() => {
    const netAmount = monthlyAmount * 0.9;
    const MIN_DONATION = 0.20;
    return (MIN_DONATION / netAmount) * 100;
  }, [monthlyAmount]);

  // --- THE MATH FIXER ---
  // This ensures the sum is EXACTLY 100.00%
  // It sums everyone EXCEPT the largest slice, then forces the largest slice to be (100 - sum_of_others)
  const forceSumTo100 = useCallback((currentPercentages: Record<number, number>) => {
    const ids = Object.keys(currentPercentages).map(Number);
    if (ids.length === 0) return currentPercentages;

    // 1. Find the ID with the largest percentage to absorb the remainder/rounding error
    let largestId = ids[0];
    let largestValue = currentPercentages[ids[0]];

    ids.forEach(id => {
      if (currentPercentages[id] > largestValue) {
        largestValue = currentPercentages[id];
        largestId = id;
      }
    });

    // 2. Sum everyone ELSE
    let sumOfOthers = 0;
    const fixedPercentages = { ...currentPercentages };

    ids.forEach(id => {
      if (id !== largestId) {
        // Ensure others are rounded to 2 decimals nicely
        const val = parseFloat(fixedPercentages[id].toFixed(2));
        fixedPercentages[id] = val;
        sumOfOthers += val;
      }
    });

    // 3. Force the largest one to fill the gap exactly
    const remaining = 100 - sumOfOthers;

    // Safety check: ensure we don't accidentally make it negative 
    if (remaining >= 0) {
      fixedPercentages[largestId] = parseFloat(remaining.toFixed(2));
    }

    return fixedPercentages;
  }, []);

  // Initialize Data
  useEffect(() => {
    if (causes.length > 0 && isOpen) {
      const minPercentage = calculateMinPercentage();
      let initialPercentages: Record<number, number> = {};

      const hasExistingPercentages = boxCauses.some((bc: any) => bc.percentage != null);

      if (hasExistingPercentages) {
        // Load from existing
        causes.forEach((cause: any) => {
          const boxCause = boxCauses.find((bc: any) => bc.cause?.id === cause.id);
          const existingPercentage = boxCause?.percentage || (100 / causes.length);
          initialPercentages[cause.id] = Math.max(minPercentage, existingPercentage);
        });
      } else {
        // Load default equal split
        const equalPercentage = 100 / causes.length;
        const targetPercentage = equalPercentage < minPercentage ? minPercentage : equalPercentage;
        causes.forEach((cause: any) => {
          initialPercentages[cause.id] = targetPercentage;
        });
      }

      // CRITICAL: Force sum to 100 immediately on load to fix the 99.99% issue
      initialPercentages = forceSumTo100(initialPercentages);

      setPercentages(initialPercentages);

      // Sync inputs
      const initialInputs: Record<number, string> = {};
      causes.forEach((cause: any) => {
        initialInputs[cause.id] = (initialPercentages[cause.id] || 0).toFixed(2);
      });
      setInputValues(initialInputs);
    }
  }, [causes, isOpen, boxCauses, monthlyAmount, calculateMinPercentage, forceSumTo100]);

  // Sync Input Values from Percentages (Only when NOT focused)
  useEffect(() => {
    const newInputValues = { ...inputValues };
    let hasChanges = false;

    causes.forEach((cause: any) => {
      if (focusedInput !== cause.id) {
        const newVal = (percentages[cause.id] || 0).toFixed(2);
        if (newInputValues[cause.id] !== newVal) {
          newInputValues[cause.id] = newVal;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setInputValues(newInputValues);
    }
  }, [percentages, causes, focusedInput]); // Removed inputValues to prevent loops

  // Animation effect
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

  // Main Logic: Adjust percentages when one changes
  const adjustPercentages = (changedId: number, newPercentage: number) => {
    const otherCauses = causes.filter((c: any) => c.id !== changedId);
    const otherCount = otherCauses.length;
    const minPercentage = calculateMinPercentage();

    if (otherCount === 0) return;

    const newPercentages: Record<number, number> = { ...percentages };

    // 1. Clamp the changed value
    let clampedNewPercentage = Math.max(minPercentage, Math.min(100, newPercentage));

    // Ensure this value leaves enough room for everyone else to have the minimum
    const maxAllowed = 100 - (otherCount * minPercentage);
    if (clampedNewPercentage > maxAllowed) {
      clampedNewPercentage = maxAllowed;
    }

    newPercentages[changedId] = clampedNewPercentage;

    const remainingPercentage = 100 - clampedNewPercentage;
    const currentTotalOthers = otherCauses.reduce((sum, cause) => sum + (percentages[cause.id] || 0), 0);

    // 2. Distribute remaining among others
    if (currentTotalOthers <= 0.01) {
      // If others were basically 0, distribute equally
      const perOther = remainingPercentage / otherCount;
      otherCauses.forEach((cause: any) => { newPercentages[cause.id] = perOther; });
    } else {
      // Scale proportionally
      const scaleFactor = remainingPercentage / currentTotalOthers;

      otherCauses.forEach((cause: any) => {
        // Apply scale, but respect floor
        const scaled = (percentages[cause.id] || 0) * scaleFactor;
        newPercentages[cause.id] = Math.max(minPercentage, scaled);
      });
    }

    // 3. NUCLEAR OPTION: Force the total to be exactly 100.00
    // This catches all floating point errors (99.99%) and logic gaps
    const finalPercentages = forceSumTo100(newPercentages);

    setPercentages(finalPercentages);
  };

  const handlePercentageChange = (causeId: number, value: number) => {
    adjustPercentages(causeId, value);
  };

  const handleInputChange = (causeId: number, value: string) => {
    setInputValues({ ...inputValues, [causeId]: value });
  };

  const handleInputBlur = (causeId: number) => {
    setFocusedInput(null);
    const minPercentage = calculateMinPercentage();
    const rawValue = inputValues[causeId] || '0';
    const numValue = parseFloat(rawValue) || 0;

    const clampedValue = Math.max(minPercentage, Math.min(100, numValue));

    // Update visual input immediately
    setInputValues(prev => ({ ...prev, [causeId]: clampedValue.toFixed(2) }));

    adjustPercentages(causeId, clampedValue);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent, causeId: number) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleDecrease = (causeId: number) => {
    const minPercentage = calculateMinPercentage();
    const current = percentages[causeId] || 0;
    if (current > minPercentage) {
      adjustPercentages(causeId, Math.max(minPercentage, current - 1));
    }
  };

  const handleIncrease = (causeId: number) => {
    const current = percentages[causeId] || 0;
    if (current < 100) {
      adjustPercentages(causeId, Math.min(100, current + 1));
    }
  };

  const showCustomToast = (message: string) => {
    setToastState({ show: true, message });
    setTimeout(() => setToastState({ show: false, message: "" }), 2000);
  };

  const handleReset = () => {
    const minPercentage = calculateMinPercentage();
    const equalPercentage = 100 / causes.length;
    let newPercentages: Record<number, number> = {};

    const target = equalPercentage < minPercentage ? minPercentage : equalPercentage;

    causes.forEach((cause: any) => {
      newPercentages[cause.id] = target;
    });

    // Force exact sum
    newPercentages = forceSumTo100(newPercentages);

    const inputs: Record<number, string> = {};
    Object.keys(newPercentages).forEach(key => {
      inputs[parseInt(key)] = newPercentages[parseInt(key)].toFixed(2);
    });

    setPercentages(newPercentages);
    setInputValues(inputs);
  };

  const queryClient = useQueryClient();

  const updateDonationBoxMutation = useMutation({
    mutationFn: (data: any) => updateDonationBox(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationBox'] });
      showCustomToast('Donation split updated successfully');
      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (error: any) => {
      console.error('Update donation box error:', error);
      showCustomToast(error?.response?.data?.message || 'Failed to update donation split');
    },
  });

  const handleSave = () => {
    // Check for changes logic...
    const hasChanges = causes.some((cause: any) => {
      const currentPercentage = percentages[cause.id] || 0;
      const boxCause = boxCauses?.find((bc: any) => bc.cause?.id === cause.id);
      const initialPercentage = boxCause?.percentage || (100 / causes.length);
      return Math.abs(currentPercentage - initialPercentage) > 0.1;
    });

    if (!hasChanges) {
      showCustomToast('No changes to save');
      return;
    }

    const causesData = causes.map((cause: any) => {
      const percentage = percentages[cause.id] || 0;
      const boxCause = boxCauses?.find((bc: any) => bc.cause?.id === cause.id);

      let attributedCollective = null;
      if (boxCause?.attributed_collectives && Array.isArray(boxCause.attributed_collectives) && boxCause.attributed_collectives.length > 0) {
        attributedCollective = typeof boxCause.attributed_collectives[0] === 'object'
          ? boxCause.attributed_collectives[0]?.id || boxCause.attributed_collectives[0]
          : boxCause.attributed_collectives[0];
      } else if (boxCause?.attributed_collective) {
        attributedCollective = typeof boxCause.attributed_collective === 'object'
          ? boxCause.attributed_collective?.id || boxCause.attributed_collective
          : boxCause.attributed_collective;
      }

      const causeData: any = {
        cause_id: cause.id,
        percentage: parseFloat(percentage.toFixed(2)),
      };

      if (attributedCollective && attributedCollective !== 'manual' && attributedCollective !== 'Manual') {
        causeData.attributed_collective = attributedCollective;
      }

      return causeData;
    });

    updateDonationBoxMutation.mutate({
      monthly_amount: monthlyAmount.toString(),
      causes: causesData,
    });
  };

  if (!isVisible) return null;

  const netAmount = monthlyAmount * 0.9;

  return (
    <>
      <style jsx global>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid currentColor;
          margin-top: -6px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        input[type=range]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid currentColor;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          cursor: pointer;
          border-radius: 999px;
        }
        input[type=range]::-moz-range-track {
          width: 100%;
          height: 6px;
          cursor: pointer;
          border-radius: 999px;
        }
      `}</style>

      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />

        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl md:rounded-t-3xl shadow-2xl transition-transform duration-300 max-h-[90vh] md:max-h-[85vh] flex flex-col",
            isAnimating ? "translate-y-0" : "translate-y-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-2 md:pt-3 pb-1.5 md:pb-2">
            <div className="w-10 md:w-12 h-1 md:h-1.5 bg-gray-300 rounded-full" />
          </div>

          <div className="px-3 md:px-6 py-3 md:py-4 border-b border-gray-200 flex items-start md:items-center justify-between gap-2 md:gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-base md:text-xl font-bold text-gray-900">Edit Donation Split</h2>
              <p className="text-xs md:text-base text-gray-600 mt-0.5 md:mt-1">
                Adjust how your ${monthlyAmount}/month is split across nonprofits.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 md:px-6 py-3 md:py-4">
            <div className="space-y-3 md:space-y-4">
              {causes.map((cause: any, index: number) => {
                const percentage = percentages[cause.id] || 0;
                const amount = (netAmount * percentage) / 100;
                const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                const initials = getInitials(cause.name || 'N');
                const sliderColor = sliderColors[index % sliderColors.length];

                return (
                  <div key={cause.id} className="bg-white border border-gray-300 rounded-lg p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                      <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0">
                        <AvatarImage src={cause.image} alt={cause.name} />
                        <AvatarFallback
                          style={{ backgroundColor: avatarBgColor }}
                          className="text-white font-bold text-xs md:text-base"
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xs md:text-base text-gray-900 truncate">
                          {cause.name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          ${amount.toFixed(2)}/mo
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 md:gap-2">
                      <button
                        onClick={() => handleDecrease(cause.id)}
                        disabled={percentage <= calculateMinPercentage()}
                        className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <Minus className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-700" />
                      </button>

                      <div className="flex flex-1 flex-col items-center">
                        <Input
                          type="number"
                          step="0.01"
                          value={parseInt(inputValues[cause.id]) || ''}
                          onChange={(e) => handleInputChange(cause.id, e.target.value)}
                          onFocus={() => setFocusedInput(cause.id)}
                          onBlur={() => handleInputBlur(cause.id)}
                          onKeyDown={(e) => handleInputKeyDown(e, cause.id)}
                          className="w-full text-center text-xs md:text-base font-semibold border-gray-300 rounded-lg bg-white py-2 md:py-2.5 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                          min="0"
                          max="100"
                        />
                      </div>

                      <button
                        onClick={() => handleIncrease(cause.id)}
                        disabled={percentage >= 100}
                        className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-700" />
                      </button>
                    </div>

                    <span className="text-[10px] md:text-xs text-gray-500 flex justify-center mt-2 md:mt-4">percent</span>

                    <div className="px-2">
                      <Slider
                        min={calculateMinPercentage()}
                        max={100}
                        step={0.01}
                        value={percentage}
                        onChange={(val) => handlePercentageChange(cause.id, val as number)}
                        trackStyle={{ backgroundColor: sliderColor, height: 6 }} // Active track
                        handleStyle={{
                          borderColor: sliderColor,
                          height: 16,
                          width: 16,
                          marginTop: -5,
                          backgroundColor: '#ffffff',
                          borderWidth: 2,
                          opacity: 1,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }}
                        railStyle={{ backgroundColor: '#E5E7EB', height: 6 }} // Inactive track
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-3 md:px-6 py-3 md:py-4 border-t border-gray-200 bg-white">
            <button
              onClick={handleReset}
              className="w-full flex flex-col items-center gap-1 px-3 py-2 md:py-3 border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 transition-colors mb-2 md:mb-3"
            >
              <span className="text-xs md:text-sm text-center">Reset to equal split</span>
            </button>
            <div className="flex items-center justify-between gap-2 md:gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-300 text-gray-700 text-sm md:text-base py-2 md:py-2.5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateDonationBoxMutation.isPending}
                className="flex-1 bg-[#1600ff] hover:bg-[#1400cc] text-white disabled:opacity-50 text-sm md:text-base py-2 md:py-2.5"
              >
                {updateDonationBoxMutation.isPending ? 'Saving...' : 'Save Split'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Toast
        show={toastState.show}
        message={toastState.message}
        onHide={() => setToastState({ show: false, message: "" })}
        className="top-10 z-[100]"
      />
    </>
  );
}