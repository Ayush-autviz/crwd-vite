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
    <div className="w-full mt-4 md:mt-6 lg:mt-8 max-w-full md:max-w-[95%] lg:max-w-[70%] mx-auto hover:shadow-lg transition-shadow duration-300 rounded-xl">
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 flex items-start gap-3 md:gap-4">
        {/* Icon */}
        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#8B5CF6] rounded-lg flex items-center justify-center flex-shrink-0">
          <Package className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base md:text-lg text-gray-900 mb-1.5 md:mb-2">My Donation Box</h3>
          <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 leading-relaxed">
            You are currently donating{" "}
            <span className="font-bold text-gray-900">${monthlyAmount} per month</span> to{" "}
            <span className="font-bold text-gray-900">{causeCount} causes</span>.
          </p>
          <Link
            to="/donation"
            className="text-[#1600ff] text-xs md:text-sm font-medium inline-flex items-center gap-1 hover:underline"
          >
            Manage box <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

