import { HelpCircle, Settings, X, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ManageDonationBox from "./ManageDonationBox";
import { DonationBoxSummaryCard } from "./DonationBoxSummaryCard";
import { CROWDS, RECENTS, SUGGESTED } from "@/constants";
import ReactConfetti from "react-confetti";
import { getCollectiveById } from "@/services/api/crwd";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/store";
import { getDonationHistory } from "@/services/api/donation";
import { getNonprofitColor } from "@/lib/getNonprofitColor";

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
  onBack = () => {},
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
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Update showManageDonationBox when initialShowManage changes
  useEffect(() => {
    setShowManageDonationBox(initialShowManage);
  }, [initialShowManage]);

  // Get manual causes and attributing collectives from donation box API
  const manualCauses = donationBox?.manual_causes || [];
  const attributingCollectives = donationBox?.attributing_collectives || [];
  const actualDonationAmount = parseFloat(donationBox?.monthly_amount || donationAmount.toString());
  
  // Use API data if available, otherwise fall back to selectedOrganizations
  const hasApiData = manualCauses.length > 0 || attributingCollectives.length > 0;
  const totalCauses = manualCauses.length;
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

  // Get capacity from donation box - count all causes (manual + from collectives)
  // Count unique causes from box_causes array
  const boxCauses = donationBox?.box_causes || [];
  const uniqueCauseIds = new Set(boxCauses.map((bc: any) => bc.cause?.id).filter(Boolean));
  const currentCapacity = uniqueCauseIds.size || 0;
  const maxCapacity = donationBox?.capacity || 30;

  // Show confetti and refetch donation box when coming from payment result (only once)
  useEffect(() => {
    if (fromPaymentResult) {
      // Show confetti
      setShowSuccessModal(true);
      
      // Refetch donation box data
      queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
      queryClient.refetchQueries({ queryKey: ['donationBox', currentUser?.id] });
      
      // Immediately clear fromPaymentResult from location state to prevent showing again when switching tabs
      const newState = { ...location.state };
      delete newState.fromPaymentResult;
      navigate(location.pathname + (location.search || ''), { 
        replace: true, 
        state: newState
      });
    }
  }, [fromPaymentResult, queryClient, currentUser?.id, navigate, location]);

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

  // Calculate equal distribution percentage and amount per item
  const totalItems = hasApiData 
    ? (totalCauses + totalCollectives)
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
    const causesAsObjects = hasApiData 
      ? [
          ...manualCauses.map((cause: any) => ({
            id: `cause-${cause.id}`,
            name: cause.name,
            imageUrl: cause.logo || "",
            color: "#4F46E5",
            description: cause.mission || cause.description || "",
            type: 'cause' as const,
          })),
          ...attributingCollectives.map((collective: any) => ({
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
    <div className="flex flex-col h-full bg-white min-h-screen p-0">
      {/* Header */}
      {/* <div className="bg-white border-b border-gray-200 p-4 h-16 flex items-center">
        <button
          onClick={() => onBack()}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mr-2 cursor-pointer"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          Donation Box
        </h1>
        <div className="w-10"></div>
      </div> */}

      {/* Donation Box Summary Card */}
      <div className="mx-4 mt-4 mb-6">
        <DonationBoxSummaryCard
          monthlyAmount={Math.round(actualDonationAmount)}
          lifetimeAmount={Math.round(lifetimeAmount)}
          causesCount={totalCauses}
          collectivesCount={totalCollectives}
          currentCapacity={currentCapacity}
          maxCapacity={maxCapacity}
          onEditAmount={() => {
            setShowManageDonationBox(true);
            if (onShowManage) {
              onShowManage();
            }
          }}
          onEditPayment={() => {
            // Navigate to payment settings or open payment modal
            navigate("/settings/payments");
          }}
          onAddCauses={() => {
            setShowManageDonationBox(true);
            if (onShowManage) {
              onShowManage();
            }
          }}
        />
      </div>

      {/* Search Bar */}
      {/* <div className="px-4 mb-4">
        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search causes or CRWDs..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
          />
        </div>
      </div> */}

      {/* percentage distribution */}
      <p className="text-gray-500 text-sm mx-8  mb-6">Donation amount is equally distributed across all the nonprofits</p>

      {/* CAUSES Section */}
      <div className="flex-1 overflow-auto">
        {/* Manual Causes from API */}
        {manualCauses.length > 0 && (
          <>
            <div className="flex items-center mb-4 px-8">
              <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide">
                NONPROFITS
              </h2>
              {/* <HelpCircle size={16} className="ml-2 text-gray-500" /> */}
            </div>
            <div className="space-y-3 px-8">
              {manualCauses.map((cause: any, index: number) => {
                const colors = getNonprofitColor(cause.id || cause.name);
                return (
                  <div
                    key={`cause-${cause.id}-${index}`}
                    className="flex gap-4 items-center bg-white rounded-xl px-4 py-4 shadow-sm border border-gray-200"
                  >
                    <div 
                      className="w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: colors.bgColor }}
                    >
                      <span 
                        className="text-xl font-bold"
                        style={{ color: colors.textColor }}
                      >
                        {cause.name?.charAt(0)?.toUpperCase() || 'C'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base mb-1">
                        {cause.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {cause.mission || cause.description || 'Making a positive impact in the community'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-base">
                          {distributionPercentage}%
                        </div>
                        <div className="text-sm text-gray-500">
                          ${amountPerItem.toFixed(2)}/mo
                        </div>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                        aria-label="Remove cause"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Collectives Section */}
        {attributingCollectives.length > 0 && (
          <>
            <div className="flex items-center mb-4 px-8 mt-6">
              <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide">
                COLLECTIVES
              </h2>
              {/* <HelpCircle size={16} className="ml-2 text-gray-500" /> */}
            </div>
            <div className="space-y-3 px-8">
              {attributingCollectives.map((collective: any, index: number) => {
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
                  <div key={`collective-${collective.id}-${index}`}>
                    <div
                      className="flex gap-4 items-center bg-white rounded-xl px-4 py-4 shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleToggleCollectiveDropdown(collective.id)}
                    >
                      <div 
                        className="w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: collectiveColor.bg }}
                      >
                        <span 
                          className="text-xl font-bold"
                          style={{ color: collectiveColor.text }}
                        >
                          {collective.name?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base mb-1">
                          {collective.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {collective.description || 'Community collective'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-gray-900 text-base">
                            {distributionPercentage}%
                          </div>
                          <div className="text-sm text-gray-500">
                            ${amountPerItem.toFixed(2)}/mo
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          ) : (
                            isExpanded ? (
                              <ChevronUp size={20} className="text-gray-500" />
                            ) : (
                              <ChevronDown size={20} className="text-gray-500" />
                            )
                          )}
                          <button
                            className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                            aria-label="Remove collective"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle remove collective
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {isExpanded && details && details.causes && details.causes.length > 0 && (
                      <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
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
              })}
            </div>
          </>
        )}

        {/* Fallback to selectedOrganizations if no API data */}
        {!hasApiData && selectedOrganizations.length > 0 && (
          <>
            <div className="flex items-center mb-4 px-8">
              <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide">
                CAUSES
              </h2>
              <HelpCircle size={16} className="ml-2 text-gray-500" />
            </div>
            <div className="space-y-2">
              {selectedOrganizations.map((orgName: string, index: number) => (
                <div
                  key={`${orgName}-${index}`}
                  className="flex gap-4 items-center bg-white px-8 py-4 border-b border-gray-200"
                >
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden shadow">
                    <div
                      className="w-full h-full flex items-center justify-center text-lg font-bold text-white"
                      style={{ backgroundColor: getOrganizationColor(orgName) }}
                    >
                      {orgName.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">
                          {orgName}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {getOrganizationDescription(orgName)}
                        </p>
                      </div>
                      <div className="text-blue-600 font-semibold text-sm">
                        {distributionPercentage}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Give Together Section */}
        <div className="mx-8 mt-6 mb-6">
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
        </div>

        {/* Add More Causes Section */}
        {/* <div className="mx-8 mb-6">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-500 mb-2">
              Add up to 45 more causes to thi s box
            </p>
            <p className="text-xs text-gray-400 mb-2">
              Allocations will automatically adjust for 100% distribution
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Donations are not tax deductible at this time{" "}
              <Link to="/tax-info" className="text-blue-500 underline">
                Learn More
              </Link>
            </p>
            <div className="flex gap-2">
              <Link
                className="flex-1 text-center rounded-md border border-blue-200 px-4 py-2 text-blue-600 bg-white hover:bg-blue-50"
                to="/search"
              >
                + Add More Causes
              </Link>
              {showAddMoreCauses && (
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSave}
                >
                  Save
                </Button>
              )}
            </div>
          </div>
        </div> */}
        {/* <div className="h-24 md:hidden"></div> */}
      </div>

      {/* Payment Section */}
      {/* <PaymentSection amount={donationAmount} /> */}

      {/* <div className="h-30 md:hidden" /> */}

      {/* Success Modal with Confetti */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseSuccessModal}
        >
          <ReactConfetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            numberOfPieces={200}
          />
          <div
            className="bg-white rounded-lg max-w-md w-full mx-4 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseSuccessModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Modal Content */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Checkout!
              </h2>

              <p className="text-gray-600 mb-4">
                Here's your donation summary:
              </p>

              {/* Donation Summary Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">💝</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      Monthly Donation Box
                    </h3>
                      <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600">
                        ${actualDonationAmount}/month
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
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
    </div>
  );
};
