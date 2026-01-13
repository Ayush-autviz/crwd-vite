import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/store';

interface DonationBoxPromptProps {
  causeCount?: number;
  hasJoinedCollectives?: boolean; // Hide "Start Your Own Collective" if user has joined collectives
}

export default function DonationBoxPrompt({ causeCount }: DonationBoxPromptProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const firstName = user?.first_name || 'there';

  // If causeCount is provided, show the "You're Almost There!" card
  const showAlmostThereCard = causeCount !== undefined && causeCount > 0;

  return (
    <div className="w-full py-2 md:py-6 md:max-w-2xl md:mx-auto">
      {/* Greeting - Only show if not showing "Almost There" card */}

      <h2 className="text-base xs:text-lg md:text-2xl font-bold text-foreground mb-3 md:mb-6">
        Hi {firstName}, ready to make an impact?
      </h2>


      {/* Action Cards */}
      <div className="space-y-2 md:space-y-4">
        {/* You're Almost There Card - Show when donation box exists but is not active */}
        {showAlmostThereCard ? (
          <Card
            onClick={() => navigate('/donation?tab=setup')}
            className="cursor-pointer py-0 shadow-none border border-orange-300 bg-yellow-50"
          >
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col items-start gap-2.5 md:flex-row md:items-start md:gap-4">
                {/* Orange Clock Icon */}
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 md:w-6 md:w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left w-full md:w-auto">
                  <h3 className="font-bold text-sm xs:text-base md:text-lg text-gray-900 mb-0.5 md:mb-1">
                    You're Almost There!
                  </h3>
                  <p className="text-xs xs:text-sm md:text-base text-amber-900 mb-2 md:mb-3">
                    You selected <span className="font-bold">{causeCount} {causeCount === 1 ? 'cause' : 'causes'}</span> but haven't started donating yet
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/donation?tab=setup');
                    }}
                    className="p-0 self-start text-left text-orange-600 font-semibold text-xs xs:text-sm md:text-base hover:underline flex items-center gap-1"
                  >
                    Complete Setup - Just 2 minutes!
                    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Create Donation Box Card - Show when no donation box exists */
          <Card
            onClick={() => navigate('/donation')}
            className="cursor-pointer py-0 shadow-none border border-gray-200"
          >
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col items-start gap-2.5 md:flex-row md:items-start md:gap-4">
                {/* Blue Icon */}
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[#1600ff] flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left w-full md:w-auto">
                  <h3 className="font-bold text-xs xs:text-sm md:text-lg text-foreground">
                    Create a Donation Box
                  </h3>
                  <p className="text-[10px] xs:text-xs md:text-sm text-gray-600 mb-1.5 md:mb-2 mt-0.5 md:mt-1">
                    Support multiple causes with one donation
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/donation');
                    }}
                    className="text-[#1600ff] font-semibold text-[10px] xs:text-xs md:text-sm hover:underline"
                  >
                    Start donating →
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start Collective Card - Only show if user hasn't joined any collectives */}
        {/* {!hasJoinedCollectives && (
          <Card
            onClick={() => navigate('/create-crwd')}
            className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 bg-white"
          >
            <CardContent className="p-3 md:p-6 lg:p-8 xl:p-10">
              <div className="flex flex-col items-start gap-2.5 md:flex-row md:items-start md:gap-4 lg:gap-6">
                <div className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full bg-[#aeff30] flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 md:w-6 md:h-6 text-black" strokeWidth={3}/>
                </div>
                <div className="flex-1 min-w-0 text-left w-full md:w-auto">
                  <h3 className="font-bold text-sm md:text-lg lg:text-xl xl:text-2xl text-foreground">
                    Start Your Own Collective
                  </h3>
                  <p className="text-xs md:text-sm lg:text-base xl:text-lg text-gray-600 mb-1.5 md:mb-2 lg:mb-3 mt-0.5 md:mt-1">
                    Bring people together around causes you care about.
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/create-crwd');
                    }}
                    className="text-foreground font-semibold text-xs md:text-sm hover:underline flex items-center gap-1 self-start"
                  >
                    Create collective
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}
      </div>
    </div>
  );
}


