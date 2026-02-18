import React, { useMemo } from 'react';
import { Loader2, Heart, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Link } from 'react-router-dom';

interface RecentDonationsListProps {
  onBack?: () => void;
  donationHistory?: any[];
  isLoading?: boolean;
}

interface DonationItem {
  id: number;
  donor: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  donation_type: string;
  gross_amount: string;
  charged_at: string;
  causes: Array<{
    id: number;
    name: string;
    amount: number;
  }>;
}

const RecentDonationsList: React.FC<RecentDonationsListProps> = ({ 
  donationHistory, 
  isLoading = false 
}) => {
  // Format date helper function
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      // Format as "Month Day" (e.g., "May 7th", "April 1st")
      const options: Intl.DateTimeFormatOptions = { 
        month: 'long', 
        day: 'numeric' 
      };
      const formatted = date.toLocaleDateString('en-US', options);
      const day = date.getDate();
      const suffix = day % 10 === 1 && day % 100 !== 11 ? 'st' :
                     day % 10 === 2 && day % 100 !== 12 ? 'nd' :
                     day % 10 === 3 && day % 100 !== 13 ? 'rd' : 'th';
      return formatted.replace(/\d+/, `${day}${suffix}`);
    } catch {
      return dateString;
    }
  };

  // Format time helper function
  const formatTime = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
      
      return `${displayHours}:${displayMinutes} ${ampm}`;
    } catch {
      return '';
    }
  };

  // Transform donation history data
  const donations: DonationItem[] = useMemo(() => {
    if (!donationHistory || !Array.isArray(donationHistory)) return [];
    return donationHistory;
  }, [donationHistory]);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-600">Loading donations...</span>
        </div>
      </div>
    );
  }

  if (!donations || donations.length === 0) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-900 mb-2">No donations found</p>
          <p className="text-sm text-gray-500 text-center">When members make donations, they'll appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 py-4">
      <div className="space-y-3">
        {donations.map((donation) => {
          const donorName = `${donation.donor.first_name} ${donation.donor.last_name}`.trim() || donation.donor.username;
          const formattedDate = formatDate(donation.charged_at);
          const formattedTime = formatTime(donation.charged_at);
          const formattedAmount = `$${parseFloat(donation.gross_amount || '0').toFixed(2)}`;
          const isRecurring = donation.donation_type === 'recurring';
          
          return (
            <div
              key={donation.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300"
            >
              <div className="flex items-start gap-4">
                {/* Donor Avatar */}
                <Link to={`/u/${donation.donor.username}`} className="flex-shrink-0">
                  <Avatar className="w-14 h-14 ring-2 ring-gray-100 hover:ring-green-200 transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-green-700 font-semibold text-lg">
                      {donorName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                {/* Donation Details */}
                <div className="flex-1 min-w-0">
                  {/* Top Row: Donor Name and Amount */}
                  <div className="flex items-start justify-between gap-4 ">
                    <div className="flex-1 min-w-0">
                      <Link to={`/u/${donation.donor.username}`} className="block group">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-base text-gray-900 group-hover:text-green-600 transition-colors">
                            {donorName}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                            @{donation.donor.username}
                          </span>
                        </div>
                      </Link>
                    </div>
                    
                    {/* Amount Badge */}
                    <div className="flex-shrink-0">
                      {/* <div className="flex items-center gap-1.5 bg-green-50 px-3 rounded-lg border border-green-100"> */}
                        {/* <Heart className="w-4 h-4 text-green-600 fill-green-600" /> */}
                        <span className="text-lg font-semibold text-green-500">
                          {formattedAmount}
                        </span>
                      {/* </div> */}
                    </div>
                  </div>
                  
                  {/* Date and Type Row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formattedDate}</span>
                      {formattedTime && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{formattedTime}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Donation Type Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-md">
                    <div className={`w-2 h-2 rounded-full ${isRecurring ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-xs font-medium text-blue-700">
                      {isRecurring ? 'Donation Box' : 'One-time donation'}
                    </span>
                  </div>
                  
                  {/* Causes Count (if available) */}
                  {/* {donation.causes && donation.causes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2 font-medium">
                        Distributed to {donation.causes.length} {donation.causes.length === 1 ? 'nonprofit' : 'nonprofits'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {donation.causes.slice(0, 4).map((cause) => (
                          <div
                            key={cause.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-md border border-blue-100"
                          >
                            <span className="text-xs font-medium text-blue-700 truncate max-w-[120px]">
                              {cause.name}
                            </span>
                            <span className="text-xs text-blue-600 font-semibold">
                              ${cause.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {donation.causes.length > 4 && (
                          <div className="inline-flex items-center px-2.5 py-1 bg-gray-100 rounded-md border border-gray-200">
                            <span className="text-xs font-medium text-gray-600">
                              +{donation.causes.length - 4} more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentDonationsList;
