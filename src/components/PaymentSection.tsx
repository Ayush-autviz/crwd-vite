"use client";

// PaymentSection.tsx
// New component to handle Stripe card payment and Apple Pay (Payment Request API) within the checkout flow.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import Image from "next/image"; - replaced with regular img tags
import { ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentSectionProps {
  /** Amount in USD */
  amount: number;
  setCheckout: (value: boolean) => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ amount, setCheckout }) => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  });

  // Handlers just update local state – no real payment logic
  const handleChange = (field: string, value: string) =>
    setCard((prev) => ({ ...prev, [field]: value }));

  return (
    <div className=" py-8 bg-white space-y-6">
      {/* Payment buttons */}
      <div className="space-y-3">
        {/* Apple Pay button */}
        <Button
          onClick={() => setCheckout(true)}
          className="w-full h-12 bg-black hover:bg-black/90 rounded-lg flex items-center justify-center gap-3"
        >
          <Image
            src="/apple-logo.svg"
            alt="Apple Pay"
            width={18}
            height={18}
          />
          <span className="text-lg font-semibold text-white">Pay</span>
        </Button>

        {/* Card payment button */}
        <Button
          onClick={() => setShowCardForm(!showCardForm)}
          className={cn(
            "w-full h-12 rounded-lg flex items-center justify-between px-4",
            "bg-blue-600 hover:bg-blue-700 text-white transition-colors",
            showCardForm && "bg-blue-700"
          )}
        >
          <div className="flex items-center justify-center  mx-auto pl-5 gap-3">
            <CreditCard className="w-5 h-5" />
            <span className="text-lg font-semibold">Pay with card</span>
          </div>
          {showCardForm ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Card form */}
      {showCardForm && (
        <div className="animate-in slide-in-from-top duration-300">
          <div className="bg-blue-50 rounded-xl p-6 space-y-4">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number" className="text-blue-900">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={card.number}
                  onChange={(e) => handleChange("number", e.target.value)}
                  className="bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-name" className="text-blue-900">Name on Card</Label>
                <Input
                  id="card-name"
                  placeholder="John Doe"
                  value={card.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card-expiry" className="text-blue-900">Expiry Date</Label>
                  <Input
                    id="card-expiry"
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={(e) => handleChange("expiry", e.target.value)}
                    className="bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-cvc" className="text-blue-900">CVC</Label>
                  <Input
                    id="card-cvc"
                    placeholder="123"
                    value={card.cvc}
                    onChange={(e) => handleChange("cvc", e.target.value)}
                    className="bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
              </div>

              <Button onClick={() => setCheckout(true)} className="w-full bg-green-600 hover:bg-green-700 text-black font-medium h-12 mt-2">
                Donate ${amount}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSection; 