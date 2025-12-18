import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useQuery } from '@tanstack/react-query';
import { getCausesBySearch } from '@/services/api/crwd';

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
  onRemoveItem?: (id: string) => void;
  onClearAllItems?: () => void;
  preselectedItem?: {
    id: string;
    type: 'cause' | 'collective';
    data: any;
  };
  activeTab?: string;
  onRequestNonprofit?: () => void;
}

export default function DonationCauseSelector({
  selectedItems,
  onSelectItem,
  onRemoveItem,
  onClearAllItems,
  preselectedItem,
  activeTab,
  onRequestNonprofit,
}: DonationCauseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType] = useState<'cause' | 'collective'>('cause'); // Always causes for one-time donation
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [preselectedItemAdded, setPreselectedItemAdded] = useState(false);

  // Handle preselected item from navigation (only causes for one-time donation)
  useEffect(() => {
    if (preselectedItem && !preselectedItemAdded && preselectedItem.type === 'cause') {
      console.log('DonationCauseSelector: Setting preselected item:', preselectedItem);
      // Add the preselected item (only if it's a cause)
      onSelectItem(preselectedItem);
      setPreselectedItemAdded(true);
    }
  }, [preselectedItem, onSelectItem, preselectedItemAdded]);

  // Fetch causes with search - only when search button is clicked
  const { data: causesData, isLoading: causesLoading } = useQuery({
    queryKey: ['causes', searchQuery],
    queryFn: () => getCausesBySearch(searchQuery || '', '', 1),
    enabled: selectedType === 'cause' && showSearchResults && searchQuery.length > 0,
  });

  // Removed collectives queries - only showing causes for one-time donation

  // Fetch default causes (no search query)
  const { data: defaultCausesData, isLoading: defaultCausesLoading } = useQuery({
    queryKey: ['defaultCauses'],
    queryFn: () => getCausesBySearch('', '', 1),
    enabled: selectedType === 'cause' && !showSearchResults,
  });

  // Fetch default collectives (no search query) - removed, using joined collectives instead
  // const { data: defaultCollectivesData, isLoading: defaultCollectivesLoading } = useQuery({
  //   queryKey: ['defaultCollectives'],
  //   queryFn: () => getCollectivesBySearch(''),
  //   enabled: selectedType === 'collective' && !showSearchResults,
  // });

  const causes = showSearchResults ? (causesData?.results || []) : (defaultCausesData?.results || []);

  // Filter out already selected items (only causes)
  const filteredCauses = causes.filter((cause: Cause) => 
    !selectedItems.some(item => item.id === cause.id.toString() && item.type === 'cause')
  ).slice(0, 20); // Show up to 20 causes

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  // Removed handleTypeChange - only causes are supported

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
    <div className="w-full">
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Add More Causes</h2>
      </div>

      {/* Search Section */}
      <div className="space-y-4 mb-4 md:mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <Input
              type="text"
              placeholder="Search for causes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  handleSearch();
                }
              }}
              className="pl-10 pr-4 py-2 md:py-2.5"
            />
          </div>
          {/* <Button 
            onClick={handleSearch} 
            disabled={!searchQuery.trim()}
            className="bg-[#1600ff] hover:bg-[#1400cc] text-white px-4 md:px-6 rounded-lg"
          >
            All
          </Button> */}
        </div>
        {/* {onRequestNonprofit ? ( */}
          <button
            onClick={onRequestNonprofit}
            className="text-[#1600ff] text-sm md:text-base underline flex justify-center w-full"
          >
            Can't find your nonprofit? Request it here
          </button>
        {/* ) : (
          <Link to="/request-nonprofit" className="text-[#1600ff] text-sm md:text-base underline">
            Can't find your nonprofit? Request it here
          </Link>
        )} */}
      </div>

      {/* Causes List */}
      <div className="space-y-2.5 md:space-y-3">
        {showSearchResults ? (
          causesLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading causes...</p>
            </div>
          ) : filteredCauses.length > 0 ? (
            filteredCauses.map((cause: Cause) => {
              // Generate consistent color for avatar
              const avatarColors = [
                '#EF4444', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#06B6D4',
                '#F97316', '#84CC16', '#A855F7', '#14B8A6', '#F43F5E', '#6366F1', '#22C55E', '#EAB308',
              ];
              const getConsistentColor = (id: number) => {
                const hash = id % avatarColors.length;
                return avatarColors[hash];
              };
              const avatarBgColor = getConsistentColor(cause.id);
              const getInitials = (name: string) => {
                if (!name) return 'N';
                const words = name.trim().split(' ');
                if (words.length >= 2) {
                  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
                }
                return name.charAt(0).toUpperCase();
              };
              const initials = getInitials(cause.name || '');

              return (
                <div
                  key={cause.id}
                  className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleItemSelect(cause)}
                >
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: avatarBgColor }}
                  >
                    <span className="text-white font-bold text-base md:text-lg">
                      {initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm md:text-base text-gray-900 mb-0.5 md:mb-1">{cause.name}</h4>
                    <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                      {cause.description || 'Supporting this nonprofit\'s mission'}
                    </p>
                  </div>
                  <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-pink-100 hover:bg-pink-200 flex items-center justify-center transition-colors flex-shrink-0">
                    <Plus size={16} className="text-pink-600" strokeWidth={3} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No causes found</p>
            </div>
          )
        ) : (
          defaultCausesLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading causes...</p>
            </div>
          ) : filteredCauses.length > 0 ? (
            filteredCauses.map((cause: Cause) => {
              // Generate consistent color for avatar
              const avatarColors = [
                '#EF4444', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#06B6D4',
                '#F97316', '#84CC16', '#A855F7', '#14B8A6', '#F43F5E', '#6366F1', '#22C55E', '#EAB308',
              ];
              const getConsistentColor = (id: number) => {
                const hash = id % avatarColors.length;
                return avatarColors[hash];
              };
              const avatarBgColor = getConsistentColor(cause.id);
              const getInitials = (name: string) => {
                if (!name) return 'N';
                const words = name.trim().split(' ');
                if (words.length >= 2) {
                  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
                }
                return name.charAt(0).toUpperCase();
              };
              const initials = getInitials(cause.name || '');

              return (
                <div
                  key={cause.id}
                  className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleItemSelect(cause)}
                >
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: avatarBgColor }}
                  >
                    <span className="text-white font-bold text-base md:text-lg">
                      {initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm md:text-base text-gray-900 mb-0.5 md:mb-1">{cause.name}</h4>
                    <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                      {cause.description || 'Supporting this nonprofit\'s mission'}
                    </p>
                  </div>
                  <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-pink-100 hover:bg-pink-200 flex items-center justify-center transition-colors flex-shrink-0">
                    <Plus size={16} className="text-pink-600" strokeWidth={3} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No causes available</p>
            </div>
          )
        )}
      </div>

        {/* Discover More Link */}
        {/* <div className="text-sm text-blue-600 rounded-lg">
          <p className="font-medium text-blue-600">You can add up to 10 more organizations to this donation</p>
          <Link to="/search" className="flex items-center mt-1 text-sm text-blue-600">
            <span>Discover More</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div> */}
    </div>
  );
}
