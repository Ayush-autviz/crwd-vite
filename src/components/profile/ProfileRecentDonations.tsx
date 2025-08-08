import React from 'react';
import { Link } from 'react-router-dom';

interface RecentDonation {
  id: string;
  causeName: string;
  causeLogo: string;
  amount: number;
  date: string;
}

const recentDonations: RecentDonation[] = [
  {
    id: '1',
    causeName: 'The Red Cross',
    causeLogo: '/redcross.png',
    amount: 50,
    date: '2 days ago'
  },
  {
    id: '2',
    causeName: 'St. Jude Children\'s Hospital',
    causeLogo: '/starbucks.jpg',
    amount: 25,
    date: '1 week ago'
  },
  {
    id: '3',
    causeName: 'World Wildlife Fund',
    causeLogo: '/grocery.jpg',
    amount: 75,
    date: '2 weeks ago'
  },
  {
    id: '4',
    causeName: 'Doctors Without Borders',
    causeLogo: '/tesla.jpg',
    amount: 100,
    date: '3 weeks ago'
  }
];

const ProfileRecentDonations: React.FC = () => {
  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-4">Recent Donations</h2>
      <div className="space-y-3">
        {recentDonations.map((donation) => (
          <Link to={`/cause`} key={donation.id}>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex-shrink-0">
                <img 
                  src={donation.causeLogo} 
                  alt={donation.causeName} 
                  className="w-12 h-12 rounded-lg object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">
                    {donation.causeName}
                  </h3>
                  {/* <span className="text-sm font-semibold text-green-600">
                    ${donation.amount}
                  </span> */}
                </div>
                {/* <p className="text-sm text-gray-500">
                  {donation.date}
                </p> */}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* View All Donations Link */}
      {/* <div className="mt-4 pt-3 border-t border-gray-200">
        <Link to="/transaction-history">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Donations
          </button>
        </Link>
      </div> */}
    </div>
  );
};

export default ProfileRecentDonations; 