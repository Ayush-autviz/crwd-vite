import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, CreditCard, DollarSign, CheckCircle } from 'lucide-react';
import ProfileNavbar from '@/components/profile/ProfileNavbar';

export default function DonationTest() {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const presetAmounts = [10, 25, 50, 100];

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setIsComplete(true);
  };

  const resetForm = () => {
    setAmount('');
    setIsComplete(false);
    setIsProcessing(false);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-white flex flex-col pb-16">
        <ProfileNavbar title="Donation Test" />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
              <p className="text-gray-600 mb-4">
                Your donation of ${amount} has been processed successfully.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This is a test transaction. No actual payment was made.
              </p>
              <Button onClick={resetForm} className="w-full">
                Make Another Test Donation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-16">
      <ProfileNavbar title="Donation Test" />

      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Test Notice */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  TEST MODE
                </Badge>
              </div>
              <p className="text-sm text-yellow-800 mt-2">
                This is a test donation page. No real payments will be processed.
              </p>
            </CardContent>
          </Card>

          {/* Donation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Test Donation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preset Amounts */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Choose an amount
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset.toString() ? "default" : "outline"}
                      onClick={() => setAmount(preset.toString())}
                      className="h-12"
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Or enter custom amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10"
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Payment Method
                </label>
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Test Credit Card</p>
                        <p className="text-sm text-blue-700">**** **** **** 4242</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Donate Button */}
              <Button
                onClick={handleDonate}
                disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
                className="w-full h-12 text-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  `Donate $${amount || '0'}`
                )}
              </Button>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 text-center">
                This is a test environment. No actual charges will be made to your account.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
