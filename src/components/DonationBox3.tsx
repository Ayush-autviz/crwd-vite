"use client";
import { useState, useEffect } from "react";
import { CROWDS, RECENTS, SUGGESTED } from "@/constants";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { removeCauseFromBox, removeCollectiveFromBox, activateDonationBox, getDonationHistory, updateDonationBox, addCausesToBox } from "@/services/api/donation";
import { useAuthStore } from "@/stores/store";
import { getCollectiveById, getCausesBySearch } from "@/services/api/crwd";
import { ChevronDown, ChevronUp, Pencil, FileText, Plus, Minus, Trash2, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AmountBottomSheet from "@/components/donation/AmountBottomSheet";
import EditDonationSplitBottomSheet from "@/components/donation/EditDonationSplitBottomSheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface DonationSummaryProps {
  selectedOrganizations: string[];
  setSelectedOrganizations: React.Dispatch<React.SetStateAction<string[]>>;
  setCheckout: (value: boolean) => void;
  onRemoveOrganization?: (id: string) => void;
  onBookmarkOrganization?: (id: string) => void;
  donationAmount: number;
  donationBox?: any;
  onManageDonationBox?: () => void;
}

export const DonationBox3 = ({
  selectedOrganizations,
  setSelectedOrganizations,
  setCheckout,
  onRemoveOrganization,
  onBookmarkOrganization,
  donationAmount,
  donationBox,
  onManageDonationBox,
}: DonationSummaryProps) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();

  // State for confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleteModalAnimating, setIsDeleteModalAnimating] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: 'cause' | 'collective' } | null>(null);
  const [expandedCollectives, setExpandedCollectives] = useState<Set<number>>(new Set());
  const [collectiveDetails, setCollectiveDetails] = useState<Record<number, any>>({});
  const [loadingCollectives, setLoadingCollectives] = useState<Set<number>>(new Set());
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editableAmount, setEditableAmount] = useState(parseFloat(donationBox?.monthly_amount || donationAmount.toString()));
  const [showAmountSheet, setShowAmountSheet] = useState(false);
  const [showEditSplitSheet, setShowEditSplitSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Query for searching causes to add
  const { data: searchCausesData, isLoading: searchCausesLoading } = useQuery({
    queryKey: ['searchCauses', searchQuery],
    queryFn: () => getCausesBySearch(searchQuery || '', '', 1),
    enabled: true,
  });

  // Mutation for adding causes to donation box
  const addCausesMutation = useMutation({
    mutationFn: (causeId: number) => addCausesToBox({ causes: [{ cause_id: causeId }] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['donationBox'] });
      // toast.success('Cause added to your Donation Box!');
    },
    onError: (error: any) => {
      console.error('Add cause error:', error);
      toast.error('Failed to add cause. Please try again.');
    },
  });

  // Get box_causes from donation box (only causes, no collectives)
  const boxCauses = donationBox?.box_causes || [];
  // Extract cause objects from box_causes
  const causes = boxCauses.map((boxCause: any) => boxCause.cause).filter((cause: any) => cause != null);
  // Get attributing collectives from donation box
  const attributingCollectives = donationBox?.attributing_collectives || [];
  const actualDonationAmount = parseFloat(donationBox?.monthly_amount || donationAmount.toString());

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

  // Calculate distribution - check for custom percentages in box_causes
  const totalItems = causes.length;
  const getCausePercentage = (causeId: number) => {
    const boxCause = boxCauses.find((bc: any) => bc.cause?.id === causeId);
    const percentage = boxCause?.percentage;
    return percentage != null ? Number(percentage) : null; // Return custom percentage as number if exists
  };
  const hasCustomPercentages = boxCauses.some((bc: any) => bc.percentage != null);
  const distributionPercentage = totalItems > 0 ? (hasCustomPercentages ? null : 100 / totalItems) : 0;

  // Calculate amount per item - use custom percentage if available, otherwise equal split
  const getAmountPerItem = (causeId: number) => {
    const customPercentage = getCausePercentage(causeId);
    if (customPercentage != null) {
      return (actualDonationAmount * 0.9 * customPercentage) / 100;
    }
    return totalItems > 0 ? (actualDonationAmount * 0.9) / totalItems : 0;
  };
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");

  // Update editableAmount when donation box data changes
  useEffect(() => {
    if (donationBox?.monthly_amount) {
      setEditableAmount(Math.round(parseFloat(donationBox.monthly_amount)));
    }
  }, [donationBox?.monthly_amount]);

  // Handle delete modal animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showDeleteModal) {
      setIsDeleteModalVisible(true);
      setIsDeleteModalAnimating(false);
      timer = setTimeout(() => setIsDeleteModalAnimating(true), 20);
    } else if (isDeleteModalVisible) {
      setIsDeleteModalAnimating(false);
      timer = setTimeout(() => setIsDeleteModalVisible(false), 300);
    }
    return () => clearTimeout(timer);
  }, [showDeleteModal, isDeleteModalVisible]);

  // Fetch donation history for lifetime amount
  const { data: donationHistoryData } = useQuery({
    queryKey: ['donationHistory'],
    queryFn: getDonationHistory,
  });

  // Calculate lifetime amount from donation history
  const lifetimeAmount = donationHistoryData?.results?.reduce((sum: number, transaction: any) => {
    return sum + parseFloat(transaction.gross_amount || '0');
  }, 0) || 0;

  // Calculate capacity and counts
  const currentCapacity = causes.length;
  const maxCapacity = donationBox?.capacity || 30;
  const totalCausesCount = causes.length;
  const totalCollectivesCount = attributingCollectives.length;

  // Format next charge date
  const formatNextChargeDate = (dateString?: string) => {
    if (!dateString) return 'December 26, 2024'; // Fallback

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

  const incrementAmount = () => {
    setEditableAmount(prev => Math.round(prev) + 5);
  };

  const decrementAmount = () => {
    if (editableAmount > 5) {
      setEditableAmount(prev => Math.max(5, Math.round(prev) - 5));
    }
  };

  // Calculate fees and capacity
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

  // Mutation to update donation box
  const updateAmountMutation = useMutation({
    mutationFn: (amount: number) => updateDonationBox({ monthly_amount: amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationBox'] });
      setIsEditingAmount(false);
      toast.success('Monthly donation amount updated successfully!');
    },
    onError: (error: any) => {
      console.error('Update amount error:', error);
      toast.error('Failed to update donation amount. Please try again.');
    },
  });

  const updateSplitMutation = useMutation({
    mutationFn: (percentages: Record<number, number>) => {
      // Convert percentages to box_causes format with percentages
      // The API expects box_causes array with id and percentage
      const boxCausesWithPercentages = boxCauses.map((boxCause: any) => ({
        id: boxCause.id, // box_cause ID
        cause_id: boxCause.cause?.id,
        percentage: percentages[boxCause.cause?.id] || null,
      }));
      return updateDonationBox({ box_causes: boxCausesWithPercentages });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationBox'] });
      toast.success('Donation split updated successfully');
    },
    onError: (error: any) => {
      console.error('Update split error:', error);
      toast.error('Failed to update donation split');
    },
  });

  const handleSaveAmount = () => {
    // Calculate capacity for the new amount
    const fees = calculateFees(editableAmount);
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

  const handleSaveAmountFromSheet = (amount: number) => {
    // Calculate capacity for the new amount
    const fees = calculateFees(amount);
    const net = fees.net;
    const maxCapacity = Math.floor(net / 0.20);

    // Check if current causes exceed the new capacity
    if (currentCapacity > maxCapacity) {
      // Show error toast
      toast.error(`You can only support up to ${maxCapacity} cause${maxCapacity !== 1 ? 's' : ''} with $${amount}. Please remove some causes or increase the amount.`);
      return;
    }

    setEditableAmount(amount);
    // If capacity check passes, update the amount
    updateAmountMutation.mutate(amount);
  };

  const handleCancelEdit = () => {
    if (donationBox?.monthly_amount) {
      setEditableAmount(Math.round(parseFloat(donationBox.monthly_amount)));
    }
    setIsEditingAmount(false);
  };

  // Mutation to remove cause from box
  const removeCauseMutation = useMutation({
    mutationFn: (causeId: string) => removeCauseFromBox(causeId),
    onSuccess: () => {
      console.log('Cause removed successfully');
      queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
      setShowDeleteModal(false);
      setItemToDelete(null);
    },
    onError: (error: any) => {
      console.error('Error removing cause:', error);
      toast.error(error.response.data.error);
    },
  });

  // Mutation to remove collective from box
  const removeCollectiveMutation = useMutation({
    mutationFn: (collectiveId: string) => removeCollectiveFromBox(collectiveId),
    onSuccess: () => {
      console.log('Collective removed successfully');
      queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
      setShowDeleteModal(false);
      setItemToDelete(null);
    },
    onError: (error: any) => {
      console.error('Error removing collective:', error);
    },
  });

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

  // Mutation to activate donation box
  const activateBoxMutation = useMutation({
    mutationFn: () => activateDonationBox(),
    onSuccess: (response) => {
      console.log('Donation box activated successfully');
      // queryClient.invalidateQueries({ queryKey: ['donationBox'] });
      // setCheckout(true);
      window.location.href = response.checkout_url;
    },
    onError: (error: any) => {
      console.error('Error activating donation box:', error);
    },
  });

  // Handle delete confirmation
  const handleDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'cause') {
        removeCauseMutation.mutate(itemToDelete.id);
      } else {
        removeCollectiveMutation.mutate(itemToDelete.id);
      }
    }
  };

  // Handle checkout button click
  const handleCheckout = () => {
    activateBoxMutation.mutate();
  };
  const [showCardForm, setShowCardForm] = useState<boolean>(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    zipCode: "",
    state: "",
    country: "",
  });

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

  // Handle remove organization if not provided
  const handleRemoveOrganization = (orgName: string) => {
    if (onRemoveOrganization) {
      onRemoveOrganization(orgName);
    } else {
      setSelectedOrganizations((prev: string[]) =>
        prev.filter((name: string) => name !== orgName)
      );
    }
  };

  // Handle bookmark organization if not provided
  const handleBookmarkOrganization = (orgName: string) => {
    if (onBookmarkOrganization) {
      onBookmarkOrganization(orgName);
    }
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    if (method === "apple-pay") {
      setShowCardForm(false);
    } else if (method === "card") {
      setShowCardForm(true);
    }
  };

  // Handle card details input
  const handleCardDetailsChange = (field: string, value: string) => {
    setCardDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/\D/g, "");
    const matches = v.match(/\d{4,16}/g);
    const match = matches?.[0] || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/\D/g, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col pb-20 md:pb-24">
      <div className="flex-1 overflow-auto mt-2 mx-3 md:mx-4">
        {/* Header Section */}
        <div className="text-center my-4 md:my-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#1600ff] mb-1 md:mb-2">
            Set your monthly gift
          </h1>
          <p className="text-gray-600 text-xs text-center mt-1.5 md:mt-2">
            Support multiple causes with one donation, split evenly. Change anytime.
          </p>
        </div>

        {/* Donation Box Summary Card */}
        <div className="bg-white rounded-xl mb-4 md:mb-6 shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6">
            {/* Your Monthly Impact Section */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 text-center mb-4 md:mb-6">
                Your Monthly Impact
              </h2>

              {/* Amount Selector with Plus/Minus */}
              <div className="flex items-center justify-center gap-3 md:gap-4">
                <button
                  onClick={() => {
                    if (!isEditingAmount) {
                      setIsEditingAmount(true);
                    }
                    decrementAmount();
                  }}
                  disabled={editableAmount <= 5}
                  className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg transition-colors ${editableAmount > 5
                    ? 'bg-[#1600ff] hover:bg-[#1400cc]'
                    : 'bg-gray-200 cursor-not-allowed'
                    }`}
                >
                  <Minus size={18} className="md:w-5 md:h-5 text-white font-bold" strokeWidth={3} />
                </button>

                <div className="text-center cursor-pointer" onClick={() => setShowAmountSheet(true)}>
                  <div className="text-[#1600ff] text-3xl md:text-4xl font-bold">
                    ${Math.round(editableAmount)}
                  </div>
                  <div className="text-gray-900 text-xs md:text-sm mt-1">
                    per month
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isEditingAmount) {
                      setIsEditingAmount(true);
                    }
                    incrementAmount();
                  }}
                  className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#1600ff] hover:bg-[#1400cc] transition-colors"
                >
                  <Plus size={18} className="md:w-5 md:h-5 text-white font-bold" strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Save/Cancel Buttons - Only show when editing */}
            {isEditingAmount && (
              <div className="flex items-center gap-2 md:gap-3 mt-4 md:mt-6">
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
        </div>

        {/* Donation Box Capacity */}
        {/* <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
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
            </div> */}

        {/* Add Causes Button */}
        {/* <button
              onClick={() => navigate('/donation/manage')}
              className="w-full bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} className="text-white" />
              <span>Add Causes</span>
            </button>
          </div>
        </div> */}

        {/* Currently Supporting Section */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Your Selected Causes</h2>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">
                Your Donation Box. Add or remove anytime.
              </p>
            </div>
            {/* <button
              onClick={() => setShowEditSplitSheet(true)}
              className="bg-gray-100 text-gray-600 font-medium py-1.5 px-3 md:py-2 md:px-4 rounded-lg transition-colors flex items-center gap-1.5 md:gap-2 hover:bg-gray-200"
            >
              <Pencil size={16} className="md:w-[18px] md:h-[18px] text-gray-600 flex-shrink-0" />
              <span className="text-xs md:text-sm leading-tight">Edit Split</span>
            </button> */}
            <div className="bg-[#1600ff] text-white font-medium py-1.5 px-3 rounded-full transition-colors flex items-center gap-1.5 md:gap-2">
              {causes.length}
            </div>
          </div>
          {/* Causes List from box_causes */}
          <div className="space-y-2.5 md:space-y-3">
            {causes.length > 0 ? (
              causes.map((cause: any) => {
                const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                const initials = getInitials(cause.name || 'N');
                return (
                  <div
                    key={cause.id}
                    className="flex items-center p-3 md:p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    {/* Avatar */}
                    <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 border border-gray-200 mr-3 md:mr-4">
                      <AvatarImage src={cause.image || cause.logo} />
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

                    {/* Donation Info & Action */}
                    <div className="flex items-center gap-3 md:gap-4 ml-2 md:ml-4">
                      <div className="text-right">
                        <p className="font-bold text-sm md:text-base text-gray-900">
                          {(() => {
                            const customPercentage = getCausePercentage(cause.id);
                            return customPercentage != null
                              ? `${Number(customPercentage).toFixed(1)}%`
                              : distributionPercentage != null
                                ? `${Number(distributionPercentage).toFixed(1)}%`
                                : '0%';
                          })()}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">${getAmountPerItem(cause.id).toFixed(2)}/mo</p>
                      </div>
                      <button
                        onClick={() => {
                          setItemToDelete({ id: cause.id.toString(), name: cause.name, type: 'cause' });
                          setShowDeleteModal(true);
                        }}
                        className=" hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Remove cause"
                      >
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-3 md:py-4 text-sm md:text-base">No causes</p>
            )}
          </div>
        </div>

        {/* Add More Causes Section */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
            Add More Causes
          </h2>

          {/* Search Bar */}
          <div className="flex gap-2 mb-3 md:mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Search for causes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 border border-gray-300 rounded-xl text-sm md:text-base"

              />
            </div>
          </div>

          {/* Request Nonprofit Link */}
          <div className="mb-3 md:mb-4 flex justify-center">
            <button
              onClick={() => navigate('/request-nonprofit')}
              className="text-xs md:text-sm text-[#1600ff] underline font-medium"
            >
              Can't find your nonprofit? Request it here
            </button>
          </div>

          {/* Causes List */}
          <div className="space-y-2 md:space-y-3">
            {searchCausesLoading ? (
              <div className="flex justify-center py-6 md:py-8">
                <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
              </div>
            ) : searchCausesData?.results?.length > 0 ? (
              searchCausesData.results
                .filter((cause: any) => !causes.some((c: any) => c.id === cause.id))
                .slice(0, 10)
                .map((cause: any) => {
                  const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                  const initials = getInitials(cause.name);
                  return (
                    <div
                      key={cause.id}
                      className="flex items-center p-2.5 md:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 border border-gray-200 mr-2.5 md:mr-3">
                        <AvatarImage src={cause.image || cause.logo} />
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
                          addCausesMutation.mutate(cause.id);
                        }}
                        disabled={addCausesMutation.isPending}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50"
                      >
                        {addCausesMutation.isPending ? (
                          <Loader2 size={14} className="md:w-4 md:h-4 text-pink-600 animate-spin" />
                        ) : (
                          <Plus size={14} className="md:w-4 md:h-4 text-pink-600" strokeWidth={3} />
                        )}
                      </button>
                    </div>
                  );
                })
            ) : (
              <p className="text-gray-500 text-center py-6 md:py-8 text-sm md:text-base">No nonprofits found</p>
            )}
          </div>
        </div>


        {/* Attributing Collectives Section */}
        {/* <div className="bg-white rounded-xl mb-6 p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Collectives
          </h2>

        
          <div className="space-y-4">
            {attributingCollectives.length > 0 ? (
              attributingCollectives.map((collective: any) => {
                const isExpanded = expandedCollectives.has(collective.id);
                const details = collectiveDetails[collective.id];
                const isLoading = loadingCollectives.has(collective.id);
                
                return (
                  <div key={collective.id}>
                    <div
                      className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleToggleCollectiveDropdown(collective.id)}
                    >
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                        <span className="text-green-600 font-semibold text-lg">
                          {collective.name?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{collective.name}</h3>
                        <p className="text-sm text-gray-600">
                          {collective.description || 'Community collective'}
                        </p>
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
                    {isExpanded && details && details.causes && details.causes.length > 0 && (
                      <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg mt-2">
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
              <p className="text-gray-500 text-center py-4">No collectives</p>
            )}
          </div>
        </div> */}

        {/* Distribution Details */}
        {/* <div className="bg-blue-50 rounded-xl mb-10 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Distribution
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            Your ${actualDonationAmount} becomes ${(actualDonationAmount * 0.9).toFixed(2)}{" "}
            after fees, split evenly across causes. Your donation will be evenly
            distributed across all {manualCauses.length} causes.
          </p>
          <div className="  text-blue-500 ">
            <span className="font-semibold">
              Each cause receives: $
              {manualCauses.length > 0
                ? (actualDonationAmount / manualCauses.length).toFixed(2)
                : "0.00"}{" "}
              per month
            </span>
          </div>
        </div> */}

        {/* Manage Donation Box Button - Only show if donation box exists */}
        {/* {(donationBox?.id) && (
          <div className="mb-6">
            <Button
              onClick={() => {
                if (onManageDonationBox) {
                  onManageDonationBox();
                }
              }}
              variant="outline"
              className="w-full text-sm h-12"
            >
              Manage Donation Box
            </Button>
          </div>
        )} */}

        {/* Add More Button */}
        {/* <div className="mb-6">
          <button className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors hover:bg-gray-300">
            Add More
          </button>
        </div> */}

        {/* Payment Method Selection */}
        {/* <div className="bg-white rounded-xl mb-6 p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Select Payment Method
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Choose a payment method to complete your donation.
          </p>

          <div className="space-y-3">
            
            <button
              type="button"
              className={`w-full flex items-center p-4 border rounded-lg transition-all cursor-pointer ${
                selectedPaymentMethod === "apple-pay"
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => handlePaymentMethodSelect("apple-pay")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handlePaymentMethodSelect("apple-pay");
                }
              }}
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">Apple Pay</span>
              {selectedPaymentMethod === "apple-pay" && (
                <div className="ml-auto">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>

            
            <button
              type="button"
              className={`w-full flex items-center p-4 border rounded-lg transition-all cursor-pointer ${
                selectedPaymentMethod === "card"
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => handlePaymentMethodSelect("card")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handlePaymentMethodSelect("card");
                }
              }}
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <span className="font-medium text-gray-800">
                Credit or Debit Card
              </span>
              {selectedPaymentMethod === "card" && (
                <div className="ml-auto">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>

            
            {showCardForm && selectedPaymentMethod === "card" && (
              <div className="mt-4 p-4  rounded-lg border border-gray-200">
                <div className="space-y-4">
                  
                  <div>
                    <label
                      htmlFor="cardNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Card Number
                    </label>
                    <input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        handleCardDetailsChange("cardNumber", formatted);
                      }}
                      maxLength={19}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="expiryDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Expiry Date
                      </label>
                      <input
                        id="expiryDate"
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={(e) => {
                          const formatted = formatExpiryDate(e.target.value);
                          handleCardDetailsChange("expiryDate", formatted);
                        }}
                        maxLength={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cvv"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        CVV
                      </label>
                      <input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 4) {
                            handleCardDetailsChange("cvv", value);
                          }
                        }}
                        maxLength={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Country
                      </label>
                      <Select
                        value={cardDetails.country}
                        onValueChange={(value) => {
                          handleCardDetailsChange("country", value);
                          
                          handleCardDetailsChange("state", "");
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {Country.getAllCountries().map((country) => (
                            <SelectItem
                              key={country.isoCode}
                              value={country.isoCode}
                            >
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        State
                      </label>
                      <Select
                        value={cardDetails.state}
                        onValueChange={(value) =>
                          handleCardDetailsChange("state", value)
                        }
                        disabled={!cardDetails.country}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              !cardDetails.country
                                ? "Select Country first"
                                : "Select State"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {cardDetails.country &&
                            State.getStatesOfCountry(cardDetails.country).map(
                              (state) => (
                                <SelectItem
                                  key={state.isoCode}
                                  value={state.isoCode}
                                >
                                  {state.name}
                                </SelectItem>
                              )
                            )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  
                  <div>
                    <label
                      htmlFor="zipCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Zip Code
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      placeholder="12345"
                      value={cardDetails.zipCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          handleCardDetailsChange("zipCode", value);
                        }
                      }}
                      maxLength={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div> */}


        {/* <div className="space-y-3 mb-6 fixed bottom-0 w-calc(100%-16px) left-0 right-0 mx-4">
          <button
            onClick={() => setCheckout(true)}
            disabled={
              !selectedPaymentMethod ||
              (selectedPaymentMethod === "card" &&
                (!cardDetails.cardNumber ||
                  !cardDetails.expiryDate ||
                  !cardDetails.cvv ||
                  !cardDetails.zipCode ||
                  !cardDetails.state ||
                  !cardDetails.country))
            }
            className={`w-full py-4 rounded-lg font-medium transition-colors ${
              !selectedPaymentMethod ||
              (selectedPaymentMethod === "card" &&
                (!cardDetails.cardNumber ||
                  !cardDetails.expiryDate ||
                  !cardDetails.cvv ||
                  !cardDetails.zipCode ||
                  !cardDetails.state ||
                  !cardDetails.country))
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {(() => {
              if (!selectedPaymentMethod) {
                return "Select a payment method";
              }
              if (
                selectedPaymentMethod === "card" &&
                (!cardDetails.cardNumber ||
                  !cardDetails.expiryDate ||
                  !cardDetails.cvv ||
                  !cardDetails.zipCode ||
                  !cardDetails.state ||
                  !cardDetails.country)
              ) {
                return "Complete card details";
              }
              return "Confirm your donation";
            })()}
          </button>
        </div> */}

        {/* checkout button */}
        {/* <div className="space-y-1 fixed bottom-0 p-4 md:p-6 left-0 right-0 border-t border-gray-200 bg-white">
           <Button 
             className="w-full bg-[#aeff30] hover:bg-[#91d11c] text-black py-4 md:py-6 rounded-full font-bold transition-colors flex items-center justify-center text-sm md:text-base" 
             onClick={handleCheckout}
             disabled={activateBoxMutation.isPending}
           >
             {activateBoxMutation.isPending ? 'Activating...' : 'Activate Donation Box'}
           </Button>
         </div> */}
      </div>

      {/* Spacer for mobile */}
      {/* <div className="h-24 md:hidden"></div> */}

      {/* Remove Cause Bottom Sheet Modal */}
      {isDeleteModalVisible && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${isDeleteModalAnimating ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Bottom Sheet */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl md:rounded-t-3xl shadow-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col transition-transform duration-300 ${isDeleteModalAnimating ? 'translate-y-0' : 'translate-y-full'
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
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                Are you sure you want to remove <span className="font-semibold">{itemToDelete?.name}</span> from your donation box? This action cannot be undone.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                disabled={removeCauseMutation.isPending || removeCollectiveMutation.isPending}
                className="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 md:py-4 rounded-full transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={removeCauseMutation.isPending || removeCollectiveMutation.isPending}
                className="w-full sm:flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 md:py-4 rounded-full transition-colors text-sm md:text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removeCauseMutation.isPending || removeCollectiveMutation.isPending ? (
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

      {/* Edit Donation Split Bottom Sheet */}
      <EditDonationSplitBottomSheet
        isOpen={showEditSplitSheet}
        onClose={() => setShowEditSplitSheet(false)}
        causes={causes}
        monthlyAmount={actualDonationAmount}
        boxCauses={boxCauses}
      />

      <AmountBottomSheet
        isOpen={showAmountSheet}
        onClose={() => setShowAmountSheet(false)}
        initialAmount={Math.round(editableAmount)}
        onSave={handleSaveAmountFromSheet}
      />
    </div>
  );
};
