import { useState, useEffect, useMemo } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

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

interface JoinGroupBottomsheetProps {
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

export default function JoinGroupBottomsheet({
    isOpen,
    onClose,
    collectiveName,
    nonprofits,
    collectiveId,
    onJoin,
    isJoining = false,
    donationBox,
    founderName,
}: JoinGroupBottomsheetProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedNonprofitIds, setSelectedNonprofitIds] = useState<Set<number>>(new Set());
    const [hasInitialized, setHasInitialized] = useState(false);

    // Get existing cause IDs from donation box
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

    // Check capacity
    const currentCapacity = donationBox?.box_causes?.length || 0;
    const maxCapacity = donationBox?.capacity || 0;
    const isAtCapacity = hasDonationBox && currentCapacity >= maxCapacity;

    // Initialize selection
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
                setSelectedNonprofitIds(new Set());
            }
            setHasInitialized(true);
        } else if (!isOpen && hasInitialized) {
            setHasInitialized(false);
            setSelectedNonprofitIds(new Set());
        }
    }, [isOpen, hasInitialized, nonprofits, existingCauseIds, isAtCapacity]);

    // Animation Effect
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

    // Get available nonprofits (excluding those already in donation box)
    const availableNonprofits = useMemo(() => {
        return nonprofits.filter((np) => {
            const cause = np.cause || np;
            const causeId = cause.id || np.id;
            return !existingCauseIds.has(causeId);
        });
    }, [nonprofits, existingCauseIds]);

    if (!isVisible) return null;

    const handleDeselectAll = () => {
        if (isAtCapacity || availableNonprofits.length === 0) return;

        if (selectedNonprofitIds.size === availableNonprofits.length) {
            setSelectedNonprofitIds(new Set());
        } else {
            setSelectedNonprofitIds(new Set(availableNonprofits.map((np) => {
                const cause = np.cause || np;
                return cause.id || np.id;
            })));
        }
    };

    const handleToggleNonprofit = (id: number) => {
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

    const handleJoin = () => {
        const selectedNonprofits = nonprofits.filter((np) => {
            const cause = np.cause || np;
            const nonprofitId = cause.id || np.id;
            return selectedNonprofitIds.has(nonprofitId);
        });
        onJoin(selectedNonprofits, collectiveId, !hasDonationBox);
    };

    const allSelected = availableNonprofits.length > 0 && selectedNonprofitIds.size === availableNonprofits.length;

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
            <div className="absolute inset-0 bg-black/40" />

            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl transition-transform duration-300 max-h-[90vh] overflow-hidden flex flex-col mx-auto",
                    isAnimating ? "translate-y-0" : "translate-y-full"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-6 py-2">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                        Join {collectiveName}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-2 leading-snug">
                        {founderName || 'Conrad'} chose these nonprofits. Add them to your Donation Box to give alongside the group.
                    </p>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-4">

                    {isAtCapacity && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
                            <p className="text-sm text-red-800 font-medium text-center">
                                Your donation box is at capacity. Increase your donation amount to add more nonprofits.
                            </p>
                        </div>
                    )}

                    <div className="space-y-0 border-t border-gray-100">
                        {nonprofits.map((nonprofit) => {
                            const cause = nonprofit.cause || nonprofit;
                            const nonprofitId = cause.id || nonprofit.id;
                            const nonprofitName = cause.name || nonprofit.name || 'Unknown Nonprofit';
                            const isSelected = selectedNonprofitIds.has(nonprofitId);
                            const isDisabled = existingCauseIds.has(nonprofitId);
                            const initials = getInitials(nonprofitName);

                            return (
                                <button
                                    key={nonprofit.id}
                                    onClick={() => handleToggleNonprofit(nonprofitId)}
                                    disabled={isDisabled || isAtCapacity}
                                    className={cn(
                                        "w-full flex items-center justify-between py-4 border-b border-gray-100 transition-opacity",
                                        (isDisabled || isAtCapacity) && "opacity-70"
                                    )}
                                >
                                    <div className="flex items-center gap-4 max-w-[90%]">
                                        <Avatar>
                                            <AvatarImage src={cause.logo} />
                                            <AvatarFallback>{initials}</AvatarFallback>
                                        </Avatar>
                                        <h4 className="font-bold text-sm sm:text-base text-left">
                                            {nonprofitName}
                                        </h4>
                                    </div>

                                    <div
                                        className={cn(
                                            "w-6 h-6 rounded-sm flex items-center justify-center transition-all",
                                            isSelected || isDisabled
                                                ? "bg-[#1600ff]"
                                                : "border-2 border-gray-200 bg-white"
                                        )}
                                    >
                                        {(isSelected || isDisabled) && (
                                            <Check className="w-4 h-4 text-white stroke-[3px]" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Info Box */}
                    <div className="mt-8 p-4 bg-[#fafaf5] rounded-lg text-gray-700">
                        <p className="text-sm sm:text-base leading-snug">
                            Your Donation Box holds nonprofits you want to give to. Set up recurring or one-time donations anytime.
                        </p>
                    </div>
                </div>

                {/* Footer - Single Button */}
                <div className="px-6 pt-2 pb-10">
                    <Button
                        onClick={handleJoin}
                        disabled={isJoining || (selectedNonprofitIds.size === 0 && !isAtCapacity && hasDonationBox)}
                        className="w-full h-14 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold text-base shadow-none transition-transform active:scale-[0.98]"
                    >
                        {isJoining ? 'Adding...' : 'Add to Donation Box'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

