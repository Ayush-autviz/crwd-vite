import React from 'react';
import { Button } from '@/components/ui/button';

interface MembersTabNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  causesCount?: number;
  membersCount?: number;
  donationsCount?: number;
}

const tabs = [
  { label: 'Cause', value: 'Cause' },
  { label: 'Members', value: 'Members' },
  { label: 'Collective Donations', value: 'Collective Donations' },
];

const MembersTabNav: React.FC<MembersTabNavProps> = ({
  activeTab,
  setActiveTab,
  causesCount = 1,
  membersCount = 58,
  donationsCount = 34
}) => (
  <div className="flex justify-around border-b px-4 mt-3">
    {tabs.map(tab => (
      <Button
        key={tab.value}
        variant="ghost"
        className={`flex-1 py-4 px-1 text-center rounded-none border-b pb-7 ${activeTab === tab.value ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
        onClick={() => setActiveTab(tab.value)}
      >
        <div className="flex items-center gap-2">
          <span className={`flex items-center justify-center rounded-full h-6 w-6 text-xs font-medium ${
            activeTab === tab.value
              ? 'bg-primary/20 text-primary'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {tab.value === 'Cause' ? causesCount :
             tab.value === 'Members' ? membersCount :
             donationsCount}
          </span>
          <span>{tab.label}</span>
        </div>
      </Button>
    ))}
  </div>
);

export default MembersTabNav;