import { Minus, Plus } from "lucide-react";
import { Link } from 'react-router-dom';
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import DonationCauseSelector from "./DonationCauseSelector";
import { useMutation } from '@tanstack/react-query';
import { createOneTimeDonation } from '@/services/api/donation';

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
  const [donationAmount, setDonationAmount] = useState(7);
  const [inputValue, setInputValue] = useState("7");
  const [preselectedItemAdded, setPreselectedItemAdded] = useState(false);

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
    const newAmount = donationAmount + 1;
    setDonationAmount(newAmount);
    setInputValue(newAmount.toString());
  };

  const decrementDonation = () => {
    if (donationAmount > 1) {
      const newAmount = donationAmount - 1;
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

  return (
    <div className="p-3 md:p-4 mt-3 md:mt-4 mb-4 rounded-lg">
      {/* Main container - flex column on mobile, flex row on larger screens */}
      <div className="flex flex-col md:flex-row md:gap-6 w-full">
        {/* Left column - Organizations section */}
        <div className="w-full mb-4 md:mb-0">
          <DonationCauseSelector
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onRemoveItem={handleRemoveItem}
            onClearAllItems={handleClearAllItems}
            preselectedItem={preselectedItem}
            activeTab={activeTab}
          />
        </div>

        {/* Right column - Donation amount and checkout */}
        <div className="w-full space-y-4 md:space-y-5">
          {/* Donation amount section */}
          <div className="bg-blue-50 rounded-xl w-full p-4 md:p-6">
            <div className="flex items-center mb-3 md:mb-4 rounded-lg">
              <h2 className="text-sm md:text-base font-medium text-gray-800">
                Enter donation amount
              </h2>
            </div>

            <div className="bg-blue-50 rounded-lg mb-3 md:mb-4">
              <div className="bg-white flex items-center rounded-lg border shadow-sm">
                <button
                  onClick={decrementDonation}
                  className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-l-lg hover:bg-gray-50 transition-colors"
                >
                  <Minus size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
                <div className="flex-1 flex justify-center items-center h-10 md:h-12 px-3 md:px-4 border-x">
                  <span className="text-blue-600 text-xl md:text-2xl font-bold relative">
                    $
                    <input
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className="bg-transparent w-16 md:w-20 text-center focus:outline-none text-xl md:text-2xl"
                      aria-label="Donation amount"
                    />
                  </span>
                </div>
                <button
                  onClick={incrementDonation}
                  className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-r-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-1.5 md:mt-2">
                Input amount over $5
              </p>
            </div>

            <div className="flex justify-between items-center p-2.5 md:p-3 border-b border-gray-200">
              <span className="text-xs md:text-sm font-medium text-gray-700">TOTAL:</span>
              <span className="text-base md:text-lg font-bold text-blue-600">${donationAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Security message */}
          <div className="flex items-center p-2.5 md:p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-100 text-green-600 mr-1.5 md:mr-2 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" className="md:w-[14px] md:h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              Your donation is protected and guaranteed.{" "}
              <Link to="/settings/about" className="text-blue-600 font-medium">
                Learn More
              </Link>
            </p>
          </div>

          {/* Checkout button */}
          <div className="py-3 md:py-4 w-full">
            <Button
              onClick={handleCheckout}
              disabled={oneTimeDonationMutation.isPending || selectedItems.length === 0}
              className="bg-green-500 hover:bg-green-600 text-black w-full py-4 md:py-6 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {oneTimeDonationMutation.isPending ? 'Processing...' : 'Checkout'}
            </Button>
          </div>
          {/* <div className="py-4 w-full">
            <Button
              onClick={() => setCheckout(true)}
              className="bg-green-500 hover:bg-green-600 text-black w-full py-6 md:py-6 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              Complete Donation
            </Button>
          </div> */}
          {/* <PaymentSection setCheckout={setCheckout} amount={7} /> */}
          <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
}
