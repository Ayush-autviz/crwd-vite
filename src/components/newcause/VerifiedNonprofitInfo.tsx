import { CheckCircle } from 'lucide-react';

interface VerifiedNonprofitInfoProps {
  causeData: any;
}

export default function VerifiedNonprofitInfo({ causeData }: VerifiedNonprofitInfoProps) {
  return (
    <div className="mx-4 mb-6 bg-gray-50 rounded-xl p-4 ">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <span className="text-sm font-semibold text-blue-600">
          Verified U.S. Nonprofit Organization
        </span>
      </div>
      <div className="text-sm text-gray-700 mb-1 mt-5">
        Tax ID: {causeData?.tax_id_number || 'N/A'}
      </div>
      {causeData?.street && (
        <div className="text-sm text-gray-700">
          {causeData.street}
          {causeData.city && `, ${causeData.city}`}
          {causeData.state && `, ${causeData.state}`}
        </div>
      )}
    </div>
  );
}

