import React, { useState } from "react";
import {
  Minus,
  Plus,
  DollarSign,
  Trash2,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Book,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCausesBySearch, getJoinCollective, getCollectiveById } from "@/services/api/crwd";
import { updateDonationBox, cancelDonationBox, getDonationHistory, getDonationBox } from "@/services/api/donation";
import { useAuthStore } from "@/stores/store";
import { cn } from "@/lib/utils";
import { Toast } from "./ui/toast";
import { getNonprofitColor } from "@/lib/getNonprofitColor";

// Define Organization type locally to avoid import issues
type Organization = {
  id: string;
  name: string;
  imageUrl: string;
  color?: string;
  shortDesc?: string;
  description?: string;
  via?: string;
  type?: 'cause' | 'collective';
};

interface ManageDonationBoxProps {
  amount: number;
  causes: Organization[];
  onBack: () => void;
  onRemove?: (id: string) => void;
  isActive?: boolean;
  onCancelSuccess?: () => void;
  nextChargeDate?: string;
}

const ManageDonationBox: React.FC<ManageDonationBoxProps> = ({
  amount,
  causes,
  onBack,
  onRemove,
  isActive = true,
  onCancelSuccess,
  nextChargeDate,
}) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"nonprofits" | "collectives">("nonprofits");
  const [editableAmount, setEditableAmount] = React.useState(Math.round(amount));
  const [isEditingAmount, setIsEditingAmount] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [temporarilyRemovedCauses, setTemporarilyRemovedCauses] =
    React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCauses, setSelectedCauses] = useState<number[]>([]);
  const [selectedCollectives, setSelectedCollectives] = useState<number[]>([]);
  const [selectedCausesData, setSelectedCausesData] = useState<any[]>([]); // Store full data for selected causes
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string; type: 'cause' | 'collective'; isNewlySelected: boolean } | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [expandedCollectives, setExpandedCollectives] = useState<Set<number>>(new Set());
  const [collectiveDetails, setCollectiveDetails] = useState<Record<number, any>>({});
  const [loadingCollectives, setLoadingCollectives] = useState<Set<number>>(new Set());

  // Separate existing causes/collectives from new selections
  const existingCauses = causes.filter(c => c.type === 'cause' || !c.type);
  const existingCollectives = causes.filter(c => c.type === 'collective');

  // Note: selectedCauses and selectedCollectives track NEW selections only
  // Existing ones are shown separately in the "Selected" sections

  // Fetch causes with search
  const { data: causesData, isLoading: causesLoading } = useQuery({
    queryKey: ['causes', searchQuery],
    queryFn: () => getCausesBySearch(searchQuery, '', 1),
    enabled: activeTab === 'nonprofits' && showSearchResults && searchQuery.length > 0,
  });

  // Fetch default causes (5 causes) when nonprofits tab is active
  const { data: defaultCausesData, isLoading: defaultCausesLoading } = useQuery({
    queryKey: ['default-causes-manage'],
    queryFn: () => getCausesBySearch('', '', 1),
    enabled: activeTab === 'nonprofits' && !showSearchResults,
  });

  // Fetch joined collectives
  const { data: joinedCollectivesData, isLoading: joinedCollectivesLoading } = useQuery({
    queryKey: ['joined-collectives-manage'],
    queryFn: () => getJoinCollective(currentUser?.id),
    enabled: activeTab === 'collectives',
  });

  // Fetch donation box data to get box_causes with attributed_collectives
  const { data: donationBoxData } = useQuery({
    queryKey: ['donationBox', currentUser?.id],
    queryFn: () => getDonationBox(),
    enabled: !!currentUser?.id,
  });

  // Mutation to add causes/collectives to box
  // const addToBoxMutation = useMutation({
  //   mutationFn: (data: { cause_ids?: number[]; collective_ids?: number[] }) => addCausesToBox(data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['donationBox'] });
  //     setSelectedCauses([]);
  //     setSelectedCollectives([]);
  //     setSelectedCausesData([]);
  //   },
  //   onError: (error: any) => {
  //     console.error('Error adding to box:', error);
  //   },
  // });

  // Mutation to update donation box amount
  // const updateAmountMutation = useMutation({
  //   mutationFn: (data: { monthly_amount: number }) => updateDonationBoxAmount(data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['donationBox'] });
  //   },
  //   onError: (error: any) => {
  //     console.error('Error updating amount:', error);
  //   },
  // });

  const updateDonationBoxMutation = useMutation({
    mutationFn: (data: any) => updateDonationBox(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
      setToastMessage('Donation box updated successfully!');
      setShowToast(true);
    },
    onError: (error: any) => {
      console.error('Error updating donation box:', error);
      setToastMessage('Failed to update donation box. Please try again.');
      setShowToast(true);
    },
  });

  const cancelDonationBoxMutation = useMutation({
    mutationFn: () => cancelDonationBox(),
    onSuccess: async () => {
      // Invalidate and refetch donation box query to get updated state
      await queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
      await queryClient.refetchQueries({ queryKey: ['donationBox', currentUser?.id] });
      setShowCancelModal(false);
      // Navigate to step 2 after successful cancellation
      if (onCancelSuccess) {
        onCancelSuccess();
      } else {
        onBack();
      }
    },
    onError: (error: any) => {
      console.error('Error canceling donation box:', error);
    },
  });

  const incrementAmount = () => {
    setEditableAmount((prev) => Math.round(prev) + 5);
  };

  const decrementAmount = () => {
    const current = Math.round(editableAmount);
    if (current > 5) {
      setEditableAmount(Math.max(5, current - 5));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value === "") {
      setEditableAmount(5);
    } else {
      const parsed = parseInt(value);
      setEditableAmount(Math.max(5, parsed));
    }
  };

  const handleRemove = (id: string) => {
    // Temporarily remove the cause/collective
    setTemporarilyRemovedCauses((prev) => [...prev, id]);
  };

  const handleDeselectCause = (causeId: number, isNewlySelected: boolean, causeName: string) => {
    // Show confirmation modal
    setItemToDelete({ id: causeId, name: causeName, type: 'cause', isNewlySelected });
    setShowDeleteModal(true);
  };

  const handleDeselectCollective = (collectiveId: number, isNewlySelected: boolean, collectiveName: string) => {
    // Show confirmation modal
    setItemToDelete({ id: collectiveId, name: collectiveName, type: 'collective', isNewlySelected });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'cause') {
      if (itemToDelete.isNewlySelected) {
        // Remove from newly selected
        setSelectedCauses((prev) => prev.filter(id => id !== itemToDelete.id));
        setSelectedCausesData((prev) => prev.filter(c => c.id !== itemToDelete.id));
      } else {
        // Remove existing cause from display (no API call)
        handleRemove(`cause-${itemToDelete.id}`);
        if (onRemove) {
          onRemove(`cause-${itemToDelete.id}`);
        }
      }
    } else {
      if (itemToDelete.isNewlySelected) {
        // Remove from newly selected
        setSelectedCollectives((prev) => prev.filter(id => id !== itemToDelete.id));
      } else {
        // Remove existing collective from display (no API call)
        handleRemove(`collective-${itemToDelete.id}`);
        if (onRemove) {
          onRemove(`collective-${itemToDelete.id}`);
        }
      }
    }

    // Close modal
    setShowDeleteModal(false);
    setItemToDelete(null);
  };


  const handleSave = () => {
    // Permanently remove the causes
    temporarilyRemovedCauses.forEach((id) => {
      if (onRemove) {
        onRemove(id);
      }
    });
    // Clear the temporarily removed causes
    setTemporarilyRemovedCauses([]);
    setIsEditMode(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleToggleCause = (causeId: number) => {
    if (selectedCauses.includes(causeId)) {
      // Deselecting
      setSelectedCauses((prev) => prev.filter(id => id !== causeId));
      setSelectedCausesData((prev) => prev.filter(c => c.id !== causeId));
    } else {
      // Selecting - find the cause data from search results
      const causeData = causesData?.results?.find((c: any) => c.id === causeId);
      if (causeData) {
        setSelectedCauses((prev) => [...prev, causeId]);
        setSelectedCausesData((prev) => [...prev, causeData]);
      }
    }
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

  const handleToggleCollective = (collectiveId: number) => {
    setSelectedCollectives((prev) => 
      prev.includes(collectiveId) 
        ? prev.filter(id => id !== collectiveId)
        : [...prev, collectiveId]
    );
  };

  const handleUpdateDonation = async () => {
    try {
      // Get existing cause IDs that are NOT removed
      const remainingExistingCauseIds = existingCauses
        .filter(c => !temporarilyRemovedCauses.includes(c.id))
        .map(c => {
          const id = c.id.replace('cause-', '');
          return parseInt(id);
        })
        .filter(id => !isNaN(id));

      // Get existing collective IDs that are NOT removed
      const remainingExistingCollectiveIds = existingCollectives
        .filter(c => !temporarilyRemovedCauses.includes(c.id))
        .map(c => {
          const id = c.id.replace('collective-', '');
          return parseInt(id);
        })
        .filter(id => !isNaN(id));

      // Combine existing (not removed) + newly selected causes/collectives
      const allCauseIds = [...remainingExistingCauseIds, ...selectedCauses];
      const allCollectiveIds = [...remainingExistingCollectiveIds, ...selectedCollectives];

      // Validate that at least one nonprofit or collective exists
      if (allCauseIds.length === 0 && allCollectiveIds.length === 0) {
        alert('Please add at least one nonprofit or collective to your donation box.');
        return;
      }

      // Build causes array with cause_id and optional attributed_collective
      const causesArray: Array<{ cause_id: number; attributed_collective?: number }> = [];

      // Get box_causes from donation box data to map attributed_collectives
      const boxCauses = donationBoxData?.box_causes || [];
      const causeToAttributedCollective = new Map<number, number>();
      
      // Map existing causes to their attributed_collective from box_causes
      boxCauses.forEach((boxCause: any) => {
        const causeId = boxCause.cause?.id;
        if (causeId) {
          // Check if attributed_collectives exists and is not "manual"
          const attributedCollectives = boxCause.attributed_collectives || [];
          // Find the first numeric collective ID (not "manual")
          const numericCollectiveId = attributedCollectives.find((ac: any) => 
            typeof ac === 'number' && ac !== 0
          );
          if (numericCollectiveId) {
            causeToAttributedCollective.set(causeId, numericCollectiveId);
          }
        }
      });

      // Add existing causes (not removed) with their attributed_collective from box_causes
      remainingExistingCauseIds.forEach((causeId) => {
        const attributedCollective = causeToAttributedCollective.get(causeId);
        const causeEntry: { cause_id: number; attributed_collective?: number } = {
          cause_id: causeId,
        };
        // Only add attributed_collective if it exists and is not 0
        if (attributedCollective && attributedCollective !== 0) {
          causeEntry.attributed_collective = attributedCollective;
        }
        causesArray.push(causeEntry);
      });

      // Add newly selected causes (standalone, no attributed_collective)
      selectedCauses.forEach((causeId) => {
        causesArray.push({
          cause_id: causeId,
        });
      });

      // Add causes from newly selected collectives
      // When a collective is selected, we need to get its causes and add them with attributed_collective
      for (const collectiveId of selectedCollectives) {
        try {
          const collectiveData = collectiveDetails[collectiveId] || await getCollectiveById(collectiveId.toString());
          if (collectiveData?.causes) {
            collectiveData.causes.forEach((collectiveCause: any) => {
              const causeId = collectiveCause.cause?.id || collectiveCause.id;
              if (causeId) {
                // Check if this cause is already in the array (shouldn't happen for newly selected, but just in case)
                const alreadyExists = causesArray.some(c => c.cause_id === causeId);
                if (!alreadyExists) {
                  const causeEntry: { cause_id: number; attributed_collective?: number } = {
                    cause_id: causeId,
                    attributed_collective: collectiveId,
                  };
                  causesArray.push(causeEntry);
                }
              }
            });
          }
        } catch (error) {
          console.error(`Error fetching collective ${collectiveId} details:`, error);
        }
      }

      // Note: Causes from existing collectives are already included in remainingExistingCauseIds
      // with their attributed_collective mapped from box_causes above, so we don't need to add them separately

      // Prepare payload with new format
      const payload: {
        monthly_amount: string;
        causes: Array<{ cause_id: number; attributed_collective?: number }>;
      } = {
        monthly_amount: editableAmount.toString(),
        causes: causesArray,
      };

      // Send single update call with all data
      await updateDonationBoxMutation.mutateAsync(payload);

      // Clear temporarily removed causes after successful update
      setTemporarilyRemovedCauses([]);
      setSelectedCauses([]);
      setSelectedCollectives([]);
      setSelectedCausesData([]);

      // Refresh data and navigate back to donation page
      queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
      onBack();
    } catch (error) {
      console.error('Error updating donation box:', error);
      // You might want to show an error toast here
    }
  };

  // Filter out temporarily removed causes for display
  const visibleCauses = causes.filter(
    (cause) => !temporarilyRemovedCauses.includes(cause.id)
  );

  // Get existing cause IDs to filter them out from search results
  const existingCauseIds = existingCauses
    .map(c => {
      const id = c.id.replace('cause-', '');
      return parseInt(id);
    })
    .filter(id => !isNaN(id));

  // Get existing collective IDs to filter them out
  const existingCollectiveIds = existingCollectives
    .map(c => {
      const id = c.id.replace('collective-', '');
      return parseInt(id);
    })
    .filter(id => !isNaN(id));

  // Get all selected cause IDs (existing + newly selected)
  const allSelectedCauseIds = [...existingCauseIds, ...selectedCauses];
  
  // Get all selected collective IDs (existing + newly selected)
  const allSelectedCollectiveIds = [...existingCollectiveIds, ...selectedCollectives];

  // Format next charge date
  const formatNextChargeDate = (dateString?: string) => {
    if (!dateString) return null; // Fallback
    
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'December 26, 2024'; // Fallback
    }
  };

  // Get day of month from next charge date
  const getChargeDay = (dateString?: string) => {
    if (!dateString) return '26'; // Fallback
    
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

  // Calculate if there are any items (existing not removed + newly selected)
  const remainingExistingCauseIdsForValidation = existingCauses
    .filter(c => !temporarilyRemovedCauses.includes(c.id))
    .map(c => {
      const id = c.id.replace('cause-', '');
      return parseInt(id);
    })
    .filter(id => !isNaN(id));

  const remainingExistingCollectiveIdsForValidation = existingCollectives
    .filter(c => !temporarilyRemovedCauses.includes(c.id))
    .map(c => {
      const id = c.id.replace('collective-', '');
      return parseInt(id);
    })
    .filter(id => !isNaN(id));

  const totalCauseIds = [...remainingExistingCauseIdsForValidation, ...selectedCauses];
  const totalCollectiveIds = [...remainingExistingCollectiveIdsForValidation, ...selectedCollectives];
  const hasNoItems = totalCauseIds.length === 0 && totalCollectiveIds.length === 0;

  // Calculate equal distribution percentage and amount per item
  const totalItems = totalCauseIds.length + totalCollectiveIds.length;
  const distributionPercentage = totalItems > 0 ? Math.floor(100 / totalItems) : 0;
  const amountPerItem = totalItems > 0 ? (editableAmount * 0.9) / totalItems : 0; // 90% after fees, divided equally

  // Calculate capacity and counts for summary card
  const totalCausesCount = totalCauseIds.length;
  const totalCollectivesCount = totalCollectiveIds.length;
  const currentCapacity = totalCausesCount;
  
  // Calculate fees and capacity using the provided formula
  const calculateFees = (grossAmount: number) => {
    const gross = grossAmount;
    const stripeFee = (gross * 0.029) + 0.30;
    const crwdFee = (gross - stripeFee) * 0.07;
    const net = gross - stripeFee - crwdFee;
    
    console.log('=== Fee Calculation (ManageDonationBox) ===');
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

  const actualDonationAmount = parseFloat(editableAmount.toString());
  const fees = calculateFees(actualDonationAmount);
  const net = fees.net;
  const maxCapacity = Math.floor(net / 0.20);
  
  console.log('=== Capacity Calculation (ManageDonationBox) ===');
  console.log('Editable Amount:', editableAmount);
  console.log('Actual Donation Amount:', actualDonationAmount);
  console.log('Fees object:', fees);
  console.log('Net amount:', net);
  console.log('Max Capacity (net / 0.20):', maxCapacity);
  console.log('Current Capacity (totalCausesCount):', currentCapacity);
  console.log('Total Causes Count:', totalCausesCount);
  console.log('Total Collectives Count:', totalCollectivesCount);
  
  const remainingCapacity = maxCapacity - currentCapacity;
  const capacityPercentage = (currentCapacity / maxCapacity) * 100;
  
  console.log('=== Capacity Info (ManageDonationBox) ===');
  console.log('Remaining Capacity:', remainingCapacity);
  console.log('Capacity Percentage:', capacityPercentage);

  // Fetch donation history for lifetime amount
  const { data: donationHistoryData } = useQuery({
    queryKey: ['donationHistory'],
    queryFn: getDonationHistory,
  });

  // Calculate lifetime amount from donation history
  const lifetimeAmount = donationHistoryData?.results?.reduce((sum: number, transaction: any) => {
    return sum + parseFloat(transaction.gross_amount || '0');
  }, 0) || 0;

  // Check if amount has changed from original
  const hasAmountChanged = editableAmount !== Math.round(amount);
  const originalAmount = Math.round(amount);

  // Create combined selected causes list for display (existing + newly selected from search results)
  const getSelectedCausesForDisplay = () => {
    const existingList = existingCauses.filter(c => !temporarilyRemovedCauses.includes(c.id));
    
    // Get newly selected causes from stored data
    const newlySelectedCauses = selectedCausesData;
    
    return [...existingList.map(c => ({
      id: c.id,
      name: c.name,
      imageUrl: c.imageUrl,
      description: c.description,
      isExisting: true,
      isNewlySelected: false,
    })), ...newlySelectedCauses.map((cause: any) => ({
      id: `cause-${cause.id}`,
      name: cause.name,
      imageUrl: cause.logo || '',
      description: cause.mission || cause.description || '',
      isExisting: false,
      isNewlySelected: true,
      causeId: cause.id,
    }))];
  };

  // Create combined selected collectives list for display
  const getSelectedCollectivesForDisplay = () => {
    const existingList = existingCollectives.filter(c => !temporarilyRemovedCauses.includes(c.id));
    const newlySelectedFromList = joinedCollectivesData?.data?.map((item: any) => item.collective).filter((collective: any) => 
      selectedCollectives.includes(collective.id)
    ) || [];
    return [...existingList.map(c => ({
      id: c.id,
      name: c.name,
      imageUrl: c.imageUrl,
      description: c.description,
      isExisting: true,
      isNewlySelected: false,
    })), ...newlySelectedFromList.map((collective: any) => ({
      id: `collective-${collective.id}`,
      name: collective.name,
      imageUrl: collective.cover_image || '',
      description: collective.description || '',
      isExisting: false,
      isNewlySelected: true,
      collectiveId: collective.id,
    }))];
  };

  // Get search results (max 5) for nonprofits, excluding all selected ones
  const searchResults = showSearchResults && causesData?.results 
    ? causesData.results
        .filter((cause: any) => !allSelectedCauseIds.includes(cause.id))
        .slice(0, 5)
    : [];

  // Get default causes (max 5) when no search is active, excluding all selected ones
  const defaultCauses = !showSearchResults && defaultCausesData?.results
    ? defaultCausesData.results
        .filter((cause: any) => !allSelectedCauseIds.includes(cause.id))
        .slice(0, 5)
    : [];

  // Get joined collectives, excluding all selected ones
  const joinedCollectives = joinedCollectivesData?.data?.map((item: any) => item.collective) || [];
  const availableCollectives = joinedCollectives.filter((collective: any) => 
    !allSelectedCollectiveIds.includes(collective.id)
  );

  return (
    <div className="w-full min-h-screen bg-white flex flex-col ">
      {/* Content Container with max-width */}
      <div className="md:max-w-[60%] mx-auto w-full">
      {/* Header */}
      {/* <div className="bg-white border-b border-gray-200 h-16 p-4 flex items-center">
        <button
          onClick={() => onBack()}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mr-2 cursor-pointer"
          aria-label="Go back"
        >
          
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          Manage Donation Box
        </h1>
        <div className="w-10"></div>
      </div> */}

      {/* Donation Box Summary Card */}
      <div className="mx-3 md:mx-4 mt-3 md:mt-4 mb-4 md:mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 md:h-2"></div>

          <div className="p-4 md:p-6">
            {/* Monthly Donation Section */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">Monthly Donation</h2>
              <div className="flex items-center justify-between mb-1.5 md:mb-2">
                <div className="flex items-baseline gap-1.5 md:gap-2">
                  {isEditingAmount ? (
                    <input
                      type="text"
                      value={editableAmount}
                      onChange={handleAmountChange}
                      onBlur={() => setIsEditingAmount(false)}
                      autoFocus
                      className="text-3xl md:text-4xl font-bold text-gray-900 bg-transparent border-b border-gray-300 w-20 md:w-24 text-center focus:outline-none"
                    />
                  ) : (
                    <>
                      <span className="text-3xl md:text-4xl font-bold text-gray-900">${editableAmount}</span>
                      <span className="text-sm md:text-base text-gray-600">/   month</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <button
                    onClick={decrementAmount}
                    disabled={editableAmount <= 5}
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-colors ${
                      editableAmount > 5 
                        ? 'bg-gray-100 hover:bg-gray-200' 
                        : 'bg-gray-200 cursor-not-allowed opacity-50'
                    }`}
                    aria-label="Decrease amount"
                  >
                    <Minus className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 font-bold" strokeWidth={3} />
                  </button>
                  <button
                    onClick={incrementAmount}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    aria-label="Increase amount"
                  >
                    <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              {lifetimeAmount > 0 && (
                <p className="text-xs md:text-sm text-gray-600">${lifetimeAmount.toLocaleString()} lifetime</p>
              )}
            </div>

            {/* Information Banner - Show when amount has changed */}
            {formatNextChargeDate(nextChargeDate) && (
              <div className="bg-blue-50 rounded-lg px-3 md:px-4 py-2.5 md:py-3 mb-4 md:mb-6 border border-blue-100">
                <p className="text-xs md:text-sm text-blue-700">
                  Changes take effect on your next billing cycle ({formatNextChargeDate(nextChargeDate)} of the month)
                </p>
              </div>
            )}

           

            {/* Supported Entities */}
            <div className="bg-gray-100 rounded-lg px-3 md:px-4 py-2.5 md:py-3 mb-4 md:mb-6 text-center">
              <p className="text-xs md:text-sm font-bold text-gray-900">
                {totalCausesCount} Cause{totalCausesCount !== 1 ? 's' : ''} • {totalCollectivesCount} Collective{totalCollectivesCount !== 1 ? 's' : ''}
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
                  style={{ width: `${Math.min(100, capacityPercentage)}%` }}
                ></div>
              </div>
              <p className="text-xs md:text-sm text-blue-600">
                You can support {remainingCapacity} more cause{remainingCapacity !== 1 ? 's' : ''} with this donation amount.
              </p>
            </div>

            {/* Payment Schedule and Action Buttons */}
            {/* <div className="text-sm text-gray-600 mb-4 text-center">
              on the {getChargeDay(nextChargeDate)} of every month
            </div>
            <div className="flex w-full max-w-xs mx-auto justify-between gap-2">
              <button
                className="flex flex-col items-center flex-1 bg-gray-50 hover:bg-gray-100 rounded-xl py-3 transition-colors"
                onClick={() => setIsEditingAmount(true)}
              >
                <DollarSign size={22} className="mb-1 text-gray-600" />
                <span className="text-xs text-gray-600">Edit amount</span>
              </button>
              <Link
                to="/transaction-history"
                className="flex flex-col items-center flex-1 bg-gray-50 hover:bg-gray-100 rounded-xl py-3 transition-colors"
              >
                <Book size={22} className="mb-1 text-gray-600" />
                <span className="text-xs text-gray-600 underline">transaction history</span>
              </Link>
            </div> */}
          </div>
        </div>
      </div>
      {/* Tabs Navigation */}
      {/* <div className="mx-4 mt-4">
        <div className="flex rounded-xl overflow-hidden border bg-white shadow-sm">
          <button
            className={cn(
              "flex-1 py-4 text-sm font-medium transition-all",
              activeTab === "nonprofits"
                ? "text-white bg-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => {
              setActiveTab("nonprofits");
              setShowSearchResults(false);
              setSearchQuery("");
            }}
          >
            Nonprofits
          </button>
          <button
            className={cn(
              "flex-1 py-4 text-sm font-medium transition-all",
              activeTab === "collectives"
                ? "text-white bg-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => {
              setActiveTab("collectives");
              setShowSearchResults(false);
              setSearchQuery("");
            }}
          >
            Collectives
          </button>
        </div>
      </div> */}

      {/* Content Area */}
      <div className="flex-1 mt-3 md:mt-4 mb-20 md:mb-24 overflow-auto">
        {activeTab === "nonprofits" ? (
          <div className="px-3 md:px-4">
            {/* Selected Nonprofits - Combined existing + newly selected */}
            {(() => {
              const selectedCausesForDisplay = getSelectedCausesForDisplay();
              return selectedCausesForDisplay.length > 0 && (
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-800">Your Selected Causes</h2>
                      <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">Your Donation Box. Add or remove anytime.</p>
                    </div>
                  </div>
                  <div className="space-y-2.5 md:space-y-3">
                    {selectedCausesForDisplay.map((org) => {
                      const causeId = org.isNewlySelected ? (org as any).causeId : parseInt(org.id.replace('cause-', ''));
                      const colors = getNonprofitColor(causeId || org.name);
                      return (
                        <div
                          key={org.id}
                          className="bg-white rounded-xl px-3 md:px-4 py-3 md:py-4 shadow-sm border border-gray-200"
                        >
                          <div className="flex gap-3 md:gap-4 items-center">
                            <div 
                              className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: colors.bgColor }}
                            >
                              <span 
                                className="text-lg md:text-xl font-bold"
                                style={{ color: colors.textColor }}
                              >
                                {org.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-sm md:text-base mb-0.5 md:mb-1">
                                {org.name}
                              </h3>
                              {org.description && (
                                <p className="text-xs md:text-sm text-gray-500 line-clamp-1">
                                  {org.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className="text-right">
                                <div className="font-bold text-gray-900 text-sm md:text-base">
                                  {distributionPercentage}%
                                </div>
                                <div className="text-xs md:text-sm text-gray-500">
                                  ${amountPerItem.toFixed(2)}/mo
                                </div>
                              </div>
                              <button
                                className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                                onClick={() => handleDeselectCause(causeId, org.isNewlySelected, org.name)}
                                aria-label="Remove cause"
                              >
                                <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Search Section */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                Add More Causes
              </h2>
              <div className="flex gap-2 mb-3 md:mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                  <input
                    type="text"
                    placeholder="Search for causes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1600ff] text-sm md:text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setShowSearchResults(false);
                      }}
                      className="absolute right-2.5 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} className="md:w-4 md:h-4" />
                    </button>
                  )}
                </div>
              </div>
              
            </div>

            {/* Default Causes - Show when no search is active */}
            {!showSearchResults && (
              <div className="mb-4 md:mb-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">
                  Suggested Nonprofits
                </h3>
                {defaultCausesLoading ? (
                  <p className="text-gray-500 text-center py-3 md:py-4 text-sm md:text-base">Loading...</p>
                ) : defaultCauses.length > 0 ? (
                  <div className="space-y-2.5 md:space-y-3">
                    {defaultCauses.map((cause: any) => {
                      const isSelected = selectedCauses.includes(cause.id);
                      const colors = getNonprofitColor(cause.id || cause.name);
                      return (
                        <div
                          key={cause.id}
                          className="flex items-center gap-3 md:gap-4 bg-white rounded-xl px-3 md:px-4 py-3 md:py-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleToggleCause(cause.id)}
                        >
                          <div 
                            className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: colors.bgColor }}
                          >
                            <span 
                              className="text-lg md:text-xl font-bold"
                              style={{ color: colors.textColor }}
                            >
                              {cause.name?.charAt(0)?.toUpperCase() || 'C'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm md:text-base mb-0.5 md:mb-1">{cause.name}</h3>
                            <p className="text-xs md:text-sm text-gray-500 line-clamp-1">{cause.mission || cause.description}</p>
                          </div>
                          {!isSelected && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCause(cause.id);
                              }}
                              className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors flex-shrink-0"
                            >
                              <Plus size={14} className="md:w-4 md:h-4 text-pink-600" strokeWidth={3} />
                            </button>
                          )}
                          {isSelected && (
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-3 md:py-4 text-sm md:text-base">No nonprofits available</p>
                )}
              </div>
            )}

            {/* Search Results */}
            {showSearchResults && (
              <div className="mb-4 md:mb-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">
                  Search Results (Max 5)
                </h3>
                {causesLoading ? (
                  <p className="text-gray-500 text-center py-3 md:py-4 text-sm md:text-base">Loading...</p>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2.5 md:space-y-3">
                    {searchResults.map((cause: any) => {
                      const isSelected = selectedCauses.includes(cause.id);
                      const colors = getNonprofitColor(cause.id || cause.name);
                      return (
                        <div
                          key={cause.id}
                          className="flex items-center gap-3 md:gap-4 bg-white rounded-xl px-3 md:px-4 py-3 md:py-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div 
                            className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: colors.bgColor }}
                          >
                            <span 
                              className="text-lg md:text-xl font-bold"
                              style={{ color: colors.textColor }}
                            >
                              {cause.name?.charAt(0)?.toUpperCase() || 'C'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm md:text-base mb-0.5 md:mb-1">{cause.name}</h3>
                            <p className="text-xs md:text-sm text-gray-500 line-clamp-1">{cause.mission || cause.description}</p>
                          </div>
                          {!isSelected && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCause(cause.id);
                              }}
                              className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors flex-shrink-0"
                            >
                              <Plus size={14} className="md:w-4 md:h-4 text-pink-600" strokeWidth={3} />
                            </button>
                          )}
                          {isSelected && (
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-3 md:py-4 text-sm md:text-base">No nonprofits found</p>
                )}
              </div>
            )}
          </div>
                        ) : (
          <div className="px-3 md:px-4">
            {/* Selected Collectives - Combined existing + newly selected */}
            {(() => {
              const selectedCollectivesForDisplay = getSelectedCollectivesForDisplay();
              return selectedCollectivesForDisplay.length > 0 && (
                <div className="mb-4 md:mb-6">
                  <h2 className="text-sm md:text-base font-semibold text-gray-700 uppercase mb-3 md:mb-4 tracking-wide">
                    Selected Collectives
                  </h2>
                  <div className="space-y-2.5 md:space-y-3">
                    {selectedCollectivesForDisplay.map((org) => {
                      const collectiveId = org.isNewlySelected ? (org as any).collectiveId : parseInt(org.id.replace('collective-', ''));
                      const isExpanded = expandedCollectives.has(collectiveId);
                      const details = collectiveDetails[collectiveId];
                      const isLoading = loadingCollectives.has(collectiveId);
                      
                      // Generate consistent color for collective
                      const collectiveColors = [
                        { bg: '#dbeafe', text: '#1e40af' }, // blue
                        { bg: '#fce7f3', text: '#831843' }, // pink
                        { bg: '#e9d5ff', text: '#6b21a8' }, // purple
                        { bg: '#d1fae5', text: '#065f46' }, // green
                        { bg: '#fed7aa', text: '#9a3412' }, // orange
                      ];
                      const colorIndex = (org.name?.charCodeAt(0) || 0) % collectiveColors.length;
                      const collectiveColor = collectiveColors[colorIndex];
                      
                      return (
                        <div key={org.id}>
                          <div className="bg-white rounded-xl px-3 md:px-4 py-3 md:py-4 shadow-sm border border-gray-200">
                            <div className="flex gap-3 md:gap-4 items-center">
                              <div
                                className="flex gap-3 md:gap-4 items-center cursor-pointer flex-1 min-w-0"
                                onClick={() => handleToggleCollectiveDropdown(collectiveId)}
                              >
                                <div 
                                  className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: collectiveColor.bg }}
                                >
                                  <span 
                                    className="text-lg md:text-xl font-bold"
                                    style={{ color: collectiveColor.text }}
                                  >
                                    {org.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-900 text-sm md:text-base mb-0.5 md:mb-1">
                                    {org.name}
                                  </h3>
                                  {org.description && (
                                    <p className="text-xs md:text-sm text-gray-500 line-clamp-1">
                                      {org.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="text-right">
                                  <div className="font-bold text-gray-900 text-sm md:text-base">
                                    {distributionPercentage}%
                                  </div>
                                  <div className="text-xs md:text-sm text-gray-500">
                                    ${amountPerItem.toFixed(2)}/mo
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 md:gap-2">
                                  {isLoading ? (
                                    <div className="animate-spin rounded-full h-3.5 w-3.5 md:h-4 md:w-4 border-b-2 border-green-600"></div>
                                  ) : (
                                    isExpanded ? (
                                      <ChevronUp size={18} className="md:w-5 md:h-5 text-gray-500" />
                                    ) : (
                                      <ChevronDown size={18} className="md:w-5 md:h-5 text-gray-500" />
                                    )
                                  )}
                                  <button
                                    className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeselectCollective(collectiveId, org.isNewlySelected, org.name);
                                    }}
                                    aria-label="Remove collective"
                                  >
                                    <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          {isExpanded && details && details.causes && details.causes.length > 0 && (
                            <div className="bg-gray-50 p-3 md:p-4 border border-gray-200 rounded-lg mt-2 ml-3 md:ml-4">
                              <h4 className="text-xs md:text-sm font-semibold text-gray-800 mb-2 md:mb-3">
                                Nonprofits ({details.causes.length})
                              </h4>
                              <div className="space-y-2 md:space-y-3 pl-12 md:pl-14">
                                {details.causes.map((causeItem: any) => (
                                  <div key={causeItem.id} className="flex items-center gap-2.5 md:gap-3 py-1.5 md:py-2 border-b border-gray-200 last:border-b-0">
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                      <span className="text-blue-600 text-[10px] md:text-xs font-semibold">
                                        {causeItem.cause?.name?.charAt(0).toUpperCase() || 'N'}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold text-gray-800 text-xs md:text-sm">
                                        {causeItem.cause?.name}
                                      </h5>
                                      {causeItem.cause?.description && (
                                        <p className="text-[10px] md:text-xs text-gray-600 line-clamp-2 mt-0.5 md:mt-1">
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
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Available Collectives */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-sm md:text-base font-semibold text-gray-700 uppercase mb-3 md:mb-4 tracking-wide">
                Joined Collectives
              </h2>
              {joinedCollectivesLoading ? (
                <p className="text-gray-500 text-center py-3 md:py-4 text-sm md:text-base">Loading...</p>
              ) : availableCollectives.length > 0 ? (
                <div className="space-y-2.5 md:space-y-3">
                  {availableCollectives.map((collective: any) => {
                    const isSelected = selectedCollectives.includes(collective.id);
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
                        <div className="flex items-center gap-3 md:gap-4 bg-white rounded-xl px-3 md:px-4 py-3 md:py-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div
                            className="flex gap-3 md:gap-4 items-center cursor-pointer flex-1 min-w-0"
                            onClick={() => handleToggleCollectiveDropdown(collective.id)}
                          >
                            <div 
                              className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: collectiveColor.bg }}
                            >
                              <span 
                                className="text-lg md:text-xl font-bold"
                                style={{ color: collectiveColor.text }}
                              >
                                {collective.name?.charAt(0)?.toUpperCase() || 'C'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-sm md:text-base mb-0.5 md:mb-1">{collective.name}</h3>
                              <p className="text-xs md:text-sm text-gray-500 line-clamp-1">{collective.description || 'Community collective'}</p>
                            </div>
                            <div className="ml-2 md:ml-4">
                              {isLoading ? (
                                <div className="animate-spin rounded-full h-3.5 w-3.5 md:h-4 md:w-4 border-b-2 border-green-600"></div>
                              ) : (
                                isExpanded ? (
                                  <ChevronUp size={18} className="md:w-5 md:h-5 text-gray-500" />
                                ) : (
                                  <ChevronDown size={18} className="md:w-5 md:h-5 text-gray-500" />
                                )
                              )}
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer ${isSelected ? 'bg-blue-600' : 'border-2 border-gray-300'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCollective(collective.id);
                            }}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        {isExpanded && details && details.causes && details.causes.length > 0 && (
                          <div className="bg-gray-50 p-3 md:p-4 border border-gray-200 rounded-lg mt-2 ml-3 md:ml-4">
                            <h4 className="text-xs md:text-sm font-semibold text-gray-800 mb-2 md:mb-3">
                              Nonprofits ({details.causes.length})
                            </h4>
                            <div className="space-y-2 md:space-y-3 pl-12 md:pl-14">
                              {details.causes.map((causeItem: any) => (
                                <div key={causeItem.id} className="flex items-center gap-2.5 md:gap-3 py-1.5 md:py-2 border-b border-gray-200 last:border-b-0">
                                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 text-[10px] md:text-xs font-semibold">
                                      {causeItem.cause?.name?.charAt(0).toUpperCase() || 'N'}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-gray-800 text-xs md:text-sm">
                                      {causeItem.cause?.name}
                                    </h5>
                                    {causeItem.cause?.description && (
                                      <p className="text-[10px] md:text-xs text-gray-600 line-clamp-2 mt-0.5 md:mt-1">
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
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-3 md:py-4 text-sm md:text-base">No collectives available</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Distribution Details */}
      {/* <div className="px-4 py-4">
        <p className="text-sm text-gray-500 text-center">
          Your ${editableAmount} becomes ${(editableAmount * 0.9).toFixed(2)}{" "}
          after fees, split evenly across causes. Your donation will be evenly
          distributed across all {visibleCauses.length} organizations.
        </p>
      </div> */}

      {/* Update Donation Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 border-t border-gray-200 bg-white">
        <Button
          onClick={handleUpdateDonation}
          disabled={updateDonationBoxMutation.isPending || hasNoItems}
          className="w-full bg-[#1600ff] hover:bg-[#0000ff] text-white py-4 md:py-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
        >
          {updateDonationBoxMutation.isPending
            ? 'Updating...'
            : 'Update Donation'}
        </Button>

        {/* Toast notification */}
        <Toast
          message={toastMessage}
          show={showToast}
          onHide={() => setShowToast(false)}
          duration={3000}
        />
        
        {/* Deactivate Subscription Button - Only show if subscription is active */}
        {/* {isActive && (
          <Button
            onClick={() => setShowCancelModal(true)}
            disabled={cancelDonationBoxMutation.isPending}
            variant="outline"
            className="w-full mt-3 md:mt-4 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 py-4 md:py-6 rounded-lg font-semibold text-sm md:text-base"
          >
            {cancelDonationBoxMutation.isPending
              ? 'Deactivating...'
              : 'Deactivate Subscription'}
          </Button>
        )} */}
      </div>

      {/* Payment Method Section */}
      {/* <div className="px-8 py-4">
        <h3 className="text-base font-semibold text-gray-700 uppercase mb-4 tracking-wide">
          PAYMENT METHOD
        </h3>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <CreditCard size={16} className="text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  **** **** **** 4242
                </div>
                <div className="text-xs text-gray-500">12/25</div>
              </div>
            </div>
            <Link
              to="/settings/payments"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Change
            </Link>
          </div>
        </div>
      </div> */}

      {/* Next Payment Section */}
      {/* <div className="px-8 py-4">
        <h3 className="text-base font-semibold text-gray-700 uppercase mb-4 tracking-wide">
          NEXT PAYMENT
        </h3>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">
                Next payment date
              </div>
              <div className="text-xs text-gray-500">{formatNextChargeDate(nextChargeDate)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                ${editableAmount}
              </div>
              <div className="text-xs text-gray-500">Monthly</div>
            </div>
          </div>
        </div>
      </div> */}

      {/* <div className=" text-gray-400 mb-5  pt-5 text-center">
        Allocations will automatically adjust for 100% distribution
      </div> */}

      {/* Edit Causes Button */}
      {/* <div className="flex  mt-6 pb-4 px-8">
        <Button
          variant="outline"
          className="rounded-full px-6 py-2 text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100 font-semibold"
          onClick={handleEditCauses}
        >
          {isEditMode ? "Close" : "Edit Causes"}
        </Button>
      </div> */}

      {/* Footer */}
      {isEditMode && (
        <div className="px-4 py-6 ">
          <div className="grid grid-cols-2 gap-2">
            {visibleCauses.length > 0 && (
              <button className="col-span-1 text-xs text-gray-400">
                Deactivate donation box
              </button>
            )}
            <Button
              className={`${
                visibleCauses.length > 0 ? "col-span-1" : "col-span-2"
              } rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-20 w-1/2 mx-auto`}
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {itemToDelete?.name} from your donation box? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteModal(false);
                setItemToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Confirmation Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate your donation box subscription? This will cancel all future monthly donations. You can reactivate it at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelModal(false)}
              disabled={cancelDonationBoxMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => cancelDonationBoxMutation.mutate()}
              disabled={cancelDonationBoxMutation.isPending}
            >
              {cancelDonationBoxMutation.isPending ? 'Deactivating...' : 'Deactivate Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* <div className="h-24 md:hidden"></div> */}
      </div>
    </div>
  );
};

export default ManageDonationBox;
