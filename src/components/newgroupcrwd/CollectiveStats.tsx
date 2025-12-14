import { Card, CardContent } from '@/components/ui/card';

type TabType = 'Nonprofits' | 'Members' | 'Donations';

interface CollectiveStatsProps {
  nonprofitCount?: number;
  memberCount?: number;
  donationCount?: number;
  onStatClick?: (tab: TabType) => void;
}

export default function CollectiveStats({
  nonprofitCount = 0,
  memberCount = 0,
  donationCount = 0,
  onStatClick,
}: CollectiveStatsProps) {
  return (
    <Card className="mx-3 md:mx-4 mb-3 md:mb-4 bg-gray-50 border-none rounded-lg py-2 md:py-3">
      <CardContent className="p-0">
        <div className="grid grid-cols-3 gap-2 md:gap-3 text-center">
          <div
            onClick={() => onStatClick?.('Nonprofits')}
            className={`${onStatClick ? 'cursor-pointer hover:bg-gray-100 transition-colors rounded-lg py-1 md:py-1.5' : ''}`}
          >
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-0.5">
              {nonprofitCount}
            </p>
            <p className="text-[9px] md:text-[10px] lg:text-xs font-semibold text-muted-foreground">
              Nonprofits
            </p>
          </div>
          <div
            onClick={() => onStatClick?.('Members')}
            className={`${onStatClick ? 'cursor-pointer hover:bg-gray-100 transition-colors rounded-lg py-1 md:py-1.5' : ''}`}
          >
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-0.5">
              {memberCount}
            </p>
            <p className="text-[9px] md:text-[10px] lg:text-xs font-semibold text-muted-foreground">
              Members
            </p>
          </div>
          <div
            onClick={() => onStatClick?.('Donations')}
            className={`${onStatClick ? 'cursor-pointer hover:bg-gray-100 transition-colors rounded-lg py-1 md:py-1.5' : ''}`}
          >
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-[#1600ff] mb-0.5">
              {donationCount}
            </p>
            <p className="text-[9px] md:text-[10px] lg:text-xs font-semibold text-muted-foreground">
              Donations
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

