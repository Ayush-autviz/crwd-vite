import { Settings, X, ChevronDown, ChevronUp, Trash2, Pencil, Plus, Minus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ManageDonationBox from "./ManageDonationBox";
import { CROWDS, RECENTS, SUGGESTED } from "@/constants";
import ReactConfetti from "react-confetti";
import { getCollectiveById } from "@/services/api/crwd";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/store";
import { getDonationHistory, removeCauseFromBox, updateDonationBox, cancelDonationBox } from "@/services/api/donation";
import RequestNonprofitModal from "@/components/newsearch/RequestNonprofitModal";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface DonationOverviewProps {
  donationAmount?: number;
  onBack?: () => void;
  selectedOrganizations: string[];
  donationBox?: any;
  initialShowManage?: boolean;
  onCloseManage?: () => void;
  onShowManage?: () => void;
  onCancelSuccess?: () => void;
  fromPaymentResult?: boolean;
}

export const Checkout = ({
  donationAmount = 25,
  onBack = () => { },
  selectedOrganizations: selectedOrgIds,
  donationBox,
  initialShowManage = false,
  onCloseManage,
  onShowManage,
  onCancelSuccess,
  fromPaymentResult = false,
}: DonationOverviewProps) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showManageDonationBox, setShowManageDonationBox] = useState(initialShowManage);
  const [localSelectedOrgs, setLocalSelectedOrgs] = useState(selectedOrgIds);
  const [showAddMoreCauses, setShowAddMoreCauses] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [expandedCollectives, setExpandedCollectives] = useState<Set<number>>(new Set());
  const [collectiveDetails, setCollectiveDetails] = useState<Record<number, any>>({});
  const [loadingCollectives, setLoadingCollectives] = useState<Set<number>>(new Set());
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const [isRemoveModalAnimating, setIsRemoveModalAnimating] = useState(false);
  const [causeToRemove, setCauseToRemove] = useState<{ id: number; name: string } | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editableAmount, setEditableAmount] = useState(parseFloat(donationBox?.monthly_amount || donationAmount.toString()));
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [isPauseModalVisible, setIsPauseModalVisible] = useState(false);
  const [isPauseModalAnimating, setIsPauseModalAnimating] = useState(false);
  const [selectedPauseOption, setSelectedPauseOption] = useState<number | null>(null);

  // Update showManageDonationBox when initialShowManage changes
  useEffect(() => {
    setShowManageDonationBox(initialShowManage);
  }, [initialShowManage]);

  // Update editableAmount when donation box data changes
  useEffect(() => {
    if (donationBox?.monthly_amount) {
      setEditableAmount(Math.round(parseFloat(donationBox.monthly_amount)));
    }
  }, [donationBox?.monthly_amount]);

  // Get box_causes from donation box API (main source)
  const boxCauses = donationBox?.box_causes || [];
  // Extract cause objects from box_causes
  const causes = boxCauses.map((boxCause: any) => boxCause.cause).filter((cause: any) => cause != null);

  // Also get manual_causes for backward compatibility
  const manualCauses = donationBox?.manual_causes || [];
  const attributingCollectives = donationBox?.attributing_collectives || [];
  const actualDonationAmount = parseFloat(donationBox?.monthly_amount || donationAmount.toString());

  // Use API data if available, otherwise fall back to selectedOrganizations
  const hasApiData = causes.length > 0 || manualCauses.length > 0 || attributingCollectives.length > 0;
  const totalCauses = causes.length || manualCauses.length;
  const totalCollectives = attributingCollectives.length;

  // Fetch donation history to calculate lifetime amount
  const { data: donationHistoryData } = useQuery({
    queryKey: ['donationHistory'],
    queryFn: getDonationHistory,
    enabled: !!currentUser?.id,
  });

  // Calculate lifetime amount from donation history
  const lifetimeAmount = donationHistoryData?.results?.reduce((sum: number, transaction: any) => {
    return sum + parseFloat(transaction.gross_amount || '0');
  }, 0) || 0;

  // Calculate fees and capacity using the provided formula
  const calculateFees = (grossAmount: number) => {
    const gross = grossAmount;
    const stripeFee = (gross * 0.029) + 0.30;
    const crwdFee = (gross - stripeFee) * 0.07;
    const net = gross - stripeFee - crwdFee;
    
    console.log('=== Fee Calculation ===');
    console.log('Gross Amount:', gross);
    console.log('Stripe Fee (2.9% + $0.30):', stripeFee);
    console.log('CRWD Fee (7% of Gross - Stripe):', crwdFee);
    console.log('Net (Gross - Stripe - CRWD):', net);
    
    return {
      stripeFee: Math.round(stripeFee * 100) / 100,
      crwdFee: Math.round(crwdFee * 100) / 100,
      net: Math.round(net * 100) / 100,
    };
  };

  const fees = calculateFees(actualDonationAmount);
  const net = fees.net;
  const maxCapacity = Math.floor(net / 0.20);
  
  console.log('=== Capacity Calculation ===');
  console.log('Fees object:', fees);
  console.log('Net amount:', net);
  console.log('Max Capacity (net / 0.20):', maxCapacity);
  
  // Get current capacity from box_causes only
  const uniqueCauseIds = new Set(boxCauses.map((bc: any) => bc.cause?.id).filter(Boolean));
  const currentCapacity = uniqueCauseIds.size;
  
  console.log('=== Capacity Info ===');
  console.log('Box Causes:', boxCauses);
  console.log('Unique Cause IDs:', Array.from(uniqueCauseIds));
  console.log('Current Capacity (box_causes count):', currentCapacity);
  console.log('Max Capacity:', maxCapacity);
  console.log('Remaining Capacity:', maxCapacity - currentCapacity);

  // Helper for consistent avatar colors
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

  // Format next charge date
  const getChargeDay = (dateString?: string) => {
    if (!dateString) return '26th'; // Fallback

    try {
      const date = new Date(dateString);
      const day = date.getDate();
      // Add ordinal suffix
      if (day > 3 && day < 21) return `${day}th`;
      switch (day % 10) {
        case 1: return `${day}st`;
        case 2: return `${day}nd`;
        case 3: return `${day}rd`;
        default: return `${day}th`;
      }
    } catch (error) {
      console.error('Error getting charge day:', error);
      return '26th'; // Fallback
    }
  };

  // Show confetti and refetch donation box when coming from payment result (only once)
  // useEffect(() => {
  //   if (fromPaymentResult) {
  //     // Show confetti
  //     setShowSuccessModal(true);

  //     // Refetch donation box data
  //     queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
  //     queryClient.refetchQueries({ queryKey: ['donationBox', currentUser?.id] });

  //     // Immediately clear fromPaymentResult from location state to prevent showing again when switching tabs
  //     const newState = { ...location.state };
  //     delete newState.fromPaymentResult;
  //     navigate(location.pathname + (location.search || ''), {
  //       replace: true,
  //       state: newState
  //     });
  //   }
  // }, [fromPaymentResult, queryClient, currentUser?.id, navigate, location]);

  // Update window dimensions on resize for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Get organization description by name (similar to DonationBox3)
  const getOrganizationDescription = (orgName: string): string => {
    // Try to find organization by name first
    const org = [...CROWDS, ...RECENTS, ...SUGGESTED].find(
      (org) => org.name === orgName
    );

    if (org?.description) {
      return org.description;
    }

    // Fallback descriptions for common organizations
    const descriptions: { [key: string]: string } = {
      "Hunger Initiative": "Fighting hunger in local communities",
      "Clean Water Initiative": "Providing clean water access",
      "Education for All": "Quality education access",
      "Animal Rescue Network": "Rescuing and caring for animals",
    };

    return descriptions[orgName] || "Making a positive impact in the community";
  };

  const getOrganizationColor = (orgName: string): string => {
    const org = [...CROWDS, ...RECENTS, ...SUGGESTED].find(
      (org) => org.name === orgName
    );
    return org?.color || "#4F46E5"; // Default color
  };

  // Use organization names directly (like DonationBox3) - fallback to local state if no API data
  const selectedOrganizations = hasApiData ? [] : localSelectedOrgs;

  const handleRemoveOrganization = (orgName: string) => {
    setLocalSelectedOrgs((prev) => prev.filter((name) => name !== orgName));
  };

  const handleSave = () => {
    // Here you would typically save the changes
    // For now, just hide the add more causes mode
    setShowAddMoreCauses(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  // Mutation to remove cause from box
  const removeCauseMutation = useMutation({
    mutationFn: (causeId: string) => removeCauseFromBox(causeId),
    onSuccess: () => {
      console.log('Cause removed successfully');
      queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
      setShowRemoveModal(false);
      setCauseToRemove(null);
    },
    onError: (error: any) => {
      console.error('Error removing cause:', error);
    },
  });

  const handleRemoveCause = (cause: any) => {
    setCauseToRemove({ id: cause.id, name: cause.name });
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = () => {
    if (causeToRemove) {
      removeCauseMutation.mutate(causeToRemove.id.toString());
    }
  };

  // Calculate fees and capacity for amount editing
  const calculateFeesForAmount = (grossAmount: number) => {
    const gross = grossAmount;
    const stripeFee = (gross * 0.029) + 0.30;
    const crwdFee = (gross - stripeFee) * 0.07;
    const net = gross - stripeFee - crwdFee;
    return {
      stripeFee: Math.round(stripeFee * 100) / 100,
      crwdFee: Math.round(crwdFee * 100) / 100,
      net: Math.round(net * 100) / 100,
    };
  };

  const incrementAmount = () => {
    setEditableAmount(prev => Math.round(prev) + 5);
  };

  const decrementAmount = () => {
    if (editableAmount > 5) {
      setEditableAmount(prev => Math.max(5, Math.round(prev) - 5));
    }
  };

  // Mutation to update donation box
  const updateAmountMutation = useMutation({
    mutationFn: (amount: number) => updateDonationBox({ monthly_amount: amount }),
    onSuccess: () => {
      console.log('Donation box amount updated successfully');
      queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
      setIsEditingAmount(false);
    },
    onError: (error: any) => {
      console.error('Error updating donation box amount:', error);
      // Revert on error
      if (donationBox?.monthly_amount) {
        setEditableAmount(Math.round(parseFloat(donationBox.monthly_amount)));
      }
    },
  });

  const handleSaveAmount = () => {
    // Calculate capacity for the new amount
    const fees = calculateFeesForAmount(editableAmount);
    const net = fees.net;
    const maxCapacity = Math.floor(net / 0.20);
    
    // Check if current causes exceed the new capacity
    if (currentCapacity > maxCapacity) {
      // Show error toast
      toast.error(`You can only support up to ${maxCapacity} cause${maxCapacity !== 1 ? 's' : ''} with $${editableAmount}. Please remove some causes or increase the amount.`);
      return;
    }
    
    // If capacity check passes, update the amount
    updateAmountMutation.mutate(editableAmount);
  };

  const handleCancelEdit = () => {
    if (donationBox?.monthly_amount) {
      setEditableAmount(Math.round(parseFloat(donationBox.monthly_amount)));
    }
    setIsEditingAmount(false);
  };

  // Handle pause modal animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showPauseModal) {
      setIsPauseModalVisible(true);
      setIsPauseModalAnimating(false);
      timer = setTimeout(() => setIsPauseModalAnimating(true), 20);
    } else if (isPauseModalVisible) {
      setIsPauseModalAnimating(false);
      timer = setTimeout(() => setIsPauseModalVisible(false), 300);
    }
    return () => clearTimeout(timer);
  }, [showPauseModal, isPauseModalVisible]);

  // Mutation to cancel donation box
  const cancelDonationBoxMutation = useMutation({
    mutationFn: () => cancelDonationBox(),
    onSuccess: () => {
      console.log('Donation box cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
      setShowPauseModal(false);
      setSelectedPauseOption(null);
      if (onCancelSuccess) {
        onCancelSuccess();
      }
    },
    onError: (error: any) => {
      console.error('Error cancelling donation box:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    },
  });

  const handleCancelSubscription = () => {
    cancelDonationBoxMutation.mutate();
  };

  // Handle remove modal animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showRemoveModal) {
      setIsRemoveModalVisible(true);
      setIsRemoveModalAnimating(false);
      timer = setTimeout(() => setIsRemoveModalAnimating(true), 20);
    } else if (isRemoveModalVisible) {
      setIsRemoveModalAnimating(false);
      timer = setTimeout(() => setIsRemoveModalVisible(false), 300);
    }
    return () => clearTimeout(timer);
  }, [showRemoveModal, isRemoveModalVisible]);

  // Calculate equal distribution percentage and amount per item
  const totalItems = hasApiData
    ? totalCauses
    : selectedOrganizations.length;
  const distributionPercentage =
    totalItems > 0
      ? Math.floor(100 / totalItems)
      : 0;
  const amountPerItem = totalItems > 0
    ? (actualDonationAmount * 0.9) / totalItems // 90% after fees, divided equally
    : 0;

  if (showManageDonationBox) {
    // Convert API data to Organization objects for ManageDonationBox
    // Use box_causes as primary source, fallback to manual_causes
    const causesAsObjects = hasApiData
      ? [
        ...causes.map((cause: any) => ({
          id: `cause-${cause.id}`,
          name: cause.name,
          imageUrl: cause.image || cause.logo || "",
          color: "#4F46E5",
          description: cause.mission || cause.description || "",
          type: 'cause' as const,
        })),
        // Also include manual_causes if not already in box_causes (for backward compatibility)
        ...manualCauses
          .filter((manualCause: any) => !causes.some((c: any) => c.id === manualCause.id))
          .map((cause: any) => ({
            id: `cause-${cause.id}`,
            name: cause.name,
            imageUrl: cause.logo || "",
            color: "#4F46E5",
            description: cause.mission || cause.description || "",
            type: 'cause' as const,
          })),
        // Include collectives from attributing_collectives
        ...(attributingCollectives || []).map((collective: any) => ({
          id: `collective-${collective.id}`,
          name: collective.name,
          imageUrl: collective.cover_image || "",
          color: "#9333EA",
          description: collective.description || "",
          type: 'collective' as const,
        })),
      ]
      : selectedOrganizations.map(
        (orgName: string, index: number) => ({
          id: `${orgName}-${index}`,
          name: orgName,
          imageUrl: "",
          color: getOrganizationColor(orgName),
          description: getOrganizationDescription(orgName),
          type: 'cause' as const,
        })
      );

    // Create a wrapper function that converts ID back to organization name
    const handleRemoveFromManageBox = (id: string) => {
      // Extract the organization name from the ID (remove the "-index" part)
      const orgName = id.replace(/-\d+$/, "");
      handleRemoveOrganization(orgName);
    };

    return (
      <ManageDonationBox
        amount={actualDonationAmount}
        causes={causesAsObjects}
        isActive={donationBox?.is_active ?? true}
        onBack={() => {
          setShowManageDonationBox(false);
          if (onCloseManage) {
            onCloseManage();
          }
        }}
        onRemove={handleRemoveFromManageBox}
        onCancelSuccess={onCancelSuccess}
      />
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col pb-20 md:pb-24">
      <div className="flex-1 overflow-auto mt-2 mx-3 md:mx-4">
        {/* Content Container with max-width */}
        <div className="w-full">
          {/* Donation Box Summary Card */}
          <div className="bg-white rounded-xl mb-4 md:mb-6 shadow-sm border border-gray-200 overflow-hidden">
            {/* Gradient Header */}
            <div className="h-0.5 md:h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

            <div className="p-4 md:p-6">
              {/* Monthly Donation Section */}
              <div className="mb-4 md:mb-6">
                <h2 className="text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Monthly Donation</h2>
                
                {/* Amount Display with Controls */}
                <div className="flex items-center justify-between mb-1.5 md:mb-2">
                  <div className="flex items-baseline gap-1.5 md:gap-2">
                    {isEditingAmount ? (
                      <input
                        type="number"
                        value={Math.round(editableAmount)}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 5;
                          setEditableAmount(Math.max(5, value));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveAmount();
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        autoFocus
                        className="text-3xl md:text-4xl font-bold text-gray-900 w-20 md:w-24 border-none focus:outline-none"
                      />
                    ) : (
                      <span className="text-3xl md:text-4xl font-bold text-gray-900">${Math.round(editableAmount)}</span>
                    )}
                    <span className="text-sm md:text-base text-gray-600">/month</span>
                  </div>
                  
                  {/* +/- Buttons - Only show when editing */}
                  {isEditingAmount && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={decrementAmount}
                        disabled={editableAmount <= 5}
                        className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg transition-colors ${
                          editableAmount > 5 
                            ? 'bg-gray-100 hover:bg-gray-200' 
                            : 'bg-gray-200 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <Minus size={20} className="text-gray-600 font-bold" strokeWidth={3} />
                      </button>
                      <button
                        onClick={incrementAmount}
                        className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Plus size={20} className="text-gray-600" strokeWidth={3} />
                      </button>
                    </div>
                  )}
                  
                  {/* Pencil Icon - Only show when not editing */}
                  {!isEditingAmount && (
                    <button
                      onClick={() => setIsEditingAmount(true)}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      aria-label="Edit amount"
                    >
                      <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                    </button>
                  )}
                </div>
                
                {/* Lifetime Amount */}
                {lifetimeAmount > 0 && (
                  <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">${lifetimeAmount.toLocaleString()} lifetime</p>
                )}
                
                {/* Billing Cycle Info - Only show when editing and donation box is active */}
                {isEditingAmount && donationBox?.is_active && donationBox?.next_charge_date && (
                  <div className="bg-blue-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                    <p className="text-xs md:text-sm text-blue-600 text-center">
                      Changes take effect on your next billing cycle ({getChargeDay(donationBox.next_charge_date)} of the month)
                    </p>
                  </div>
                )}
                
                {/* Action Buttons - Only show when editing */}
                {isEditingAmount && (
                  <div className="flex items-center gap-2 md:gap-3">
                    <button
                      onClick={handleCancelEdit}
                      disabled={updateAmountMutation.isPending}
                      className="flex-1 bg-white border border-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAmount}
                      disabled={updateAmountMutation.isPending}
                      className="flex-1 bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {updateAmountMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {/* Supported Entities */}
              <div className="bg-gray-100 rounded-lg px-3 md:px-4 py-2.5 md:py-3 mb-4 md:mb-6 text-center">
                <p className="text-xs md:text-sm font-bold text-gray-900">
                  {totalCauses} Cause{totalCauses !== 1 ? 's' : ''} • {totalCollectives} Collective{totalCollectives !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Donation Box Capacity */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                <div className="flex items-center justify-between mb-1.5 md:mb-2">
                  <h3 className="text-xs md:text-sm font-bold text-blue-600">Donation Box Capacity</h3>
                  <span className="text-xs md:text-sm text-gray-900">{currentCapacity}/{maxCapacity} causes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 mb-1.5 md:mb-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 md:h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (currentCapacity / maxCapacity) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs md:text-sm text-blue-600">
                  You can support {maxCapacity - currentCapacity} more cause{(maxCapacity - currentCapacity) !== 1 ? 's' : ''} with this donation amount.
                </p>
              </div>

              {/* Add Causes Button */}
              <button
                onClick={() => navigate('/donation/manage')}
                className="w-full bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} className="text-white" />
                <span>Add Causes</span>
              </button>
            </div>
          </div>

          {/* percentage distribution */}
          {/* <p className="text-gray-500 text-sm mb-6">Donation amount is equally distributed across all the nonprofits</p> */}

          {/* Currently Supporting Section */}
          {causes.length > 0 && (
            <div className="mb-4 md:mb-6">
              <div className="mb-3 md:mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Currently Supporting</h2>
                <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">
                  Supporting {causes.length} nonprofit{causes.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Causes List from box_causes */}
              <div className="space-y-2.5 md:space-y-3">
                {causes.map((cause: any) => {
                  const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                  const initials = getInitials(cause.name || 'N');
                  return (
                    <div
                      key={cause.id}
                      className="flex items-center p-3 md:p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      {/* Avatar */}
                      <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 border border-gray-200 mr-3 md:mr-4">
                        <AvatarImage src={cause.image} />
                        <AvatarFallback
                          style={{ backgroundColor: avatarBgColor }}
                          className="font-semibold rounded-lg text-white text-base md:text-lg"
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      {/* Cause Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm md:text-base text-gray-900 mb-0.5 md:mb-1">{cause.name}</h3>
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                          {cause.mission || cause.description || 'Making a positive impact in the community'}
                        </p>
                      </div>

                      {/* Donation Info & Remove Button */}
                      <div className="flex items-center gap-3 md:gap-4 ml-2 md:ml-4">
                        <div className="text-right">
                          <p className="font-bold text-sm md:text-base text-gray-900">{distributionPercentage}%</p>
                          <p className="text-xs md:text-sm text-gray-600">${amountPerItem.toFixed(2)}/mo</p>
                        </div>
                        <button
                          onClick={() => handleRemoveCause(cause)}
                          className="p-1.5 md:p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          aria-label="Remove cause"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collectives Section */}
          {/* {attributingCollectives.length > 0 && (
            <div className="mb-4 md:mb-6">
              <div className="mb-3 md:mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Collectives</h2>
                <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">
                  Supporting {attributingCollectives.length} collective{attributingCollectives.length !== 1 ? 's' : ''}
                </p>
              </div>

              
              <div className="space-y-2.5 md:space-y-3">
                {attributingCollectives.map((collective: any) => {
                  const isExpanded = expandedCollectives.has(collective.id);
                  const details = collectiveDetails[collective.id];
                  const isLoading = loadingCollectives.has(collective.id);
                  
                  // Generate consistent color for collective
                  const collectiveColors = [
                    { bg: '#dbeafe', text: '#1e40af' }, // blue
                    { bg: '#fce7f3', text: '#831843' }, // pink
                    { bg: '#e9d5ff', text: '#6b21a8' }, // purple
                    { bg: '#d1fae5', text: '#065f46' }, // green
                    { bg: '#fed7aa', text: '#9a3412' }, // orange
                  ];
                  const colorIndex = (collective.name?.charCodeAt(0) || 0) % collectiveColors.length;
                  const collectiveColor = collectiveColors[colorIndex];
                  
                  return (
                    <div key={collective.id}>
                      <div className="flex items-center p-3 md:p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div
                          className="flex gap-3 md:gap-4 items-center cursor-pointer flex-1 min-w-0"
                          onClick={() => handleToggleCollectiveDropdown(collective.id)}
                        >
                          <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 border border-gray-200">
                            <AvatarImage src={collective.cover_image || collective.logo} />
                            <AvatarFallback
                              style={{ backgroundColor: collectiveColor.bg }}
                              className="font-semibold rounded-lg text-lg md:text-xl"
                            >
                              {collective.name?.charAt(0)?.toUpperCase() || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm md:text-base text-gray-900 mb-0.5 md:mb-1">{collective.name}</h3>
                            <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                              {collective.description || 'Community collective'}
                            </p>
                          </div>
                          <div className="ml-2 md:ml-4">
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-gray-400" />
                            ) : (
                              <ChevronDown 
                                className={`w-4 h-4 md:w-5 md:h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 md:gap-4 ml-2 md:ml-4">
                          <div className="text-right">
                            <p className="font-bold text-sm md:text-base text-gray-900">{distributionPercentage}%</p>
                            <p className="text-xs md:text-sm text-gray-600">${amountPerItem.toFixed(2)}/mo</p>
                          </div>
                        </div>
                      </div>
                      {isExpanded && details && details.causes && details.causes.length > 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4 mt-2 ml-4 md:ml-6">
                          <h4 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3">
                            Nonprofits ({details.causes.length})
                          </h4>
                          <div className="space-y-2 md:space-y-3">
                            {details.causes.map((causeItem: any) => {
                              const cause = causeItem.cause || causeItem;
                              const causeAvatarBgColor = getConsistentColor(cause.id, avatarColors);
                              const causeInitials = getInitials(cause.name || 'N');
                              return (
                                <div key={causeItem.id || cause.id} className="flex items-center gap-2 md:gap-3 py-2 border-b border-gray-200 last:border-0">
                                  <Avatar className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex-shrink-0 border border-gray-200">
                                    <AvatarImage src={cause.image} />
                                    <AvatarFallback
                                      style={{ backgroundColor: causeAvatarBgColor }}
                                      className="font-semibold rounded-lg text-white text-xs md:text-sm"
                                    >
                                      {causeInitials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs md:text-sm font-medium text-gray-900">{cause.name}</p>
                                    {cause.description && (
                                      <p className="text-xs text-gray-500 line-clamp-1">{cause.description}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )} */}

          {/* Fallback to selectedOrganizations if no API data */}
          {!hasApiData && selectedOrganizations.length > 0 && (
            <div className="mb-4 md:mb-6">
              <div className="mb-3 md:mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Currently Supporting</h2>
                <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">
                  Supporting {selectedOrganizations.length} nonprofit{selectedOrganizations.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-2.5 md:space-y-3">
                {selectedOrganizations.map((orgName: string, index: number) => {
                  const avatarBgColor = getConsistentColor(orgName, avatarColors);
                  const initials = getInitials(orgName);
                  return (
                    <div
                      key={`${orgName}-${index}`}
                      className="flex items-center p-3 md:p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      <div
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mr-3 md:mr-4 flex-shrink-0"
                        style={{ backgroundColor: avatarBgColor }}
                      >
                        <span className="text-white font-bold text-base md:text-lg">
                          {initials}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm md:text-base text-gray-900 mb-0.5 md:mb-1">{orgName}</h3>
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                          {getOrganizationDescription(orgName)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 md:gap-4 ml-2 md:ml-4">
                        <div className="text-right">
                          <p className="font-bold text-sm md:text-base text-gray-900">{distributionPercentage}%</p>
                          <p className="text-xs md:text-sm text-gray-600">${amountPerItem.toFixed(2)}/mo</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Give Together Section */}
          {/* <div className="mt-6 mb-6">
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-blue-50">
              <p className="text-sm text-gray-700 mb-2">
                Want to give together? Turn this into a CRWD Collective
              </p>
              <Link
                to="/create-crwd"
                className="text-sm text-blue-500 font-semibold"
              >
                Learn more
              </Link>
            </div>
          </div> */}

          {/* Can't see your nonprofit? Section */}
          <div className="mt-4 md:mt-6 mb-4 md:mb-6 text-center">
            <button
              onClick={() => setShowRequestModal(true)}
              className="text-sm md:text-base text-[#1600ff] hover:text-[#1400cc] underline font-medium"
            >
              Don't see your nonprofit? Request it
            </button>
          </div>



          <div>
            <button
              onClick={() => setShowPauseModal(true)}
              className="text-sm md:text-base text-gray-600 text-center cursor-pointer hover:text-[#1600ff] w-full"
            >
              Pause Donations
            </button>
          </div>

        </div>
      </div>

      {/* Payment Section */}
      {/* <PaymentSection amount={donationAmount} /> */}

      {/* <div className="h-30 md:hidden" /> */}

      {/* Success Modal with Confetti */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4"
          onClick={handleCloseSuccessModal}
        >
          <ReactConfetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            numberOfPieces={200}
          />
          <div
            className="bg-white rounded-lg max-w-md w-full mx-3 md:mx-4 p-4 md:p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseSuccessModal}
              className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>

            {/* Modal Content */}
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1.5 md:mb-2">
                Welcome to Checkout!
              </h2>

              <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                Here's your donation summary:
              </p>

              {/* Donation Summary Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                <div className="flex items-center gap-2.5 md:gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs md:text-sm font-semibold">💝</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm md:text-base text-gray-900">
                      Monthly Donation Box
                    </h3>
                    <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
                      <span className="text-xs md:text-sm text-gray-600">
                        ${actualDonationAmount}/month
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                Supporting {totalItems} {totalItems === 1 ? 'organization' : 'organizations'} with your
                monthly donation.
              </p>

              {/* <div className="flex flex-col gap-3">
                <Button onClick={handleCloseSuccessModal} className="w-full">
                  CONTINUE TO PAYMENT
                </Button>

                <Button
                  onClick={handleCloseSuccessModal}
                  variant="outline"
                  className="w-full"
                >
                  MANAGE DONATIONS
                </Button>
              </div> */}
            </div>
          </div>
        </div>
      )}

      {/* Request Nonprofit Modal */}
      <RequestNonprofitModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />

      {/* Remove Cause Bottom Sheet Modal */}
      {isRemoveModalVisible && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${
            isRemoveModalAnimating ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => {
            setShowRemoveModal(false);
            setCauseToRemove(null);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Bottom Sheet */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl md:rounded-t-3xl shadow-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col transition-transform duration-300 ${
              isRemoveModalAnimating ? 'translate-y-0' : 'translate-y-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-2 md:pt-3 pb-1.5 md:pb-2">
              <div className="w-10 md:w-12 h-1 md:h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
                Remove Cause?
              </h2>
              <p className="text-sm md:text-base text-gray-600 mb-4">
                Are you sure you want to remove <span className="font-semibold">{causeToRemove?.name}</span> from your donation box? This action cannot be undone.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setCauseToRemove(null);
                }}
                disabled={removeCauseMutation.isPending}
                className="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-full transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={removeCauseMutation.isPending}
                className="w-full sm:flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-full transition-colors text-sm md:text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removeCauseMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  'Remove'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Donations Bottom Sheet Modal */}
      {isPauseModalVisible && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${
            isPauseModalAnimating ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => {
            setShowPauseModal(false);
            setSelectedPauseOption(null);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Bottom Sheet */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl md:rounded-t-3xl shadow-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col transition-transform duration-300 ${
              isPauseModalAnimating ? 'translate-y-0' : 'translate-y-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    Pause Your Donations
                  </h2>
                  <p className="text-xs text-gray-600">
                    We understand that life happens. Choose how long you'd like to pause your recurring donations.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPauseModal(false);
                    setSelectedPauseOption(null);
                  }}
                  className="ml-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {/* Pause Options */}
              <div className="space-y-2">
                {/* Option 1: Skip this month */}
                <button
                  onClick={() => setSelectedPauseOption(1)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedPauseOption === 1
                      ? 'border-[#1600ff] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">Skip this month</span>
                    <span className="text-xs text-gray-600">Resume next month</span>
                  </div>
                </button>

                {/* Option 2: Pause for 2 months */}
                <button
                  onClick={() => setSelectedPauseOption(2)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedPauseOption === 2
                      ? 'border-[#1600ff] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">Pause for 2 months</span>
                    <span className="text-xs text-gray-600">Resume in 2 months</span>
                  </div>
                </button>

                {/* Option 3: Pause for 3 months */}
                <button
                  onClick={() => setSelectedPauseOption(3)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedPauseOption === 3
                      ? 'border-[#1600ff] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">Pause for 3 months</span>
                    <span className="text-xs text-gray-600">Resume in 3 months</span>
                  </div>
                </button>
              </div>

              {/* Cancel Subscription Link */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelDonationBoxMutation.isPending}
                  className="w-full text-xs text-red-600 hover:text-red-700 font-medium py-1.5 transition-colors disabled:opacity-50"
                >
                  {cancelDonationBoxMutation.isPending ? 'Cancelling...' : 'Cancel subscription completely'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
