import React from "react";
import { Check, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

interface DonationSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  donationAmount?: number;
  causeCount?: number;
  setCheckout: (value: boolean) => void;
}

const DonationSuccess: React.FC<DonationSuccessProps> = ({
  isOpen,
  onClose,
  donationAmount = 30,
  causeCount = 3,
  setCheckout,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSeeDonation = () => {
    // Set checkout to true and close modal
    setCheckout(true);
    onClose();
  };

  const handleExploreCrwd = () => {
    // Navigate to explore page or close modal
    onClose();
    navigate("/");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4 min-h-screen">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-6">
        {/* Success Icon and Message */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center">
            <Check size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Donation Successful!
            </h2>
            <p className="text-sm text-gray-600">
              You gave ${donationAmount}/month to {causeCount} causes.
            </p>
          </div>
        </div>

        {/* Donation Summary Card */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <h3 className="font-medium text-gray-900 text-center">
            Donation Summary
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                ${(donationAmount * 0.9).toFixed(2)}
              </span>
              <span className="text-gray-900">Causes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                ${(donationAmount * 0.1).toFixed(2)}
              </span>
              <span className="text-gray-900">CRWD+ Processing</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Distributed every 45 days.
          </p>

          <Button className="w-full py-5" onClick={handleSeeDonation}>
            See Your Donation
          </Button>
        </div>

        {/* Explore CRWD Button */}
        <button
          onClick={handleExploreCrwd}
          className="w-full bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors"
        >
          Explore CRWD
        </button>

        {/* Download App Text */}
        <p className="text-xs text-gray-500 text-center">
          Download the app to track and update anytime.
        </p>
      </div>
    </div>
  );
};

export default DonationSuccess;
