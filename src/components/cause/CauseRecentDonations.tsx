import React from 'react';
import { Link } from 'react-router-dom';

interface Donation {
  avatar: string;
  name: string;
  username: string;
}

const donations: Donation[] = [
  { avatar: 'https://randomuser.me/api/portraits/men/33.jpg', name: 'Chad F.', username: 'chad' },
  { avatar: 'https://randomuser.me/api/portraits/women/44.jpg', name: 'Mia Cares', username: 'miacares1' },
  { avatar: 'https://randomuser.me/api/portraits/men/34.jpg', name: 'Conrad M.', username: 'conradm1' },
  { avatar: 'https://randomuser.me/api/portraits/women/45.jpg', name: 'Morgan Wallace', username: 'moremorgan' },
  { avatar: 'https://randomuser.me/api/portraits/men/35.jpg', name: 'Ashton Thomas', username: 'ash_t2001' },
  { avatar: 'https://randomuser.me/api/portraits/men/36.jpg', name: 'Marc Paul', username: 'makinmymarc' },
  { avatar: 'https://randomuser.me/api/portraits/women/46.jpg', name: 'Cara Cara', username: 'carebear' },
  { avatar: 'https://randomuser.me/api/portraits/women/47.jpg', name: 'Raquel Wells', username: 'rarawells' },
];

const CauseRecentDonations: React.FC = () => (
  <div className="bg-white  py-4  border-y border-gray-200">
    <div className=" font-semibold px-6">Recent Donations</div>
    <div className="flex flex-col divide-y divide-gray-200">
      {donations.map((d, i) => (
        <Link to="/profile" key={i}>
          <div className="flex items-center gap-3 py-3 px-8 hover:bg-gray-50 transition-colors cursor-pointer">
            <img src={d.avatar} alt={d.name} className="w-11 h-11 rounded-full object-cover" />
            <div className="flex flex-col">
              <span className="font-semibold text-base text-gray-900">{d.name}</span>
              <span className="text-sm text-gray-500">{d.username}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default CauseRecentDonations;