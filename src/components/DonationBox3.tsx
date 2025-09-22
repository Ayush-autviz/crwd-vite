"use client";
import { useState } from "react";
import { CROWDS, RECENTS, SUGGESTED } from "@/constants";
import { Country, State, City } from "country-state-city";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DonationSummaryProps {
  selectedOrganizations: string[];
  setSelectedOrganizations: React.Dispatch<React.SetStateAction<string[]>>;
  setCheckout: (value: boolean) => void;
  onRemoveOrganization?: (id: string) => void;
  onBookmarkOrganization?: (id: string) => void;
  donationAmount: number;
}

export const DonationBox3 = ({
  selectedOrganizations,
  setSelectedOrganizations,
  setCheckout,
  onRemoveOrganization,
  onBookmarkOrganization,
  donationAmount,
}: DonationSummaryProps) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [showCardForm, setShowCardForm] = useState<boolean>(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    zipCode: "",
    state: "",
    country: "",
  });

  console.log(Country.getAllCountries());
  console.log(State.getStatesOfCountry("US"));
  console.log(City.getCitiesOfState("US", "NY"));

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
    }
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    if (method === "apple-pay") {
      setShowCardForm(false);
    } else if (method === "card") {
      setShowCardForm(true);
    }
  };

  // Handle card details input
  const handleCardDetailsChange = (field: string, value: string) => {
    setCardDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/\D/g, "");
    const matches = v.match(/\d{4,16}/g);
    const match = matches?.[0] || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/\D/g, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
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
            {/* Apple Pay Option */}
            <button
              type="button"
              className={`w-full flex items-center p-4 border rounded-lg transition-all cursor-pointer ${
                selectedPaymentMethod === "apple-pay"
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => handlePaymentMethodSelect("apple-pay")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handlePaymentMethodSelect("apple-pay");
                }
              }}
            >
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
              {selectedPaymentMethod === "apple-pay" && (
                <div className="ml-auto">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>

            {/* Credit/Debit Card Option */}
            <button
              type="button"
              className={`w-full flex items-center p-4 border rounded-lg transition-all cursor-pointer ${
                selectedPaymentMethod === "card"
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => handlePaymentMethodSelect("card")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handlePaymentMethodSelect("card");
                }
              }}
            >
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
              {selectedPaymentMethod === "card" && (
                <div className="ml-auto">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>

            {/* Card Details Form */}
            {showCardForm && selectedPaymentMethod === "card" && (
              <div className="mt-4 p-4  rounded-lg border border-gray-200">
                <div className="space-y-4">
                  {/* Card Number */}
                  <div>
                    <label
                      htmlFor="cardNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Card Number
                    </label>
                    <input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        handleCardDetailsChange("cardNumber", formatted);
                      }}
                      maxLength={19}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Expiry Date and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="expiryDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Expiry Date
                      </label>
                      <input
                        id="expiryDate"
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={(e) => {
                          const formatted = formatExpiryDate(e.target.value);
                          handleCardDetailsChange("expiryDate", formatted);
                        }}
                        maxLength={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cvv"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        CVV
                      </label>
                      <input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 4) {
                            handleCardDetailsChange("cvv", value);
                          }
                        }}
                        maxLength={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Country and State */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Country
                      </label>
                      <Select
                        value={cardDetails.country}
                        onValueChange={(value) => {
                          handleCardDetailsChange("country", value);
                          // Reset state when country changes
                          handleCardDetailsChange("state", "");
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {Country.getAllCountries().map((country) => (
                            <SelectItem
                              key={country.isoCode}
                              value={country.isoCode}
                            >
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        State
                      </label>
                      <Select
                        value={cardDetails.state}
                        onValueChange={(value) =>
                          handleCardDetailsChange("state", value)
                        }
                        disabled={!cardDetails.country}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              !cardDetails.country
                                ? "Select Country first"
                                : "Select State"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {cardDetails.country &&
                            State.getStatesOfCountry(cardDetails.country).map(
                              (state) => (
                                <SelectItem
                                  key={state.isoCode}
                                  value={state.isoCode}
                                >
                                  {state.name}
                                </SelectItem>
                              )
                            )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label
                      htmlFor="zipCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Zip Code
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      placeholder="12345"
                      value={cardDetails.zipCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          handleCardDetailsChange("zipCode", value);
                        }
                      }}
                      maxLength={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6 fixed bottom-0 w-calc(100%-16px) left-0 md:left-auto md:w-[calc(100%-320px)] right-0 mx-4">
          <button
            onClick={() => setCheckout(true)}
            disabled={
              !selectedPaymentMethod ||
              (selectedPaymentMethod === "card" &&
                (!cardDetails.cardNumber ||
                  !cardDetails.expiryDate ||
                  !cardDetails.cvv ||
                  !cardDetails.zipCode ||
                  !cardDetails.state ||
                  !cardDetails.country))
            }
            className={`w-full py-4 rounded-lg font-medium transition-colors ${
              !selectedPaymentMethod ||
              (selectedPaymentMethod === "card" &&
                (!cardDetails.cardNumber ||
                  !cardDetails.expiryDate ||
                  !cardDetails.cvv ||
                  !cardDetails.zipCode ||
                  !cardDetails.state ||
                  !cardDetails.country))
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {(() => {
              if (!selectedPaymentMethod) {
                return "Select a payment method";
              }
              if (
                selectedPaymentMethod === "card" &&
                (!cardDetails.cardNumber ||
                  !cardDetails.expiryDate ||
                  !cardDetails.cvv ||
                  !cardDetails.zipCode ||
                  !cardDetails.state ||
                  !cardDetails.country)
              ) {
                return "Complete card details";
              }
              return "Confirm your donation";
            })()}
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
