import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { DonationBox3 } from "./DonationBox3";
import OneTimeDonation from "./OneTimeDonation";
import { Checkout } from "./Checkout";

import DonationHeader from "./donation/DonationHeader";
import { Link } from "react-router-dom";

const DonationBox = () => {
  const [activeTab, setActiveTab] = useState<"setup" | "onetime">("setup");
  const [checkout, setCheckout] = useState(false);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([
    "Hunger Initiative",
    "Clean Water Initiative",
  ]);

  const [donationAmount, setDonationAmount] = useState(10);
  const [step, setStep] = useState(1);
  const [inputValue, setInputValue] = useState("10");

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
    const value = e.target.value.replace(/[^0-9]/g, "");
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

  const toggleOrganization = (orgName: string) => {
    setSelectedOrganizations((prev) =>
      prev.includes(orgName)
        ? prev.filter((org) => org !== orgName)
        : [...prev, orgName]
    );
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
                <div className="flex-1 mt-4 flex flex-col p-4 mb-24">
                  {/* Set Monthly Donation Amount Section */}
                  <div className="bg-blue-50 rounded-xl mb-6 p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                      Set monthly donation amount
                    </h2>
                    <p className="text-gray-600 text-sm mb-6">
                      Set one monthly amount and we'll split it across causes
                      you're passionate about. You can edit at any time.
                    </p>

                    {/* Amount Selector */}
                    <div className="flex items-center justify-center mb-6">
                      <button
                        onClick={decrementDonation}
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 hover:bg-gray-200 transition-colors"
                      >
                        <Minus size={20} className="text-gray-600" />
                      </button>
                      <div className="mx-6 text-center">
                        <span className="text-blue-600 text-3xl font-bold">
                          ${donationAmount}
                        </span>
                        <span className="text-gray-500 text-lg ml-2">
                          per month
                        </span>
                      </div>
                      <button
                        onClick={incrementDonation}
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 hover:bg-gray-200 transition-colors"
                      >
                        <Plus size={20} className="text-gray-600" />
                      </button>
                    </div>

                    {/* Slider for fine-tuning */}
                    {/* <div className="relative mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">$5</span>
                        <span className="text-sm font-medium text-gray-600">$100</span>
                      </div>
                      <Range
                        step={1}
                        min={5}
                        max={100}
                        values={[donationAmount]}
                        onChange={(values) => {
                          const newAmount = values[0];
                          setDonationAmount(newAmount);
                          setInputValue(newAmount.toString());
                        }}
                        renderTrack={({ props, children }) => (
                          <div
                            {...props}
                            className="h-2 w-full bg-gray-200 rounded-full"
                            style={{
                              ...props.style,
                            }}
                          >
                            <div
                              className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-out"
                              style={{
                                width: `${Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    ((donationAmount - 5) / 95) * 100
                                  )
                                )}%`,
                              }}
                            />
                            {children}
                          </div>
                        )}
                        renderThumb={({ props }) => (
                          <div
                            {...props}
                            className="w-5 h-5 bg-blue-600 rounded-full shadow-md"
                            style={{
                              ...props.style,
                              cursor: "pointer",
                            }}
                          />
                        )}
                      />
                    </div> */}
                  </div>

                  {/* Choose Organizations Section */}
                  <div className="bg-white rounded-xl mb-6 p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Choose organizations to support
                    </h2>

                    {/* Organization List */}
                    <div className="space-y-4">
                      {/* Hunger Initiative */}
                      <div
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => toggleOrganization("Hunger Initiative")}
                      >
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                          <span className="text-orange-600 font-semibold text-lg">
                            H
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            Hunger Initiative
                          </h3>
                          <p className="text-sm text-gray-600">
                            Fighting hunger in local communities
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            selectedOrganizations.includes("Hunger Initiative")
                              ? "bg-blue-600"
                              : "border-2 border-gray-300"
                          }`}
                        >
                          {selectedOrganizations.includes(
                            "Hunger Initiative"
                          ) && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Clean Water Initiative */}
                      <div
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() =>
                          toggleOrganization("Clean Water Initiative")
                        }
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                          <span className="text-blue-600 font-semibold text-lg">
                            C
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            Clean Water Initiative
                          </h3>
                          <p className="text-sm text-gray-600">
                            Providing clean water access
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            selectedOrganizations.includes(
                              "Clean Water Initiative"
                            )
                              ? "bg-blue-600"
                              : "border-2 border-gray-300"
                          }`}
                        >
                          {selectedOrganizations.includes(
                            "Clean Water Initiative"
                          ) && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Education for All */}
                      <div
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => toggleOrganization("Education for All")}
                      >
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                          <span className="text-green-600 font-semibold text-lg">
                            E
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            Education for All
                          </h3>
                          <p className="text-sm text-gray-600">
                            Quality education access
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            selectedOrganizations.includes("Education for All")
                              ? "bg-blue-600"
                              : "border-2 border-gray-300"
                          }`}
                        >
                          {selectedOrganizations.includes(
                            "Education for All"
                          ) && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Related Section */}
                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Related
                        </h3>

                        {/* Animal Rescue Network */}
                        <div
                          className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() =>
                            toggleOrganization("Animal Rescue Network")
                          }
                        >
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                            <span className="text-purple-600 font-semibold text-lg">
                              A
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">
                              Animal Rescue Network
                            </h3>
                            <p className="text-sm text-gray-600">
                              Rescuing and caring for animals
                            </p>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              selectedOrganizations.includes(
                                "Animal Rescue Network"
                              )
                                ? "bg-blue-600"
                                : "border-2 border-gray-300"
                            }`}
                          >
                            {selectedOrganizations.includes(
                              "Animal Rescue Network"
                            ) && (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary and Next Button */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 fixed bottom-0 w-calc(100%-16px) left-0 md:left-auto md:w-[calc(100%-320px)] right-0 mx-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-semibold text-gray-800">
                          ${donationAmount} per month
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedOrganizations.length} organizations selected
                        </p>
                      </div>
                      <button
                        onClick={() => setStep(2)}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors hover:bg-blue-700 flex items-center"
                      >
                        Next
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ml-2"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : // ) : step === 2 ? (
              //   //@ts-ignore
              //   <DonationBox2
              //     step={step}
              //     selectedOrganizations={selectedOrganizations}
              //     setSelectedOrganizations={setSelectedOrganizations}
              //     setStep={setStep}
              //   />
              step === 2 ? (
                //@ts-ignore
                <DonationBox3
                  setCheckout={setCheckout}
                  step={step}
                  selectedOrganizations={selectedOrganizations}
                  setSelectedOrganizations={setSelectedOrganizations}
                  setStep={setStep}
                  donationAmount={donationAmount}
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
                        <Link to="/settings/about" className="text-blue-500">
                          Learn More
                        </Link>
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
