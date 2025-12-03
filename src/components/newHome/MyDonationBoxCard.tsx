import { Link } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";

interface MyDonationBoxCardProps {
  monthlyAmount?: number;
  causeCount?: number;
}

export default function MyDonationBoxCard({
  monthlyAmount = 10,
  causeCount = 5,
}: MyDonationBoxCardProps) {
  return (
    <div className="px-4 mt-6 md:px-0 md:mt-8 max-w-[95%] md:max-w-[70%] mx-auto hover:shadow-lg transition-shadow duration-300 rounded-xl">
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 bg-[#8B5CF6] rounded-lg flex items-center justify-center flex-shrink-0">
          <Package className="h-6 w-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 mb-2">My Donation Box</h3>
          <p className="text-sm text-gray-600 mb-3">
            You are currently donating{" "}
            <span className="font-bold text-gray-900">${monthlyAmount} per month</span> to{" "}
            <span className="font-bold text-gray-900">{causeCount} causes</span>.
          </p>
          <Link
            to="/donation"
            className="text-[#1600ff] text-sm font-medium inline-flex items-center gap-1 hover:underline"
          >
            Manage box <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

