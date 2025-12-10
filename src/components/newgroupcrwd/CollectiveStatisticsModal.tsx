import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCollectiveCauses, getCollectiveMembers, getCollectiveDonationHistory } from '@/services/api/crwd';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CollectiveStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectiveId?: string;
  collectiveName?: string;
  initialTab?: 'Nonprofits' | 'Members' | 'Donations';
}

type TabType = 'Nonprofits' | 'Members' | 'Donations';

export default function CollectiveStatisticsModal({
  isOpen,
  onClose,
  collectiveId,
  initialTab = 'Nonprofits',
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
      className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-t-3xl w-full h-[70vh] flex flex-col transform transition-transform duration-300 ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scroll indicator */}
        <div className="flex justify-center pt-2 pb-1 sticky top-0 bg-white z-10">
          <div className="w-10 md:w-12 h-0.5 md:h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Collective Statistics</h2>
            <button
              onClick={handleClose}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </button>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            View detailed information about nonprofits, members, and donations
          </p>
        </div>

        {/* Tabs */}
        <div className="px-4 md:px-6 pt-3 md:pt-4 border-b border-gray-200">
          <div className="flex justify-around gap-3 md:gap-6">
            {(['Nonprofits', 'Members', 'Donations'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 md:pb-3 px-0.5 md:px-1 font-semibold text-sm md:text-md transition-colors relative ${
                  activeTab === tab
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 md:h-1 rounded-full bg-black"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 md:px-6 py-4 md:py-6 flex-1 overflow-y-auto">
          {activeTab === 'Nonprofits' && (
            <div>
              <h3 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 md:mb-4">
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
                        className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 p-3 md:p-4 border border-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
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
                          <h4 className="font-bold text-sm md:text-base text-foreground mb-0.5 md:mb-1">
                            {name}
                          </h4>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {cause.mission || 'No description available'}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleViewNonprofit(cause.id || nonprofit.id)}
                          className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm"
                        >
                          View
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8 text-xs md:text-sm text-muted-foreground">
                  No nonprofits found
                </div>
              )}
            </div>
          )}

          {activeTab === 'Members' && (
            <div>
              {isLoadingMembers ? (
                <div className="flex items-center justify-center py-6 md:py-8">
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
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
                    const avatarBgColor = avatarColors[avatarColorIndex];

                    // Get first initial
                    const initial = name.charAt(0).toUpperCase() || username.charAt(0).toUpperCase() || 'U';

                    return (
                      <div
                        key={member.id || user.id}
                        className="flex items-center gap-3 md:gap-4 py-3 md:py-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
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
                          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                            <h4 className="font-bold text-sm md:text-base text-foreground">
                              @{username || name.toLowerCase().replace(/\s+/g, '_')}
                            </h4>
                            {isFounder && (
                              <span className="bg-red-500 text-white text-[10px] md:text-xs font-semibold px-1.5 md:px-2 py-0.5 rounded-full">
                                Founder
                              </span>
                            )}
                          </div>
                          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">
                            Active member
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8 text-xs md:text-sm text-muted-foreground">
                  No members found
                </div>
              )}
            </div>
          )}

          {activeTab === 'Donations' && (
            <div>
              {isLoadingDonations ? (
                <div className="flex items-center justify-center py-6 md:py-8">
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
                </div>
              ) : donations.length > 0 ? (
                <div className="space-y-0">
                  {donations.map((donation: any, index: number) => (
                    <div
                      key={donation.id || index}
                      className="flex items-center gap-3 md:gap-4 py-3 md:py-4 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm md:text-base text-foreground mb-0.5 md:mb-1">
                          ${donation.amount || donation.donation_amount || '0.00'}
                        </h4>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {donation.created_at
                            ? new Date(donation.created_at).toLocaleDateString()
                            : 'Recent donation'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8 text-xs md:text-sm text-muted-foreground">
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

