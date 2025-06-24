import React from 'react';
import { Search } from 'lucide-react';
const recentDonors = [
  { name: 'Chad F.', username: 'chad', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Mia Cares', username: 'miacares1', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Conrad M.', username: 'conradm1', avatar: 'https://randomuser.me/api/portraits/men/34.jpg' },
  { name: 'Morgan Wallace', username: 'moremorgan', avatar: 'https://randomuser.me/api/portraits/women/45.jpg' },
  { name: 'Ashton Thomas', username: 'ash_t2001', avatar: 'https://randomuser.me/api/portraits/women/46.jpg' },
  { name: 'Marc Paul', username: 'makinmymarc', avatar: 'https://randomuser.me/api/portraits/men/35.jpg' },
  { name: 'Cara Cara', username: 'carebear', avatar: 'https://randomuser.me/api/portraits/women/47.jpg' },
  { name: 'Raquel Wells', username: 'rarawells', avatar: 'https://randomuser.me/api/portraits/women/48.jpg' },
];

interface RecentDonationsListProps {
  onBack: () => void;
}

const RecentDonationsList: React.FC<RecentDonationsListProps> = ({ onBack }) => (
  <div className="w-full">
      <div className="relative mb-4 mt-1 px-6">
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 pl-12 rounded-lg bg-[#F4F4F8] text-foreground"
      />
      <Search className="absolute left-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
    <div className="flex items-center justify-between mb-2 px-8">
      <span className="text-lg font-semibold text-gray-700">Recent Donations</span>
      {/* <button onClick={onBack} className="text-xs text-blue-600 underline">Back</button> */}
    </div>
    <div className="flex flex-col divide-y divide-gray-200">
      {recentDonors.map((donor, i) => (
        <div key={i} className="flex items-center gap-3 py-3 px-8">
          <img src={donor.avatar} alt={donor.name} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-gray-900">{donor.name}</span>
            <span className="text-xs text-gray-500">{donor.username}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RecentDonationsList; 