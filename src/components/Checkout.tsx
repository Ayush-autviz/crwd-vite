import { HelpCircle, Settings, X, ChevronDown, ChevronUp, Trash2, Pencil } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ManageDonationBox from "./ManageDonationBox";
import { CROWDS, RECENTS, SUGGESTED } from "@/constants";
import ReactConfetti from "react-confetti";
import { getCollectiveById } from "@/services/api/crwd";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/store";
import { getDonationHistory } from "@/services/api/donation";

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
  const currentCapacity = uniqueCauseIds.size || totalCauses;
  const maxCapacity = donationBox?.capacity || 30;

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
    <div className="w-full h-full bg-white flex flex-col pb-24">
      <div className="flex-1 overflow-auto mt-2 mx-4">
        {/* Content Container with max-width */}
        <div className="w-full">
          {/* Donation Box Summary Card */}
          <div className="bg-white rounded-xl mb-6 shadow-sm border border-gray-200 overflow-hidden">
            {/* Gradient Header */}
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

            <div className="p-6">
              {/* Monthly Donation Section */}
              <div className="mb-6">
                <h2 className="text-base font-medium text-gray-900 mb-3">Monthly Donation</h2>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">${Math.round(actualDonationAmount)}</span>
                    <span className="text-base text-gray-600">/   month</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowManageDonationBox(true);
                      if (onShowManage) {
                        onShowManage();
                      }
                    }}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    aria-label="Edit amount"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                {lifetimeAmount > 0 && (
                  <p className="text-sm text-gray-600">${lifetimeAmount.toLocaleString()} lifetime</p>
                )}
              </div>

              {/* Supported Entities */}
              <div className="bg-gray-100 rounded-lg px-4 py-3 mb-6 text-center">
                <p className="text-sm font-bold text-gray-900">
                  {totalCauses} Cause{totalCauses !== 1 ? 's' : ''} • {totalCollectives} Collective{totalCollectives !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Donation Box Capacity */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-blue-600">Donation Box Capacity</h3>
                  <span className="text-sm text-gray-900">{currentCapacity}/{maxCapacity} causes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (currentCapacity / maxCapacity) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-600">
                  You can support {maxCapacity - currentCapacity} more cause{(maxCapacity - currentCapacity) !== 1 ? 's' : ''} with this donation amount.
                </p>
              </div>

              {/* Payment Schedule */}
              {donationBox?.next_charge_date && (
                <p className="text-sm text-gray-600 text-center mb-4">
                  on the {getChargeDay(donationBox.next_charge_date)} of every month
                </p>
              )}
            </div>
          </div>

          {/* percentage distribution */}
          {/* <p className="text-gray-500 text-sm mb-6">Donation amount is equally distributed across all the nonprofits</p> */}

          {/* Currently Supporting Section */}
          {manualCauses.length > 0 && (
            <div className="mb-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Currently Supporting</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Supporting {manualCauses.length} nonprofit{manualCauses.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Manual Causes List */}
              <div className="space-y-3">
                {manualCauses.map((cause: any) => {
                  const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                  const initials = getInitials(cause.name || 'N');
                  return (
                    <div
                      key={cause.id}
                      className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0"
                        style={{ backgroundColor: avatarBgColor }}
                      >
                        <span className="text-white font-bold text-lg">
                          {initials}
                        </span>
                      </div>

                      {/* Cause Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1">{cause.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {cause.mission || cause.description || 'Making a positive impact in the community'}
                        </p>
                      </div>

                      {/* Donation Info */}
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{distributionPercentage}%</p>
                          <p className="text-sm text-gray-600">${amountPerItem.toFixed(2)}/mo</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collectives Section - Commented out like DonationBox3 */}
          {/* {attributingCollectives.length > 0 && (
            <div className="mb-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Collectives</h2>
              </div>
              <div className="space-y-3">
                {attributingCollectives.map((collective: any) => {
                  // ... collective rendering code
                })}
              </div>
            </div>
          )} */}

          {/* Fallback to selectedOrganizations if no API data */}
          {!hasApiData && selectedOrganizations.length > 0 && (
            <div className="mb-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Currently Supporting</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Supporting {selectedOrganizations.length} nonprofit{selectedOrganizations.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-3">
                {selectedOrganizations.map((orgName: string, index: number) => {
                  const avatarBgColor = getConsistentColor(orgName, avatarColors);
                  const initials = getInitials(orgName);
                  return (
                    <div
                      key={`${orgName}-${index}`}
                      className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0"
                        style={{ backgroundColor: avatarBgColor }}
                      >
                        <span className="text-white font-bold text-lg">
                          {initials}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1">{orgName}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {getOrganizationDescription(orgName)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{distributionPercentage}%</p>
                          <p className="text-sm text-gray-600">${amountPerItem.toFixed(2)}/mo</p>
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
        </div>
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
