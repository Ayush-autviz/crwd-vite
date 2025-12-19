
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from 'react-router-dom';
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import DonationCauseSelector from "./DonationCauseSelector";
import { useMutation } from '@tanstack/react-query';
import { createOneTimeDonation } from '@/services/api/donation';
import RequestNonprofitModal from '@/components/newsearch/RequestNonprofitModal';
import { toast } from 'sonner';

interface OneTimeDonationProps {
  setCheckout: (value: boolean) => void;
  selectedOrganizations: string[];
  setSelectedOrganizations: (value: string[]) => void;
  preselectedItem?: {
    id: string;
    type: 'cause' | 'collective';
    data: any;
  };
  activeTab?: string;
  preselectedCauses?: number[];
  preselectedCausesData?: any[];
  preselectedCollectiveId?: number;
}

interface SelectedItem {
  id: string;
  type: 'cause' | 'collective';
  data: any;
}

export default function OneTimeDonation({
  setCheckout,
  selectedOrganizations,
  setSelectedOrganizations,
  preselectedItem,
  activeTab,
  preselectedCauses,
  preselectedCausesData,
  preselectedCollectiveId,
}: OneTimeDonationProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [donationAmount, setDonationAmount] = useState(5);
  const [inputValue, setInputValue] = useState("5");
  const [preselectedItemAdded, setPreselectedItemAdded] = useState(false);
  const [preselectedCausesProcessed, setPreselectedCausesProcessed] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

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

  // Handle preselected item from navigation
  useEffect(() => {
    if (preselectedItem && !preselectedItemAdded) {
      console.log('OneTimeDonation: Setting preselected item:', preselectedItem);
      setSelectedItems([preselectedItem]);
      setSelectedOrganizations([preselectedItem.id]);
      setPreselectedItemAdded(true);
    }
  }, [preselectedItem, setSelectedOrganizations, preselectedItemAdded]);

  // Handle preselected causes from collective (multiple causes)
  useEffect(() => {
    if (preselectedCauses && preselectedCauses.length > 0 && !preselectedCausesProcessed) {
      console.log('OneTimeDonation: Setting preselected causes:', preselectedCauses, preselectedCausesData);
      
      // If we have the full cause data, use it directly
      if (preselectedCausesData && preselectedCausesData.length > 0) {
        const causesAsItems: SelectedItem[] = preselectedCausesData.map((cause: any) => ({
          id: cause.id.toString(),
          type: 'cause' as const,
          data: cause,
        }));
        
        setSelectedItems(causesAsItems);
        setSelectedOrganizations(causesAsItems.map(item => item.id));
        setPreselectedCausesProcessed(true);
      } else {
        // Fallback: create items from IDs only
        const causesAsItems: SelectedItem[] = preselectedCauses.map((causeId: number) => ({
          id: causeId.toString(),
          type: 'cause' as const,
          data: { id: causeId },
        }));
        
        setSelectedItems(causesAsItems);
        setSelectedOrganizations(causesAsItems.map(item => item.id));
        setPreselectedCausesProcessed(true);
      }
    }
  }, [preselectedCauses, preselectedCausesData, preselectedCausesProcessed, setSelectedOrganizations]);

  // One-time donation mutation
  const oneTimeDonationMutation = useMutation({
    mutationFn: createOneTimeDonation,
    onSuccess: (response) => {
      console.log('One-time donation response:', response);
      // setCheckout(true);  
      window.location.href = response.checkout_url;
    },
    onError: (error) => {
      console.error('One-time donation error:', error);
    },
  });

  const incrementDonation = () => {
    const newAmount = donationAmount + 5;
    setDonationAmount(newAmount);
    setInputValue(newAmount.toString());
  };

  const decrementDonation = () => {
    if (donationAmount > 5) {
      const newAmount = donationAmount - 5;
      
      // Calculate max capacity for new amount
      const calculateFees = (grossAmount: number) => {
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
      const fees = calculateFees(newAmount);
      const net = fees.net;
      const newMaxCapacity = Math.floor(net / 0.20);
      const currentCapacity = selectedItems.length;
      
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
    const value = e.target.value.replace(/[^0-9]/g, '');
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
      const calculateFees = (grossAmount: number) => {
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
      const fees = calculateFees(finalValue);
      const net = fees.net;
      const newMaxCapacity = Math.floor(net / 0.20);
      const currentCapacity = selectedItems.length;
      
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

  const handleSelectItem = (item: SelectedItem) => {
    // Check if item is already selected to prevent duplicates
    const isAlreadySelected = selectedItems.some(selectedItem => 
      selectedItem.id === item.id && selectedItem.type === item.type
    );
    
    if (!isAlreadySelected) {
      // Calculate max capacity before adding
      const calculateFees = (grossAmount: number) => {
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
      const actualDonationAmount = parseFloat(donationAmount.toString());
      const fees = calculateFees(actualDonationAmount);
      const net = fees.net;
      const maxCapacity = Math.floor(net / 0.20);
      const currentCapacity = selectedItems.length;
      
      // Check if adding this item would exceed capacity
      if (currentCapacity >= maxCapacity) {
        toast.error(`You can only add up to ${maxCapacity} cause${maxCapacity !== 1 ? 's' : ''} for $${donationAmount}. Increase your donation amount to support more causes.`);
        return;
      }
      
      setSelectedItems((prev: SelectedItem[]) => [...prev, item]);
      // Also update the legacy selectedOrganizations for backward compatibility
      setSelectedOrganizations([...selectedOrganizations, item.id]);
    }
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev: SelectedItem[]) => prev.filter(item => `${item.type}-${item.id}` !== id));
    // Also update the legacy selectedOrganizations for backward compatibility
    setSelectedOrganizations(selectedOrganizations.filter((orgId: string) => orgId !== id.split('-')[1]));
  };

  const handleClearAllItems = () => {
    console.log('handleClearAllItems called');
    console.log('Current selectedItems before clear:', selectedItems);
    console.log('Current selectedOrganizations before clear:', selectedOrganizations);
    
    setSelectedItems([]);
    setSelectedOrganizations([]);
    
    console.log('Items cleared');
  };

  const handleCheckout = () => {
    // Prepare request body according to API specification
    // Format: { amount: string, causes: [{ cause_id: number, attributed_collective?: number }] }
    const causes: Array<{ cause_id: number; attributed_collective?: number }> = [];

    // Process selected items and build causes array
    selectedItems.forEach(item => {
      if (item.type === 'cause') {
        const causeId = parseInt(item.id);
        const causeEntry: { cause_id: number; attributed_collective?: number } = {
          cause_id: causeId,
        };
        
        // Only include attributed_collective if preselectedCollectiveId exists, is not 0, and cause_id is not 0
        if (preselectedCollectiveId && preselectedCollectiveId > 0 && causeId > 0) {
          causeEntry.attributed_collective = preselectedCollectiveId;
        }
        
        causes.push(causeEntry);
      }
      // Note: For one-time donations, we're only handling causes, not collectives directly
    });

    // Build request body
    const requestBody: {
      amount: string;
      causes: Array<{ cause_id: number; attributed_collective?: number }>;
    } = {
      amount: donationAmount.toString(),
      causes: causes.length > 0 ? causes : [{ cause_id: 0 }], // Fallback if no causes selected (no attributed_collective for fallback)
    };

    console.log('Sending one-time donation request:', requestBody);
    oneTimeDonationMutation.mutate(requestBody);
  };

  // Calculate fees and capacity using the provided formula
  const calculateFees = (grossAmount: number) => {
    const gross = grossAmount;
    const stripeFee = (gross * 0.029) + 0.30;
    const crwdFee = (gross - stripeFee) * 0.07;
    const net = gross - stripeFee - crwdFee;
    
    console.log('=== Fee Calculation (OneTimeDonation) ===');
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

  const actualDonationAmount = parseFloat(donationAmount.toString());
  const fees = calculateFees(actualDonationAmount);
  const net = fees.net;
  const maxCapacity = Math.floor(net / 0.20);
  const currentCapacity = selectedItems.length;
  const capacityPercentage = maxCapacity > 0 ? Math.min(100, (currentCapacity / maxCapacity) * 100) : 0;
  
  console.log('=== Capacity Calculation (OneTimeDonation) ===');
  console.log('Donation Amount:', donationAmount);
  console.log('Actual Donation Amount:', actualDonationAmount);
  console.log('Fees object:', fees);
  console.log('Net amount:', net);
  console.log('Max Capacity (net / 0.20):', maxCapacity);
  console.log('Current Capacity:', currentCapacity);
  console.log('Capacity Percentage:', capacityPercentage);

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col pb-20 md:pb-24">
      <div className="flex-1 overflow-auto mt-3 md:mt-4 flex flex-col p-3 md:p-4 mb-20 md:mb-24 space-y-3 md:space-y-4">
        {/* Header Section */}
        <div>
          <p className="text-xl md:text-2xl font-bold text-[#1600ff] text-center">Set your one-time gift</p>
          <p className="text-gray-600 text-xs text-center mt-1.5 md:mt-2">Support multiple causes with one donation, split evenly. Change anytime.</p>
        </div>

        {/* Donation Box Card */}
        <div className="bg-white rounded-xl mb-4 md:mb-6 p-4 md:p-6 shadow-sm border border-gray-100">
          {/* Your One-Time Impact Section */}
          <div className="mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 text-center mb-4 md:mb-6">
              Your One-Time Impact
            </h2>
            
            {/* Amount Selector */}
            <div className="flex items-center justify-center gap-3 md:gap-4">
              <button
                onClick={decrementDonation}
                disabled={donationAmount <= 5}
                className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg transition-colors ${
                  donationAmount > 5 
                    ? 'bg-[#1600ff] hover:bg-[#1600ff]' 
                    : 'bg-gray-200 hover:bg-gray-300 cursor-not-allowed'
                }`}
              >
                <Minus size={18} className="md:w-5 md:h-5 text-white font-bold" strokeWidth={3} />
              </button>
              <div className="text-center">
                <div className="text-[#1600ff] text-3xl md:text-4xl font-bold">
                  ${donationAmount}
                </div>
                <div className="text-gray-900 text-xs md:text-sm mt-1">
                  per donation
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
                style={{ width: `${capacityPercentage}%` }}
              />
            </div>
            
            <p className="text-xs md:text-sm text-[#1600ff]">
              For every ${donationAmount}, you can support {maxCapacity} cause{maxCapacity !== 1 ? 's' : ''}.
            </p>
          </div>
        </div>

        {/* Your Selected Causes */}
        {selectedItems.filter(item => item.type === 'cause').length > 0 && (
          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Your Selected Causes</h2>
                <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">Your One-Time Donation. Add or remove anytime.</p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#1600ff] flex items-center justify-center">
                <span className="text-white text-xs md:text-sm font-bold">{selectedItems.filter(item => item.type === 'cause').length}</span>
              </div>
            </div>
            
            <div className="space-y-2 md:space-y-3 mt-3 md:mt-4">
              {selectedItems
                .filter(item => item.type === 'cause')
                .map((item) => {
                  const cause = item.data;
                  const causeId = typeof cause.id === 'number' ? cause.id : parseInt(cause.id) || cause.id;
                  const avatarBgColor = getConsistentColor(causeId, avatarColors);
                  const initials = getInitials(cause.name || '');
                  return (
                    <div key={item.id} className="flex items-center p-2.5 md:p-3 border border-gray-200 rounded-lg">
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
                        <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                          <h3 className="font-bold text-sm md:text-base text-gray-900">{cause.name}</h3>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                          {cause.mission || cause.description || 'No description available'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(`${item.type}-${item.id}`);
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
        <div className="w-full">
          <DonationCauseSelector
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onRemoveItem={handleRemoveItem}
            onClearAllItems={handleClearAllItems}
            preselectedItem={preselectedItem}
            activeTab={activeTab}
            onRequestNonprofit={() => setShowRequestModal(true)}
          />
        </div>
      </div>

      {/* Checkout button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t border-gray-200 z-10">
        <Button
          onClick={handleCheckout}
          disabled={oneTimeDonationMutation.isPending || selectedItems.length === 0}
          className="bg-[#1600ff] hover:bg-[#1400cc] text-white w-full py-4 md:py-6 rounded-full font-bold transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
        >
          {oneTimeDonationMutation.isPending ? 'Processing...' : 'Continue to Review'}
        </Button>
      </div>

      {/* Request Nonprofit Modal */}
      <RequestNonprofitModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </div>
  );
}
