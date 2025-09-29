import { ArrowLeft, ChevronLeft, HelpCircle, Settings, X } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ManageDonationBox from "./ManageDonationBox";
import { CROWDS, RECENTS, SUGGESTED } from "@/constants";
import ReactConfetti from "react-confetti";

interface DonationOverviewProps {
  donationAmount?: number;
  onBack?: () => void;
  selectedOrganizations: string[];
}

export const Checkout = ({
  donationAmount = 25,
  onBack = () => {},
  selectedOrganizations: selectedOrgIds,
}: DonationOverviewProps) => {
  const [showManageDonationBox, setShowManageDonationBox] = useState(false);
  const [localSelectedOrgs, setLocalSelectedOrgs] = useState(selectedOrgIds);
  const [showAddMoreCauses, setShowAddMoreCauses] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Show success modal when component mounts
  useEffect(() => {
    setShowSuccessModal(true);

    // Update window dimensions on resize for confetti
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Use organization names directly (like DonationBox3)
  const selectedOrganizations = localSelectedOrgs;

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

  // Calculate equal distribution percentage
  const distributionPercentage =
    selectedOrganizations.length > 0
      ? Math.floor(100 / selectedOrganizations.length)
      : 0;

  if (showManageDonationBox) {
    // Convert organization names to Organization objects for ManageDonationBox
    const causesAsObjects = selectedOrganizations.map(
      (orgName: string, index: number) => ({
        id: `${orgName}-${index}`,
        name: orgName,
        imageUrl: "",
        color: getOrganizationColor(orgName),
        description: getOrganizationDescription(orgName),
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
        amount={donationAmount}
        causes={causesAsObjects}
        onBack={() => setShowManageDonationBox(false)}
        onRemove={handleRemoveFromManageBox}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white min-h-screen p-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 h-16 flex items-center">
        <button
          onClick={() => onBack()}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mr-2 cursor-pointer"
          aria-label="Go back"
        >
          {/* <ArrowLeft size={20} /> */}
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          Donation Box
        </h1>
        <div className="w-10"></div> {/* Empty div for alignment */}
      </div>

      {/* Blue Card */}
      <div className="bg-blue-600 text-white p-5 pb-8 mx-4 mt-4 rounded-xl shadow-md mb-6">
        <div className="flex flex-col items-center mt-2">
          <div className="text-5xl font-bold mb-1">${donationAmount}</div>
          <div className="text-base flex items-center gap-1">
            per month <HelpCircle size={16} />
          </div>
        </div>
        <div className="flex mt-8 mb-2 divide-x divide-white/20">
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold">
              {selectedOrganizations.length}
            </div>
            <div className="text-sm">Causes</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold">2</div>
            <div className="text-sm">CRWDS</div>
          </div>
          <div className="flex-1 flex justify-center items-center pl-4">
            <Button
              onClick={() => setShowManageDonationBox(true)}
              size="sm"
              className="bg-blue-400/30 text-white hover:bg-blue-400/50 rounded-md px-4 py-2 flex items-center gap-1"
            >
              <Settings size={16} />
              Manage
            </Button>
          </div>
        </div>
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

      {/* CAUSES Section */}
      <div className="flex-1 overflow-auto">
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
        <div className="mx-8 mb-6">
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
        </div>
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
                        ${donationAmount}/month
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Supporting {selectedOrganizations.length} nonprofits with your
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
