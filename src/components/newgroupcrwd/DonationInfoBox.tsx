import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface DonationInfoBoxProps {
  nonprofitCount?: number;
}

export default function DonationInfoBox({ nonprofitCount = 0 }: DonationInfoBoxProps) {
  return (
    <Card className="mx-4 mb-4 bg-blue-50 border-blue-200 rounded-lg py-1">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-[#1600ff]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground text-sm md:text-base mb-1">
              Split evenly across {nonprofitCount} nonprofits.
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              Donated through CRWD Foundation (501c3). Tax-deductible.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

