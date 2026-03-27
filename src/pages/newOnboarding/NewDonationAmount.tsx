import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewDonationAmount() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const [amount, setAmount] = useState<number | string>(10);
  const [isCustom, setIsCustom] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCustom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCustom]);

  const handleIncrement = () => {
    const currentVal = typeof amount === 'string' ? parseInt(amount) || 0 : amount;
    setAmount(currentVal + 1);
    setIsCustom(false);
  };

  const handleDecrement = () => {
    const currentVal = typeof amount === 'string' ? parseInt(amount) || 0 : amount;
    setAmount(Math.max(5, currentVal - 1));
    setIsCustom(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setAmount('');
      return;
    }
    // Limit to 5 digits
    if (val.length > 5) return;

    const num = parseInt(val);
    if (!isNaN(num)) {
      setAmount(num);
    }
  };

  const handleInputBlur = () => {
    const num = typeof amount === 'string' ? parseInt(amount) || 0 : amount;
    if (num < 5) {
      setAmount(5);
    }
  };

  const handleCustomClick = () => {
    if (isCustom) {
      inputRef.current?.focus();
    } else {
      setIsCustom(true);
    }
  };

  const handleContinue = () => {
    const finalAmount = typeof amount === 'string' ? parseInt(amount) || 5 : amount;
    if (finalAmount < 5) return;

    navigate(`/onboard-success?redirectTo=${encodeURIComponent(redirectTo)}`, {
      state: {
        ...(location.state as any),
        amount: finalAmount
      }
    });
  };

  const handleSkip = () => {
    // navigate(`/onboard-success?redirectTo=${encodeURIComponent(redirectTo)}`, {
    //   state: { ...(location.state as any) }
    // });
    navigate('/')
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white overflow-hidden">
      <div className="w-full max-w-2xl bg-white rounded-xl flex flex-col items-start p-4 sm:p-6 md:p-8">

        {/* Progress Indicator - Step 4 of 5 */}
        <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mb-8 w-full">
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-[#1600ff] rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-[#1600ff] rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-[#1600ff] rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-[#1600ff] rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-200 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="w-full text-left mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
            How much do you want to give each month?
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-medium">
            $5 minimum.
          </p>
        </div>

        {/* Amount Selector */}
        <div className="w-full flex flex-col items-center mb-12">
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
            <button
              onClick={handleDecrement}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-95 shrink-0"
            >
              <Minus className="w-6 h-6 text-gray-400" />
            </button>

            <div className="flex flex-col items-center min-w-[120px]">
              {isCustom ? (
                <div className="flex items-center justify-center">
                  <span className="text-4xl xs:text-5xl font-bold text-[#1600ff] mr-[-2px]">$</span>
                  <input
                    ref={inputRef}
                    type="number"
                    value={amount}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className="text-4xl xs:text-5xl font-bold text-[#1600ff] bg-transparent border-none focus:ring-0 outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{
                      width: `${(amount.toString().length || 1) * 0.7}em`,
                      minWidth: '1.2em'
                    }}
                  />
                </div>
              ) : (
                <span className="text-4xl xs:text-5xl font-bold text-[#1600ff]">
                  ${amount}
                </span>
              )}
              <span className="text-sm sm:text-base text-gray-500 font-semibold mt-1">
                per month
              </span>
            </div>

            <button
              onClick={handleIncrement}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-95 shrink-0"
            >
              <Plus className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <button
            onClick={handleCustomClick}
            className="text-gray-500 font-bold text-sm sm:text-base underline decoration-2 underline-offset-4 hover:text-gray-900 transition-colors"
          >
            Enter custom amount
          </button>
        </div>

        {/* Info Box */}
        <div className="w-full bg-[#f7f7f2] rounded-2xl p-4 sm:p-6 mb-12">
          <p className="text-base sm:text-lg text-gray-600 font-bold text-center leading-relaxed">
            Start with what feels comfortable. You can always adjust.
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleContinue}
          disabled={typeof amount === 'number' && amount < 5}
          className="w-full h-14 bg-[#1600ff] hover:bg-[#1100cc] text-white text-base sm:text-lg font-bold rounded-lg transition-all active:scale-[0.98] mb-4 disabled:opacity-50"
        >
          Continue
        </Button>

        <button
          onClick={handleSkip}
          className="w-full text-center text-gray-500 font-bold text-sm sm:text-base hover:text-gray-900"
        >
          Skip for now, I'll set this up later
        </button>

      </div>
    </div>
  );
}
