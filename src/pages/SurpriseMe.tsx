import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Phone, HelpCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCausesBySearch } from '@/services/api/crwd';
import { addCausesToBox } from '@/services/api/donation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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

export default function SurpriseMePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [surpriseCauses, setSurpriseCauses] = useState<any[]>([]);

  // Fetch causes - we'll get a random set
  const { data: causesData, isLoading, refetch } = useQuery({
    queryKey: ['surprise-causes'],
    queryFn: () => getCausesBySearch('', '', 1),
    enabled: true,
  });

  // Get 5 random causes when data is loaded
  useEffect(() => {
    if (causesData?.results && causesData.results.length > 0) {
      const shuffled = [...causesData.results].sort(() => 0.5 - Math.random());
      setSurpriseCauses(shuffled.slice(0, 5));
    }
  }, [causesData]);

  // Add all causes to donation box mutation
  const addToBoxMutation = useMutation({
    mutationFn: async (causeIds: number[]) => {
      return await addCausesToBox({ cause_ids: causeIds });
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
    if (surpriseCauses.length > 0) {
      const causeIds = surpriseCauses.map((cause) => cause.id);
      addToBoxMutation.mutate(causeIds);
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
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 w-full flex items-center justify-between px-4 py-4 border-b bg-white">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={handleSurpriseAgain}
          className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Surprise Again
        </button>
      </div>

      {/* Main Content */}
      <div className="md:max-w-[60%] mx-auto">
      <div className="px-4 py-6">
        {/* Sparkle Icons */}
        <div className="flex justify-center mb-4">
          <div className="flex gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground text-center mb-2">
          Your Surprise Nonprofits!
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-center mb-8">
          We picked these 5 amazing organizations for you
        </p>

        {/* Nonprofit Cards */}
        <div className="space-y-4 mb-8">
          {surpriseCauses.map((cause) => {
            const avatarBgColor = getConsistentColor(cause.id, avatarColors);
            const initials = getInitials(cause.name || 'N');

            return (
              <Card
                key={cause.id}
                onClick={() => navigate(`/cause/${cause.id}`)}
                className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
              >
                <CardContent className="px-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 rounded-lg flex-shrink-0">
                      <AvatarImage src={cause.image || undefined} alt={cause.name} />
                      <AvatarFallback
                        style={{ backgroundColor: avatarBgColor }}
                        className="text-white rounded-lg font-bold text-base"
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-foreground mb-1">
                        {cause.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {cause.mission || cause.description || 'No description available'}
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
      <div className="fixed bottom-0 left-0 right-0 bg-white px-4 py-4 space-y-4 safe-area-bottom md:max-w-[60%] mx-auto">
        {/* Add All Button */}
        <Button
          onClick={handleAddAllToBox}
          disabled={addToBoxMutation.isPending || surpriseCauses.length === 0}
          className="w-full bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-lg py-6 text-base"
        >
          {addToBoxMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
            className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-medium mx-auto"
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Surprise Me Again
          </button>
        </div>


      </div>

      </div>

      {/* Spacer to prevent content from being hidden behind fixed footer */}
      <div className="h-24" />
    </div>
  );
}

