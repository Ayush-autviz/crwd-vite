import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";

interface MyDonationBoxCardProps {
  monthlyAmount?: number;
  causeCount?: number;
}

export default function MyDonationBoxCard({
  monthlyAmount = 10,
  causeCount = 5,
}: MyDonationBoxCardProps) {
  return (
    <div className="w-full py-2 md:py-6 md:max-w-2xl md:mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6 flex flex-col md:flex-row items-start gap-2.5 md:gap-4 hover:shadow-md transition-shadow">
        {/* Icon */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-[#8B5CF6] rounded-full flex items-center justify-center flex-shrink-0">
            {/* <Package className="h-4 w-4 md:h-6 md:w-6 text-white" /> */}
            <ShoppingBag className="h-4 w-4 md:h-6 md:w-6 text-white" />

          </div>
          <h3 className="font-[700] text-xs xs:text-sm md:text-lg text-gray-900 mb-0.5 md:mb-1 md:hidden">My Donation Box</h3>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-[700] text-xs xs:text-sm md:text-lg text-gray-900 mb-0.5 md:mb-1 hidden md:block">My Donation Box</h3>
          <p className="text-[10px] xs:text-xs md:text-base text-gray-600 mb-2 md:mb-3 font-[500]">
            You are currently donating{" "}
            <span className="font-bold text-gray-800">${monthlyAmount} per month</span> to{" "}
            <span className="font-bold text-gray-800">{causeCount} causes</span>.
          </p>
          <Link
            to="/donation"
            className="text-[#1600ff] text-[10px] xs:text-xs md:text-base font-semibold inline-flex items-center gap-1 hover:underline"
          >
            Manage <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}

