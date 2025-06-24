// import Image from "next/image"; - replaced with regular img tags
import { Minus, Plus, Bookmark, ChevronRight, Trash2 } from "lucide-react";
import { Link } from 'react-router-dom';
import { Button } from "./ui/button";
import { CROWDS, RECENTS, SUGGESTED } from "@/constants";
import { useState } from "react";
import PaymentSection from "./PaymentSection";
import type { Organization } from "@/lib/types";

interface OneTimeDonationProps {
  setCheckout: (value: boolean) => void;
  selectedOrganizations: string[];
  setSelectedOrganizations: (value: string[]) => void;
}

export default function OneTimeDonation({
  setCheckout,
  selectedOrganizations,
  setSelectedOrganizations
}: OneTimeDonationProps) {
  const [bookmarkedOrgs, setBookmarkedOrgs] = useState<string[]>([]);
  const [donationAmount, setDonationAmount] = useState(7);
  const [inputValue, setInputValue] = useState("7");

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

  const selectedOrgs = selectedOrganizations
    .map((id) => {
      const org = [...CROWDS, ...RECENTS, ...SUGGESTED].find((o) => o.id === id);
      return org;
    })
    .filter((org): org is Organization => !!org);

  const handleRemoveOrganization = (id: string) => {
    setSelectedOrganizations(selectedOrganizations.filter((orgId) => orgId !== id));
  };

  const handleBookmarkOrganization = (id: string) => {
    setBookmarkedOrgs((prev) =>
      prev.includes(id) ? prev.filter(orgId => orgId !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 mt-4 mb-4 rounded-lg  ">
      {/* Main container - flex column on mobile, flex row on larger screens */}
      <div className="flex flex-col md:flex-row md:gap-6 w-full">
        {/* Left column - Organizations section */}
        <div className="w-full  mb-5 md:mb-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <div className="flex items-center mb-4">
              <h1 className="text-xl font-medium text-gray-800">
                Your donation will support
              </h1>
            </div>

            {selectedOrgs.length > 0 ? (
              <div className="space-y-4 mb-4">
                {selectedOrgs.map((org) => (
                  <div key={org.id} className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="h-16 w-16 rounded-full overflow-hidden flex items-start mt-1">
                          <Image
                            src={org.imageUrl || "/redcross.png"}
                            alt={`${org.name} logo`}
                            width={48}
                            height={48}
                            className="object-cover rounded-full overflow-hidden h-10 w-10"
                          />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-800">{org.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {org.description || "This is a non-profit mission statement that aligns with the company's goals and..."}
                          </p>
                        </div>
                      </div>
                      <button
                        className={`${bookmarkedOrgs.includes(org.id) ? 'text-blue-500' : 'text-gray-400'} hover:text-blue-500 transition-colors`}
                        onClick={() => handleBookmarkOrganization(org.id)}
                      >
                        <Bookmark size={20} />
                      </button>
                    </div>
                    <div className="flex justify-end mt-3">
                      <button
                        className="text-xs text-gray-600 hover:text-red-500 flex items-center px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                        onClick={() => handleRemoveOrganization(org.id)}
                      >
                        <Trash2 size={12} className="mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="text-sm text-blue-600 rounded-lg">
                  <p className="font-medium text-blue-600">You can add up to 10 more causes to this donation</p>
                  <Link to="/search" className="flex items-center mt-1 text-sm text-blue-600">
                    <span>Discover More</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center mb-4">
                <p className="text-gray-500">No organizations selected</p>
                <Link to="/search" className="text-blue-600 text-sm font-medium mt-2 inline-block">
                  Add organizations
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Donation amount and checkout */}
        <div className="w-full  space-y-5">
          {/* Donation amount section */}
          <div className="bg-blue-50 rounded-xl w-full p-6">
            <div className="flex items-center mb-4 rounded-lg">
              <h2 className="text-base font-medium text-gray-800">
                Enter donation amount
              </h2>
            </div>

            <div className="bg-blue-50 rounded-lg mb-4">
              <div className="bg-white flex items-center rounded-lg border shadow-sm">
                <button
                  onClick={decrementDonation}
                  className="flex items-center justify-center w-12 h-12 rounded-l-lg hover:bg-gray-50 transition-colors"
                >
                  <Minus size={18} />
                </button>
                <div className="flex-1 flex justify-center items-center h-12 px-4 border-x">
                  <span className="text-blue-600 text-2xl font-bold relative">
                    $
                    <input
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className="bg-transparent w-20 text-center focus:outline-none"
                      aria-label="Donation amount"
                    />
                  </span>
                </div>
                <button
                  onClick={incrementDonation}
                  className="flex items-center justify-center w-12 h-12 rounded-r-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Input amount over $5
              </p>
            </div>

            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">TOTAL:</span>
              <span className="text-lg font-bold text-blue-600">${donationAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Security message */}
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <p className="text-sm text-gray-600">
              Your donation is protected and guaranteed.{" "}
              <Link to="/settings/about" className="text-blue-600 font-medium">
                Learn More
              </Link>
            </p>
          </div>

          {/* Checkout button */}
          {/* <div className="py-4 w-full">
            <Button
              onClick={() => setCheckout(true)}
              className="bg-green-500 hover:bg-green-600 text-black w-full py-6 md:py-6 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              Complete Donation
            </Button>
          </div> */}
          <PaymentSection setCheckout={setCheckout} amount={7} />
          <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
}
