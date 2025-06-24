"use client";
import { useState } from "react";
import { Bookmark, Trash2, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { CROWDS, RECENTS, SUGGESTED } from "@/constants";
import { Button } from "./ui/button";
import { Link } from 'react-router-dom';
import PaymentSection from "./PaymentSection";

// Define Organization type locally
type Organization = {
  id: string;
  name: string;
  imageUrl: string;
  color?: string;
  shortDesc?: string;
  description?: string;
};

interface DonationSummaryProps {
  selectedOrganizations: string[];
  setSelectedOrganizations: React.Dispatch<React.SetStateAction<string[]>>;
  step?: number;
  setCheckout: (value: boolean) => void;
  onRemoveOrganization?: (id: string) => void;
  onBookmarkOrganization?: (id: string) => void;
  setStep: (step: number) => void;
}

export const DonationBox3 = ({
  selectedOrganizations,
  setSelectedOrganizations,
  setCheckout,
  onRemoveOrganization,
  onBookmarkOrganization,
  setStep,
}: DonationSummaryProps) => {
  const [bookmarkedOrgs, setBookmarkedOrgs] = useState<string[]>([]);

  const getOrganizationById = (orgId: string): Organization | undefined => {
    return [...CROWDS, ...RECENTS, ...SUGGESTED].find(
      (org) => org.id === orgId
    );
  };

  const selectedOrgs = selectedOrganizations
    .map((id) => getOrganizationById(id))
    .filter((org): org is Organization => !!org);

  // Handle remove organization if not provided
  const handleRemoveOrganization = (id: string) => {
    if (onRemoveOrganization) {
      onRemoveOrganization(id);
    } else {
      setSelectedOrganizations((prev: string[]) =>
        prev.filter((orgId: string) => orgId !== id)
      );
    }
  };

  // Handle bookmark organization if not provided
  const handleBookmarkOrganization = (id: string) => {
    if (onBookmarkOrganization) {
      onBookmarkOrganization(id);
    } else {
      setBookmarkedOrgs((prev) =>
        prev.includes(id) ? prev.filter(orgId => orgId !== id) : [...prev, id]
      );
    }
  };

  return (
    <div className="p-4 mt-4 mb-4 rounded-lg">
      {/* Main container - flex column on mobile, flex row on larger screens */}
      <div className="flex flex-col md:flex-row md:gap-6 w-full">
        {/* Left column - Organizations section */}
        <div className="w-full md:w-3/5 mb-5 md:mb-0">
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
                        <Avatar className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                          {org.imageUrl ? (
                            <AvatarImage src={org.imageUrl} alt={org.name} className="object-cover" />
                          ) : (
                            <AvatarFallback
                              className="rounded-full"
                              style={{ backgroundColor: org.color || "#E5E7EB" }}
                            >
                              {org.name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
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
                  <p className="font-medium text-blue-500">You can add up to 10 more causes to this donation</p>
                  <Link to="/search" className="flex items-center mt-1 text-sm text-blue-600">
                    <span>Discover More</span>
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center mb-4">
                <p className="text-gray-500">No organizations selected</p>
                <button
                  onClick={() => setStep(2)}
                  className="text-blue-600 text-sm font-medium mt-2 inline-block"
                >
                  Go back to add causes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Donation Summary and Checkout */}
        <div className="w-full md:w-2/5 space-y-5">
          {/* Donation summary section */}
          <div className="bg-blue-50 rounded-xl w-full p-6">
            <div className="flex items-center mb-4 rounded-lg">
              <h2 className="text-base font-medium text-gray-800">
                Donation Summary
              </h2>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Monthly donation</span>
                <span className="text-lg font-bold text-blue-600">$7.00</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Number of causes</span>
                <span className="text-sm font-medium text-gray-800">{selectedOrganizations.length}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Per cause</span>
                <span className="text-sm font-medium text-gray-800">
                  ${selectedOrganizations.length > 0
                    ? (7 / selectedOrganizations.length).toFixed(2)
                    : "0.00"}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">TOTAL:</span>
              <span className="text-lg font-bold text-blue-600">$7.00</span>
            </div>
          </div>

          {/* Security message */}
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <p className="text-sm text-gray-600">
              Your donation is protected and guaranteed.{" "}
              <Link to="/settings/about" className="text-blue-600 font-medium">
                Learn More
              </Link>
            </p>
          </div>

          {/* Payment Section */}
          <PaymentSection setCheckout={setCheckout} amount={7} />

          {/* Back button */}
          <button
            onClick={() => setStep(2)}
            className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium py-2"
          >
            ← Back to edit causes
          </button>
        </div>
      </div>
      <div className="h-20 md:hidden"></div>
    </div>
  );
};
