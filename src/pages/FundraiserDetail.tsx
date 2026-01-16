import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, MoreHorizontal, Users, TrendingUp, Pencil, Flag } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getFundraiserById, patchFundraiser } from '@/services/api/crwd';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import dayjs from 'dayjs';
import { SharePost } from "@/components/ui/SharePost";
import { queryClient } from '@/lib/react-query/client';

// Avatar colors for consistent fallback styling
const avatarColors = [
  '#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3',
  '#FFC107', '#E91E63', '#00BCD4', '#8BC34A', '#FF5722',
  '#673AB7', '#009688', '#FFEB3B', '#795548', '#607D8B',
];

const getConsistentColor = (id: number | string | undefined, fallbackName?: string) => {
  if (id !== undefined && id !== null) {
    const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return avatarColors[hash % avatarColors.length];
  }
  if (fallbackName) {
    const hash = fallbackName.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return avatarColors[hash % avatarColors.length];
  }
  return avatarColors[0];
};

const getInitials = (name: string) => {
  const words = name.split(' ').filter(Boolean);
  if (words.length === 0) return 'N';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export default function FundraiserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [donationAmount, setDonationAmount] = useState('25');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Fetch fundraiser data
  const { data: fundraiserData, isLoading, error } = useQuery({
    queryKey: ['fundraiser', id],
    queryFn: () => getFundraiserById(id || ''),
    enabled: !!id,
  });

  // End Fundraiser Mutation
  const endFundraiserMutation = useMutation({
    mutationFn: (fundraiserId: number) => patchFundraiser(fundraiserId.toString(), { is_active: false }),
    onSuccess: () => {
      setToastMessage('Fundraiser ended successfully');
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['fundraiser', id] });
      navigate(-1);
      setShowDropdown(false);
    },
    onError: (error: any) => {
      console.error('Error ending fundraiser:', error);
      setToastMessage(`Failed to end fundraiser: ${error.response?.data?.message || error.message}`);
      setShowToast(true);
      setShowDropdown(false);
    },
  });

  // Calculate days left
  const daysLeft = fundraiserData?.end_date
    ? Math.max(0, dayjs(fundraiserData.end_date).diff(dayjs(), 'day'))
    : 0;

  const handleDonate = () => {
    if (!fundraiserData?.causes || fundraiserData.causes.length === 0) {
      toast.error('No nonprofits selected for this fundraiser.');
      return;
    }

    // Navigate to one-time donation page with preselected causes and fundraiser ID
    const preselectedCauseIds = fundraiserData.causes.map((cause: any) => cause.id);
    const preselectedCausesData = fundraiserData.causes;

    navigate('/one-time-donation', {
      state: {
        preselectedCauses: preselectedCauseIds,
        preselectedCausesData: preselectedCausesData,
        fundraiserId: fundraiserData.id,
        donationAmount: donationAmount || '25',
        fundraiserTitle: fundraiserData.name,
      },
    });
  };

  const handleEditFundraiser = () => {
    if (id) {
      navigate(`/edit-fundraiser/${id}`);
    }
    setShowDropdown(false);
  };

  const handleEndFundraiser = () => {
    if (id) {
      endFundraiserMutation.mutate(Number(id));
    }
  };

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !fundraiserData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            Fundraiser not found
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-4">
            The fundraiser you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const collective = fundraiserData.collective;

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Banner Background */}
      <div className={`sticky top-0 z-10 ${fundraiserData.color || fundraiserData.image ? 'relative' : 'bg-white'} border-b overflow-hidden`}>
        {/* Banner Background */}
        {(fundraiserData.color || fundraiserData.image) && (
          <div className="absolute inset-0 w-full h-full">
            {fundraiserData.color ? (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: fundraiserData.color }}
              />
            ) : fundraiserData.image ? (
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-xs scale-110"
                style={{ backgroundImage: `url(${fundraiserData.image})` }}
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: '#1600ff' }}
              />
            )}
          </div>
        )}

        {/* Header Content */}
        <div className={`relative z-10 px-4 py-3 md:px-6 md:py-4`}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-700" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 top-8 md:top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px] md:min-w-[180px]">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditFundraiser();
                      }}
                      className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                      <span>Edit Fundraiser</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEndFundraiser();
                      }}
                      disabled={endFundraiserMutation.isPending}
                      className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-red-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Flag className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                      <span>{endFundraiserMutation.isPending ? 'Ending...' : 'End Fundraiser'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Amount and Progress */}
          <div className="mb-3 bg-white p-4 rounded-lg">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl md:text-3xl font-bold text-[#1600ff]">
                ${parseFloat(fundraiserData.current_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-sm md:text-base text-gray-500">
                raised of ${parseFloat(fundraiserData.target_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} goal
              </span>
            </div>
            <div className="w-full h-2 md:h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#1600ff] transition-all duration-300"
                style={{ width: `${fundraiserData.progress_percentage || 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-gray-600">
                {(fundraiserData.progress_percentage || 0).toFixed(2)}% of goal
              </span>
              {daysLeft > 0 && (
                <span className="text-xs md:text-sm text-gray-600">
                  {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Campaign Title and Collective Tag */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
            {fundraiserData.name}
          </h1>
          {collective && (
            <Link
              to={`/groupcrwd/${collective.id}`}
              className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 text-[#1600ff] rounded-full text-xs md:text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {collective.name}
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-3 md:mb-5">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              <span className="text-xs md:text-sm text-gray-600 font-medium">Donors</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {fundraiserData.total_donors || 0}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-3 md:mb-5">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              <span className="text-xs md:text-sm text-gray-600 font-medium">Avg. Donation</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              ${parseFloat(fundraiserData.average_donation || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Campaign Story */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Campaign Story</h2>
          <div className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
            {fundraiserData.description || 'No description available.'}
          </div>
        </div>

        {/* Organized By */}
        {collective && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Organized By</h2>
            <Link
              to={`/groupcrwd/${collective.id}`}
              className="flex items-center gap-3 md:gap-4 bg-white border border-gray-200 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors"
            >
              <Avatar className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
                <AvatarImage src={collective.image} alt={collective.name} />
                <AvatarFallback
                  style={{ backgroundColor: collective.color || getConsistentColor(collective.id, collective.name) }}
                  className="text-white font-bold text-sm md:text-base"
                >
                  {getInitials(collective.name || 'Collective').charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm md:text-base text-gray-900 truncate">
                  {collective.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  {collective.members_count || 0} member{(collective.members_count || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          </div>
        )}

        {/* Supporting Nonprofits */}
        {fundraiserData.causes && fundraiserData.causes.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
              Supporting {fundraiserData.causes.length} Nonprofit{fundraiserData.causes.length !== 1 ? 's' : ''}
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-4">
              Your donation will be split evenly among these organizations:
            </p>
            <div className="space-y-3 md:space-y-4">
              {fundraiserData.causes.map((cause: any) => {
                const avatarBgColor = getConsistentColor(cause.id, cause.name);
                const initials = getInitials(cause.name || 'Nonprofit').charAt(0);
                return (
                  <Link
                    key={cause.id}
                    to={`/cause/${cause.id}`}
                    className="flex items-center gap-3 md:gap-4 bg-white border border-gray-200 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
                      <AvatarImage src={cause.image} alt={cause.name} />
                      <AvatarFallback
                        style={{ backgroundColor: avatarBgColor }}
                        className="text-white font-bold text-sm md:text-base"
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm md:text-base text-gray-900 truncate">
                        {cause.name}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Supporters */}
        {fundraiserData.recent_donors && fundraiserData.recent_donors.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Recent Supporters</h2>
            <div className="space-y-3 md:space-y-4">
              {fundraiserData.recent_donors.slice(0, 5).map((donor: any) => {
                const displayName = donor.name || 'Anonymous';
                const avatarBgColor = donor.color || getConsistentColor(donor.id, displayName);
                const initials = getInitials(displayName).charAt(0);
                return (
                  <Link
                    key={donor.id}
                    to={`/user-profile/${donor.id}`}
                    className="flex items-center gap-3 md:gap-4 bg-white border border-gray-200 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                      <AvatarImage src={donor.image} alt={displayName} />
                      <AvatarFallback
                        style={{ backgroundColor: avatarBgColor }}
                        className="text-white font-bold text-xs md:text-sm"
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm md:text-base text-gray-900 truncate">
                        {displayName}
                      </h3>
                      {donor.latest_donation_date && (
                        <p className="text-xs md:text-sm text-gray-600">
                          {formatDistanceToNow(new Date(donor.latest_donation_date), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                    {donor.amount_donated && (
                      <div className="flex-shrink-0">
                        <p className="text-sm md:text-base font-bold text-[#1600ff]">
                          ${parseFloat(donor.amount_donated.toString()).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Donation Input */}
      {fundraiserData.is_active && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 md:px-6 py-4 md:py-5">
          <div className="max-w-2xl mx-auto flex items-center gap-3 md:gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium text-sm md:text-base">
                $
              </span>
              <Input
                type="number"
                value={donationAmount}
                onChange={(e) => {
                  // Only allow numbers
                  const numericValue = e.target.value.replace(/[^0-9]/g, '');
                  setDonationAmount(numericValue);
                }}
                placeholder="25"
                className="pl-8 md:pl-10 text-sm md:text-base"
                min="1"
              />
            </div>
            <Button
              onClick={handleDonate}
              disabled={!donationAmount || parseFloat(donationAmount) <= 0}
              className="bg-[#1600ff] hover:bg-[#1400cc] text-white text-sm md:text-base px-6 md:px-8 py-2 md:py-2.5"
            >
              Donate to Campaign
            </Button>
          </div>
        </div>
      )}


      {/* Spacer for fixed footer */}
      <div className="h-20 md:h-24"></div>

      {fundraiserData && (
        <SharePost
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          url={window.location.href}
          title={fundraiserData.name}
          description={fundraiserData.description || `Check out this fundraiser: ${fundraiserData.name}`}
        />
      )}
    </div>
  );
}
