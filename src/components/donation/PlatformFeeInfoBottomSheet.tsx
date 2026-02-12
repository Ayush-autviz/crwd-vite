import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface PlatformFeeInfoBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlatformFeeInfoBottomSheet({
  isOpen,
  onClose,
}: PlatformFeeInfoBottomSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <SheetContent side="bottom" className="rounded-t-3xl pt-2 pb-6 px-6 h-auto max-h-[90vh] overflow-y-auto border-none">
        <div className="flex flex-col">
          {/* Handle Bar */}
          <div className="w-12 h-1 bg-gray-200 rounded-full mb-6 mx-auto" />

          <SheetHeader className="">
            <SheetTitle className="text-center text-2xl md:text-3xl font-bold text-gray-900">
              About the Platform Fee
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            <p className="text-center text-sm md:text-base text-gray-600 leading-relaxed px-2">
              At least 90% of your donation goes directly to nonprofits. Up to 10% covers platform operations, including payment processing, nonprofit verification, maintenance, and support.
            </p>

            {/* Tax Deductible Banner */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="text-emerald-800 text-sm md:text-base font-medium">
                Your full donation is tax-deductible
              </span>
            </div>

            {/* Example Box */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-gray-900 text-sm md:text-base">
                Example: $10 donation
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm md:text-base text-gray-600">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span>At least <span className="font-bold text-gray-900">$9.00</span> to nonprofits</span>
                </li>
                <li className="flex items-center gap-2 text-sm md:text-base text-gray-600">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span>Up to <span className="font-bold text-gray-900">$1.00</span> platform costs</span>
                </li>
                <li className="flex items-center gap-2 text-sm md:text-base text-gray-600">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span><span className="font-bold text-gray-900">$10.00</span> tax deduction</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4 pt-2">
              <Button
                onClick={onClose}
                className="w-full bg-[#1600ff] hover:bg-[#1400cc] text-white font-bold py-6 rounded-2xl text-base md:text-lg"
              >
                Got it
              </Button>

              {/* <button 
                className="w-full text-gray-400 text-xs md:text-sm font-medium hover:text-gray-600 transition-colors"
              >
                View full fee disclosure
              </button> */}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
