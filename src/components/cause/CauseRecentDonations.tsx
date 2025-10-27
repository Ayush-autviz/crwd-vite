import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RecentDonation {
  id: number;
  amount: number;
  donor: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
  donation_type: string;
  charged_at: string;
}

interface CauseRecentDonationsProps {
  donations?: RecentDonation[];
  showEmpty?: boolean;
}

const CauseRecentDonations: React.FC<CauseRecentDonationsProps> = ({ 
  donations: donationsProp = [], 
  showEmpty = false 
}) => {
  // Show empty state if showEmpty is true or if donations array is empty
  const shouldShowEmpty = showEmpty || !donationsProp || donationsProp.length === 0;

  // Helper function to format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white py-6">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 mb-4">
        <Sparkles className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-bold text-gray-900">Recent Donations</h3>
      </div>
      
      {shouldShowEmpty ? (
        <div className="px-6">
          <EmptyState
            icon={<Heart size={48} className="text-gray-300" />}
            title="No donations yet"
            description="Be the first to support this cause. Every donation makes a difference and helps us reach our goal."
            actionText="Donate Now"
            actionLink="/donation"
            className="py-8"
          />
        </div>
      ) : (
        <div className="space-y-2 px-4">
          {donationsProp.map((donation) => {
            const donorName = `${donation.donor.first_name} ${donation.donor.last_name}`;
            const initials = `${donation.donor.first_name.charAt(0)}${donation.donor.last_name.charAt(0)}`;
            
            return (
              <Link 
                to={`/user-profile/${donation.donor.id}`} 
                key={donation.id}
                className="block"
              >
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-green-50 hover:to-white hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-green-200 cursor-pointer group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="w-12 h-12 ring-2 ring-green-100 group-hover:ring-green-300 transition-all">
                      <AvatarImage src={donation.donor.profile_picture} />
                      <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-base text-gray-900 truncate group-hover:text-green-700 transition-colors">
                        {donorName}
                      </span>
                      <span className="text-sm text-gray-500 truncate">
                        @{donation.donor.username}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-4">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-lg text-green-600">
                        {formatAmount(donation.amount)}
                      </span>
                      {/* <Heart className="w-4 h-4 text-green-500 fill-green-500" /> */}
                    </div>
                    <span className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-100 rounded-full">
                      {formatDate(donation.charged_at)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CauseRecentDonations;
