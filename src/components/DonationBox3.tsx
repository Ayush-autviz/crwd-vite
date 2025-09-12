// "use client";
// import { useState } from "react";
// import { Bookmark, Trash2, ChevronRight } from "lucide-react";
// import { Avatar } from "@/components/ui/avatar";
// import { AvatarImage } from "@/components/ui/avatar";
// import { AvatarFallback } from "@/components/ui/avatar";
// import { CROWDS, RECENTS, SUGGESTED } from "@/constants";
// import { Button } from "./ui/button";
// import { Link } from 'react-router-dom';
// import PaymentSection from "./PaymentSection";

// // Define Organization type locally
// type Organization = {
//   id: string;
//   name: string;
//   imageUrl: string;
//   color?: string;
//   shortDesc?: string;
//   description?: string;
// };

// interface DonationSummaryProps {
//   selectedOrganizations: string[];
//   setSelectedOrganizations: React.Dispatch<React.SetStateAction<string[]>>;
//   step?: number;
//   setCheckout: (value: boolean) => void;
//   onRemoveOrganization?: (id: string) => void;
//   onBookmarkOrganization?: (id: string) => void;
//   setStep: (step: number) => void;
// }

// export const DonationBox3 = ({
//   selectedOrganizations,
//   setSelectedOrganizations,
//   setCheckout,
//   onRemoveOrganization,
//   onBookmarkOrganization,
//   setStep,
// }: DonationSummaryProps) => {
//   const [bookmarkedOrgs, setBookmarkedOrgs] = useState<string[]>([]);

//   const getOrganizationById = (orgId: string): Organization | undefined => {
//     return [...CROWDS, ...RECENTS, ...SUGGESTED].find(
//       (org) => org.id === orgId
//     );
//   };

//   const selectedOrgs = selectedOrganizations
//     .map((id) => getOrganizationById(id))
//     .filter((org): org is Organization => !!org);

//   // Handle remove organization if not provided
//   const handleRemoveOrganization = (id: string) => {
//     if (onRemoveOrganization) {
//       onRemoveOrganization(id);
//     } else {
//       setSelectedOrganizations((prev: string[]) =>
//         prev.filter((orgId: string) => orgId !== id)
//       );
//     }
//   };

//   // Handle bookmark organization if not provided
//   const handleBookmarkOrganization = (id: string) => {
//     if (onBookmarkOrganization) {
//       onBookmarkOrganization(id);
//     } else {
//       setBookmarkedOrgs((prev) =>
//         prev.includes(id) ? prev.filter(orgId => orgId !== id) : [...prev, id]
//       );
//     }
//   };

//   return (
//     <div className="p-4 mt-4 mb-4 rounded-lg">
//       {/* Main container - flex column on mobile, flex row on larger screens */}
//       <div className="flex flex-col md:flex-row md:gap-6 w-full">
//         {/* Left column - Organizations section */}
//         <div className="w-full md:w-3/5 mb-5 md:mb-0">
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
//             <div className="flex items-center mb-4">
//               <h1 className="text-xl font-medium text-gray-800">
//                 Your donation will support
//               </h1>
//             </div>

//             {selectedOrgs.length > 0 ? (
//               <div className="space-y-4 mb-4">
//                 {selectedOrgs.map((org) => (
//                   <div key={org.id} className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
//                     <div className="flex items-start justify-between">
//                       <div className="flex gap-4">
//                         <Avatar className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
//                           {org.imageUrl ? (
//                             <AvatarImage src={org.imageUrl} alt={org.name} className="object-cover" />
//                           ) : (
//                             <AvatarFallback
//                               className="rounded-full"
//                               style={{ backgroundColor: org.color || "#E5E7EB" }}
//                             >
//                               {org.name.charAt(0)}
//                             </AvatarFallback>
//                           )}
//                         </Avatar>
//                         <div className="space-y-1">
//                           <h3 className="font-medium text-gray-800">{org.name}</h3>
//                           <p className="text-sm text-gray-600 line-clamp-2">
//                             {org.description || "This is a non-profit mission statement that aligns with the company's goals and..."}
//                           </p>
//                         </div>
//                       </div>
//                       <button
//                         className={`${bookmarkedOrgs.includes(org.id) ? 'text-blue-500' : 'text-gray-400'} hover:text-blue-500 transition-colors`}
//                         onClick={() => handleBookmarkOrganization(org.id)}
//                       >
//                         <Bookmark size={20} />
//                       </button>
//                     </div>
//                     <div className="flex justify-end mt-3">
//                       <button
//                         className="text-xs text-gray-600 hover:text-red-500 flex items-center px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
//                         onClick={() => handleRemoveOrganization(org.id)}
//                       >
//                         <Trash2 size={12} className="mr-1" />
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 ))}

//                 <div className="text-sm text-blue-600 rounded-lg">
//                   <p className="font-medium text-blue-500">You can add up to 10 more causes to this donation</p>
//                   <Link to="/search" className="flex items-center mt-1 text-sm text-blue-600">
//                     <span>Discover More</span>
//                     <ChevronRight size={16} className="ml-1" />
//                   </Link>
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-gray-50 rounded-lg p-4 text-center mb-4">
//                 <p className="text-gray-500">No organizations selected</p>
//                 <button
//                   onClick={() => setStep(2)}
//                   className="text-blue-600 text-sm font-medium mt-2 inline-block"
//                 >
//                   Go back to add causes
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Right column - Donation Summary and Checkout */}
//         <div className="w-full md:w-2/5 space-y-5">
//           {/* Donation summary section */}
//           <div className="bg-blue-50 rounded-xl w-full p-6">
//             <div className="flex items-center mb-4 rounded-lg">
//               <h2 className="text-base font-medium text-gray-800">
//                 Donation Summary
//               </h2>
//             </div>

