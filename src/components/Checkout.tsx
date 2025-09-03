import { ArrowLeft, HelpCircle, Settings } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ManageDonationBox from "./ManageDonationBox";
import { CROWDS, RECENTS, SUGGESTED } from "@/constants";

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
      <div className="bg-white border-b border-gray-200 p-4 h-16 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold text-lg">Donation Box</h1>
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
              Want to give together? Turn this into a CRWD
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
              Add up to 45 more causes to this box
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
              <Button
                variant="outline"
                className="flex-1 text-blue-600 border-blue-200 bg-white hover:bg-blue-50"
                onClick={() => setShowAddMoreCauses(!showAddMoreCauses)}
              >
                + Add More Causes
              </Button>
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
      </div>

      {/* Payment Section */}
      {/* <PaymentSection amount={donationAmount} /> */}

      <div className="h-30 md:hidden" />
    </div>
  );
};
