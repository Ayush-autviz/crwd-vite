import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Phone, HelpCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSurpriseMe } from '@/services/api/crwd';
import { addCausesToBox, getDonationBox } from '@/services/api/donation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/store';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Get consistent color for avatar
const avatarColors = [
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#10B981', // Green
  '#EC4899', // Pink/Red
  '#F97316', // Orange
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#A855F7', // Violet
];

const getConsistentColor = (id: number | string, colors: string[]) => {
  const hash = typeof id === 'number' ? id : id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Helper function to truncate description at first period
const truncateAtFirstPeriod = (text: string): string => {
  if (!text) return text;
  const periodIndex = text.indexOf('.');
  return periodIndex !== -1 ? text.substring(0, periodIndex + 1) : text;
};

export default function SurpriseMePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();
  const [surpriseCauses, setSurpriseCauses] = useState<any[]>([]);

  // Get categories from URL params or location state
  const categoriesFromParams = searchParams.get('categories');
  const categoriesFromState = (location.state as any)?.categories;
  const categories = categoriesFromParams
    ? categoriesFromParams.split(',').filter(Boolean)
    : categoriesFromState || undefined;

  // Fetch random causes using the surprise me API
  const { data: surpriseData, isLoading, refetch } = useQuery({
    queryKey: ['surprise-me', categories],
    queryFn: () => getSurpriseMe(categories),
    enabled: true,
  });

  // Fetch donation box data to check if it's set up
  const { data: donationBoxData } = useQuery({
    queryKey: ['donationBox', user?.id],
    queryFn: getDonationBox,
    enabled: !!user?.id && !!token?.access_token,
  });

  // Set causes when data is loaded
  useEffect(() => {
    if (surpriseData) {
      // Handle different response structures
      if (Array.isArray(surpriseData)) {
        setSurpriseCauses(surpriseData);
      } else if (surpriseData.data && Array.isArray(surpriseData.data)) {
        setSurpriseCauses(surpriseData.data);
      } else if (surpriseData.results && Array.isArray(surpriseData.results)) {
        setSurpriseCauses(surpriseData.results);
      }
    }
  }, [surpriseData]);

  // Add all causes to donation box mutation (only used when donation box is already set up)
  const addToBoxMutation = useMutation({
    mutationFn: async (causes: Array<{ cause_id: number }>) => {
      return await addCausesToBox({ causes });
    },
    onSuccess: () => {
      toast.success('All nonprofits added to donation box!');
      queryClient.invalidateQueries({ queryKey: ['donationBox'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add nonprofits to donation box');
    },
  });

  const handleSurpriseAgain = () => {
    refetch();
  };

  const handleAddAllToBox = () => {
    if (surpriseCauses.length === 0) return;

    // Check if donation box exists and is active
    const isDonationBoxNotFound = donationBoxData?.message === 'Donation box not found';
    const hasDonationBox = donationBoxData && !isDonationBoxNotFound && donationBoxData.id;

    if (!hasDonationBox) {

      // Donation box not set up - navigate to donation box setup with preselected causes
      const causeIds = surpriseCauses.map((cause) => cause.id);
      navigate('/donation?tab=setup', {
        state: {
          preselectedCauses: causeIds, // IDs
          preselectedCausesData: surpriseCauses, // Full cause objects
        },
      });
    } else {
      // Donation box is set up - check capacity before adding causes
      // Calculate fees and capacity
      // For donations < $10.00: Flat fee of $1.00
      // For donations ≥ $10.00: 10% of total (covers all platform + processing costs)
      const calculateFees = (grossAmount: number) => {
        const gross = grossAmount;
        let crwdFee: number;
        let net: number;

        if (gross < 10.00) {
          // Flat fee of $1.00
          crwdFee = 1.00;
          net = gross - crwdFee;
        } else {
          // 10% of total
          crwdFee = gross * 0.10;
          net = gross - crwdFee;
        }

        return {
          crwdFee: Math.round(crwdFee * 100) / 100,
          net: Math.round(net * 100) / 100,
        };
      };

      const monthlyAmount = parseFloat(donationBoxData.monthly_amount || '0');
      const fees = calculateFees(monthlyAmount);
      const net = fees.net;
      const maxCapacity = Math.floor(net / 0.20);

      // Count current causes in the box
      const boxCauses = donationBoxData.box_causes || [];
      const currentCapacity = boxCauses.length;

      // Check if adding all surprise causes would exceed capacity
      const newCausesCount = surpriseCauses.length;
      const totalAfterAdding = currentCapacity + newCausesCount;

      if (totalAfterAdding > maxCapacity) {
        const availableSlots = maxCapacity - currentCapacity;
        if (availableSlots <= 0) {
          toast.error(
            `Your donation box is full. You can only support up to ${maxCapacity} cause${maxCapacity !== 1 ? 's' : ''} for $${monthlyAmount} per month. Please increase your donation amount or remove some causes to add these.`
          );
        } else {
          toast.error(
            `You can only add ${availableSlots} more cause${availableSlots !== 1 ? 's' : ''} to your donation box. You're trying to add ${newCausesCount} cause${newCausesCount !== 1 ? 's' : ''}. Please increase your donation amount or remove some causes first.`
          );
        }
        return;
      }

      // If capacity check passes, proceed with adding
      const causes = surpriseCauses.map((cause) => ({
        cause_id: cause.id,
      }));
      addToBoxMutation.mutate(causes);
    }
  };

  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 w-full flex items-center justify-between px-3 md:px-4 py-3 md:py-4 border-b bg-white">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>
        <button
          onClick={handleSurpriseAgain}
          className="flex items-center gap-1 md:gap-1.5 text-purple-600 hover:text-purple-700 font-medium text-xs md:text-sm"
        >
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Surprise Me Again
        </button>
      </div>

      {/* Main Content */}
      <div className="md:max-w-[60%] mx-auto">
        <div className="px-3 md:px-4 py-4 md:py-6">
          {/* Sparkle Icons */}
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="flex gap-1.5 md:gap-2">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-1.5 md:mb-2">
            Your Surprise Nonprofits!
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8">
            We picked these 5 amazing organizations for you
          </p>

          {/* Nonprofit Cards */}
          <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
            {surpriseCauses.map((cause) => {
              const avatarBgColor = getConsistentColor(cause.id, avatarColors);
              const initials = getInitials(cause.name || 'N');

              return (
                <Card
                  key={cause.id}
                  onClick={() => navigate(`/c/${cause.sort_name}`)}
                  className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
                >
                  <CardContent className="px-3 md:px-4 ">
                    <div className="flex items-start gap-3 md:gap-4">
                      <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0">
                        <AvatarImage src={cause.image || undefined} alt={cause.name} />
                        <AvatarFallback
                          style={{ backgroundColor: avatarBgColor }}
                          className="text-white rounded-lg font-bold text-sm md:text-base"
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm md:text-base text-foreground mb-0.5 md:mb-1">
                          {cause.name}
                        </h3>
                        {(cause.city || cause.state) && (
                          <p className="text-xs md:text-sm text-gray-600 mb-1.5 md:mb-2">
                            {[cause.city, cause.state].filter(Boolean).join(', ')}
                          </p>
                        )}
                        <p className="text-xs md:text-sm text-gray-700">
                          {truncateAtFirstPeriod(cause.mission || cause.description || 'No description available')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white px-3 md:px-4 py-3 md:py-4 space-y-3 md:space-y-4 safe-area-bottom md:max-w-[60%] mx-auto">
          {/* Add All Button */}
          <Button
            onClick={handleAddAllToBox}
            disabled={addToBoxMutation.isPending || surpriseCauses.length === 0}
            className="w-full bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-lg py-4 md:py-6 text-sm md:text-base"
          >
            {addToBoxMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              `Add All ${surpriseCauses.length} to Donation Box`
            )}
          </Button>

          {/* Surprise Me Again */}
          <div className="text-center">
            <button
              onClick={handleSurpriseAgain}
              className="flex items-center gap-1 md:gap-1.5 text-purple-600 hover:text-purple-700 font-medium mx-auto text-xs md:text-sm"
            >
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500" />
              Surprise Me Again
            </button>
          </div>


        </div>

      </div>

      {/* Spacer to prevent content from being hidden behind fixed footer */}
      <div className="h-20 md:h-24" />
    </div>
  );
}

