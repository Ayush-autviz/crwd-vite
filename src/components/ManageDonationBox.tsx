import React from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  CreditCard,
  DollarSign,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Define Organization type locally to avoid import issues
type Organization = {
  id: string;
  name: string;
  imageUrl: string;
  color?: string;
  shortDesc?: string;
  description?: string;
  via?: string;
};

interface ManageDonationBoxProps {
  amount: number;
  causes: Organization[];
  onBack: () => void;
  onRemove?: (id: string) => void;
}

const ManageDonationBox: React.FC<ManageDonationBoxProps> = ({
  amount,
  causes,
  onBack,
  onRemove,
}) => {
  const [editableAmount, setEditableAmount] = React.useState(amount);
  const [isEditingAmount, setIsEditingAmount] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [temporarilyRemovedCauses, setTemporarilyRemovedCauses] =
    React.useState<string[]>([]);

  const incrementAmount = () => {
    setEditableAmount((prev) => prev + 1);
  };

  const decrementAmount = () => {
    if (editableAmount > 1) {
      setEditableAmount((prev) => prev - 1);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value === "") {
      setEditableAmount(0);
    } else {
      setEditableAmount(parseInt(value));
    }
  };

  const handleRemove = (id: string) => {
    // Temporarily remove the cause
    setTemporarilyRemovedCauses((prev) => [...prev, id]);
  };

  const handleEditCauses = () => {
    if (isEditMode) {
      // "Done Editing" clicked - restore temporarily removed causes
      setTemporarilyRemovedCauses([]);
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = () => {
    // Permanently remove the causes
    temporarilyRemovedCauses.forEach((id) => {
      if (onRemove) {
        onRemove(id);
      }
    });
    // Clear the temporarily removed causes
    setTemporarilyRemovedCauses([]);
    setIsEditMode(false);
  };

  // Filter out temporarily removed causes for display
  const visibleCauses = causes.filter(
    (cause) => !temporarilyRemovedCauses.includes(cause.id)
  );

  return (
    <div className="w-full min-h-screen bg-white flex flex-col ">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 h-16 p-4 flex items-center">
        <button
          onClick={() => onBack()}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mr-2 cursor-pointer"
          aria-label="Go back"
        >
          {/* <ArrowLeft size={20} /> */}
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          Manage Donation Box
        </h1>
        <div className="w-10"></div> {/* Empty div for alignment */}
      </div>

      {/* Blue Card */}
      <div className="bg-blue-600 rounded-xl px-4 py-6 mx-4 mt-4 relative">
        <Link
          to="/transaction-history"
          className="absolute right-4 top-4 text-xs text-white/80 underline"
        >
          See full transaction history
        </Link>
        <div className="flex flex-col items-center mt-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={decrementAmount}
              className="bg-white/20 rounded-full p-2 text-white hover:bg-white/30 transition"
            >
              <Minus size={20} />
            </button>
            {isEditingAmount ? (
              <input
                type="text"
                value={editableAmount}
                onChange={handleAmountChange}
                onBlur={() => setIsEditingAmount(false)}
                autoFocus
                className="text-4xl font-bold text-white bg-transparent border-b border-white/30 w-24 text-center focus:outline-none"
              />
            ) : (
              <button
                className="text-4xl font-bold text-white cursor-pointer bg-transparent border-none p-0"
                onClick={() => setIsEditingAmount(true)}
                type="button"
              >
                ${editableAmount}
              </button>
            )}
            <button
              onClick={incrementAmount}
              className="bg-white/20 rounded-full p-2 text-white hover:bg-white/30 transition"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="text-white/80 text-sm mb-6">
            on the 26th of every month
          </div>
          <div className="flex w-full max-w-xs justify-between gap-2">
            <button
              className="flex flex-col items-center flex-1 bg-white/10 rounded-xl py-3 text-white hover:bg-white/20 transition"
              onClick={() => setIsEditingAmount(true)}
            >
              <DollarSign size={22} className="mb-1" />
              <span className="text-xs">Edit amount</span>
            </button>
            <Link
              to="/settings/payments"
              className="flex flex-col items-center flex-1 bg-white/10 rounded-xl py-3 text-white hover:bg-white/20 transition"
            >
              <CreditCard size={22} className="mb-1" />
              <span className="text-xs">Edit payment</span>
            </Link>
          </div>
        </div>
      </div>
      {/* Causes List */}
      <div className="flex-1 mt-4 overflow-auto">
        <h2 className="text-base font-semibold text-gray-700 uppercase mb-4 tracking-wide px-8">
          CAUSES
        </h2>
        <div className="space-y-4 px-8">
          {visibleCauses.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 items-center">
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
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {org.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        @{org.name.replace(/\s+/g, "").toLowerCase()}
                      </span>
                    </div>
                  </div>
                  {org.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {org.description}
                    </p>
                  )}
                </div>
              </div>
              {isEditMode && (
                <div className="flex justify-end mt-3">
                  <button
                    className="text-xs text-gray-600 hover:text-red-500 flex items-center px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => handleRemove(org.id)}
                  >
                    <Trash2 size={12} className="mr-1" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
          {/* <p className="text-sm text-gray-500 text-left mt-4">
            Add up to 45 more causes to this box
          </p>
          <div className="pt-2 pb-2 text-left">
            <Link
              to="/search"
              className="flex items-center gap-1 text-sm text-blue-500 font-semibold"
            >
              Discover more <ChevronRight size={16} />
            </Link>
          </div> */}
        </div>
      </div>

      {/* Distribution Details */}
      <div className="px-8 py-4">
        <p className="text-sm text-gray-500 text-center">
          Your ${editableAmount} becomes ${(editableAmount * 0.9).toFixed(2)}{" "}
          after fees, split evenly across causes. Your donation will be evenly
          distributed across all {visibleCauses.length} organizations.
        </p>
      </div>

      {/* Payment Method Section */}
      <div className="px-8 py-4">
        <h3 className="text-base font-semibold text-gray-700 uppercase mb-4 tracking-wide">
          PAYMENT METHOD
        </h3>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <CreditCard size={16} className="text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  **** **** **** 4242
                </div>
                <div className="text-xs text-gray-500">12/25</div>
              </div>
            </div>
            <Link
              to="/settings/payments"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Change
            </Link>
          </div>
        </div>
      </div>

      {/* Next Payment Section */}
      <div className="px-8 py-4">
        <h3 className="text-base font-semibold text-gray-700 uppercase mb-4 tracking-wide">
          NEXT PAYMENT
        </h3>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">
                Next payment date
              </div>
              <div className="text-xs text-gray-500">December 26, 2024</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                ${editableAmount}
              </div>
              <div className="text-xs text-gray-500">Monthly</div>
            </div>
          </div>
        </div>
      </div>

      <div className=" text-gray-400  pt-5 text-center">
        Allocations will automatically adjust for 100% distribution
      </div>

      {/* Edit Causes Button */}
      <div className="flex  mt-6 pb-4 px-8">
        <Button
          variant="outline"
          className="rounded-full px-6 py-2 text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100 font-semibold"
          onClick={handleEditCauses}
        >
          {isEditMode ? "Close" : "Edit Causes"}
        </Button>
      </div>

      {/* Footer */}
      {isEditMode && (
        <div className="px-4 py-6 ">
          <div className="grid grid-cols-2 gap-2">
            {visibleCauses.length > 0 && (
              <button className="col-span-1 text-xs text-gray-400">
                Deactivate donation box
              </button>
            )}
            <Button
              className={`${
                visibleCauses.length > 0 ? "col-span-1" : "col-span-2"
              } rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-20 w-1/2 mx-auto`}
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      )}
      {/* <div className="h-24 md:hidden"></div> */}
    </div>
  );
};

export default ManageDonationBox;
