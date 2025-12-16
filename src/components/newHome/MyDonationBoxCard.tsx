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
    <div className="w-full py-4 md:py-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 flex items-start gap-3 md:gap-4 hover:shadow-md transition-shadow">
        {/* Icon */}
        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#8B5CF6] rounded-lg flex items-center justify-center flex-shrink-0">
          <Package className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base md:text-lg text-gray-900 mb-1">My Donation Box</h3>
          <p className="text-sm md:text-base text-gray-600 mb-3">
            You are currently donating{" "}
            <span className="font-semibold text-gray-600">${monthlyAmount} per month</span> to{" "}
            <span className="font-semibold text-gray-600">{causeCount} causes</span>.
          </p>
          <Link
            to="/donation"
            className="text-[#1600ff] text-sm md:text-base font-semibold inline-flex items-center gap-1 hover:underline"
          >
            Manage your donation box <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

