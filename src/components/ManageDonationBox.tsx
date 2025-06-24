import React from "react";
import { ArrowLeft, Minus, Plus, CreditCard, Calendar, DollarSign, Trash2, Badge, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

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

const ManageDonationBox: React.FC<ManageDonationBoxProps> = ({ amount, causes, onBack, onRemove }) => {
  const [editableAmount, setEditableAmount] = React.useState(amount);
  const [isEditingAmount, setIsEditingAmount] = React.useState(false);

  const incrementAmount = () => {
    setEditableAmount(prev => prev + 1);
  };

  const decrementAmount = () => {
    if (editableAmount > 1) {
      setEditableAmount(prev => prev - 1);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setEditableAmount(0);
    } else {
      setEditableAmount(parseInt(value));
    }
  };

  const handleRemove = (id: string) => {
    if (onRemove) {
      onRemove(id);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 h-16 p-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold text-lg">Manage Donation Box</h1>
        <div className="w-10"></div> {/* Empty div for alignment */}
      </div>

      {/* Blue Card */}
      <div className="bg-blue-600 rounded-xl px-4 py-6 mx-4 mt-4 relative">
        <a to="/transaction-history" className="absolute right-4 top-4 text-xs text-white/80 underline">
          See full transaction history
        </a>
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
              <span
                className="text-4xl font-bold text-white cursor-pointer"
                onClick={() => setIsEditingAmount(true)}
              >
                ${editableAmount}
              </span>
            )}
            <button
              onClick={incrementAmount}
              className="bg-white/20 rounded-full p-2 text-white hover:bg-white/30 transition"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="text-white/80 text-sm mb-6">on the 26th of every month</div>
          <div className="flex w-full max-w-xs justify-between gap-2">
            <button
              className="flex flex-col items-center flex-1 bg-white/10 rounded-xl py-3 text-white hover:bg-white/20 transition"
              onClick={() => setIsEditingAmount(true)}
            >
              <DollarSign size={22} className="mb-1" />
              <span className="text-xs">Edit amount</span>
            </button>
            <Link to="/settings/payments" className="flex flex-col items-center flex-1 bg-white/10 rounded-xl py-3 text-white hover:bg-white/20 transition">
              <CreditCard size={22} className="mb-1" />
              <span className="text-xs">Edit payment</span>
            </Link>
          </div>
        </div>
      </div>
      {/* Edit Causes Button */}
      <div className="flex  mt-6 pb-4 px-8">
        <Button variant="outline" className="rounded-full px-6 py-2 text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100 font-semibold">Edit Causes</Button>
      </div>
      {/* Causes List */}
      <div className="flex-1 overflow-auto">
        <h2 className="text-base font-semibold text-gray-700 uppercase mb-4 tracking-wide px-8">
          CAUSES
        </h2>
        <div className="space-y-4 px-8">
          {causes.map((org) => (
            <div key={org.id} className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
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
                      <h3 className="font-semibold text-gray-900 text-base">{org.name}</h3>
                      {/* <span className="text-xs text-gray-500">
                        @{org.name.replace(/\s+/g, "").toLowerCase()}
                      </span> */}
                    </div>
                  </div>
                  {org.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {org.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  className="text-xs text-gray-600 hover:text-red-500 flex items-center px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                  onClick={() => handleRemove(org.id)}
                >
                  <Trash2 size={12} className="mr-1" />
                  Remove
                </button>
              </div>
            </div>
          ))}
          <p className="text-sm text-gray-500 text-left mt-4">
            Add up to 45 more causes to this box
          </p>
          <div className="pt-2 pb-2 text-left">
            <Link to="/search" className="flex items-center gap-1 text-sm text-blue-500 font-semibold">
              Discover more <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-400 text-center pt-5 ml-auto px-4">Allocations will automatically adjust for 100% distribution</div>

      {/* Footer */}
      <div className="px-4 py-6 pb-30">
        <div className="grid grid-cols-2 gap-2">
          <button className="col-span-1 text-xs text-gray-400">Deactivate donation box</button>
          <Button className="col-span-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-20 w-1/2 mx-auto">Save</Button>
        </div>
      </div>
    </div>
  );
};

export default ManageDonationBox;