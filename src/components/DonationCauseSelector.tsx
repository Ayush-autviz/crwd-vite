import { useState, useEffect } from 'react';
import { Search, Heart, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { getCausesBySearch, getCollectivesBySearch } from '@/services/api/crwd';

interface Cause {
  id: number;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  state?: string;
  city?: string;
}

interface Collective {
  id: number;
  name: string;
  description?: string;
  member_count?: number;
  created_by?: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    profile_picture: string;
    is_following: boolean;
    can_follow_back: boolean;
  };
}

interface DonationCauseSelectorProps {
  selectedItems: Array<{ id: string; type: 'cause' | 'collective'; data: Cause | Collective }>;
  onSelectItem: (item: { id: string; type: 'cause' | 'collective'; data: Cause | Collective }) => void;
  onRemoveItem: (id: string) => void;
  onClearAllItems: () => void;
  onBookmarkItem: (id: string) => void;
  bookmarkedItems: string[];
  preselectedItem?: {
    id: string;
    type: 'cause' | 'collective';
    data: any;
  };
  activeTab?: string;
}

export default function DonationCauseSelector({
  selectedItems,
  onSelectItem,
  onRemoveItem,
  onClearAllItems,
  onBookmarkItem,
  bookmarkedItems,
  preselectedItem,
  activeTab,
}: DonationCauseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'cause' | 'collective'>('cause');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [preselectedItemAdded, setPreselectedItemAdded] = useState(false);
  const [userChangedTab, setUserChangedTab] = useState(false);

  // Handle preselected item and active tab from navigation
  useEffect(() => {
    if (preselectedItem && !preselectedItemAdded && !userChangedTab) {
      console.log('DonationCauseSelector: Setting preselected item:', preselectedItem);
      // Set the correct type based on preselected item
      setSelectedType(preselectedItem.type);
      // Add the preselected item
      onSelectItem(preselectedItem);
      setPreselectedItemAdded(true);
    }
    if (activeTab && !userChangedTab) {
      console.log('DonationCauseSelector: Setting active tab:', activeTab);
      // Set the correct type based on active tab
      if (activeTab === 'nonprofits') {
        setSelectedType('cause');
      } else if (activeTab === 'collectives') {
        setSelectedType('collective');
      }
    }
  }, [preselectedItem, activeTab, onSelectItem, preselectedItemAdded, userChangedTab]);

  // Fetch causes with search - only when search button is clicked
  const { data: causesData, isLoading: causesLoading } = useQuery({
    queryKey: ['causes', searchQuery],
    queryFn: () => getCausesBySearch(searchQuery || '', '', 1),
    enabled: selectedType === 'cause' && showSearchResults && searchQuery.length > 0,
  });

  // Fetch collectives with search - only when search button is clicked
  const { data: collectivesData, isLoading: collectivesLoading } = useQuery({
    queryKey: ['collectives', searchQuery],
    queryFn: () => getCollectivesBySearch(searchQuery || ''),
    enabled: selectedType === 'collective' && showSearchResults && searchQuery.length > 0,
  });

  // Fetch default causes (no search query)
  const { data: defaultCausesData, isLoading: defaultCausesLoading } = useQuery({
    queryKey: ['defaultCauses'],
    queryFn: () => getCausesBySearch('', '', 1),
    enabled: selectedType === 'cause' && !showSearchResults,
  });

  // Fetch default collectives (no search query)
  const { data: defaultCollectivesData, isLoading: defaultCollectivesLoading } = useQuery({
    queryKey: ['defaultCollectives'],
    queryFn: () => getCollectivesBySearch(''),
    enabled: selectedType === 'collective' && !showSearchResults,
  });

  const causes = showSearchResults ? (causesData?.results || []) : (defaultCausesData?.results || []);
  const collectives = showSearchResults ? (collectivesData?.results || []) : (defaultCollectivesData?.results || []);

  // Filter out already selected items
  const filteredCauses = causes.filter((cause: Cause) => 
    !selectedItems.some(item => item.id === cause.id.toString() && item.type === 'cause')
  ).slice(0, 5);

  const filteredCollectives = collectives.filter((collective: Collective) => 
    !selectedItems.some(item => item.id === collective.id.toString() && item.type === 'collective')
  ).slice(0, 5);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleTypeChange = (type: 'cause' | 'collective') => {
    // Mark that user has manually changed the tab
    setUserChangedTab(true);
    
    // Change the tab type immediately
    setSelectedType(type);
    setShowSearchResults(false);
    setSearchQuery('');
    
    // Clear all selected items when changing tabs
    console.log('Calling onClearAllItems');
    onClearAllItems();
  };

  const handleItemSelect = (item: Cause | Collective) => {
    const itemData = {
      id: item.id.toString(),
      type: selectedType,
      data: item
    };
    onSelectItem(itemData);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
      <div className="flex items-center mb-4">
        <h1 className="text-xl font-medium text-gray-800">
          Your donation will support
        </h1>
      </div>

      {/* Selected Items Display */}
      {selectedItems.length > 0 ? (
        <div className="space-y-4 mb-6">
          {selectedItems.map((item) => (
            <div key={`${item.type}-${item.id}`} className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={item.type === 'cause' ? (item.data as Cause).image : (item.data as Collective).created_by?.profile_picture || ''} 
                      alt={`${item.data.name} logo`} 
                    />
                    <AvatarFallback>
                      {item.data.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-800">{item.data.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.type === 'cause' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {item.type === 'cause' ? 'Nonprofit' : 'Collective'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.data.description || "Supporting this organization's mission"}
                    </p>
                    {item.type === 'collective' && (item.data as Collective).member_count && (
                      <p className="text-xs text-gray-500">
                        {(item.data as Collective).member_count} members
                      </p>
                    )}
                  </div>
                </div>
                {/* <button
                  className={`${bookmarkedItems.includes(`${item.type}-${item.id}`) ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors`}
                  onClick={() => onBookmarkItem(`${item.type}-${item.id}`)}
                >
                  <Heart size={20} />
                </button> */}
              </div>
              <div className="flex justify-end mt-3">
                <button
                  className="text-xs text-gray-600 hover:text-red-500 flex items-center px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                  onClick={() => onRemoveItem(`${item.type}-${item.id}`)}
                >
                  <Trash2 size={12} className="mr-1" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center mb-6">
          <p className="text-gray-500">No organizations selected</p>
          <p className="text-sm text-gray-400 mt-1">Search and select causes or collectives below</p>
        </div>
      )}

      {/* Type Selection */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={selectedType === 'cause' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeChange('cause')}
          className="flex-1"
        >
          Nonprofits
        </Button>
        <Button
          variant={selectedType === 'collective' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeChange('collective')}
          className="flex-1"
        >
          Collectives
        </Button>
      </div>

      {/* Search Section */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={`Search ${selectedType === 'cause' ? 'nonprofits' : 'collectives'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                handleSearch();
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
            <Search size={16} />
          </Button>
        </div>

        {/* Search Results */}
        {showSearchResults ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedType === 'cause' ? (
              <>
                {causesLoading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading nonprofits...</p>
                  </div>
                ) : filteredCauses.length > 0 ? (
                  filteredCauses.map((cause: Cause) => (
                    <div
                      key={cause.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleItemSelect(cause)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={cause.image} alt={cause.name} />
                        <AvatarFallback>
                          {cause.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">{cause.name}</h4>
                        <p className="text-sm text-gray-600 truncate">
                          {cause.description || 'Supporting this nonprofit\'s mission'}
                        </p>
                       
                      </div>
                      <Button size="sm" variant="outline">
                        Add
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No nonprofits found</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {collectivesLoading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading collectives...</p>
                  </div>
                ) : filteredCollectives.length > 0 ? (
                  filteredCollectives.map((collective: Collective) => (
                    <div
                      key={collective.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleItemSelect(collective)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collective.created_by?.profile_picture || ''} alt={collective.name} />
                        <AvatarFallback>
                          {collective.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">{collective.name}</h4>
                        <p className="text-sm text-gray-600 truncate">
                          {collective.description || 'Supporting this collective\'s mission'}
                        </p>
                        {collective.member_count && (
                          <p className="text-xs text-gray-500">
                            {collective.member_count} members
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        Add
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No collectives found</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Default Results */
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedType === 'cause' ? (
              <>
                {defaultCausesLoading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading nonprofits...</p>
                  </div>
                ) : filteredCauses.length > 0 ? (
                  <>
                    <div className="text-sm text-gray-600 mb-2">
                      <p className="font-medium">Popular Nonprofits</p>
                    </div>
                    {filteredCauses.map((cause: Cause) => (
                      <div
                        key={cause.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleItemSelect(cause)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={cause.image} alt={cause.name} />
                          <AvatarFallback>
                            {cause.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate">{cause.name}</h4>
                          <p className="text-sm text-gray-600 truncate">
                            {cause.description || 'Supporting this nonprofit\'s mission'}
                          </p>
                          
                        </div>
                        <Button size="sm" variant="outline">
                          Add
                        </Button>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No nonprofits available</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {defaultCollectivesLoading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading collectives...</p>
                  </div>
                ) : filteredCollectives.length > 0 ? (
                  <>
                    <div className="text-sm text-gray-600 mb-2">
                      <p className="font-medium">Popular Collectives</p>
                    </div>
                    {filteredCollectives.map((collective: Collective) => (
                      <div
                        key={collective.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleItemSelect(collective)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={collective.created_by?.profile_picture || ''} alt={collective.name} />
                          <AvatarFallback>
                            {collective.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate">{collective.name}</h4>
                          <p className="text-sm text-gray-600 truncate">
                            {collective.description || 'Supporting this collective\'s mission'}
                          </p>
                          {collective.member_count && (
                            <p className="text-xs text-gray-500">
                              {collective.member_count} members
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          Add
                        </Button>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No collectives available</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Discover More Link */}
        {/* <div className="text-sm text-blue-600 rounded-lg">
          <p className="font-medium text-blue-600">You can add up to 10 more organizations to this donation</p>
          <Link to="/search" className="flex items-center mt-1 text-sm text-blue-600">
            <span>Discover More</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div> */}
      </div>
    </div>
  );
}
