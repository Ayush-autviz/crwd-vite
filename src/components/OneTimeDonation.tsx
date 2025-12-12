import { Minus, Plus } from "lucide-react";
import { Link } from 'react-router-dom';
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import DonationCauseSelector from "./DonationCauseSelector";
import { useMutation } from '@tanstack/react-query';
import { createOneTimeDonation } from '@/services/api/donation';
import RequestNonprofitModal from '@/components/newsearch/RequestNonprofitModal';

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
  activeTab
}: OneTimeDonationProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [donationAmount, setDonationAmount] = useState(5);
  const [inputValue, setInputValue] = useState("5");
  const [preselectedItemAdded, setPreselectedItemAdded] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Handle preselected item from navigation
  useEffect(() => {
    if (preselectedItem && !preselectedItemAdded) {
      console.log('OneTimeDonation: Setting preselected item:', preselectedItem);
      setSelectedItems([preselectedItem]);
      setSelectedOrganizations([preselectedItem.id]);
      setPreselectedItemAdded(true);
    }
  }, [preselectedItem, setSelectedOrganizations, preselectedItemAdded]);

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
    setDonationAmount(finalValue);
    setInputValue(finalValue.toString());
  };

  const handleSelectItem = (item: SelectedItem) => {
    // Check if item is already selected to prevent duplicates
    const isAlreadySelected = selectedItems.some(selectedItem => 
      selectedItem.id === item.id && selectedItem.type === item.type
    );
    
    if (!isAlreadySelected) {
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
    const causeIds: number[] = [];
    let collectiveIds: number[] = [];

    // Separate causes and collectives from selected items
    selectedItems.forEach(item => {
      if (item.type === 'cause') {
        causeIds.push(parseInt(item.id));
      } else if (item.type === 'collective') {
        collectiveIds.push(parseInt(item.id));
      }
    });

    // Build request body - only include the relevant field based on what's selected
    let requestBody: any = {
      amount: donationAmount.toString(),
    };

    if (causeIds.length > 0) {
      // If causes are selected, send cause_ids and set collective_id to 0
      requestBody.cause_ids = causeIds;
      // requestBody.collective_id = 0;
    } else if (collectiveIds.length > 0) {
      // If a collective is selected, send collective_id and set cause_ids to [0]
      requestBody.collective_ids = collectiveIds;
      // requestBody.cause_ids = [0];
    } else {
      // Fallback if nothing is selected (shouldn't happen due to button disabled state)
      requestBody.cause_ids = [];
      requestBody.collective_ids = [];
    }

    console.log('Sending one-time donation request:', requestBody);
    oneTimeDonationMutation.mutate(requestBody);
  };

  // Calculate capacity - max is 20 causes, and for every $5 you can support 20 causes
  const maxCapacity = 20;
  const currentCapacity = selectedItems.length;
  const capacityPercentage = maxCapacity > 0 ? Math.min(100, (currentCapacity / maxCapacity) * 100) : 0;
  // For every $5, you can support 20 causes (so $1 = 4 causes, but max is 20)
  const calculatedCapacity = Math.min(Math.floor(donationAmount * 4), maxCapacity);

  return (
    <div className="w-full h-full bg-white flex flex-col pb-20 md:pb-24">
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
              For every ${donationAmount}, you can support {calculatedCapacity} cause{calculatedCapacity !== 1 ? 's' : ''}.
            </p>
          </div>
        </div>

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
          className="bg-[#aeff30] hover:bg-[#91d11c] text-black w-full py-4 md:py-6 rounded-full font-bold transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
        >
          {oneTimeDonationMutation.isPending ? 'Processing...' : 'Checkout'}
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
