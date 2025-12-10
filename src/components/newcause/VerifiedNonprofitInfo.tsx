import { CheckCircle } from 'lucide-react';

interface VerifiedNonprofitInfoProps {
  causeData: any;
}

export default function VerifiedNonprofitInfo({ causeData }: VerifiedNonprofitInfoProps) {
  return (
    <div className="mx-3 md:mx-4 mb-4 md:mb-6 bg-gray-50 rounded-xl p-3 md:p-4">
      <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
        <span className="text-xs md:text-sm font-semibold text-blue-600">
          Verified U.S. Nonprofit Organization
        </span>
      </div>
      <div className="text-xs md:text-sm text-gray-700 mb-0.5 md:mb-1 mt-4 md:mt-5">
        Tax ID: {causeData?.tax_id_number || 'N/A'}
      </div>
      {causeData?.street && (
        <div className="text-xs md:text-sm text-gray-700">
          {causeData.street}
          {causeData.city && `, ${causeData.city}`}
          {causeData.state && `, ${causeData.state}`}
        </div>
      )}
    </div>
  );
}

