import React from "react";
import { ArrowLeft, X } from "lucide-react";
import { Link } from "react-router-dom";

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
  return (
    <div className="flex items-center h-16 p-4 border-b">
      {showBackButton && (
        <button
          onClick={onBack}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mr-2 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
      )}

      {showCloseButton && !showBackButton && (
        <Link
          to="/"
          className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mr-2"
        >
          {/* <X size={18} /> */}
          <ArrowLeft size={18} />
        </Link>
      )}

      <h1 className="text-xl font-bold text-gray-800 tracking-tight ml-2">
        {title}
      </h1>

      {/* Empty div for alignment */}
      <div className="w-8"></div>
    </div>
  );
};

export default DonationHeader;
