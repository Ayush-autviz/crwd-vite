import { useState, useEffect } from "react";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface AmountBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount: number;
  onSave: (amount: number) => void;
  label?: string;
}

export default function AmountBottomSheet({
  isOpen,
  onClose,
  initialAmount,
  onSave,
  label = "Monthly Donation",
}: AmountBottomSheetProps) {
  const [amountString, setAmountString] = useState(initialAmount.toString());

  useEffect(() => {
    if (isOpen) {
      setAmountString(initialAmount.toString());
    }
  }, [isOpen, initialAmount]);

  const handleNumberClick = (num: number) => {
    setAmountString((prev) => {
      if (prev === "0") return num.toString();
      return prev + num.toString();
    });
  };

  const handleBackspace = () => {
    setAmountString((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  };

  const handleSave = () => {
    const amount = parseInt(amountString, 10);
    onSave(amount);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <SheetContent side="bottom" className="rounded-t-3xl pt-6 pb-8 px-6 h-auto max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center">
          <div className="w-12 h-1 bg-gray-200 rounded-full mb-6 mx-auto" />
          
          <SheetHeader className="mb-6">
            <SheetTitle className="text-center text-lg font-bold text-gray-900">Set Amount</SheetTitle>
          </SheetHeader>

          <div className="text-center mb-8">
            <div className="text-[#1600ff] text-5xl font-bold mb-2">
              $ {amountString}
            </div>
            <div className="text-gray-400 text-sm font-medium">
              {label}
            </div>
          </div>

          <div className="w-full max-w-[300px] grid grid-cols-3 gap-y-6 gap-x-8 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="text-2xl font-bold text-gray-900 hover:text-[#1600ff] transition-colors py-2"
              >
                {num}
              </button>
            ))}
            <div /> {/* Empty slot for alignment */}
            <button
              onClick={() => handleNumberClick(0)}
              className="text-2xl font-bold text-gray-900 hover:text-[#1600ff] transition-colors py-2"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="flex items-center justify-center text-gray-900 hover:text-[#1600ff] transition-colors py-2"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>

          <div className="w-full space-y-3">
            <Button
              onClick={handleSave}
              className="w-full bg-[#1600ff] hover:bg-[#1400cc] text-white font-bold py-6 rounded-full text-lg"
            >
              Set Amount
            </Button>
            <button
              onClick={onClose}
              className="w-full text-gray-500 font-semibold py-3 text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
