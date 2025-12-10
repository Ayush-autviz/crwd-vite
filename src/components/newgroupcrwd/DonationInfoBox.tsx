import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface DonationInfoBoxProps {
  nonprofitCount?: number;
}

export default function DonationInfoBox({ nonprofitCount = 0 }: DonationInfoBoxProps) {
  return (
    <Card className="mx-3 md:mx-4 mb-3 md:mb-4 bg-blue-50 border-blue-200 rounded-lg py-0.5 md:py-1">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start gap-2.5 md:gap-3">
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1600ff]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground text-xs md:text-sm lg:text-base mb-0.5 md:mb-1">
              Split evenly across {nonprofitCount} nonprofits.
            </p>
            <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground">
              Donated through CRWD Foundation (501c3). Tax-deductible.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

