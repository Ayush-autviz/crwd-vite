import { useState } from "react";
import { ArrowRight, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { CROWDS, RECENTS, SUGGESTED } from "@/constants";
import { Switch } from "@/components/ui/switch"
import type { Organization } from "@/lib/types";

interface DonationBox2Props {
  initialAmount?: number;
  onBack?: () => void;
  step?: number;
  setStep: (step: number) => void;
  selectedOrganizations: string[];
  setSelectedOrganizations: React.Dispatch<React.SetStateAction<string[]>>;
}

const DonationBox2 = ({
  setStep,
  selectedOrganizations,
  setSelectedOrganizations,
}: DonationBox2Props) => {
  const [donationAmount] = useState(7);

  // Function to toggle selection of an organization
  const toggleOrganization = (orgId: string) => {
    setSelectedOrganizations((prev: string[]) =>
      prev.includes(orgId)
        ? prev.filter((id: string) => id !== orgId)
        : [...prev, orgId]
    );
  };

  // Function to get organization by ID
  const getOrganizationById = (orgId: string): Organization | undefined => {
    return [...CROWDS, ...RECENTS, ...SUGGESTED].find(
      (org) => org.id === orgId
    );
  };

  // Function to remove an organization from selected list
  const removeOrganization = (orgId: string) => {
    setSelectedOrganizations((prev: string[]) => prev.filter((id: string) => id !== orgId));
  };

  // Get all selected organizations objects
  const selectedOrgs = selectedOrganizations
    .map((id: string) => getOrganizationById(id))
    .filter((org): org is Organization => !!org);

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* We'll use the DonationHeader component from the parent instead */}

      <div className="flex-1 overflow-auto mt-2 mx-4">
        {/* Step indicator */}
        {/* <StepIndicator currentStep={2} /> */}

        {/* Main content container - flex column on mobile, grid on larger screens */}
        <div className="md:grid md:grid-cols-12 md:gap-6">
          {/* Left column - Donation Amount and Selected Causes */}
          <div className="md:col-span-5 space-y-4 order-first md:order-last">
            {/* Donation Amount Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-4 md:mt-0 mb-4 md:mb-4">
              <div className="flex justify-center items-center mb-4">
                <h2 className="text-lg text-center font-medium text-gray-800">Add Causes</h2>
              </div>

              <div className="mx-auto w-fit items-center justify-between bg-blue-50 rounded-lg px-4 py-3 mb-4">
                <span className="text-blue-600 text-xl font-bold px-4 py-1">
                  ${donationAmount}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2 mx-auto w-fit">
                You can add up to 10 more causes to your donation box
              </p>
            </div>

            {/* Selected Organizations List - Always visible regardless of screen size */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
              <div className="flex items-center mb-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <h2 className="text-sm font-medium text-gray-800">Selected Causes ({selectedOrgs.length})</h2>
              </div>
              {selectedOrgs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedOrgs.map((org) => (
                    <Badge
                      key={org.id}
                      variant="outline"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 border-blue-100 text-blue-700"
                    >
                      {org.name}
                      <button
                        onClick={() => removeOrganization(org.id)}
                        className="ml-1 bg-blue-100 hover:bg-blue-200 rounded-full p-1 transition-colors"
                        aria-label={`Remove ${org.name}`}
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">No causes selected yet</p>
              )}
            </div>

            {/* Confirm button - visible on both mobile and desktop */}
            <div className="w-full mb-4 hidden md:block">
              <Button
                onClick={() => setStep(3)}
                disabled={selectedOrgs.length === 0}
                className="bg-green-500 hover:bg-green-600 text-black w-full py-6 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </Button>
            </div>
          </div>

          {/* Right column - CROWDS, Recents, and Suggested */}
          <div className="md:col-span-7">
            {/* CROWDS Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
              <div className="flex items-center mb-3">
                <h2 className="text-sm font-medium text-gray-800">
                  Select from your CRWDS
                </h2>
              </div>
              <div className="flex flex-wrap gap-3 pb-2 px-1">
                {CROWDS.map((org) => (
                  <button
                    key={org.id}
                    className={cn(
                      "flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg relative shadow-sm transition-all",
                      org.color ? `bg-[${org.color}]` : "bg-cover bg-center",
                      selectedOrganizations.includes(org.id)
                        ? "ring-2 ring-blue-500 scale-105"
                        : "hover:scale-105"
                    )}
                    style={{
                      backgroundColor: org.color || undefined,
                      backgroundImage:
                        org.imageUrl && !org.color
                          ? `url(${org.imageUrl})`
                          : undefined,
                    }}
                    onClick={() => toggleOrganization(org.id)}
                  >
                    {org.shortDesc && (
                      <span className="text-white text-xs font-medium">{org.shortDesc}</span>
                    )}
                    {selectedOrganizations.includes(org.id) && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs shadow-sm">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Recents and Suggested Section - Scrollable as a whole */}
            <div className="bg-blue-50 rounded-xl">
              <div className="bg-blue-100 rounded-xl border mb-4 overflow-hidden">
                {/* Scrollable container for both sections */}
                <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  {/* Recents Section */}
                  <div className="p-4 bg-blue-100 z-10 border-b">
                    <div className="flex items-center">
                      <h2 className="text-sm font-medium text-gray-800">
                        Select from your Recents
                      </h2>
                    </div>
                  </div>

                  {/* Recents Cards - Grid on larger screens */}
                  <div className="px-4 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {RECENTS.map((org) => (
                        <div
                          key={org.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg transition-colors",
                            selectedOrganizations.includes(org.id)
                              ? "bg-blue-50"
                              : "hover:bg-blue-200"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 bg-gray-100 rounded-md">
                              <img src={org.imageUrl || "/redcross.png"} alt="" className="rounded-md" />
                            </Avatar>
                            <span className="text-sm font-medium text-gray-700">{org.name}</span>
                          </div>
                          {/* <Checkbox
                            checked={selectedOrganizations.includes(org.id)}
                            onCheckedChange={() => toggleOrganization(org.id)}
                            className={cn(
                              "h-5 w-5 border-gray-300 rounded-full",
                              selectedOrganizations.includes(org.id) && "border-blue-500 bg-blue-500"
                            )}
                          /> */}
                          <Switch
                            checked={selectedOrganizations.includes(org.id)}
                            onCheckedChange={() => toggleOrganization(org.id)}
                            className={cn(
                              "h-5 border-gray-300 rounded-full",
                              selectedOrganizations.includes(org.id) && "border-blue-500 bg-blue-500"
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* More Suggested Section */}
                  <div className="p-4 bg-blue-100 z-10 border-b border-t">
                    <div className="flex items-center">
                      <h2 className="text-sm font-medium text-gray-800">More Suggested</h2>
                    </div>
                  </div>

                  {/* Suggested Cards - Grid on larger screens */}
                  <div className="px-4 py-2 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {SUGGESTED.map((org) => (
                        <div
                          key={org.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg transition-colors",
                            selectedOrganizations.includes(org.id)
                              ? "bg-blue-50"
                              : "hover:bg-blue-200"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 bg-gray-100 rounded-md">
                              <img src={org.imageUrl || "/redcross.png"} alt="" className="rounded-md" />
                            </Avatar>
                            <span className="text-sm font-medium text-gray-700">{org.name}</span>
                          </div>
                          {/* <Checkbox
                            checked={selectedOrganizations.includes(org.id)}
                            onCheckedChange={() => toggleOrganization(org.id)}
                            className={cn(
                              "h-5 w-5 border-gray-300 rounded-full",
                              selectedOrganizations.includes(org.id) && "border-blue-500 bg-blue-500 "
                            )}
                          /> */}
                          <Switch
                            checked={selectedOrganizations.includes(org.id)}
                            onCheckedChange={() => toggleOrganization(org.id)}
                            className={cn(
                              "h-5 border-gray-300 rounded-full",
                              selectedOrganizations.includes(org.id) && "border-blue-500 bg-blue-500"
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Discover more link */}
              <div className="my-4 pb-4 text-right px-6">
                <Link
                  to="/search"
                  className="text-blue-500 text-sm flex items-center justify-end"
                >
                  Discover more <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>




            </div>
            <div className="w-full mb-4  md:hidden">
              <Button
                onClick={() => setStep(3)}
                disabled={selectedOrgs.length === 0}
                className="bg-green-500 hover:bg-green-600 text-black w-full py-6 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for mobile */}
      <div className="h-24 md:hidden"></div>
    </div>
  );
};

export default DonationBox2;
