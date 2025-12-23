import { useState, useEffect, useLayoutEffect } from "react";
import { Loader2, Minus, Plus, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { DonationBox3 } from "./DonationBox3";
import OneTimeDonation from "./OneTimeDonation";
import { Checkout } from "./Checkout";

import DonationHeader from "./donation/DonationHeader";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDonationBox, createDonationBox } from "@/services/api/donation";
import { getCausesBySearch, getJoinCollective, getCollectiveById } from "@/services/api/crwd";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuthStore } from "@/stores/store";
import ProfileNavbar from "./profile/ProfileNavbar";
import RequestNonprofitModal from "./newsearch/RequestNonprofitModal";
import DonationReviewBottomSheet from "./donation/DonationReviewBottomSheet";
import { toast } from "sonner";

interface DonationBoxProps {
  tab?: string;
  preselectedItem?: {
    id: string;
    type: 'cause' | 'collective';
    data: any;
  };
  activeTab?: string;
  fromPaymentResult?: boolean;
  preselectedCauses?: number[]; // Array of cause IDs to pre-select
  preselectedCausesData?: any[]; // Full cause data objects
  preselectedCollectiveId?: number; // Collective ID for attributed causes
}

const DonationBox = ({ tab = "setup", preselectedItem, activeTab, fromPaymentResult, preselectedCauses, preselectedCausesData, preselectedCollectiveId }: DonationBoxProps) => {
  // Initialize activeTabState: prioritize tab prop from URL, then check preselectedItem
  // If tab is explicitly "setup", always use setup. Otherwise, if preselectedItem exists, use onetime
  const initialTab = tab === "setup" ? "setup" : (preselectedItem ? "onetime" : (tab as "setup" | "onetime" || "setup"));
  const [activeTabState, setActiveTabState] = useState<"setup" | "onetime">(initialTab);
  
  // Update tab synchronously when prop changes (before paint)
  useLayoutEffect(() => {
    if (tab === "setup") {
      setActiveTabState("setup");
    } else if (tab === "onetime") {
      setActiveTabState("onetime");
    }
  }, [tab]);
  const [checkout, setCheckout] = useState(false);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
  const [preselectedItemAdded, setPreselectedItemAdded] = useState(false);
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [donationAmount, setDonationAmount] = useState(10);
  const [step, setStep] = useState(1);
  const [inputValue, setInputValue] = useState("10");
  
  // Step 1 state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCauseIds, setSelectedCauseIds] = useState<number[]>([]);
  const [selectedCollectiveIds, setSelectedCollectiveIds] = useState<number[]>([]);
  const [selectedCausesData, setSelectedCausesData] = useState<any[]>([]);
  const [selectedCollectivesData, setSelectedCollectivesData] = useState<any[]>([]);
  const [expandedCollectives, setExpandedCollectives] = useState<Set<number>>(new Set());
  const [collectiveDetails, setCollectiveDetails] = useState<Record<number, any>>({});
  const [loadingCollectives, setLoadingCollectives] = useState<Set<number>>(new Set());
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReviewBottomSheet, setShowReviewBottomSheet] = useState(false);
  const [justCreatedBox, setJustCreatedBox] = useState(false);
  const [preselectedCausesProcessed, setPreselectedCausesProcessed] = useState(false);

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

  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Get donation box - include user ID in query key so cache is user-specific
  const { data: donationBox, isLoading: isLoadingDonationBox, refetch: refetchDonationBox } = useQuery({
    queryKey: ['donationBox', currentUser?.id],
    queryFn: () => getDonationBox(),
    enabled: !!currentUser?.id,
    staleTime: 0, // Always consider data stale to refetch on mount
  });

  // Refetch donation box when user changes
  useEffect(() => {
    if (currentUser?.id) {
      refetchDonationBox();
    }
  }, [currentUser?.id, refetchDonationBox]);

  // Set step based on donation box existence - only when setup tab is active
  useEffect(() => {
    if (activeTabState === "setup") {
      if (donationBox && donationBox.id) {
        // Only show checkout if donation box is explicitly active
        if (donationBox.is_active === true) {
          setCheckout(true);
        } else {
          setCheckout(false); // Reset checkout when deactivated or inactive
        }
        setStep(2); // Show step 2 if donation box exists
      } else {
        setCheckout(false); // Reset checkout if no donation box
        setStep(1); // Show step 1 if no donation box
      }
    }
  }, [donationBox, activeTabState]);

  // Show checkout screen when coming from payment result - only if donation box is active
  useEffect(() => {
    if (fromPaymentResult && donationBox && donationBox.id) {
      // Only show checkout if donation box is explicitly active
      if (donationBox.is_active === true) {
        setCheckout(true);
      } else {
        // If coming from payment result but donation box is inactive, don't show checkout
        setCheckout(false);
      }
    }
  }, [fromPaymentResult, donationBox]);

  // Get causes with search - only when setup tab is active and on step 1
  const { data: causesData, isLoading: causesLoading } = useQuery({
    queryKey: ['causes', searchQuery],
    queryFn: () => getCausesBySearch(searchQuery, '', 1),
    enabled: activeTabState === "setup" && step === 1,
  });

  // Get joined collectives - only when setup tab is active and on step 1
  const { data: joinedCollectivesData } = useQuery({
    queryKey: ['joined-collectives'],
    queryFn: () => getJoinCollective(currentUser?.id),
    enabled: activeTabState === "setup" && step === 1,
  });

  // Create donation box mutation
  const createBoxMutation = useMutation({
    mutationFn: createDonationBox,
    onSuccess: () => {
      console.log('Donation box created successfully');
      queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
      setJustCreatedBox(true); // Flag to indicate we just created the box
      setStep(2);
      // Open review bottom sheet after creating
      setShowReviewBottomSheet(true);
    },
    onError: (error: any) => {
      console.error('Error creating donation box:', error);
    },
  });

  // Handle continue to review button
  const handleContinueToReview = () => {
    if (step === 1) {
      // Donation box not setup - create it first
      const prepareRequestData = async () => {
        const requestData: any = {
          monthly_amount: donationAmount.toString(),
          causes: [],
        };

        // Track which causes are from preselected collective to add attributed_collective
        const preselectedCauseIds = preselectedCauses || [];
        const hasPreselectedCollective = preselectedCollectiveId !== undefined;

        // Add causes from selectedCauseIds
        // If they came from preselectedCollectiveId, add attributed_collective
        selectedCauseIds.forEach((causeId) => {
          if (hasPreselectedCollective && preselectedCauseIds.includes(causeId)) {
            // This cause came from the preselected collective
            requestData.causes.push({
              cause_id: causeId,
              attributed_collective: preselectedCollectiveId,
            });
          } else {
            // Standalone cause, no attributed_collective
            requestData.causes.push({
              cause_id: causeId,
            });
          }
        });

        // Add causes from selectedCollectiveIds
        if (selectedCollectiveIds.length > 0) {
          for (const collectiveId of selectedCollectiveIds) {
            try {
              let collectiveDetailsData = collectiveDetails[collectiveId];
              
              if (!collectiveDetailsData) {
                collectiveDetailsData = await getCollectiveById(collectiveId.toString());
                setCollectiveDetails(prev => ({ ...prev, [collectiveId]: collectiveDetailsData }));
              }
              
              if (collectiveDetailsData?.causes && Array.isArray(collectiveDetailsData.causes)) {
                collectiveDetailsData.causes.forEach((causeItem: any) => {
                  const causeId = causeItem.cause?.id || causeItem.id;
                  if (causeId && !selectedCauseIds.includes(causeId)) {
                    // Only add if not already added from selectedCauseIds
                    requestData.causes.push({
                      cause_id: causeId,
                      attributed_collective: collectiveId,
                    });
                  }
                });
              }
            } catch (error) {
              console.error(`Error fetching collective ${collectiveId} details:`, error);
            }
          }
        }

        createBoxMutation.mutate(requestData);
      };

      prepareRequestData();
    } else {
      // Donation box already setup - just open review bottom sheet
      setShowReviewBottomSheet(true);
    }
  };

  // Note: activateDonationBox is handled in DonationBox3 component (step 2)

  // Handle preselected item from navigation
  useEffect(() => {
    if (preselectedItem && !preselectedItemAdded) {
      console.log('Setting preselected item:', preselectedItem, 'Tab:', tab);
      
      // If tab is "setup" and preselectedItem is a collective, add to selectedCollectiveIds
      if (tab === "setup" && preselectedItem.type === 'collective') {
        // Stay on setup tab and add collective to selectedCollectiveIds
        setActiveTabState("setup");
        const collectiveId = parseInt(preselectedItem.id);
        setSelectedCollectiveIds(prev => {
          if (!prev.includes(collectiveId)) {
            return [...prev, collectiveId];
          }
          return prev;
        });
        // Also add to selectedCollectivesData so it shows in the UI
        if (preselectedItem.data) {
          setSelectedCollectivesData(prev => {
            const exists = prev.some(c => c.id === collectiveId);
            if (!exists) {
              return [...prev, preselectedItem.data];
            }
            return prev;
          });
        }
      } else if (tab === "setup" && preselectedItem.type === 'cause') {
        // If tab is "setup" and preselectedItem is a cause, add to selectedCauseIds
        setActiveTabState("setup");
        const causeId = parseInt(preselectedItem.id);
        setSelectedCauseIds(prev => {
          if (!prev.includes(causeId)) {
            return [...prev, causeId];
          }
          return prev;
        });
        // Also add to selectedCausesData so it shows in the UI
        if (preselectedItem.data) {
          setSelectedCausesData(prev => {
            const exists = prev.some(c => c.id === causeId);
            if (!exists) {
              return [...prev, preselectedItem.data];
            }
            return prev;
          });
        }
      } else {
        // For onetime tab or non-collective items, switch to onetime and add to selectedOrganizations
        if (activeTabState !== "onetime") {
          setActiveTabState("onetime");
        }
        setSelectedOrganizations([preselectedItem.id]);
      }
      setPreselectedItemAdded(true);
    }
  }, [preselectedItem, preselectedItemAdded, tab, activeTabState]);

  // Handle preselected causes from NewCompleteOnboard or JoinCollectiveBottomSheet
  useEffect(() => {
    if (preselectedCauses && preselectedCauses.length > 0 && activeTabState === "setup" && step === 1 && !preselectedCausesProcessed) {
      // Set the selected cause IDs
      setSelectedCauseIds(preselectedCauses);
      
      // If we have a preselected collective ID, also add it to selected collectives
      // This ensures the collective is tracked for attributed_collective in API calls
      if (preselectedCollectiveId) {
        setSelectedCollectiveIds([preselectedCollectiveId]);
      }
      
      // If we have the full cause data, use it directly (preferred method)
      if (preselectedCausesData && preselectedCausesData.length > 0) {
        setSelectedCausesData(preselectedCausesData);
        setPreselectedCausesProcessed(true);
      } else {
        // Fallback: try to fetch cause data from the default causes query
        // This will only work if the causes are in the first page of results
        const fetchPreselectedCausesData = async () => {
          try {
            const allCausesResponse = await getCausesBySearch('', '', 1);
            const allCauses = allCausesResponse?.results || [];
            
            // Filter to only include preselected causes
            const foundCauses = allCauses.filter((cause: any) => 
              preselectedCauses.includes(cause.id)
            );
            
            // Set the causes data if we found any
            if (foundCauses.length > 0) {
              setSelectedCausesData(foundCauses);
            }
            
            setPreselectedCausesProcessed(true);
          } catch (error) {
            console.error('Error fetching preselected causes data:', error);
            setPreselectedCausesProcessed(true);
          }
        };
        
        fetchPreselectedCausesData();
      }
    }
  }, [preselectedCauses, preselectedCausesData, preselectedCollectiveId, activeTabState, step, preselectedCausesProcessed]);

  const incrementDonation = () => {
    const newAmount = donationAmount + 5;
    setDonationAmount(newAmount);
    setInputValue(newAmount.toString());
  };

  const decrementDonation = () => {
    if (donationAmount > 5) {
      const newAmount = Math.max(5, donationAmount - 5);
      
      // Calculate max capacity for new amount
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
      const fees = calculateFees(newAmount);
      const net = fees.net;
      const newMaxCapacity = Math.floor(net / 0.20);
      const currentCapacity = selectedCauseIds.length + selectedCollectiveIds.length;
      
      // Check if new amount would reduce capacity below current causes
      if (currentCapacity > newMaxCapacity) {
        toast.error(`You have ${currentCapacity} cause${currentCapacity !== 1 ? 's' : ''} selected. Please remove ${currentCapacity - newMaxCapacity} cause${currentCapacity - newMaxCapacity !== 1 ? 's' : ''} to lower the donation amount to $${newAmount}.`);
        return;
      }
      
      setDonationAmount(newAmount);
      setInputValue(newAmount.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const value = e.target.value.replace(/[^0-9]/g, "");
    setInputValue(value);
  };

  const handleInputBlur = () => {
    // Convert to number and ensure minimum value is 1
    const numValue = parseInt(inputValue) || 1;
    // Ensure minimum donation is $5
    const finalValue = numValue < 5 ? 5 : numValue;
    
    // Only validate if the amount is being lowered
    if (finalValue < donationAmount) {
      // Calculate max capacity for new amount
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
      const fees = calculateFees(finalValue);
      const net = fees.net;
      const newMaxCapacity = Math.floor(net / 0.20);
      const currentCapacity = selectedCauseIds.length + selectedCollectiveIds.length;
      
      // Check if new amount would reduce capacity below current causes
      if (currentCapacity > newMaxCapacity) {
        toast.error(`You have ${currentCapacity} cause${currentCapacity !== 1 ? 's' : ''} selected. Please remove ${currentCapacity - newMaxCapacity} cause${currentCapacity - newMaxCapacity !== 1 ? 's' : ''} to lower the donation amount to $${finalValue}.`);
        // Revert to current donation amount
        setInputValue(donationAmount.toString());
        return;
      }
    }
    
    setDonationAmount(finalValue);
    setInputValue(finalValue.toString());
  };

  const handleToggleCollectiveDropdown = async (collectiveId: number) => {
    const isExpanded = expandedCollectives.has(collectiveId);
    const newExpanded = new Set(expandedCollectives);
    
    if (isExpanded) {
      newExpanded.delete(collectiveId);
      setExpandedCollectives(newExpanded);
    } else {
      newExpanded.add(collectiveId);
      setExpandedCollectives(newExpanded);
      
      // Fetch collective details if not already cached
      if (!collectiveDetails[collectiveId]) {
        setLoadingCollectives(prev => new Set(prev).add(collectiveId));
        try {
          const details = await getCollectiveById(collectiveId.toString());
          setCollectiveDetails(prev => ({ ...prev, [collectiveId]: details }));
        } catch (error) {
          console.error('Error fetching collective details:', error);
        } finally {
          setLoadingCollectives(prev => {
            const newSet = new Set(prev);
            newSet.delete(collectiveId);
            return newSet;
          });
        }
      }
    }
  };

  console.log(selectedOrganizations, "ork");

  // Show skeleton loading only when setup tab is active and loading donation box
  if (activeTabState === "setup" && isLoadingDonationBox) {
    return (
      <div className="w-full h-full bg-white flex flex-col">
        <DonationHeader
          title="Donation Box"
          step={1}
          showBackButton={false}
          showCloseButton={false}
          onBack={() => {}}
        />
        
        {/* Tabs Skeleton */}
        <div className="flex border-b border-gray-200 bg-white">
          <div className="flex-1 py-2.5 md:py-4 bg-gray-50">
            <div className="h-4 md:h-5 bg-gray-300 rounded w-24 md:w-32 mx-auto animate-pulse"></div>
          </div>
          <div className="flex-1 py-2.5 md:py-4 bg-gray-50">
            <div className="h-4 md:h-5 bg-gray-300 rounded w-28 md:w-36 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 pb-20 md:pb-24">
          <div className="max-w-2xl mx-auto mt-3 md:mt-4 space-y-4 md:space-y-6">
            {/* Info Card Skeleton */}
            <div className="bg-gray-50 rounded-xl p-3 md:p-4 animate-pulse">
              <div className="h-5 md:h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 md:h-4 bg-gray-300 rounded w-full mb-1"></div>
              <div className="h-3 md:h-4 bg-gray-300 rounded w-5/6"></div>
            </div>

            {/* Donation Amount Selector Skeleton */}
            <div className="bg-gray-50 rounded-lg p-3 md:p-4 animate-pulse">
              <div className="flex justify-between items-center mb-2">
                <div className="space-y-2">
                  <div className="h-4 md:h-5 bg-gray-300 rounded w-40 md:w-48"></div>
                  <div className="h-3 bg-gray-300 rounded w-32 md:w-40"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-full"></div>
                  <div className="w-16 md:w-20 h-8 md:h-10 bg-gray-300 rounded-full"></div>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Donation Box Capacity Skeleton */}
            <div className="bg-gray-50 rounded-xl p-3 md:p-4 animate-pulse">
              <div className="flex justify-between items-center mb-2 md:mb-3">
                <div className="h-4 md:h-5 bg-gray-300 rounded w-32 md:w-40"></div>
                <div className="h-4 bg-gray-300 rounded w-20 md:w-24"></div>
              </div>
              <div className="w-full h-1.5 md:h-2 bg-gray-200 rounded-full mb-2 md:mb-3">
                <div className="h-1.5 md:h-2 bg-gray-300 rounded-full w-1/3"></div>
              </div>
              <div className="h-3 md:h-4 bg-gray-300 rounded w-2/3"></div>
            </div>

            {/* Selected Causes Section Skeleton */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-5 md:h-6 bg-gray-300 rounded w-40 md:w-48 animate-pulse"></div>
                  <div className="h-3 md:h-4 bg-gray-300 rounded w-56 md:w-64 animate-pulse"></div>
                </div>
                <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-300 rounded-full animate-pulse"></div>
              </div>
              
              {/* Cause Item Skeletons */}
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center p-2.5 md:p-3 border border-gray-200 rounded-lg animate-pulse">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-xl mr-2.5 md:mr-3"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 md:h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 md:h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>

            {/* Add More Causes Section Skeleton */}
            <div className="space-y-3 md:space-y-4">
              <div className="h-5 md:h-6 bg-gray-300 rounded w-40 md:w-48 animate-pulse"></div>
              
              {/* Search Bar Skeleton */}
              <div className="flex gap-2">
                <div className="flex-1 h-10 md:h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-16 md:w-20 h-10 md:h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>

              {/* Cause Selector Skeleton */}
              <div className="space-y-2 md:space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2.5 md:gap-3 p-2.5 md:p-3 border border-gray-200 rounded-lg animate-pulse">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 md:h-5 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 md:h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header with title and back/close button - Always Visible */}
      <DonationHeader
        title="Donation Box"
        step={step}
        showBackButton={false}
        showCloseButton={true}
        onClose={() => navigate('/')}
        onBack={() => {
          if (checkout) {
            setCheckout(false);
          } else {
            setStep((s) => s - 1);
          }
        }}
      />

      {/* Content Container with max-width */}
      <div className="w-full md:max-w-[60%] mx-auto bg-gray-50">
        {/* Tab Navigation - Hide when in checkout */}
        {!checkout && (
          <div className="mx-3 md:mx-4 mt-3 md:mt-4">
            <div className="flex rounded-full overflow-hidden border bg-white shadow-sm">
              <button
                className={cn(
                  "flex-1 py-2.5 md:py-4 text-xs md:text-sm font-medium transition-all relative",
                  activeTabState === "setup"
                    ? "text-white bg-[#1600ff]"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => {
                  if (checkout) {
                    setCheckout(false);
                  }
                  setActiveTabState("setup");
                  setStep(1);
                }}
              >
                <div className="flex items-center justify-center">
                  {/* {donationBox?.id ? 'Donation Box' : 'Set up donation box'} */}
                  Monthly Giving
                </div>
                {activeTabState === "setup" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1600ff]"></div>
                )}
              </button>
              <button
                className={cn(
                  "flex-1 py-2.5 md:py-4 text-xs md:text-sm font-medium transition-all relative",
                  activeTabState === "onetime"
                    ? "text-white bg-[#1600ff]"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => {
                  if (checkout) {
                    setCheckout(false);
                  }
                  setActiveTabState("onetime");
                }}
              >
                <div className="flex items-center justify-center">
                  One-Time Donation
                </div>
                {activeTabState === "onetime" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1600ff]"></div>
                )}
              </button>
            </div>
          </div>
        )}

      {/* Main Content */}
      {checkout ? (
        <Checkout
          onBack={() => {
            setCheckout(false);
          }}
          selectedOrganizations={selectedOrganizations}
          donationAmount={donationAmount}
          donationBox={donationBox}
          initialShowManage={false}
          onCloseManage={() => {}}
          onShowManage={() => {
            navigate("/donation/manage");
          }}
          onCancelSuccess={() => {
            setCheckout(false);
            setStep(3);
          }}
          fromPaymentResult={fromPaymentResult}
        />
      ) : (
        <>
          {activeTabState === "onetime" ? (
            <>
              <OneTimeDonation
                setCheckout={setCheckout}
                selectedOrganizations={selectedOrganizations}
                setSelectedOrganizations={setSelectedOrganizations}
                preselectedItem={preselectedItem}
                activeTab={activeTab}
                preselectedCauses={preselectedCauses}
                preselectedCausesData={preselectedCausesData}
                preselectedCollectiveId={preselectedCollectiveId}
              />
            </>
          ) : (
            <>
              {step === 1 ? (
                <div className="flex-1 mt-3 md:mt-4 flex flex-col p-3 md:p-4 pb-24 md:pb-32 space-y-3 md:space-y-4 bg-gray-50">

                 <div>
                <p className="text-xl md:text-2xl font-bold text-[#1600ff] text-center">Set your monthly gift</p>
                <p className="text-gray-600 text-xs text-center mt-1.5 md:mt-2">Support multiple causes with one donation, split evenly. Change anytime.</p>
                  </div>
                  {/* Donation Box Card */}
                  <div className="bg-white rounded-xl mb-4 md:mb-6 p-4 md:p-6 shadow-sm border border-gray-100">
                    {/* Your Monthly Impact Section */}
                    <div className="mb-4 md:mb-6">
                      <h2 className="text-lg md:text-xl font-bold text-gray-900 text-center mb-4 md:mb-6">
                        Your Monthly Impact
                      </h2>
                      
                      {/* Amount Selector */}
                      <div className="flex items-center justify-center gap-3 md:gap-4">
                        <button
                          onClick={decrementDonation}
                          className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg ${donationAmount > 5 ? 'bg-[#1600ff] hover:bg-[#1600ff]' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                        >
                          <Minus size={18} className="md:w-5 md:h-5 text-white font-bold" strokeWidth={3} />
                        </button>
                        <div className="text-center">
                          <div className="text-[#1600ff] text-3xl md:text-4xl font-bold">
                            ${donationAmount}
                          </div>
                          <div className="text-gray-900 text-xs md:text-sm mt-1">
                            per month
                          </div>
                        </div>
                        <button
                          onClick={incrementDonation}
                          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#1600ff] hover:bg-[#1600ff] transition-colors"
                        >
                          <Plus size={18} className="md:w-5 md:h-5 text-white font-bold" strokeWidth={3} />
                        </button>
                      </div>
                    </div>

                    {/* Donation Box Capacity Section */}
                    {(() => {
                      // Calculate fees and capacity using the provided formula
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
                        
                        console.log('=== Fee Calculation (Donationbox Step 1) ===');
                        console.log('Gross Amount:', gross);
                        console.log('CRWD Fee:', crwdFee);
                        console.log('Net (Gross - CRWD Fee):', net);
                        
                        return {
                          crwdFee: Math.round(crwdFee * 100) / 100,
                          net: Math.round(net * 100) / 100,
                        };
                      };

                      const actualDonationAmount = parseFloat(donationAmount.toString());
                      const fees = calculateFees(actualDonationAmount);
                      const net = fees.net;
                      const maxCapacity = Math.floor(net / 0.20);
                      const currentCapacity = selectedCauseIds.length + selectedCollectiveIds.length;
                      const capacityPercentage = maxCapacity > 0 ? Math.min(100, (currentCapacity / maxCapacity) * 100) : 0;
                      
                      console.log('=== Capacity Calculation (Donationbox Step 1) ===');
                      console.log('Donation Amount:', donationAmount);
                      console.log('Actual Donation Amount:', actualDonationAmount);
                      console.log('Fees object:', fees);
                      console.log('Net amount:', net);
                      console.log('Max Capacity (net / 0.20):', maxCapacity);
                      console.log('Current Capacity:', currentCapacity);
                      console.log('Capacity Percentage:', capacityPercentage);
                      
                      return (
                        <div className="bg-blue-50 rounded-xl p-3 md:p-4">
                          <div className="flex items-center justify-between mb-2 md:mb-3">
                            <h3 className="text-sm md:text-base font-bold text-[#1600ff]">
                              Donation Box Capacity
                            </h3>
                            <span className="text-xs md:text-sm font-medium text-[#1600ff]">
                              {currentCapacity}/{maxCapacity} causes
                            </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full h-1.5 md:h-2 bg-blue-100 rounded-full mb-2 md:mb-3">
                            <div
                              className="h-1.5 md:h-2 bg-[#1600ff] rounded-full transition-all duration-300"
                              style={{
                                width: `${capacityPercentage}%`,
                              }}
                            />
                          </div>
                          
                          <p className="text-xs md:text-sm text-[#1600ff]">
                            For every ${donationAmount}, you can support {maxCapacity} cause{maxCapacity !== 1 ? 's' : ''}.
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Your Selected Causes */}
                  {selectedCauseIds.length > 0 && (
                    <div className="mb-4 md:mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h2 className="text-lg md:text-xl font-bold text-gray-800">Your Selected Causes</h2>
                          <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">Your Donation Box. Add or remove anytime.</p>
                        </div>
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#1600ff] flex items-center justify-center">
                          <span className="text-white text-xs md:text-sm font-bold">{selectedCauseIds.length}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 md:space-y-3 mt-3 md:mt-4">
                        {selectedCausesData.map((cause: any) => {
                          const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                          const initials = getInitials(cause.name);
                          return (
                            <div key={cause.id} className="flex items-center p-2.5 md:p-3 border border-gray-200 rounded-lg">
                              <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 border border-gray-200 mr-2.5 md:mr-3">
                                <AvatarImage src={cause.image} />
                                <AvatarFallback
                                  style={{ backgroundColor: avatarBgColor }}
                                  className="font-semibold rounded-lg text-white text-sm md:text-base"
                                >
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                  <h3 className="font-bold text-sm md:text-base text-gray-900">{cause.name}</h3>
                                  {/* <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" /> */}
                                </div>
                                <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                                  {cause.mission || cause.description || 'No description available'}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCauseIds(selectedCauseIds.filter(id => id !== cause.id));
                                  setSelectedCausesData(selectedCausesData.filter(c => c.id !== cause.id));
                                }}
                                className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                              >
                                <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Add More Causes Section */}
                  <div className="mb-4 md:mb-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                      Add More Causes
                    </h2>
                    
                    {/* Search Bar with All Button */}
                    <div className="flex gap-2 mb-3 md:mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                        <input
                          type="text"
                          placeholder="Search for causes..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1600ff] text-sm md:text-base"
                        />
                      </div>
                      {/* <button className="px-4 py-2.5 bg-[#1600ff] text-white rounded-lg font-medium hover:bg-[#1400cc] transition-colors">
                        All
                      </button> */}
                    </div>

                    {/* Request Nonprofit Link */}
                    <div className="mb-3 md:mb-4 flex justify-center">
                      <button
                        onClick={() => setShowRequestModal(true)}
                        className="text-xs md:text-sm text-[#1600ff] underline font-medium" 
                      >
                        Can't find your nonprofit? Request it here
                      </button>
                    </div>

                    {/* Nonprofits List */}
                    <div className="space-y-2 md:space-y-3">
                      {causesLoading ? (
                        <div className="flex justify-center py-6 md:py-8">
                          <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
                        </div>
                      ) : causesData?.results?.length > 0 ? (
                        causesData.results
                          .filter((cause: any) => !selectedCauseIds.includes(cause.id))
                          .map((cause: any) => {
                            const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                            const initials = getInitials(cause.name);
                            return (
                              <div
                                key={cause.id}
                                className="flex items-center p-2.5 md:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 border border-gray-200 mr-2.5 md:mr-3">
                                  <AvatarImage src={cause.image} />
                                  <AvatarFallback
                                    style={{ backgroundColor: avatarBgColor }}
                                    className="font-semibold rounded-lg text-white text-sm md:text-base"
                                  >
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-sm md:text-base text-gray-900 mb-0.5 md:mb-1">{cause.name}</h3>
                                  <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                                    {cause.mission || cause.description || 'No description available'}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Calculate max capacity
                                    const calculateFees = (grossAmount: number) => {
                                      const gross = grossAmount;
                                      // For donations < $10.00: Flat fee of $1.00
                                      // For donations ≥ $10.00: 10% of total (covers all platform + processing costs)
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
                                    const net = fees.net;
                                    const maxCapacity = Math.floor(net / 0.20);
                                    const currentCapacity = selectedCauseIds.length + selectedCollectiveIds.length;
                                    
                                    // Check if adding this cause would exceed capacity
                                    if (currentCapacity >= maxCapacity) {
                                      toast.error(`You can only add up to ${maxCapacity} cause${maxCapacity !== 1 ? 's' : ''} for $${donationAmount}. Increase your donation amount to support more causes.`);
                                      return;
                                    }
                                    
                                    setSelectedCauseIds([...selectedCauseIds, cause.id]);
                                    setSelectedCausesData([...selectedCausesData, cause]);
                                  }}
                                  className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors flex-shrink-0"
                                >
                                  <Plus size={14} className="md:w-4 md:h-4 text-pink-600" strokeWidth={3} />
                                </button>
                              </div>
                            );
                          })
                      ) : (
                        <p className="text-gray-500 text-center py-6 md:py-8 text-sm md:text-base">No nonprofits found</p>
                      )}
                    </div>
                  </div>

                  {/* Choose Collective to Support Section */}
                  {/* <div className="bg-white rounded-xl mb-6 p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Choose collective to support
                    </h2>
                    
                    
                    <div className="space-y-3">
                      {joinedCollectivesData?.data?.length > 0 ? (
                        joinedCollectivesData.data.map((item: any) => {
                          const collective = item.collective;
                          const isSelected = selectedCollectiveIds.includes(collective.id);
                          const isExpanded = expandedCollectives.has(collective.id);
                          const details = collectiveDetails[collective.id];
                          const isLoading = loadingCollectives.has(collective.id);
                          
                          return (
                            <div key={collective.id}>
                              <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div
                                  className="flex-1 flex items-center cursor-pointer"
                                  onClick={() => handleToggleCollectiveDropdown(collective.id)}
                                >
                                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                    <Avatar className="w-12 h-12 rounded-full object-cover">
                                      <AvatarImage src={collective.cover_image || '/default-collective.png'} />
                                      <AvatarFallback className="bg-green-100 text-green-600">
                                        {collective.name.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">{collective.name}</h3>
                                    <p className="text-sm text-gray-600">{collective.description}</p>
                                  </div>
                                  <div className="ml-4">
                                    {isLoading ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                    ) : (
                                      isExpanded ? (
                                        <ChevronUp size={20} className="text-gray-500" />
                                      ) : (
                                        <ChevronDown size={20} className="text-gray-500" />
                                      )
                                    )}
                                  </div>
                                </div>
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ml-4 cursor-pointer ${isSelected ? 'bg-blue-600' : 'border-2 border-gray-300'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isSelected) {
                                      setSelectedCollectiveIds(selectedCollectiveIds.filter(id => id !== collective.id));
                                      setSelectedCollectivesData(selectedCollectivesData.filter(c => c.id !== collective.id));
                                    } else {
                                      // Calculate max capacity before adding collective
                                      const calculateFees = (grossAmount: number) => {
                                        const gross = grossAmount;
                                        // For donations < $10.00: Flat fee of $1.00
                                        // For donations ≥ $10.00: 10% of total (covers all platform + processing costs)
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
                                      const net = fees.net;
                                      const maxCapacity = Math.floor(net / 0.20);
                                      const currentCapacity = selectedCauseIds.length + selectedCollectiveIds.length;
                                      
                                      // Check if adding this collective would exceed capacity
                                      if (currentCapacity >= maxCapacity) {
                                        toast.error(`You can only add up to ${maxCapacity} cause${maxCapacity !== 1 ? 's' : ''} for $${donationAmount}. Increase your donation amount to support more causes.`);
                                        return;
                                      }
                                      
                                      setSelectedCollectiveIds([...selectedCollectiveIds, collective.id]);
                                      setSelectedCollectivesData([...selectedCollectivesData, collective]);
                                    }
                                  }}
                                >
                                  {isSelected && (
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              {isExpanded && details && details.causes && details.causes.length > 0 && (
                                <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg mt-2 ml-4">
                                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                                    Nonprofits ({details.causes.length})
                                  </h4>
                                  <div className="space-y-3 pl-14">
                                    {details.causes.map((causeItem: any) => (
                                      <div key={causeItem.id} className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-b-0">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                          <span className="text-blue-600 text-xs font-semibold">
                                            {causeItem.cause?.name?.charAt(0).toUpperCase() || 'N'}
                                          </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-semibold text-gray-800 text-sm">
                                            {causeItem.cause?.name}
                                          </h5>
                                          {causeItem.cause?.description && (
                                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                              {causeItem.cause.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-500 text-center">No joined collectives</p>
                      )}
                    </div>

                    
                  </div> */}

                  {/* Old hardcoded organization list removed - now using API data above */}
                  {/* <div className="space-y-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                          <span className="text-orange-600 font-semibold text-lg">
                            H
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            Hunger Initiative
                          </h3>
                          <p className="text-sm text-gray-600">
                            Fighting hunger in local communities
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            selectedOrganizations.includes("Hunger Initiative")
                              ? "bg-blue-600"
                              : "border-2 border-gray-300"
                          }`}
                        >
                          {selectedOrganizations.includes(
                            "Hunger Initiative"
                          ) && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div> */}

                      {/* Clean Water Initiative */}
                    

                     

                   
                    {/* </div> */}
                    {/* </div> */}

                  {/* Summary and Next Button */}
                {/* <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 fixed bottom-0 w-full left-0 right-0 md:relative md:rounded-t-xl md:mt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-semibold text-gray-800">
                          ${donationAmount} per month
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedCauseIds.length} nonprofits, {selectedCollectiveIds.length} collectives
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          // Call API to create donation box
                          createBoxMutation.mutate({
                            monthly_amount: donationAmount,
                            cause_ids: selectedCauseIds,
                            collective_ids: selectedCollectiveIds,
                          });
                        }}
                        disabled={createBoxMutation.isPending || (selectedCauseIds.length === 0 && selectedCollectiveIds.length === 0)}
                        className={cn(
                          "text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center",
                          createBoxMutation.isPending || (selectedCauseIds.length === 0 && selectedCollectiveIds.length === 0) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        )}
                      >
                        {createBoxMutation.isPending ? 'Creating...' : 'Next'}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ml-2"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                  </div> */}

                  {/* <div className="h-24 md:hidden"></div> */}
                </div>
              ) : step === 2 ? (
                <div className="pb-24 md:pb-32">
                  {/*@ts-ignore*/}
                  <DonationBox3
                    setCheckout={(value: boolean) => {
                      setCheckout(value);
                    }}
                    selectedOrganizations={selectedOrganizations}
                    setSelectedOrganizations={setSelectedOrganizations}
                    donationAmount={donationAmount}
                    donationBox={donationBox}
                    onManageDonationBox={() => {
                      navigate("/donation/manage");
                    }}
                  />
                </div>
              ) : (
                <div className="flex-1 mx-3 md:mx-4 mt-3 md:mt-4 mb-4 flex flex-col">
                  {/* Info Card */}
                  <div className="bg-[#f5f6ff] rounded-xl mb-3 md:mb-4 p-3 md:p-4">
                    <h2 className="text-lg md:text-xl font-medium text-gray-700 py-0.5 md:py-1 my-1.5 md:my-2">
                      Welcome to your donation box
                    </h2>
                    <p className="text-gray-600 text-xs md:text-sm py-2 md:py-3">
                      Your donation box makes giving back easy! Just set your
                      price and you can add as many of your favorite causes at
                      any time. Your donation will be evenly distributed across
                      all of the organizations in your box. Let's get started!
                    </p>
                    <div className="bg-[#e6e7f4] rounded-lg mt-4 md:mt-6 flex justify-between items-center p-3 md:p-4">
                      <div>
                        <p className="text-xs md:text-sm font-medium mb-0.5 md:mb-1">
                          Enter monthly donation
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-500">
                          Input amount over $5
                        </p>
                      </div>
                      <div className="bg-[#dbddf6] flex items-center rounded-full border">
                        <button
                          onClick={decrementDonation}
                          className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full"
                        >
                          <Minus size={14} className="md:w-4 md:h-4" />
                        </button>
                        <div className="flex-1 flex justify-center items-center h-8 md:h-10 px-3 md:px-4">
                          <span className="text-blue-500 text-xl md:text-2xl font-bold relative">
                            $
                            <input
                              type="text"
                              value={inputValue}
                              onChange={handleInputChange}
                              onBlur={handleInputBlur}
                              className="bg-transparent w-12 md:w-16 text-center focus:outline-none text-xl md:text-2xl"
                              aria-label="Donation amount"
                            />
                          </span>
                        </div>
                        <button
                          onClick={incrementDonation}
                          className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-r-full"
                        >
                          <Plus size={14} className="md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Security Message */}
                    <div className="flex items-center mt-3 md:mt-4 p-1.5 md:p-2">
                      <div className="flex items-center justify-center w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-gray-300 mr-1.5 md:mr-2">
                        <span className="text-[10px] md:text-xs">✓</span>
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-500">
                        Your donation is protected and guaranteed.{" "}
                        <Link to="/settings/about" className="text-blue-500">
                          Learn More
                        </Link>
                      </p>
                    </div>
                  </div>
                  <div
                    className={`p-3 md:p-4 flex justify-between items-center ${
                      isMobile ? "mb-20" : ""
                    }`}
                  >
                    <p className={`text-sm md:text-base text-gray-500`}>Now let's add some causes</p>
                    <button
                      onClick={() => setStep(2)}
                      className={`bg-green-500 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full font-medium text-sm md:text-base`}
                    >
                      Next
                    </button>
                  </div>
                  {/* Donation Amount Selector */}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Continue to Review Button - Fixed at bottom for both steps */}
      {activeTabState === "setup" && !checkout && (
        <div className="fixed bottom-0 left-0 right-0 px-4 md:px-6 bg-white border-t border-gray-200 z-10">
          <button 
            onClick={handleContinueToReview}
            disabled={
              createBoxMutation.isPending || 
              (step === 1 && selectedCauseIds.length === 0 && selectedCollectiveIds.length === 0)
            }
            className={cn(
              "w-full bg-[#1600ff] text-white px-4 my-3 md:px-6 py-3 md:py-4 rounded-full font-bold text-sm md:text-base transition-colors",
              createBoxMutation.isPending || 
              (step === 1 && selectedCauseIds.length === 0 && selectedCollectiveIds.length === 0)
                ? "cursor-not-allowed opacity-50" 
                : "hover:bg-gray-300"
            )}
          >
            {createBoxMutation.isPending ? 'Creating...' : 'Continue to Review'}
          </button>
          <div className="text-center mb-3 md:mb-4">
            <button
              onClick={() => navigate('/')}
              className="text-sm md:text-base text-gray-600 hover:text-gray-900"
            >
              Skip for now, I'll set this up later
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Legal Disclaimer - Full Width (Outside max-width constraint) */}
      {checkout && (
        <div className="w-full px-3 md:px-4 py-4 md:py-6 border-t border-gray-200 bg-gray-50">
          <p className="text-[10px] md:text-xs text-gray-500 text-center leading-relaxed max-w-4xl mx-auto">
            All donations are made to CRWD Foundation Inc. (EIN: XX-XXXXXXX), a 501(c)(3) nonprofit organization. CRWD Foundation grants funds to qualified 501(c)(3) organizations selected by donors.
          </p>
        </div>
      )}

      {/* Request Nonprofit Modal */}
      <RequestNonprofitModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />

      {/* Donation Review Bottom Sheet */}
      <DonationReviewBottomSheet
        isOpen={showReviewBottomSheet}
        onClose={() => {
          setShowReviewBottomSheet(false);
          setJustCreatedBox(false); // Reset flag when closing
        }}
        donationAmount={step === 2 && donationBox?.monthly_amount && !justCreatedBox ? parseFloat(donationBox.monthly_amount) : donationAmount}
        selectedCauses={
          (step === 1 || justCreatedBox) && selectedCausesData.length > 0
            ? selectedCausesData 
            : (donationBox?.box_causes || []).map((boxCause: any) => {
                const cause = boxCause.cause || boxCause;
                return {
                  id: cause.id,
                  name: cause.name,
                  description: cause.description || cause.mission,
                  image: cause.image,
                };
              }).filter((cause: any) => cause.id != null)
        }
        onComplete={() => {
          setShowReviewBottomSheet(false);
          setJustCreatedBox(false); // Reset flag
          setCheckout(true);
        }}
      />
    </div>
  );
};

export default DonationBox;
