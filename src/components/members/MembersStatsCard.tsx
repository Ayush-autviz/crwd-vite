import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MembersStatsCardProps {
  activeTab: string;
  count: number;
}

const MembersStatsCard: React.FC<MembersStatsCardProps> = ({ activeTab, count }) => (
  <>
{count && (
  <div className="hidden md:block">
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="text-center">
          <div className="text-2xl font-bold">{count}</div>
          <div className="text-muted-foreground">Total {activeTab}</div>
        </div>
      </CardContent>
    </Card>
  </div>
)}
</>
);

export default MembersStatsCard; 