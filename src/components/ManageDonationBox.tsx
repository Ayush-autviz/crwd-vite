import React, { useState } from "react";
import {
  Minus,
  Plus,
  DollarSign,
  Trash2,
  ChevronLeft,
  Search,
  X,
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
import { getCausesBySearch, getJoinCollective } from "@/services/api/crwd";
import { updateDonationBox } from "@/services/api/donation";
import { useAuthStore } from "@/stores/store";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

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
}

const ManageDonationBox: React.FC<ManageDonationBoxProps> = ({
  amount,
  causes,
  onBack,
  onRemove,
}) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"nonprofits" | "collectives">("nonprofits");
  const [editableAmount, setEditableAmount] = React.useState(amount);
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

  // Fetch joined collectives
  const { data: joinedCollectivesData, isLoading: joinedCollectivesLoading } = useQuery({
    queryKey: ['joined-collectives-manage'],
    queryFn: () => getJoinCollective(currentUser?.id),
    enabled: activeTab === 'collectives',
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
      queryClient.invalidateQueries({ queryKey: ['donationBox'] });
    },
    onError: (error: any) => {
      console.error('Error updating donation box:', error);
    },
  });

  const incrementAmount = () => {
    setEditableAmount((prev) => prev + 1);
  };

  const decrementAmount = () => {
    if (editableAmount > 1) {
      setEditableAmount((prev) => prev - 1);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value === "") {
      setEditableAmount(0);
    } else {
      setEditableAmount(parseInt(value));
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

      // Prepare payload with amount and all causes/collectives
      const payload: any = {
        monthly_amount: editableAmount,
      };

      if (allCauseIds.length > 0) {
        payload.cause_ids = allCauseIds;
      }

      if (allCollectiveIds.length > 0) {
        payload.collective_ids = allCollectiveIds;
      }

      // Send single update call with all data
      await updateDonationBoxMutation.mutateAsync(payload);

      // Clear temporarily removed causes after successful update
      setTemporarilyRemovedCauses([]);
      setSelectedCauses([]);
      setSelectedCollectives([]);
      setSelectedCausesData([]);

      // Refresh and go back
      queryClient.invalidateQueries({ queryKey: ['donationBox'] });
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

  // Get joined collectives, excluding all selected ones
  const joinedCollectives = joinedCollectivesData?.data?.map((item: any) => item.collective) || [];
  const availableCollectives = joinedCollectives.filter((collective: any) => 
    !allSelectedCollectiveIds.includes(collective.id)
  );

  return (
    <div className="w-full min-h-screen bg-white flex flex-col ">
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

      {/* Blue Card */}
      <div className="bg-blue-600 rounded-xl px-4 py-6 mx-4 mt-4 relative">
        <Link
          to="/transaction-history"
          className="absolute right-4 top-4 text-xs text-white/80 underline"
        >
          See full transaction history
        </Link>
        <div className="flex flex-col items-center mt-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={decrementAmount}
              className="bg-white/20 rounded-full p-2 text-white hover:bg-white/30 transition"
            >
              <Minus size={20} />
            </button>
            {isEditingAmount ? (
              <input
                type="text"
                value={editableAmount}
                onChange={handleAmountChange}
                onBlur={() => setIsEditingAmount(false)}
                autoFocus
                className="text-4xl font-bold text-white bg-transparent border-b border-white/30 w-24 text-center focus:outline-none"
              />
            ) : (
              <button
                className="text-4xl font-bold text-white cursor-pointer bg-transparent border-none p-0"
                onClick={() => setIsEditingAmount(true)}
                type="button"
              >
                ${editableAmount}
              </button>
            )}
            <button
              onClick={incrementAmount}
              className="bg-white/20 rounded-full p-2 text-white hover:bg-white/30 transition"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="text-white/80 text-sm mb-6">
            on the 26th of every month
          </div>
          <div className="flex w-full max-w-xs justify-between gap-2">
            <button
              className="flex flex-col items-center flex-1 bg-white/10 rounded-xl py-3 text-white hover:bg-white/20 transition"
              onClick={() => setIsEditingAmount(true)}
            >
              <DollarSign size={22} className="mb-1" />
              <span className="text-xs">Edit amount</span>
            </button>
            {/* <Link
              to="/settings/payments"
              className="flex flex-col items-center flex-1 bg-white/10 rounded-xl py-3 text-white hover:bg-white/20 transition"
            >
              <CreditCard size={22} className="mb-1" />
              <span className="text-xs">Edit payment</span>
            </Link> */}
          </div>
        </div>
      </div>
      {/* Tabs Navigation */}
      <div className="mx-4 mt-4">
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
      </div>

      {/* Content Area */}
      <div className="flex-1 mt-4 overflow-auto">
        {activeTab === "nonprofits" ? (
          <div className="px-8">
            {/* Selected Nonprofits - Combined existing + newly selected */}
            {(() => {
              const selectedCausesForDisplay = getSelectedCausesForDisplay();
              return selectedCausesForDisplay.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-gray-700 uppercase mb-4 tracking-wide">
                    Selected Nonprofits
                  </h2>
                  <div className="space-y-3">
                    {selectedCausesForDisplay.map((org) => {
                      const causeId = org.isNewlySelected ? (org as any).causeId : parseInt(org.id.replace('cause-', ''));
                      return (
                        <div
                          key={org.id}
                          className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm"
                        >
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden shadow">
                              {org.imageUrl ? (
                                <img
                                  src={org.imageUrl}
                                  alt={org.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center text-lg font-bold text-white bg-blue-500"
                                >
                                  {org.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-base">
                                {org.name}
                              </h3>
                              {org.description && (
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                  {org.description}
                                </p>
                              )}
                            </div>
                            <button
                              className="text-xs text-gray-600 hover:text-red-500 flex items-center px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                              onClick={() => handleDeselectCause(causeId, org.isNewlySelected, org.name)}
                            >
                              <Trash2 size={12} className="mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Search Section */}
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-700 uppercase mb-4 tracking-wide">
                Add Nonprofits
              </h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search nonprofits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearchResults(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {searchQuery && (
                <Button
                  onClick={handleSearch}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-4"
                >
                  Search
                </Button>
              )}
            </div>

            {/* Search Results */}
            {showSearchResults && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Search Results (Max 5)
                </h3>
                {causesLoading ? (
                  <p className="text-gray-500 text-center py-4">Loading...</p>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((cause: any) => {
                      const isSelected = selectedCauses.includes(cause.id);
                      return (
                        <div
                          key={cause.id}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleToggleCause(cause.id)}
                        >
                          <Avatar className="w-12 h-12 rounded-full object-cover mr-3">
                            <AvatarImage src={cause.logo} />
                            <AvatarFallback>
                              {cause.name?.charAt(0) || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{cause.name}</h3>
                            <p className="text-sm text-gray-600">{cause.mission || cause.description}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-600' : 'border-2 border-gray-300'}`}>
                            {isSelected && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No nonprofits found</p>
                )}
              </div>
            )}
          </div>
                        ) : (
          <div className="px-8">
            {/* Selected Collectives - Combined existing + newly selected */}
            {(() => {
              const selectedCollectivesForDisplay = getSelectedCollectivesForDisplay();
              return selectedCollectivesForDisplay.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-gray-700 uppercase mb-4 tracking-wide">
                    Selected Collectives
                  </h2>
                  <div className="space-y-3">
                    {selectedCollectivesForDisplay.map((org) => {
                      const collectiveId = org.isNewlySelected ? (org as any).collectiveId : parseInt(org.id.replace('collective-', ''));
                      return (
                        <div
                          key={org.id}
                          className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm"
                        >
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden shadow">
                              {org.imageUrl ? (
                                <img
                                  src={org.imageUrl}
                                  alt={org.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center text-lg font-bold text-white bg-purple-500"
                                >
                                  {org.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-base">
                                {org.name}
                              </h3>
                              {org.description && (
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                  {org.description}
                                </p>
                              )}
                            </div>
                            <button
                              className="text-xs text-gray-600 hover:text-red-500 flex items-center px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                              onClick={() => handleDeselectCollective(collectiveId, org.isNewlySelected, org.name)}
                            >
                              <Trash2 size={12} className="mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Available Collectives */}
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-700 uppercase mb-4 tracking-wide">
                Joined Collectives
              </h2>
              {joinedCollectivesLoading ? (
                <p className="text-gray-500 text-center py-4">Loading...</p>
              ) : availableCollectives.length > 0 ? (
                <div className="space-y-3">
                  {availableCollectives.map((collective: any) => {
                    const isSelected = selectedCollectives.includes(collective.id);
                    return (
                      <div
                        key={collective.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleToggleCollective(collective.id)}
                      >
                        <Avatar className="w-12 h-12 rounded-full object-cover mr-3">
                          <AvatarImage src={collective.cover_image} />
                          <AvatarFallback>
                            {collective.name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{collective.name}</h3>
                          <p className="text-sm text-gray-600">{collective.description || 'Community collective'}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-600' : 'border-2 border-gray-300'}`}>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No collectives available</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Distribution Details */}
      <div className="px-8 py-4">
        <p className="text-sm text-gray-500 text-center">
          Your ${editableAmount} becomes ${(editableAmount * 0.9).toFixed(2)}{" "}
          after fees, split evenly across causes. Your donation will be evenly
          distributed across all {visibleCauses.length} organizations.
        </p>
      </div>

      {/* Update Donation Button */}
      <div className="px-8 pb-6">
        <Button
          onClick={handleUpdateDonation}
          disabled={updateDonationBoxMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg font-semibold"
        >
          {updateDonationBoxMutation.isPending
            ? 'Updating...'
            : 'Update Donation'}
        </Button>
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
      <div className="px-8 py-4">
        <h3 className="text-base font-semibold text-gray-700 uppercase mb-4 tracking-wide">
          NEXT PAYMENT
        </h3>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">
                Next payment date
              </div>
              <div className="text-xs text-gray-500">December 26, 2024</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                ${editableAmount}
              </div>
              <div className="text-xs text-gray-500">Monthly</div>
            </div>
          </div>
        </div>
      </div>

      <div className=" text-gray-400 mb-5  pt-5 text-center">
        Allocations will automatically adjust for 100% distribution
      </div>

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

      {/* <div className="h-24 md:hidden"></div> */}
    </div>
  );
};

export default ManageDonationBox;
