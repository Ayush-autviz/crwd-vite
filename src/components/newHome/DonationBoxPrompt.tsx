import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/store';

export default function DonationBoxPrompt() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const firstName = user?.first_name || 'there';

  return (
    <div className="px-4 py-6">
      {/* Greeting */}
      <h2 className="text-2xl font-bold text-foreground text-center mb-6">
        Hi {firstName}, ready to make an impact?
      </h2>

      {/* Action Cards */}
      <div className="space-y-4">
        {/* Create Donation Box Card */}
        <Card
          onClick={() => navigate('/donation')}
          className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Blue Icon */}
              <div className="w-12 h-12 rounded-full bg-[#1600ff] flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-foreground mb-2">
                  Create a Donation Box
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Support multiple causes with one donation
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/donation');
                  }}
                  className="text-[#1600ff] font-medium text-sm hover:underline"
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
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Green Icon */}
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-foreground mb-2">
                  Start Your Own Collective
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Bring people together around causes you care about.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/create-crwd');
                  }}
                  className="text-foreground font-medium text-sm hover:underline"
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


