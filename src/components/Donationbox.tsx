import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import DonationBox2 from "./DonationBox2";
import { DonationBox3 } from "./DonationBox3";
import OneTimeDonation from "./OneTimeDonation";
import { Checkout } from "./Checkout";

import DonationHeader from "./donation/DonationHeader";
import StepIndicator from "./donation/StepIndicator";
import { Link } from 'react-router-dom';


const DonationBox = () => {
  const [activeTab, setActiveTab] = useState<"setup" | "onetime">("setup");
  const [checkout, setCheckout] = useState(false);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(
    []
  );

  const [donationAmount, setDonationAmount] = useState(7);
  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("7");

  // const step = 2;
  const isMobile = useIsMobile();

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
    setIsEditing(false);
    // Convert to number and ensure minimum value is 1
    const numValue = parseInt(inputValue) || 1;
    // Ensure minimum donation is $5
    const finalValue = numValue < 5 ? 5 : numValue;
    setDonationAmount(finalValue);
    setInputValue(finalValue.toString());
  };

  const handleInputFocus = () => {
    setIsEditing(true);
  };

  console.log(selectedOrganizations, "ork");

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {checkout ? (
        <Checkout 
          onBack={() => setCheckout(false)} 
          selectedOrganizations={selectedOrganizations}
          donationAmount={donationAmount}
        />
      ) : (
        <>
          {/* Header with title and back/close button */}
          <DonationHeader
            title="Donation Box"
            step={step}
            showBackButton={step > 1 && activeTab !== "onetime"}
            showCloseButton={step === 1 || activeTab === "onetime"}
            onBack={() => setStep((s) => s - 1)}
          />

          {/* Step indicator for donation box setup */}


          {/* Tab Navigation */}
          <div className="mx-4 mt-4">
            <div className="flex rounded-xl overflow-hidden border bg-white shadow-sm">
              <button
                className={cn(
                  "flex-1 py-4 text-sm font-medium transition-all relative",
                  activeTab === "setup"
                    ? "text-white bg-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => {
                  setActiveTab("setup");
                  setStep(1);
                }}
              >
                <div className="flex items-center justify-center">
                  {/* <span className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full mr-2 text-xs",
                    activeTab === "setup" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                  )}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </span> */}
                  Set up donation box
                </div>
                {activeTab === "setup" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
                )}
              </button>
              <button
                className={cn(
                  "flex-1 py-4 text-sm font-medium transition-all relative",
                  activeTab === "onetime"
                    ? "text-white bg-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => setActiveTab("onetime")}
              >
                <div className="flex items-center justify-center">
                  {/* <span className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full mr-2 text-xs",
                    activeTab === "onetime" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                  )}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </span> */}
                  One-Time Donation
                </div>
                {activeTab === "onetime" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
                )}
              </button>
            </div>
          </div>

          {/* Main Content */}

          {activeTab === "onetime" ? (
            <>
              <OneTimeDonation
                setCheckout={setCheckout}
                selectedOrganizations={selectedOrganizations}
                setSelectedOrganizations={setSelectedOrganizations}
              />
            </>
          ) : (
            <>
              {step === 1 ? (
                <div className="flex-1 mt-4 mb-4 flex flex-col p-4">
                  {/* Step indicator */}
                  {/* <StepIndicator currentStep={1} /> */}

                  {/* Info Card */}
                  <div className="bg-white rounded-xl mb-6 p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      </div>
                      <h2 className="text-xl font-medium text-gray-800">
                        Welcome to your donation box
                      </h2>
                    </div>

                    <p className="text-gray-600 text-sm mb-6">
                      Your donation box makes giving back easy! Just set your
                      price and you can add as many of your favorite causes at
                      any time. Your donation will be evenly distributed across
                      all of the organizations in your box.
                    </p>

                    <div className="bg-blue-50 rounded-lg p-5 mb-4">
                      <h3 className="text-base font-medium text-gray-800 mb-3">
                        Enter monthly donation
                      </h3>

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
                              onFocus={handleInputFocus}
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

                    {/* Security Message */}
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </div>
                      <p className="text-sm text-gray-600">
                        Your donation is protected and guaranteed.{" "}
                        <Link to="/settings/about" className="text-blue-600 font-medium">Learn More</Link>
                      </p>
                    </div>
                  </div>

                  <div className={`flex justify-between items-center ${isMobile ? "mb-20" : ""}`}>
                    <p className="text-gray-600">Now let's add some causes</p>
                    <button
                      onClick={() => setStep(2)}
                      className="bg-green-400  text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                    >
                      Next
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              ) : step === 2 ? (
                //@ts-ignore
                <DonationBox2
                  step={step}
                  selectedOrganizations={selectedOrganizations}
                  setSelectedOrganizations={setSelectedOrganizations}
                  setStep={setStep}
                />
              ) : step === 3 ? (
                //@ts-ignore
                <DonationBox3
                  setCheckout={setCheckout}
                  step={step}
                  selectedOrganizations={selectedOrganizations}
                  setSelectedOrganizations={setSelectedOrganizations}
                  setStep={setStep}
                />
              ) : (
                <div className="flex-1 mx-4 mt-4 mb-4 flex flex-col">
                  {/* Info Card */}
                  <div className="bg-[#f5f6ff] rounded-xl  mb-4 ">
                    <h2 className="text-xl font-medium text-gray-700  py-1 my-2">
                      Welcome to your donation box
                    </h2>
                    <p className="text-gray-600 text-sm py-3 ">
                      Your donation box makes giving back easy! Just set your
                      price and you can add as many of your favorite causes at
                      any time. Your donation will be evenly distributed across
                      all of the organizations in your box. Let's get started!
                    </p>
                    <div className=" bg-[#e6e7f4] rounded-lg mt-6  flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium mb-1">
                          Enter monthly donation
                        </p>
                        <p className="text-xs text-gray-500 ">
                          Input amount over $5
                        </p>
                      </div>
                      <div className="bg-[#dbddf6] flex items-center rounded-full border">
                        <button
                          onClick={decrementDonation}
                          className="flex items-center justify-center w-10 h-10  rounded-full"
                        >
                          <Minus size={16} />
                        </button>
                        <div className="flex-1 flex justify-center items-center h-10 px-4">
                          <span className="text-blue-500 text-2xl font-bold relative">
                            $
                            <input
                              type="text"
                              value={inputValue}
                              onChange={handleInputChange}
                              onBlur={handleInputBlur}
                              onFocus={handleInputFocus}
                              className="bg-transparent w-16 text-center focus:outline-none"
                              aria-label="Donation amount"
                            />
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
                        <Link to="/settings/about" className="text-blue-500">Learn More</Link>
                      </p>
                    </div>
                  </div>
                  <div
                    className={`p-4 flex justify-between items-center ${
                      isMobile ? "mb-20" : ""
                    }`}
                  >
                    <p className={`text-gray-500`}>Now let's add some causes</p>
                    <button
                      onClick={() => setStep(2)}
                      className={`bg-green-500 text-white px-6 py-2 rounded-full font-medium `}
                    >
                      Next
                    </button>
                  </div>
                  {/* Donation Amount Selector */}
                </div> // Optional default
              )}
            </>
          )}
        </>
      )}

      {/* Header with close button */}

      {/* Next Button Section */}
    </div>
  );
};

export default DonationBox;
