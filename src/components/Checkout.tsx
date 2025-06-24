import { ArrowLeft, ArrowRight, ChevronRight, HelpCircle, Menu, Search } from "lucide-react";
import { useState } from "react";
import type { Organization } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from 'react-router-dom';
import ManageDonationBox from "./ManageDonationBox";
import { CROWDS, RECENTS, SUGGESTED } from "@/constants";
import PaymentSection from "./PaymentSection";

interface DonationOverviewProps {
  donationAmount?: number;
  onBack?: () => void;
  selectedOrganizations: string[];
}

export const Checkout = ({
  donationAmount = 25,
  onBack = () => { },
  selectedOrganizations: selectedOrgIds,
}: DonationOverviewProps) => {
  const [isMonthly] = useState(true);
  const isMobile = useIsMobile();
  const [showManageDonationBox, setShowManageDonationBox] = useState(false);
  const [localSelectedOrgs, setLocalSelectedOrgs] = useState(selectedOrgIds);

  // Get organizations from CROWDS, RECENTS, SUGGESTED based on selectedOrganizations
  const getOrganizationById = (orgId: string): Organization | undefined => {
    return [...CROWDS, ...RECENTS, ...SUGGESTED].find(
      (org) => org.id === orgId
    );
  };

  const selectedOrganizations = localSelectedOrgs
    .map(id => getOrganizationById(id))
    .filter((org): org is Organization => !!org);

  const handleRemoveOrganization = (id: string) => {
    setLocalSelectedOrgs(prev => prev.filter(orgId => orgId !== id));
  };

  // Calculate equal distribution percentage
  const distributionPercentage =
    selectedOrganizations.length > 0 ? Math.floor(100 / selectedOrganizations.length) : 0;

  if (showManageDonationBox) {
    return (
      <ManageDonationBox
        amount={donationAmount}
        causes={selectedOrganizations}
        onBack={() => setShowManageDonationBox(false)}
        onRemove={handleRemoveOrganization}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen p-0 md bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 h-16 flex items-center justify-between">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600">
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
            <div className="text-2xl font-bold">{selectedOrganizations.length}</div>
            <div className="text-sm">Causes</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold">{CROWDS.length}</div>
            <div className="text-sm">CRWDS</div>
          </div>
          <div className="flex-1 flex justify-end items-center pl-4">
            <Button
              onClick={() => setShowManageDonationBox(true)}
              size="sm"
              className="bg-blue-400/30 text-white hover:bg-blue-400/50 rounded-full px-4 py-2"
            >
              Manage →
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

      {/* CROWDS Section */}
      <div className="px-8 mt-2">
        <div className="flex items-center mb-3 ">
          <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide">CRWDS</h2>
          <HelpCircle size={16} className="ml-2 text-gray-500" />
        </div>
        <div className="flex gap-4 mb-8 ">
          {CROWDS.map((crowd) => (
            <div
              key={crowd.id}
              className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: crowd.color || "#e2e8f0",
                backgroundImage: crowd.imageUrl
                  ? `url(${crowd.imageUrl})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span className="text-white text-lg font-semibold">
                {crowd.name[0].split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CAUSES Section */}
      <div className=" flex-1 overflow-auto">
        <h2 className="text-base font-semibold text-gray-700 uppercase mb-4 tracking-wide px-8">
          CAUSES
        </h2>
        <div className="space-y-2 ">
          {selectedOrganizations.map((org) => (
            <div key={org.id} className="flex gap-4 items-center bg-white  px-8 py-4 border-b border-gray-200    ">
              <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden shadow">
                {org.imageUrl ? (
                  <img
                    src={org.imageUrl}
                    alt={org.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-lg font-bold text-white"
                    style={{ backgroundColor: org.color || "#e2e8f0" }}
                  >
                    {org.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-base">{org.name}</h3>
                    {/* <span className="text-xs text-gray-500">
                      {org.name.replace(/\s+/g, "").toLowerCase()}
                    </span> */}
                  </div>
                  <Badge className="bg-gray-100 text-gray-600 font-normal hover:bg-gray-100 rounded-full px-3 py-1 text-xs">
                    {distributionPercentage}% distribution
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                  {org.description ||
                    "This is a non-profit mission statement that summarizes the company's goals"}
                </p>
              </div>
            </div>
          ))}
          <p className="text-sm text-gray-500 text-left mt-4 px-10">
            Add up to 45 more causes to this box
          </p>
          <div className="pt-2 pb-2 text-left px-10">
            <Link to="/search" className="flex items-center gap-1 text-sm text-blue-500  font-semibold">
              Discover more <ChevronRight size={16} />
            </Link>
          </div>
          <div className="h-full flex justify-center items-center ">
            <Link to="/create-crwd">
              <Button variant="link">Create a CRWD</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      {/* <PaymentSection amount={donationAmount} /> */}

      <div className="h-30 md:hidden" />
    </div>
  );
};
