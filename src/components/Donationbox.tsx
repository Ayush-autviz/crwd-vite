import { useState, useEffect, useLayoutEffect } from "react";
import { Loader2, Minus, Plus, Search, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
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

interface DonationBoxProps {
  tab?: string;
  preselectedItem?: {
    id: string;
    type: 'cause' | 'collective';
    data: any;
  };
  activeTab?: string;
  fromPaymentResult?: boolean;
}

const DonationBox = ({ tab = "setup", preselectedItem, activeTab, fromPaymentResult }: DonationBoxProps) => {
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
        if(donationBox.is_active) {
          setCheckout(true);
        }
        setStep(2); // Show step 2 if donation box exists
      } else {
        setStep(1); // Show step 1 if no donation box
      }
    }
  }, [donationBox, activeTabState]);

  // Show checkout screen when coming from payment result
  useEffect(() => {
    if (fromPaymentResult && donationBox && donationBox.id) {
      setCheckout(true);
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
      setStep(2);
    },
    onError: (error: any) => {
      console.error('Error creating donation box:', error);
    },
  });

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

  const incrementDonation = () => {
    const newAmount = donationAmount + 1;
    setDonationAmount(newAmount);
    setInputValue(newAmount.toString());
  };

  const decrementDonation = () => {
    if (donationAmount > 5) {
      const newAmount = donationAmount - 1;
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

  // Show loading only when setup tab is active and loading donation box
  if (activeTabState === "setup" && isLoadingDonationBox) {
    return <div className="w-full h-full bg-white flex flex-col">
      <ProfileNavbar title="Donation Box" />
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    </div>
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header with title and back/close button - Always Visible */}
      <DonationHeader
        title="Donation Box"
        step={step}
        showBackButton={false}
        showCloseButton={!checkout && step === 1}
        onBack={() => {
          if (checkout) {
            setCheckout(false);
          } else {
            setStep((s) => s - 1);
          }
        }}
      />

      {/* Tab Navigation - Always Visible */}
      <div className="mx-4 mt-4">
        <div className="flex rounded-xl overflow-hidden border bg-white shadow-sm">
          <button
            className={cn(
              "flex-1 py-4 text-sm font-medium transition-all relative",
              activeTabState === "setup"
                ? "text-white bg-blue-600"
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
              {donationBox?.id ? 'Donation Box' : 'Set up donation box'}
            </div>
            {activeTabState === "setup" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
            )}
          </button>
          <button
            className={cn(
              "flex-1 py-4 text-sm font-medium transition-all relative",
              activeTabState === "onetime"
                ? "text-white bg-blue-600"
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
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>
      </div>

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
              />
            </>
          ) : (
            <>
              {step === 1 ? (
                <div className="flex-1 mt-4 flex flex-col p-4 mb-24">
                  {/* Set Monthly Donation Amount Section */}
                  <div className="bg-blue-50 rounded-xl mb-6 p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                      Set monthly donation amount
                    </h2>
                    <p className="text-gray-600 text-sm mb-6">
                      Set one monthly amount and we'll split it across causes
                      you're passionate about. You can edit at any time.
                    </p>

                    {/* Amount Selector */}
                    <div className="flex items-center justify-center mb-6">
                      <button
                        onClick={decrementDonation}
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 hover:bg-gray-200 transition-colors"
                      >
                        <Minus size={20} className="text-gray-600" />
                      </button>
                      <div className="mx-6 text-center">
                        <span className="text-blue-600 text-3xl font-bold">
                          ${donationAmount}
                        </span>
                        <span className="text-gray-500 text-lg ml-2">
                          per month
                        </span>
                      </div>
                      <button
                        onClick={incrementDonation}
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 hover:bg-gray-200 transition-colors"
                      >
                        <Plus size={20} className="text-gray-600" />
                      </button>
                    </div>

                    {/* Slider for fine-tuning */}
                    {/* <div className="relative mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">$5</span>
                        <span className="text-sm font-medium text-gray-600">$100</span>
                      </div>
                      <Range
                        step={1}
                        min={5}
                        max={100}
                        values={[donationAmount]}
                        onChange={(values) => {
                          const newAmount = values[0];
                          setDonationAmount(newAmount);
                          setInputValue(newAmount.toString());
                        }}
                        renderTrack={({ props, children }) => (
                          <div
                            {...props}
                            className="h-2 w-full bg-gray-200 rounded-full"
                            style={{
                              ...props.style,
                            }}
                          >
                            <div
                              className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-out"
                              style={{
                                width: `${Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    ((donationAmount - 5) / 95) * 100
                                  )
                                )}%`,
                              }}
                            />
                            {children}
                          </div>
                        )}
                        renderThumb={({ props }) => (
                          <div
                            {...props}
                            className="w-5 h-5 bg-blue-600 rounded-full shadow-md"
                            style={{
                              ...props.style,
                              cursor: "pointer",
                            }}
                          />
                        )}
                      />
                    </div> */}
                  </div>

                  {/* Selected Items Display */}
                  {(selectedCauseIds.length > 0 || selectedCollectiveIds.length > 0) && (
                    <div className="bg-white rounded-xl mb-6 p-6 shadow-sm border border-gray-100">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">Your selection</h2>
                      
                      {selectedCauseIds.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Nonprofits</h3>
                          <div className="space-y-3">
                            {selectedCausesData.map((cause: any) => (
                              <div key={cause.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                  <Avatar className="w-12 h-12 rounded-full object-cover">
                                    <AvatarImage src={cause.logo || '/default-logo.png'} />
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                      {cause.name?.charAt(0).toUpperCase() || 'N'}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-800">{cause.name}</h3>
                                  {cause.description && (
                                    <p className="text-sm text-gray-600 line-clamp-1">{cause.description}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedCauseIds(selectedCauseIds.filter(id => id !== cause.id));
                                    setSelectedCausesData(selectedCausesData.filter(c => c.id !== cause.id));
                                  }}
                                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedCollectiveIds.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Collectives</h3>
                          <div className="space-y-3">
                            {selectedCollectivesData.map((collective: any) => (
                              <div key={collective.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                  <Avatar className="w-12 h-12 rounded-full object-cover">
                                    <AvatarImage src={collective.cover_image || collective.image || '/default-collective.png'} />
                                    <AvatarFallback className="bg-green-100 text-green-600">
                                      {collective.name?.charAt(0).toUpperCase() || 'C'}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-800">{collective.name}</h3>
                                  {collective.description && (
                                    <p className="text-sm text-gray-600 line-clamp-1">{collective.description}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedCollectiveIds(selectedCollectiveIds.filter(id => id !== collective.id));
                                    setSelectedCollectivesData(selectedCollectivesData.filter(c => c.id !== collective.id));
                                  }}
                                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Choose Nonprofit to Support Section */}
                  <div className="bg-white rounded-xl mb-6 p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Choose nonprofit to support
                    </h2>
                    
                    {/* Search Bar */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search nonprofits..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Nonprofits List - Max 5 */}
                    <div className="space-y-3">
                      {causesLoading ? (
                        <p className="text-gray-500 text-center">Loading...</p>
                      ) : causesData?.results?.length > 0 ? (
                        causesData.results.slice(0, 5).map((cause: any) => {
                          const isSelected = selectedCauseIds.includes(cause.id);
                          return (
                            <div
                              key={cause.id}
                              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedCauseIds(selectedCauseIds.filter(id => id !== cause.id));
                                  setSelectedCausesData(selectedCausesData.filter(c => c.id !== cause.id));
                                } else {
                                  setSelectedCauseIds([...selectedCauseIds, cause.id]);
                                  setSelectedCausesData([...selectedCausesData, cause]);
                                }
                              }}
                            >
                              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                {/* <img src={cause.logo || '/default-logo.png'} alt={cause.name} className="w-12 h-12 rounded-full object-cover" /> */}
                                <Avatar className="w-12 h-12 rounded-full object-cover">
                                  <AvatarImage src={cause.logo || '/default-logo.png'} />
                                  <AvatarFallback className="bg-blue-100 text-blue-600">
                                    {cause.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{cause.name}</h3>
                                <p className="text-sm text-gray-600">{cause.description}</p>
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
                        })
                      ) : (
                        <p className="text-gray-500 text-center">No nonprofits found</p>
                      )}
                    </div>
                  </div>

                  {/* Choose Collective to Support Section */}
                  <div className="bg-white rounded-xl mb-6 p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Choose collective to support
                    </h2>
                    
                    {/* Joined Collectives List */}
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
                  </div>

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
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 fixed bottom-0 w-calc(100%-16px) left-0 right-0 mx-4">
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
                  </div>

                  {/* <div className="h-24 md:hidden"></div> */}
                </div>
              ) : step === 2 ? (
                //@ts-ignore
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
              ) : (
                <div className="flex-1 mx-4 mt-4 mb-4 flex flex-col">
                  {/* Info Card */}
                  <div className="bg-[#f5f6ff] rounded-xl  mb-4 ">
                    <h2 className="text-xl font-medium text-gray-700  py-1 my-2">
                      Welcome to your donation box
                    </h2>
                    <p className="text-gray-600 text-sm py-3 ">
                      Your donation box makes giving back easy! Just set your
                      price and you can add as many of your favorite causes at
                      any time. Your donation will be evenly distributed across
                      all of the organizations in your box. Let's get started!
                    </p>
                    <div className=" bg-[#e6e7f4] rounded-lg mt-6  flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium mb-1">
                          Enter monthly donation
                        </p>
                        <p className="text-xs text-gray-500 ">
                          Input amount over $5
                        </p>
                      </div>
                      <div className="bg-[#dbddf6] flex items-center rounded-full border">
                        <button
                          onClick={decrementDonation}
                          className="flex items-center justify-center w-10 h-10  rounded-full"
                        >
                          <Minus size={16} />
                        </button>
                        <div className="flex-1 flex justify-center items-center h-10 px-4">
                          <span className="text-blue-500 text-2xl font-bold relative">
                            $
                            <input
                              type="text"
                              value={inputValue}
                              onChange={handleInputChange}
                              onBlur={handleInputBlur}
                              className="bg-transparent w-16 text-center focus:outline-none"
                              aria-label="Donation amount"
                            />
                          </span>
                        </div>
                        <button
                          onClick={incrementDonation}
                          className="flex items-center justify-center w-10 h-10  rounded-r-full"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Security Message */}
                    <div className="flex items-center mt-4 p-2">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-300 mr-2">
                        <span className="text-xs">✓</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Your donation is protected and guaranteed.{" "}
                        <Link to="/settings/about" className="text-blue-500">
                          Learn More
                        </Link>
                      </p>
                    </div>
                  </div>
                  <div
                    className={`p-4 flex justify-between items-center ${
                      isMobile ? "mb-20" : ""
                    }`}
                  >
                    <p className={`text-gray-500`}>Now let's add some causes</p>
                    <button
                      onClick={() => setStep(2)}
                      className={`bg-green-500 text-white px-6 py-2 rounded-full font-medium `}
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
    </div>
  );
};

export default DonationBox;
