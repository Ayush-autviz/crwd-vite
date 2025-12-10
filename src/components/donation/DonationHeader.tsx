import React from "react";
import { ArrowLeft, ChevronLeft, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface DonationHeaderProps {
  title: string;
  step: number;
  onBack?: () => void;
  showBackButton?: boolean;
  showCloseButton?: boolean;
}

const DonationHeader: React.FC<DonationHeaderProps> = ({
  title,
  step,
  onBack,
  showBackButton = false,
  showCloseButton = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center h-14 md:h-16 p-3 md:p-4 border-b">
      {/* Always show back button that goes to home */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mr-1.5 md:mr-2 cursor-pointer"
        aria-label="Go back to home"
      >
        <ChevronLeft size={16} className="md:w-[18px] md:h-[18px]" />
      </button>

      <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight ml-1.5 md:ml-2">
        {title}
      </h1>

      {/* Empty div for alignment */}
      <div className="w-7 md:w-8"></div>
    </div>
  );
};

export default DonationHeader;
