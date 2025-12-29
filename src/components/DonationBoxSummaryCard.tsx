import { Edit, CreditCard, Plus, Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DonationBoxSummaryCardProps {
  monthlyAmount: number;
  lifetimeAmount?: number;
  causesCount: number;
  collectivesCount: number;
  currentCapacity: number;
  maxCapacity: number;
  onEditAmount?: () => void;
  onEditPayment?: () => void;
  onAddCauses?: () => void;
}

export const DonationBoxSummaryCard = ({
  monthlyAmount,
  lifetimeAmount = 0,
  causesCount,
  collectivesCount,
  currentCapacity,
  maxCapacity,
  onEditAmount,
  onEditPayment,
  onAddCauses,
}: DonationBoxSummaryCardProps) => {
  const remainingCapacity = maxCapacity - currentCapacity;
  const capacityPercentage = (currentCapacity / maxCapacity) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2"></div>

      <div className="p-6">
        {/* Monthly Donation Section */}
        <div className="mb-6">
          <h2 className="text-base font-medium text-gray-900 mb-3">Monthly Donation</h2>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">${monthlyAmount}</span>
              <span className="text-base text-gray-600">/   month</span>
            </div>
            <button
              onClick={onEditAmount}
              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Edit amount"
            >
              <Pen className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          {/* <p className="text-sm text-gray-600">${lifetimeAmount.toLocaleString()} lifetime</p>s */}
        </div>

        {/* Supported Entities */}
        <div className="bg-gray-100 rounded-lg px-4 py-3 mb-6 text-center">
          <p className="text-sm font-bold text-gray-900">
            {causesCount} Cause{causesCount !== 1 ? 's' : ''} • {collectivesCount} Collective{collectivesCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Donation Box Capacity */}
        {/* <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-blue-600">Donation Box Capacity</h3>
            <span className="text-sm text-gray-900">{currentCapacity}/{maxCapacity} causes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${capacityPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-blue-600">
            You can support {remainingCapacity} more cause{remainingCapacity !== 1 ? 's' : ''} with this donation amount.
          </p>
        </div> */}

        {/* Action Buttons */}
        {/* <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onEditPayment}
            className="flex-1 border-gray-300 text-gray-900 hover:bg-gray-50"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Edit Payment
          </Button>
          <Button
            onClick={onAddCauses}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Causes
          </Button>
        </div> */}
      </div>
    </div>
  );
};