//             <div className="bg-white rounded-lg p-4 mb-4 border border-gray-100">
//               <div className="flex justify-between items-center mb-3">
//                 <span className="text-sm text-gray-600">Monthly donation</span>
//                 <span className="text-lg font-bold text-blue-600">$7.00</span>
//               </div>
//               <div className="flex justify-between items-center mb-3">
//                 <span className="text-sm text-gray-600">Number of causes</span>
//                 <span className="text-sm font-medium text-gray-800">{selectedOrganizations.length}</span>
//               </div>
//               <div className="flex justify-between items-center pt-3 border-t border-gray-200">
//                 <span className="text-sm font-medium text-gray-700">Per cause</span>
//                 <span className="text-sm font-medium text-gray-800">
//                   ${selectedOrganizations.length > 0
//                     ? (7 / selectedOrganizations.length).toFixed(2)
//                     : "0.00"}
//                 </span>
//               </div>
//             </div>

//             <div className="flex justify-between items-center p-3 border-b border-gray-200">
//               <span className="text-sm font-medium text-gray-700">TOTAL:</span>
//               <span className="text-lg font-bold text-blue-600">$7.00</span>
//             </div>
//           </div>

//           {/* Security message */}
//           <div className="flex items-center p-3 bg-gray-50 rounded-lg">
//             <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 mr-2">
//               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
//             </div>
//             <p className="text-sm text-gray-600">
//               Your donation is protected and guaranteed.{" "}
//               <Link to="/settings/about" className="text-blue-600 font-medium">
//                 Learn More
//               </Link>
//             </p>
//           </div>

//           {/* Payment Section */}
//           <PaymentSection setCheckout={setCheckout} amount={7} />

//           {/* Back button */}
//           <button
//             onClick={() => setStep(2)}
//             className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium py-2"
//           >
//             ← Back to edit causes
//           </button>
//         </div>
//       </div>
//       <div className="h-20 md:hidden"></div>
//     </div>
//   );
// };

"use client";
import { useState } from "react";
import { CROWDS, RECENTS, SUGGESTED } from "@/constants";

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
  donationAmount: number;
}

export const DonationBox3 = ({
  selectedOrganizations,
  setSelectedOrganizations,
  setCheckout,
  onRemoveOrganization,
  onBookmarkOrganization,
  setStep,
  donationAmount,
}: DonationSummaryProps) => {
  const [bookmarkedOrgs, setBookmarkedOrgs] = useState<string[]>([]);

  const getOrganizationById = (orgId: string): Organization | undefined => {
    return [...CROWDS, ...RECENTS, ...SUGGESTED].find(
      (org) => org.id === orgId
    );
  };

  const getOrganizationDescription = (orgName: string): string => {
    // Try to find organization by name first
    const org = [...CROWDS, ...RECENTS, ...SUGGESTED].find(
      (org) => org.name === orgName
    );

    if (org && org.description) {
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
    } else {
      setBookmarkedOrgs((prev) =>
        prev.includes(orgName)
          ? prev.filter((name) => name !== orgName)
          : [...prev, orgName]
      );
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col pb-24">
      <div className="flex-1 overflow-auto mt-2 mx-4">
        {/* Selected Organizations Section */}
        <div className="bg-white rounded-xl mb-6 p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Selected Organizations
          </h2>

          {/* Organization List */}
          <div className="space-y-4">
            {selectedOrganizations.map((orgName: string, index: number) => (
              <div
                key={`${orgName}-${index}`}
                className="flex items-center p-4 border border-gray-200 rounded-lg"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold text-lg">
                    {orgName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{orgName}</h3>
                  <p className="text-sm text-gray-600">
                    {getOrganizationDescription(orgName)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => handleBookmarkOrganization(orgName)}
                  >
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
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemoveOrganization(orgName)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution Details */}
        <div className="bg-blue-50 rounded-xl mb-6 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Distribution
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            Your ${donationAmount} becomes ${(donationAmount * 0.9).toFixed(2)}{" "}
            after fees, split evenly across causes. Your donation will be evenly
            distributed across all {selectedOrganizations.length} organizations.
          </p>
          <div className="  text-blue-500 ">
            <span className="font-semibold">
              Each organization receives: $
              {selectedOrganizations.length > 0
                ? (donationAmount / selectedOrganizations.length).toFixed(2)
                : "0.00"}{" "}
              per month
            </span>
          </div>
        </div>

        {/* Add More Button */}
        {/* <div className="mb-6">
          <button className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors hover:bg-gray-300">
            Add More
          </button>
        </div> */}

        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl mb-6 p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Select Payment Method
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Choose a payment method to complete your donation.
          </p>

          <div className="space-y-3">
            <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
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
            </div>

            <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
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
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6 fixed bottom-0  w-calc(100%-16px) left-0 md:left-auto md:w-[calc(100%-320px)] right-0 mx-4">
          <button
            onClick={() => setCheckout(true)}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium transition-colors hover:bg-blue-700"
          >
            Confirm your donation
          </button>
          {/* <button className="w-full bg-gray-200 text-black py-3 rounded-lg font-medium transition-colors hover:bg-gray-300">
            Not Now
          </button> */}
        </div>
      </div>

      {/* Spacer for mobile */}
      {/* <div className="h-24 md:hidden"></div> */}
    </div>
  );
};
