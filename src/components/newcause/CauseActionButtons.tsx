import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/store';

interface CauseActionButtonsProps {
  onAddToDonationBox: () => void;
  onDonate: () => void;
  isAlreadyInBox?: boolean;
}

export default function CauseActionButtons({
  onAddToDonationBox,
  onDonate,
  isAlreadyInBox = false,
}: CauseActionButtonsProps) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const handleAddToDonationBox = () => {
    if (!currentUser?.id) {
      navigate('/onboarding');
      return;
    }
    // If already in box, navigate to donation box setup tab instead of showing modal
    if (isAlreadyInBox) {
      navigate('/donation?tab=setup', { replace: true });
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
      <Button
        onClick={handleAddToDonationBox}
        className={`w-full font-semibold rounded-full py-4 md:py-5 text-sm md:text-base ${isAlreadyInBox
            ? 'bg-green-100 hover:bg-green-200 text-green-700 cursor-pointer'
            : 'bg-[#1660ff] hover:bg-[#1400cc] text-white'
          }`}
      >
        {isAlreadyInBox ? (
          <>
            <Check className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
            Added
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
            Donate
          </>
        )}
      </Button>

      {/* <Button
        onClick={handleDonate}
        className="w-full bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-full py-5 text-base"
      >
        Be the First to Donate
      </Button> */}
    </div>
  );
}

