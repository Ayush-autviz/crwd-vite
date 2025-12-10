import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/store';

export default function DonationBoxPrompt() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const firstName = user?.first_name || 'there';

  return (
    <div className="w-full py-4 md:py-6">
      {/* Greeting */}
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">
        Hi {firstName}, ready to make an impact?
      </h2>

      {/* Action Cards */}
      <div className="space-y-3 md:space-y-4">
        {/* Create Donation Box Card */}
        <Card
          onClick={() => navigate('/donation')}
          className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              {/* Blue Icon */}
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1600ff] flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base md:text-lg text-foreground">
                  Create a Donation Box
                </h3>
                <p className="text-xs md:text-sm text-gray-600 mb-2 mt-1">
                  Support multiple causes with one donation
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/donation');
                  }}
                  className="text-[#1600ff] font-semibold text-xs md:text-sm hover:underline"
                >
                  Start donating →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Collective Card */}
        <Card
          onClick={() => navigate('/create-crwd')}
          className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              {/* Green Icon */}
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#aeff30] flex items-center justify-center flex-shrink-0">
                <Plus className="w-5 h-5 md:w-6 md:h-6 text-black" strokeWidth={3}/>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base md:text-lg text-foreground">
                  Start Your Own Collective
                </h3>
                <p className="text-xs md:text-sm text-gray-600 mb-2 mt-1">
                  Bring people together around causes you care about.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/create-crwd');
                  }}
                  className="text-foreground font-semibold text-xs md:text-sm hover:underline"
                >
                  Create collective →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


