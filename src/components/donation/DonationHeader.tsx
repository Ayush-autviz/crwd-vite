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
    <div className="flex items-center h-16 p-4 border-b">
      {/* Always show back button that goes to home */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mr-2 cursor-pointer"
        aria-label="Go back to home"
      >
        <ChevronLeft size={18} />
      </button>

      <h1 className="text-xl font-bold text-gray-800 tracking-tight ml-2">
        {title}
      </h1>

      {/* Empty div for alignment */}
      <div className="w-8"></div>
    </div>
  );
};

export default DonationHeader;
