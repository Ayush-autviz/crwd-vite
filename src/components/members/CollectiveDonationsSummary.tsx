import React from 'react';
import { Search, Info } from 'lucide-react';

interface CollectiveDonationsSummaryProps {
  onSeeRecentDonations: () => void;
  causesCount: number;
  membersCount: number;
  donationAmount: number;
}

const CollectiveDonationsSummary: React.FC<CollectiveDonationsSummaryProps> = ({ onSeeRecentDonations, causesCount, membersCount, donationAmount }) => (
  <div className="w-full">
    <div className="relative mb-4 mt-1 px-6">
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 pl-12 rounded-lg bg-[#F4F4F8] text-foreground"
      />
      <Search className="absolute left-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
    <div className="text-xs font-semibold text-gray-700 mb-3 px-8 py-4">Impact Metrics</div>
    <div className="divide-y divide-gray-200 border-t border-gray-200">
      <div className=' py-3.5 px-8'>
      <div className="grid grid-cols-4 ">
        <span className=" col-span-2 flex items-center gap-2 text-sm">
          Collective Donations <Info className="h-4 w-4 text-gray-400" />
        </span>
        <div className=" col-span-2 text-sm font-medium">${donationAmount}</div>
        </div>
        {/* <div className="pl-0 "> */}
        <button onClick={onSeeRecentDonations} className="text-xs text-blue-600 underline">See recent donations</button>
        {/* </div> */}
      </div>
    
     
      <div className="grid grid-cols-4 py-6 px-8">
        <div className="text-sm col-span-2">Causes</div>
        <div className="text-sm font-medium col-span-2">{causesCount}</div>
      </div>
      <div className="grid grid-cols-4 py-6 px-8">
        <div className="text-sm col-span-2">Members</div>
        <div className="text-sm font-medium col-span-2">{membersCount}</div>
      </div>
    </div>
  </div>
);

export default CollectiveDonationsSummary; 