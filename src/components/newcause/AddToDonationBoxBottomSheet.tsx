import { useState, useEffect } from 'react';
import { X, ChevronRight, Heart, ShoppingBag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToDonationBoxBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onOneTimeDonation: () => void;
  isPending?: boolean;
}

export default function AddToDonationBoxBottomSheet({
  isOpen,
  onClose,
  onConfirm,
  onOneTimeDonation,
  isPending = false,
}: AddToDonationBoxBottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(false);
      timer = setTimeout(() => setIsAnimating(true), 20);
    } else if (isVisible) {
      setIsAnimating(false);
      timer = setTimeout(() => setIsVisible(false), 300);
    }
    return () => clearTimeout(timer);
  }, [isOpen, isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-300",
        isAnimating ? "opacity-100" : "opacity-0"
      )}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

      {/* Bottom Sheet */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 flex flex-col pb-10",
          isAnimating ? "translate-y-0" : "translate-y-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle & Close Button */}
        <div className="relative flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-gray-100 rounded-full" />
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-1.5 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors "
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-[24px] font-bold text-gray-900  tracking-tight">
              Support this cause
            </h2>
            <p className="text-[15px] text-gray-500 font-medium">
              Choose how you want to make an impact
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {/* Create a Donation Box Option */}
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="w-full flex items-center justify-between py-3 px-4 bg-[#1600ff] text-white rounded-xl hover:bg-[#1400cc] transition-all group active:scale-[0.98] shadow-lg shadow-blue-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  {isPending ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <ShoppingBag className="w-6 h-6 text-white stroke-[2.5px]" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="text-[18px] font-bold leading-tight mb-0.5">Create a Donation Box</h3>
                  <p className="text-[14px] text-white/80 font-medium">Support multiple causes monthly</p>
                </div>
              </div>
              <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full group-hover:translate-x-0.5 transition-transform">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
            </button>

            {/* One-time Donation Option */}
            <button
              onClick={() => {
                onClose();
                onOneTimeDonation();
              }}
              disabled={isPending}
              className="w-full flex items-center justify-between py-3 px-4 bg-white border border-gray-100 shadow-sm text-gray-900 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-gray-400 stroke-[2.5px]" />
                </div>
                <div className="text-left">
                  <h3 className="text-[18px] font-bold leading-tight mb-0.5">One-time Donation</h3>
                  <p className="text-[14px] text-gray-500 font-medium">Make a single contribution</p>
                </div>
              </div>
              <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

