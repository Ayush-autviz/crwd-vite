import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/store';

interface CauseActionButtonsProps {
  onAddToDonationBox: () => void;
  onDonate: () => void;
}

export default function CauseActionButtons({
  onAddToDonationBox,
  onDonate,
}: CauseActionButtonsProps) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const handleAddToDonationBox = () => {
    if (!currentUser?.id) {
      navigate('/onboarding');
      return;
    }
    onAddToDonationBox();
  };

  const handleDonate = () => {
    if (!currentUser?.id) {
      navigate('/onboarding');
      return;
    }
    onDonate();
  };

  return (
    <div className="px-3 md:px-4 py-3 md:py-4 space-y-2.5 md:space-y-3">
      {/* <Button
        onClick={handleAddToDonationBox}
        className="w-full bg-[#aeff30] hover:bg-[#93c902] text-black font-semibold rounded-full py-4 md:py-5 text-sm md:text-base"
      >
        <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
        Add to Donation Box
      </Button> */}
      
      <Button
        onClick={handleDonate}
        className="w-full bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-full py-5 text-base"
      >
        Be the First to Donate
      </Button>
    </div>
  );
}

