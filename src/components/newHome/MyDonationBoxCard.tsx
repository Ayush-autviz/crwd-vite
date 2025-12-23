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
    <div className="w-full py-2 md:py-6 lg:py-8 md:max-w-2xl lg:max-w-3xl xl:max-w-4xl md:mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6 lg:p-8 xl:p-10 flex items-start gap-2.5 md:gap-4 lg:gap-6 hover:shadow-md transition-shadow">
        {/* Icon */}
        <div className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-[#8B5CF6] rounded-lg flex items-center justify-center flex-shrink-0">
          <Package className="h-4 w-4 md:h-6 md:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm md:text-lg lg:text-xl xl:text-2xl text-gray-900 mb-0.5 md:mb-1 lg:mb-2">My Donation Box</h3>
          <p className="text-xs md:text-base lg:text-lg xl:text-xl text-gray-600 mb-2 md:mb-3 lg:mb-4">
            You are currently donating{" "}
            <span className="font-semibold text-gray-600">${monthlyAmount} per month</span> to{" "}
            <span className="font-semibold text-gray-600">{causeCount} causes</span>.
          </p>
          <Link
            to="/donation"
            className="text-[#1600ff] text-xs md:text-base lg:text-lg xl:text-xl font-semibold inline-flex items-center gap-1 hover:underline"
          >
            Manage <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}

