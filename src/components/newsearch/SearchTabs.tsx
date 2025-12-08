interface SearchTabsProps {
  activeTab: 'Causes' | 'Collectives' | 'Users' | 'Posts';
  onTabChange: (tab: 'Causes' | 'Collectives' | 'Users' | 'Posts') => void;
}

export default function SearchTabs({ activeTab, onTabChange }: SearchTabsProps) {
  const tabs: Array<'Causes' | 'Collectives' | 'Users' | 'Posts'> = [
    'Causes',
    'Collectives',
    'Users',
    'Posts',
  ];

  return (
    <div className="border-b border-gray-200 px-4">
      <div className="flex justify-around gap-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`pb-3 px-2 md:px-4 font-medium text-sm transition-colors ${
              activeTab === tab
                ? 'text-[#2c7fff] border-b-2 border-[#2c7fff]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

