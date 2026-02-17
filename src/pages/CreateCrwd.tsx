"use client";

import { useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Link } from "react-router-dom";
import Confetti from "react-confetti";
import { SharePost } from "@/components/ui/SharePost";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCollective, getCausesBySearch } from "@/services/api/crwd";
import { getFavoriteCauses } from "@/services/api/social";
import { useAuthStore } from "@/stores/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";


import { DiscardSheet } from "@/components/ui/DiscardSheet";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

export default function CreateCRWDPage() {
  // Load saved form data from localStorage on mount
  const [step, setStep] = useState(1);
  const [name, setName] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('createCrwd_name');
      return saved || "";
    }
    return "";
  });
  const [desc, setDesc] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('createCrwd_desc');
      return saved || "";
    }
    return "";
  });
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [selectedCausesData, setSelectedCausesData] = useState<any[]>([]); // Store full cause data
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [createdCollective, setCreatedCollective] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Navigation guard state
  const [showDiscardSheet, setShowDiscardSheet] = useState(false);
  const [isConfirmedLeave, setIsConfirmedLeave] = useState(false);

  // Check for unsaved changes
  const hasUnsavedChanges = React.useMemo(() => {
    return (
      (name.trim() !== "" || desc.trim() !== "" || selectedCauses.length > 0) &&
      step === 1 &&
      !createdCollective
    );
  }, [name, desc, selectedCauses, step, createdCollective]);

  // Use navigation guard hook
  useUnsavedChanges(hasUnsavedChanges, setShowDiscardSheet, isConfirmedLeave);

  const handleDiscard = () => {
    setIsConfirmedLeave(true);
    setShowDiscardSheet(false);
    // Allow navigation to proceed
    // Since we pushed state, one back pops the dummy state
    // Another back leaves the page
    // navigate(-2); // This depends on history. simpler is to just navigate where they wanted, but we don't know where.
    navigate(-1); // This usually goes back to previous page
  };

  const handleCancelLeave = () => {
    setShowDiscardSheet(false);
    // No need to push state here, we are already at the dummy state (if triggered by back)
  };

  // Save form data to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (name) {
        localStorage.setItem('createCrwd_name', name);
      } else {
        localStorage.removeItem('createCrwd_name');
      }
    }
  }, [name]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (desc) {
        localStorage.setItem('createCrwd_desc', desc);
      } else {
        localStorage.removeItem('createCrwd_desc');
      }
    }
  }, [desc]);



  // Get causes with search and category filtering
  const { data: causesData, isLoading: isCausesLoading } = useQuery({
    queryKey: ['causes', searchTrigger],
    queryFn: () => {
      return getCausesBySearch(searchQuery, '', 1);
    },
    enabled: true,
  });

  // Create collective mutation
  const createCollectiveMutation = useMutation({
    mutationFn: createCollective,
    onSuccess: (response) => {
      console.log('Create collective successful:', response);
      // Clear saved form data on successful creation
      if (typeof window !== 'undefined') {
        localStorage.removeItem('createCrwd_name');
        localStorage.removeItem('createCrwd_desc');
      }
      setCreatedCollective(response);
      setStep(2);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
    },
    onError: (error: any) => {
      console.error('Create collective error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create collective';
      setToast(errorMessage);
      setTimeout(() => setToast(null), 4000);
    },
  });

  // get favorite causes
  const { data: favoriteCauses, isLoading: isLoadingFavoriteCauses } = useQuery({
    queryKey: ['favoriteCauses'],
    queryFn: () => getFavoriteCauses(),
    enabled: true,
  });

  // Refresh favorite causes when navigating back to this page
  React.useEffect(() => {
    // Refresh favorite causes query when component mounts or location changes
    // This ensures newly added favorites from NonProfitInterests are shown
    queryClient.invalidateQueries({ queryKey: ['favoriteCauses'] });
  }, [location.pathname, queryClient]);

  const handleCauseToggle = (cause: any, isFavorite: boolean = false) => {
    const causeId = isFavorite ? cause.cause?.id : cause.id;
    const causeData = isFavorite
      ? { ...cause.cause, id: cause.cause.id, image: cause.image, logo: cause.image }
      : { ...cause, id: cause.id, image: cause.image || cause.logo, logo: cause.logo || cause.image };

    setSelectedCauses((prev) => {
      const isSelected = prev.includes(causeId);
      const newSelection = isSelected
        ? prev.filter((id) => id !== causeId)
        : [...prev, causeId];

      // Update cause data array
      setSelectedCausesData((prevData) => {
        if (isSelected) {
          return prevData.filter((c) => c.id !== causeId);
        } else {
          // Check if cause already exists to avoid duplicates
          const exists = prevData.some((c) => c.id === causeId);
          if (!exists) {
            return [...prevData, causeData];
          }
          return prevData;
        }
      });

      return newSelection;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Don't trigger API call on every keystroke
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Trigger API call with search query - keep selected causes
      setSearchTrigger(prev => prev + 1);
    }
  };

  const handleRemoveSelectedCause = (causeId: string) => {
    setSelectedCauses((prev) => prev.filter((id) => id !== causeId));
    setSelectedCausesData((prevData) => prevData.filter((c) => c.id !== causeId));
  };

  const handleCreateCRWD = () => {
    // Check fields from top to bottom
    if (name.trim() === "") {
      setToast("Please enter a name for your CRWD");
      setTimeout(() => setToast(null), 4000);
      return;
    }
    if (desc.trim() === "") {
      setToast("Please enter a description for your CRWD");
      setTimeout(() => setToast(null), 4000);
      return;
    }
    if (selectedCauses.length === 0) {
      setToast("Please select at least one cause");
      setTimeout(() => setToast(null), 4000);
      return;
    }

    // Create collective via API
    createCollectiveMutation.mutate({
      name: name.trim(),
      description: desc.trim(),
      cause_ids: selectedCauses, // Assuming the API expects cause names or IDs
    });
  };

  if (!currentUser?.id) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-md mx-auto p-8">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Sign in to create a CRWD
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Sign in to create a CRWD, manage your causes, and connect with your community.
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Link to="/onboarding" className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Continue
            </Link>
          </Button>

          {/* Additional Info */}
          <p className="text-sm text-gray-500 mt-6">
            Don't have an account?
            <Link to="/claim-profile" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col items-center">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-500 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between min-w-[300px]">
              <span className="text-sm font-medium">{toast}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-3 text-white hover:text-gray-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <ProfileNavbar title="Create a CRWD Collective" />

        <div className="px-4 pt-2 pb-12 lg:max-w-[600px] gap-6 w-full">
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="You"
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="font-semibold text-sm">Create a CRWD</span>
                </div>
              </div>

              {/* CRWD Name */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-sm text-gray-700">
                    Name your CRWD
                  </label>
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      Keep it short & memorable (&lt;40 characters)
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <input
                  className="bg-gray-50 w-full rounded-lg h-12 text-sm border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Atlanta Food Friends"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-sm text-gray-700">
                    What brings this group together?
                  </label>

                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      A quick one-liner works best (&lt;160 characters)
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <textarea
                  className="bg-gray-50 w-full h-20 rounded-lg p-3 text-sm border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder='e.g., "We support shelters & meals programs in ATL."'
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>

              {/* Causes Selection */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm text-gray-700">
                  Choose one or more causes for your CRWD
                </label>

                {/* Selected Causes Section */}
                {selectedCausesData.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-blue-700">
                        Selected Causes ({selectedCausesData.length})
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCausesData.map((cause) => (
                        <div
                          key={cause.id}
                          className="flex items-center gap-2 bg-white border border-blue-300 rounded-lg px-3 py-2"
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={cause.image || cause.logo} alt={cause.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-semibold">
                              {cause.name?.charAt(0)?.toUpperCase() || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-gray-900">{cause.name}</span>
                          <button
                            onClick={() => handleRemoveSelectedCause(cause.id)}
                            className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="font-semibold text-xs text-blue-600 mb-3 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Select from your causes (if any)</p>
                    <Link to="/non-profit-interests" className="text-xs text-blue-600 flex items-center hover:underline">
                      <Plus className="w-4 h-4" />
                    </Link>
                  </div>

                  {
                    isLoadingFavoriteCauses ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    ) : favoriteCauses.results.length === 0 ? (
                      <div className="text-center mb-5">
                        <p className="text-sm text-gray-500">No causes found</p>
                      </div>
                    ) : (
                      favoriteCauses?.results?.map((cause: any) => (
                        <div
                          key={cause.cause.id}
                          className={`flex items-center gap-3 py-3 px-2 mb-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${selectedCauses.includes(cause.cause.id)
                            ? "border-2 border-blue-500 bg-blue-50"
                            : "border-2 border-transparent"
                            }`}
                          onClick={() => handleCauseToggle(cause, true)}
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={cause.image} alt={cause.cause.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                              {cause.cause.name?.charAt(0)?.toUpperCase() || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-gray-900">
                              {cause.cause.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {cause.cause.mission}
                            </div>
                          </div>
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={selectedCauses.includes(cause.cause.id)}
                              onChange={() => handleCauseToggle(cause, true)}
                              className="sr-only"
                              id={`cause-${cause.cause.id}`}
                            />
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedCauses.includes(cause.cause.id)
                                ? "bg-blue-600 border-blue-600"
                                : "border-gray-300 bg-white"
                                }`}
                            >
                              {selectedCauses.includes(cause.cause.id) && (
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
                          </div>
                        </div>
                      )))}
                  <div className="font-semibold text-xs text-blue-600 mt-4 mb-3">
                    Suggested Causes
                  </div>
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search causes or nonprofits (press Enter to search)"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleSearchSubmit}
                      className="w-full h-10 pl-10 pr-4 bg-gray-100 border-0 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
                    />
                  </div>
                  {isCausesLoading ? (
                    <div className="flex items-center justify-center mt-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : causesData?.results?.length === 0 ? (
                    <div className="flex justify-center mt-4">
                      <p className="text-sm text-gray-500">No causes found</p>
                    </div>
                  ) : (() => {
                    // Get favorite cause IDs to exclude from search results
                    const favoriteCauseIds = new Set(
                      (favoriteCauses?.results || [])
                        .map((fav: any) => {
                          const id = fav.cause?.id;
                          // Convert to string for consistent comparison
                          return id ? String(id) : null;
                        })
                        .filter((id: any) => id !== null)
                    );

                    // Filter out favorite causes from search results
                    const filteredCauses = (causesData?.results || []).filter((cause: any) => {
                      const causeId = cause?.id ? String(cause.id) : null;
                      // Exclude if this cause is in favorites
                      return causeId && !favoriteCauseIds.has(causeId);
                    });

                    return filteredCauses.length === 0 ? (
                      <div className="flex justify-center mt-4">
                        <p className="text-sm text-gray-500">No causes found</p>
                      </div>
                    ) : (
                      filteredCauses.slice(0, 10).map((cause: any) => (
                        <div
                          key={cause.name}
                          className={`flex items-center gap-3 py-3 px-2 my-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${selectedCauses.includes(cause.id)
                            ? "border-2 border-blue-500 bg-blue-50"
                            : "border-2 border-transparent"
                            }`}
                          onClick={() => handleCauseToggle(cause, false)}
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={cause.image || cause.logo} alt={cause.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                              {cause.name?.charAt(0)?.toUpperCase() || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-gray-900">
                              {cause.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {cause.mission || cause.description || `Building ${cause.name.toLowerCase()} communities`}
                            </div>
                          </div>
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={selectedCauses.includes(cause.id)}
                              onChange={() => handleCauseToggle(cause, false)}
                              className="sr-only"
                              id={`cause-${cause.id}`}
                            />
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedCauses.includes(cause.id)
                                ? "bg-blue-600 border-blue-600"
                                : "border-gray-300 bg-white"
                                }`}
                            >
                              {selectedCauses.includes(cause.id) && (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    );
                  })()}
                  {/* <div className="flex justify-end mt-3">
                    <Link
                      to="/search"
                      className="text-xs text-blue-600 flex items-center hover:underline"
                    >
                      Discover more <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div> */}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-6 text-xs text-gray-500 pt-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  onClick={handleCreateCRWD}
                  disabled={createCollectiveMutation.isPending}
                >
                  {createCollectiveMutation.isPending ? "Creating..." : "Create CRWD"}
                </Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-4 items-center justify-center h-[65vh]  md:h-[75vh]">
              <div className="w-1/2 gap-4">
                <img
                  src="/icons/CRWD.png"
                  alt="You"
                  className="w-1/3 h-1/3 object-contain mx-auto"
                />
                <h2 className="text-xl font-bold text-center mb-6">
                  You've started a CRWD!
                </h2>
                {createdCollective && (
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>{createdCollective.name}</strong> has been created successfully!
                    </p>
                    <p className="text-xs text-gray-500">
                      {createdCollective.description}
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={() => setShowShareModal(true)}
                  >
                    Invite Friends
                  </Button>
                  <Button
                    onClick={() => navigate(`/groupcrwd/${createdCollective.id}`)}
                    variant="outline"
                    className="w-full"
                  >
                    View Collective
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Confetti Animation */}
          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={true}
              numberOfPieces={300}
              gravity={0.2}
              wind={0.05}
              opacity={0.8}
            />
          )}

          {/* Share Modal */}
          <SharePost
            url={window.location.origin + `/groupcrwd/${createdCollective?.id}`}
            title={`Join my new CRWD: ${name}`}
            description={desc}
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
          />
        </div>
      </div>
      <DiscardSheet
        isOpen={showDiscardSheet}
        onClose={handleCancelLeave}
        onDiscard={handleDiscard}
      />
    </>
  );
}
