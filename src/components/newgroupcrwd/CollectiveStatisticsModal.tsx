import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCollectiveCauses, getCollectiveMembers, getCollectiveDonationHistory } from '@/services/api/crwd';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { truncateAtFirstPeriod } from '@/lib/utils';

interface CollectiveStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectiveId?: string;
  collectiveName?: string;
  initialTab?: 'Nonprofits' | 'Members' | 'Donations';
  previouslySupported?: any[];
}

type TabType = 'Nonprofits' | 'Members' | 'Donations';

export default function CollectiveStatisticsModal({
  isOpen,
  onClose,
  collectiveId,
  initialTab = 'Nonprofits',
  previouslySupported = [],
}: CollectiveStatisticsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  // Handle animation and update active tab when modal opens
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setActiveTab(initialTab);
      setIsVisible(true);
      setIsAnimating(false);
      timer = setTimeout(() => setIsAnimating(true), 20);
    } else if (isVisible) {
      setIsAnimating(false);
      timer = setTimeout(() => setIsVisible(false), 300);
    }
    return () => clearTimeout(timer);
  }, [isOpen, isVisible, initialTab]);

  // Fetch nonprofits (causes)
  const { data: causesData, isLoading: isLoadingCauses } = useQuery({
    queryKey: ['collective-causes', collectiveId],
    queryFn: () => getCollectiveCauses(collectiveId || ''),
    enabled: !!collectiveId && isOpen,
  });

  // Fetch members
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['members', collectiveId],
    queryFn: () => getCollectiveMembers(collectiveId || ''),
    enabled: !!collectiveId && isOpen,
  });

  // Fetch donation history
  const { data: donationHistoryData, isLoading: isLoadingDonations } = useQuery({
    queryKey: ['donationHistory', collectiveId],
    queryFn: () => getCollectiveDonationHistory(collectiveId || ''),
    enabled: !!collectiveId && isOpen,
  });

  const nonprofits = causesData?.results || causesData || [];
  const members = membersData?.results || membersData || [];
  const donations = donationHistoryData?.results || donationHistoryData || [];

  if (!isVisible) return null;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleViewNonprofit = (causeId: number) => {
    navigate(`/cause/${causeId}`);
    handleClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-t-3xl w-full h-[93vh] md:h-[85vh] flex flex-col transform transition-transform duration-300 ${isAnimating ? 'translate-y-0' : 'translate-y-full'
          }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scroll indicator */}
        <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white z-10">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-3 md:px-4 lg:px-6 pt-2 md:pt-3 lg:pt-4 pb-3 md:pb-4 lg:pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-foreground">Collective Statistics</h2>
            <button
              onClick={handleClose}
              className="p-1 md:p-1.5 lg:p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 text-gray-700" />
            </button>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            View detailed information about nonprofits, members, and donations
          </p>
        </div>

        {/* Tabs */}
        <div className="px-3 md:px-4 lg:px-6 pt-2 md:pt-3 lg:pt-4">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-2 md:mb-4 overflow-x-auto">
            {(['Nonprofits', 'Members', 'Donations'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-1.5 sm:px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[10px] xs:text-xs sm:text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-6 flex-1 overflow-y-auto">
          {activeTab === 'Nonprofits' && (
            <div>
              <h3 className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2 md:mb-3 lg:mb-4">
                Currently Active
              </h3>
              {isLoadingCauses ? (
                <div className="flex items-center justify-center py-6 md:py-8">
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
                </div>
              ) : nonprofits.length > 0 ? (
                <div className="space-y-0">
                  {nonprofits.map((nonprofit: any) => {
                    const cause = nonprofit.cause || nonprofit;
                    const name = cause.name || nonprofit.name || 'Unknown Nonprofit';
                    const image = cause.image || nonprofit.image || '';

                    // Generate vibrant avatar colors based on nonprofit ID for consistent colors
                    const avatarColors = [
                      '#EF4444', // Red
                      '#10B981', // Green
                      '#3B82F6', // Blue
                      '#8B5CF6', // Purple
                      '#84CC16', // Lime Green
                      '#EC4899', // Pink
                      '#F59E0B', // Amber
                      '#06B6D4', // Cyan
                      '#F97316', // Orange
                      '#A855F7', // Violet
                      '#14B8A6', // Teal
                      '#F43F5E', // Rose
                      '#6366F1', // Indigo
                      '#22C55E', // Emerald
                      '#EAB308', // Yellow
                    ];
                    const nonprofitId = cause.id || nonprofit.id || name;
                    const avatarColorIndex = nonprofitId ? (Number(nonprofitId) % avatarColors.length) : (name?.charCodeAt(0) || 0) % avatarColors.length;
                    const avatarBgColor = avatarColors[avatarColorIndex];

                    return (
                      <div
                        key={nonprofit.id || cause.id}
                        onClick={() => handleViewNonprofit(cause.id || nonprofit.id)}
                        className="flex items-center gap-3 md:gap-3 lg:gap-4 py-3 md:py-3 lg:py-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0">
                          <AvatarImage src={image} alt={name} />
                          <AvatarFallback
                            style={{ backgroundColor: avatarBgColor }}
                            className="text-white rounded-lg font-semibold text-base md:text-lg"
                          >
                            {name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm md:text-base lg:text-base text-foreground mb-0.5 md:mb-1">
                            {name}
                          </h4>
                          <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">
                            {truncateAtFirstPeriod(cause.mission || cause.description || 'No description available')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 md:py-6 lg:py-8 text-xs md:text-sm lg:text-sm text-muted-foreground">
                  No nonprofits found
                </div>
              )}

              {/* Previously Supported Section */}
              {previouslySupported && previouslySupported.length > 0 && (
                <div className="mt-4 md:mt-6 lg:mt-8 pt-4 md:pt-6 lg:pt-8 border-t border-gray-200">
                  <h3 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 md:mb-3 lg:mb-4">
                    PREVIOUSLY SUPPORTED
                  </h3>
                  <div className="space-y-0">
                    {previouslySupported.map((nonprofit) => {
                      const cause = nonprofit.cause || nonprofit;
                      const name = cause.name || nonprofit.name || 'Unknown Nonprofit';
                      const image = cause.image || nonprofit.image || '';
                      const causeId = cause.id || nonprofit.id;

                      // Generate vibrant avatar colors based on nonprofit ID for consistent colors
                      const avatarColors = [
                        '#EF4444', // Red
                        '#10B981', // Green
                        '#3B82F6', // Blue
                        '#8B5CF6', // Purple
                        '#84CC16', // Lime Green
                        '#EC4899', // Pink
                        '#F59E0B', // Amber
                        '#06B6D4', // Cyan
                        '#F97316', // Orange
                        '#A855F7', // Violet
                        '#14B8A6', // Teal
                        '#F43F5E', // Rose
                        '#6366F1', // Indigo
                        '#22C55E', // Emerald
                        '#EAB308', // Yellow
                      ];
                      const nonprofitId = cause.id || nonprofit.id || name;
                      const avatarColorIndex = nonprofitId ? (Number(nonprofitId) % avatarColors.length) : (name?.charCodeAt(0) || 0) % avatarColors.length;
                      const avatarBgColor = avatarColors[avatarColorIndex];



                      return (
                        <div
                          key={nonprofit.id}
                          onClick={() => causeId && handleViewNonprofit(causeId)}
                          className="flex items-center gap-3 md:gap-3 lg:gap-4 py-3 md:py-3 lg:py-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0">
                            <AvatarImage src={image} alt={name} />
                            <AvatarFallback
                              style={{ backgroundColor: avatarBgColor }}
                              className="text-white rounded-lg font-semibold text-base md:text-lg"
                            >
                              {name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm md:text-base lg:text-base text-foreground mb-0.5 md:mb-1">
                              {name}
                            </h4>
                            <p className="text-sm md:text-base   lg:text-base text-muted-foreground line-clamp-2">
                              {truncateAtFirstPeriod(cause.mission || cause.description || 'No description available')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Members' && (
            <div>
              {isLoadingMembers ? (
                <div className="flex items-center justify-center py-4 md:py-6 lg:py-8">
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 animate-spin text-gray-400" />
                </div>
              ) : members.length > 0 ? (
                <div className="space-y-0">
                  {members.map((member: any) => {
                    const user = member.user || member;
                    const firstName = user.first_name || '';
                    const lastName = user.last_name || '';
                    const username = user.username || '';
                    const name = `${firstName} ${lastName}`.trim() || username;
                    const avatar = user.profile_picture || '';
                    const role = member.role || '';
                    const isFounder = role?.toLowerCase() === 'founder' || role?.toLowerCase() === 'admin' || member.is_founder;

                    // Generate vibrant avatar colors based on user ID for consistent colors
                    const avatarColors = [
                      '#EF4444', // Red
                      '#10B981', // Green
                      '#3B82F6', // Blue
                      '#8B5CF6', // Purple
                      '#84CC16', // Lime Green
                      '#EC4899', // Pink
                      '#F59E0B', // Amber
                      '#06B6D4', // Cyan
                      '#F97316', // Orange
                      '#A855F7', // Violet
                      '#14B8A6', // Teal
                      '#F43F5E', // Rose
                      '#6366F1', // Indigo
                      '#22C55E', // Emerald
                      '#EAB308', // Yellow
                    ];
                    const userId = user.id || member.id || username;
                    const avatarColorIndex = userId ? (Number(userId) % avatarColors.length) : (username?.charCodeAt(0) || 0) % avatarColors.length;
                    const avatarBgColor = user.color || avatarColors[avatarColorIndex];

                    // Get first initial
                    const initial = name.charAt(0).toUpperCase() || username.charAt(0).toUpperCase() || 'U';

                    return (
                      <div
                        key={member.id || user.id}
                        className="flex items-center gap-2 md:gap-3 lg:gap-4 py-2 md:py-3 lg:py-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          if (user.id) {
                            navigate(`/user-profile/${user.id}`);
                            handleClose();
                          }
                        }}
                      >
                        <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0">
                          <AvatarImage src={avatar} alt={name} />
                          <AvatarFallback
                            style={{ backgroundColor: avatarBgColor }}
                            className="text-white font-bold text-base md:text-lg"
                          >
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 md:gap-1.5 lg:gap-2 flex-wrap">
                            <h4 className="font-bold text-sm md:text-base lg:text-base text-foreground">
                              {/* @{username || name.toLowerCase().replace(/\s+/g, '_')} */}
                              {name}
                            </h4>
                            {isFounder && (
                              <span className="bg-red-500 text-white text-[10px] md:text-[12px] lg:text-xs font-semibold px-1 md:px-1.5 lg:px-2 py-0.5 rounded-full">
                                Organizer
                              </span>
                            )}
                          </div>
                          <p className="text-sm  md:text-base lg:text-base text-gray-500 mt-0.5 md:mt-1 line-clamp-2">
                            {user.bio || user.location || ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 md:py-6 lg:py-8 text-sm md:text-base lg:text-base text-muted-foreground">
                  No members found
                </div>
              )}
            </div>
          )}

          {activeTab === 'Donations' && (
            <div>
              {isLoadingDonations ? (
                <div className="flex items-center justify-center py-4 md:py-6 lg:py-8">
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 animate-spin text-gray-400" />
                </div>
              ) : donations.length > 0 ? (
                <>
                  {/* Summary Boxes */}
                  <div className="mb-3 md:mb-4 lg:mb-6">
                    {/* Collective Donations Box */}
                    <div className="bg-[#f0fdf4] border border-[#86efac] rounded-lg p-2 md:p-3 lg:p-4">
                      <h3 className="text-sm md:text-base lg:text-base font-semibold text-gray-700 mb-1 md:mb-2">
                        Collective Donations
                      </h3>
                      <p className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 mb-1">
                        ${donationHistoryData?.total_donated_to_collective?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs md:text-sm lg:text-sm text-gray-600">
                        {donations.filter((d: any) => d.amount_attributed_to_collective > 0).length} donation{donations.filter((d: any) => d.amount_attributed_to_collective > 0).length !== 1 ? 's' : ''} credited to this collective
                      </p>
                    </div>

                    {/* All Donations Box */}
                    {/* <div className="bg-[#f0fdf4] border border-[#86efac] rounded-lg p-3 md:p-4">
                      <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                        All Donations
                      </h3>
                      <p className="text-2xl md:text-3xl font-bold text-gray-600 mb-1">
                        ${donations.reduce((sum: number, d: any) => sum + parseFloat(d.gross_amount || '0'), 0).toFixed(2)}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        {donations.length} total donation{donations.length !== 1 ? 's' : ''} to these nonprofits
                      </p>
                    </div> */}
                  </div>

                  {/* Donations List */}
                  <div className="space-y-2 md:space-y-3 lg:space-y-4">
                    {donations.map((donation: any, index: number) => {
                      const user = donation.user || {};
                      const firstName = user.first_name || '';
                      const lastName = user.last_name || '';
                      const fullName = `${firstName} ${lastName}`.trim() || user.username || 'Unknown User';
                      const initials = firstName && lastName
                        ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
                        : fullName.charAt(0).toUpperCase();

                      const avatar = user.profile_picture || '';
                      const isCollectiveDonation = donation.amount_attributed_to_collective > 0;
                      const type = donation.donation_type || 'donation';

                      // Generate consistent avatar color - use a larger palette for more variety
                      const avatarColors = [
                        '#86efac', // Lime green
                        '#3B82F6', // Blue
                        '#10B981', // Green
                        '#8B5CF6', // Purple
                        '#EC4899', // Pink
                        '#F97316', // Orange
                        '#EF4444', // Red
                        '#06B6D4', // Cyan
                        '#84CC16', // Lime
                        '#A855F7', // Violet
                        '#14B8A6', // Teal
                        '#F43F5E', // Rose
                        '#6366F1', // Indigo
                        '#22C55E', // Emerald
                        '#EAB308', // Yellow
                        '#F59E0B', // Amber
                      ];

                      // Use a hash function to get more varied color distribution
                      const getColorForUser = (id: number | string, colors: string[]) => {
                        const idStr = id.toString();
                        let hash = 0;
                        for (let i = 0; i < idStr.length; i++) {
                          const char = idStr.charCodeAt(i);
                          hash = ((hash << 5) - hash) + char;
                          hash = hash & hash; // Convert to 32-bit integer
                        }
                        return colors[Math.abs(hash) % colors.length];
                      };

                      const userId = user.id || index;
                      const avatarBgColor = user.color || getColorForUser(userId, avatarColors);

                      // Format time ago
                      const formatTimeAgo = (dateString: string) => {
                        const date = new Date(dateString);
                        const now = new Date();
                        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

                        if (diffInSeconds < 60) return 'Just now';
                        if (diffInSeconds < 3600) {
                          const minutes = Math.floor(diffInSeconds / 60);
                          return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
                        }
                        if (diffInSeconds < 86400) {
                          const hours = Math.floor(diffInSeconds / 3600);
                          return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
                        }
                        if (diffInSeconds < 604800) {
                          const days = Math.floor(diffInSeconds / 86400);
                          return `${days} day${days !== 1 ? 's' : ''} ago`;
                        }
                        if (diffInSeconds < 2592000) {
                          const weeks = Math.floor(diffInSeconds / 604800);
                          return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
                        }
                        const months = Math.floor(diffInSeconds / 2592000);
                        return `${months} month${months !== 1 ? 's' : ''} ago`;
                      };

                      return (
                        <div
                          key={donation.id || index}
                          className="flex items-center gap-2 md:gap-3 lg:gap-4 py-1.5 md:py-2 lg:py-3"
                        >
                          {/* Avatar */}
                          <div
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: avatarBgColor }}
                          >
                            {avatar ? (
                              <img
                                src={avatar}
                                alt={fullName}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-sm md:text-base">
                                {initials}
                              </span>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                              <h4 className="font-bold text-sm md:text-base lg:text-base text-gray-900">
                                {fullName}
                              </h4>
                              {isCollectiveDonation && (
                                <span className="bg-blue-100 text-blue-500 text-sm md:text-base font-semibold px-1.5 md:px-2 py-0.5 rounded-full">
                                  {type === 'one_time' ? 'One Time' : 'Collective'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap mt-0.5 md:mt-1">
                              {/* <p className="text-[10px] md:text-xs lg:text-sm text-gray-600">
                                Donated to {causeCount} nonprofit{causeCount !== 1 ? 's' : ''}
                              </p> */}
                              {/* <span className="text-gray-400">•</span> */}
                              <p className="text-sm md:text-ba  se lg:text-base text-gray-600">
                                {donation.charged_at ? formatTimeAgo(donation.charged_at) : 'Recently'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-4 md:py-6 lg:py-8 text-[10px] md:text-xs lg:text-sm text-muted-foreground">
                  No donations found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

