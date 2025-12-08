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
    <Card className="mx-4 mb-4 bg-gray-50 border-none rounded-lg py-4">
      <CardContent className="p-0">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div
            onClick={() => onStatClick?.('Nonprofits')}
            className={`${onStatClick ? 'cursor-pointer hover:bg-gray-100 transition-colors rounded-lg py-2' : ''}`}
          >
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              {nonprofitCount}
            </p>
            <p className="text-xs md:text-sm font-semibold text-muted-foreground">
              Nonprofits
            </p>
          </div>
          <div
            onClick={() => onStatClick?.('Members')}
            className={`${onStatClick ? 'cursor-pointer hover:bg-gray-100 transition-colors rounded-lg py-2' : ''}`}
          >
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              {memberCount}
            </p>
            <p className="text-xs md:text-sm font-semibold text-muted-foreground">
              Members
            </p>
          </div>
          <div
            onClick={() => onStatClick?.('Donations')}
            className={`${onStatClick ? 'cursor-pointer hover:bg-gray-100 transition-colors rounded-lg py-2' : ''}`}
          >
            <p className="text-2xl md:text-3xl font-bold text-[#1600ff] mb-1">
              {donationCount}
            </p>
            <p className="text-xs md:text-sm font-semibold text-muted-foreground">
              Donations
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

