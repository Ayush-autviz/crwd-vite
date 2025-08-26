"use client";

import { useState } from "react";
import DonationBox2 from "./DonationBox2";
import { Minus, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

const DonationFlow = () => {
  const [step, setStep] = useState<"initial" | "selectCauses">("initial");
  const [donationAmount, setDonationAmount] = useState(7);

  // Function to handle moving to the next step
  const handleNext = (amount: number) => {
    setDonationAmount(amount);
    setStep("selectCauses");
  };

  // Function to go back to the initial step
  const handleBack = () => {
    setStep("initial");
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {step === "initial" ? (
        <DonationBoxWrapper onNext={handleNext} />
      ) : (
        //@ts-ignore
        <DonationBox2 initialAmount={donationAmount} onBack={handleBack} />
      )}
    </div>
  );
};

// Wrapper component for DonationBox to handle the Next button click
const DonationBoxWrapper = ({
  onNext,
}: {
  onNext: (amount: number) => void;
}) => {
  const [donationAmount, setDonationAmount] = useState(7);

  const incrementDonation = () => {
    setDonationAmount((prev) => prev + 1);
  };

  const decrementDonation = () => {
    if (donationAmount > 1) {
      setDonationAmount((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header with close button */}
      <div className="flex items-center p-4 border-b">
        <button className="p-1">
          <X size={20} />
        </button>
        <h1 className="text-center flex-1 font-medium">Donation Box</h1>
        <div className="w-5"></div> {/* Spacer for alignment */}
      </div>

      {/* Tab Navigation */}
      <div className="flex mx-4 mt-4 rounded-full overflow-hidden border">
        <button className="flex-1 py-5 px- text-sm font-medium transition-all bg-blue-600 text-white">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-400 mr-2">
              <span className="text-xs text-white">⬆️</span>
            </div>
            Set up donation box
          </div>
        </button>
        <button className="flex-1 py-5 px-4 text-sm font-medium transition-all bg-white text-gray-500">
          One-Time Donation
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 mx-4 mt-4 mb-4 flex flex-col">
        {/* Info Card */}
        <div className="bg-[#f5f6ff] rounded-xl  mb-4">
          <h2 className="text-xl font-medium text-gray-700 px-6 py-3 mb-3 mt-5">
            Welcome to your donation box
          </h2>
          <p className="text-gray-600 text-sm py-3 px-6">
            Your donation box makes giving back easy! Just set your price and
            you can add as many of your favorite causes at any time. Your
            donation will be evenly distributed across all of the organizations
            in your box. Let's get started!
          </p>
          <div className=" bg-[#e6e7f4] rounded-lg p-4 mt-20 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium mb-1">Enter monthly donation</p>
              <p className="text-xs text-gray-500 mb-4">Input amount over $5</p>
            </div>
            <div className="bg-[#dbddf6] flex items-center rounded-full border">
              <button
                onClick={decrementDonation}
                className="flex items-center justify-center w-10 h-10  rounded-full"
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 flex justify-center items-center h-10 0 px-4">
                <span className="text-blue-500 text-2xl font-bold">
                  ${donationAmount}
                </span>
              </div>
              <button
                onClick={incrementDonation}
                className="flex items-center justify-center w-10 h-10  rounded-r-full"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Security Message */}
          <div className="flex items-center mt-4 p-2">
            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-300 mr-2">
              <span className="text-xs">✓</span>
            </div>
            <p className="text-xs text-gray-500">
              Your donation is protected and guaranteed.{" "}
              <Link to="settings/about" className="text-blue-500">
                Learn More
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Next Button Section */}
      <div className="p-4 border-t flex justify-between items-center">
        <p className="text-gray-500">Now let's add some causes</p>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded-full font-medium"
          onClick={() => onNext(donationAmount)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DonationFlow;
