import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Info, Palette, Image as ImageIcon, Camera, X, Search, Trash2, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFundraiserById, getCollectiveById, getCausesBySearch, patchFundraiser } from '@/services/api/crwd';
import { Toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { categories } from '@/constants/categories';

// Avatar colors for consistent fallback styling
const avatarColors = [
  '#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3',
  '#FFC107', '#E91E63', '#00BCD4', '#8BC34A', '#FF5722',
  '#673AB7', '#009688', '#FFEB3B', '#795548', '#607D8B',
];

const getConsistentColor = (id: number | string | undefined, fallbackName?: string) => {
  if (id !== undefined && id !== null) {
    const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return avatarColors[hash % avatarColors.length];
  }
  if (fallbackName) {
    const hash = fallbackName.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return avatarColors[hash % avatarColors.length];
  }
  return avatarColors[0];
};

const getInitials = (name: string) => {
  const words = name.split(' ').filter(Boolean);
  if (words.length === 0) return 'N';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Filter categories for the fundraiser page
const filterCategories = [
  { id: '', name: 'All' },
  ...categories.filter(cat => cat.id !== '').map(cat => ({ id: cat.id, name: cat.name })),
];

export default function EditFundraiser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignStory, setCampaignStory] = useState('');
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [coverType, setCoverType] = useState<'none' | 'color' | 'image'>('none');
  const [coverColor, setCoverColor] = useState('#1600ff');
  const [uploadedCoverImage, setUploadedCoverImage] = useState<File | null>(null);
  const [uploadedCoverImagePreview, setUploadedCoverImagePreview] = useState<string | null>(null);
  const [selectedNonprofits, setSelectedNonprofits] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showExtendModal, setShowExtendModal] = useState(false);

  const colorSwatches = [
    '#0000FF', // Blue
    '#FF3366', // Pink/Red
    '#ADFF2F', // Lime Green
    '#A855F7', // Purple
    '#10B981', // Teal
    '#FF6B35', // Orange
    '#EF4444', // Red
    '#6366F1', // Indigo
  ];

  // Fetch fundraiser data
  const { data: fundraiserData, isLoading, error } = useQuery({
    queryKey: ['fundraiser', id],
    queryFn: () => getFundraiserById(id || ''),
    enabled: !!id,
  });

  // Fetch collective data
  const { data: collectiveData } = useQuery({
    queryKey: ['crwd', fundraiserData?.collective],
    queryFn: () => getCollectiveById(fundraiserData?.collective?.toString() || ''),
    enabled: !!fundraiserData?.collective && typeof fundraiserData.collective === 'number',
  });

  // Fetch causes/nonprofits for adding more
  const { data: causesData, isLoading: isLoadingCauses } = useQuery({
    queryKey: ['causes-search-edit', searchQuery, selectedCategory, searchTrigger],
    queryFn: () => getCausesBySearch(searchQuery || '', selectedCategory || '', 1),
    enabled: true, // Always enabled to fetch nonprofits
  });

  // Initial load for nonprofits - trigger search on mount
  useEffect(() => {
    if (searchTrigger === 0) {
      setSearchTrigger(1);
    }
  }, [searchTrigger]);

  // Initialize form data when fundraiser data loads
  useEffect(() => {
    if (fundraiserData) {
      setCampaignTitle(fundraiserData.name || '');
      setCampaignStory(fundraiserData.description || '');
      if (fundraiserData.end_date) {
        setEndDate(dayjs(fundraiserData.end_date));
      }
      
      // Set cover type
      if (fundraiserData.image) {
        setCoverType('image');
        setUploadedCoverImagePreview(fundraiserData.image);
      } else if (fundraiserData.color) {
        setCoverType('color');
        setCoverColor(fundraiserData.color);
      } else {
        setCoverType('none');
      }

      // Set selected nonprofits
      if (fundraiserData.causes && fundraiserData.causes.length > 0) {
        setSelectedNonprofits(fundraiserData.causes.map((cause: any) => cause.id));
      }
    }
  }, [fundraiserData]);

  // Check if fundraiser has received donations
  const hasDonations = fundraiserData && parseFloat(fundraiserData.current_amount || '0') > 0;
  // Calculate days left from current endDate state (which may have been extended)
  const daysLeft = endDate
    ? Math.max(0, endDate.diff(dayjs(), 'day'))
    : fundraiserData?.end_date
    ? Math.max(0, dayjs(fundraiserData.end_date).diff(dayjs(), 'day'))
    : 0;

  // Update fundraiser mutation
  const updateFundraiserMutation = useMutation({
    mutationFn: (data: any) => patchFundraiser(id || '', data),
    onSuccess: () => {
      setToastMessage('Fundraiser updated successfully!');
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['fundraiser', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    },
    onError: (error: any) => {
      console.error('Update fundraiser error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update fundraiser';
      setToastMessage(errorMessage);
      setShowToast(true);
    },
  });

  const handleColorSelect = (color: string) => {
    setCoverColor(color);
    setCoverType('color');
    setUploadedCoverImage(null);
    setUploadedCoverImagePreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setCoverType('image');
    }
  };

  const handleRemoveImage = () => {
    setUploadedCoverImage(null);
    setUploadedCoverImagePreview(null);
    setCoverType('none');
  };

  const handleExtendDate = () => {
    setShowExtendModal(true);
  };

  const handleExtendByWeek = (weeks: number) => {
    const currentDate = endDate || dayjs();
    const newDate = currentDate.add(weeks, 'week');
    setEndDate(newDate);
    setShowExtendModal(false);
  };

  const handleExtendByMonth = () => {
    const currentDate = endDate || dayjs();
    const newDate = currentDate.add(1, 'month');
    setEndDate(newDate);
    setShowExtendModal(false);
  };

  // Calculate new end dates for display
  const getNewEndDate = (weeks: number) => {
    const currentDate = endDate || dayjs();
    return currentDate.add(weeks, 'week');
  };

  const getNewEndDateMonth = () => {
    const currentDate = endDate || dayjs();
    return currentDate.add(1, 'month');
  };

  const formatDate = (date: Dayjs) => {
    return date.format('MMMM D, YYYY');
  };

  const handleSave = () => {
    if (!campaignTitle.trim() || !campaignStory.trim() || !endDate) {
      setToastMessage('Please fill in all required fields.');
      setShowToast(true);
      return;
    }

    const endDateISO = endDate ? endDate.toISOString() : '';

    if (coverType === 'image' && uploadedCoverImage) {
      // Use FormData for image upload
      const formData = new FormData();
      formData.append('name', campaignTitle);
      formData.append('description', campaignStory);
      formData.append('image_file', uploadedCoverImage);
      formData.append('end_date', endDateISO);
      selectedNonprofits.forEach((causeId) => {
        formData.append('cause_ids', causeId.toString());
      });

      updateFundraiserMutation.mutate(formData);
    } else if (coverType === 'color') {
      // Use JSON for color-based cover
      const requestData: any = {
        name: campaignTitle,
        description: campaignStory,
        color: coverColor,
        end_date: endDateISO,
        cause_ids: selectedNonprofits,
      };

      updateFundraiserMutation.mutate(requestData);
    } else if (coverType === 'none') {
      // Remove cover
      const requestData: any = {
        name: campaignTitle,
        description: campaignStory,
        end_date: endDateISO,
        image: null,
        color: null,
        cause_ids: selectedNonprofits,
      };

      updateFundraiserMutation.mutate(requestData);
    } else {
      // Just update text fields
      const requestData: any = {
        name: campaignTitle,
        description: campaignStory,
        end_date: endDateISO,
        cause_ids: selectedNonprofits,
      };

      updateFundraiserMutation.mutate(requestData);
    }
  };

  const handleSearch = () => {
    setSearchTrigger(prev => prev + 1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchTrigger(prev => prev + 1);
  };

  const handleAddNonprofit = (nonprofitId: number) => {
    if (!selectedNonprofits.includes(nonprofitId)) {
      setSelectedNonprofits(prev => [...prev, nonprofitId]);
    }
  };

  const handleRemoveNonprofit = (nonprofitId: number) => {
    setSelectedNonprofits(prev => prev.filter(id => id !== nonprofitId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !fundraiserData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            Fundraiser not found
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-4">
            The fundraiser you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Get selected nonprofits data
  const selectedNonprofitsData = fundraiserData.causes?.filter((cause: any) => 
    selectedNonprofits.includes(cause.id)
  ) || [];

  // Get available nonprofits to add (exclude already selected ones)
  const availableNonprofits = causesData?.results?.filter((cause: any) => 
    !selectedNonprofits.includes(cause.id)
  ) || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-3 md:gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-lg md:text-xl text-gray-900">Edit Campaign</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Campaign Summary */}
        <div className="bg-blue-50 rounded-lg p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#1600ff] mb-1">
                ${parseFloat(fundraiserData.current_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm md:text-base text-gray-700">
                raised of ${parseFloat(fundraiserData.target_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} goal
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                {fundraiserData.total_donors || 0}
              </div>
              <div className="text-sm md:text-base text-gray-700">
                donors
              </div>
            </div>
          </div>
          {hasDonations && (
            <div className="flex items-start gap-2 bg-blue-100 rounded-lg p-3 mt-4">
              <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-blue-900">
                Campaign has received donations. Some fields cannot be changed.
              </p>
            </div>
          )}
        </div>

        {/* Campaign Details */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Campaign Details</h2>
          
          {/* Campaign Title */}
          <div className="mb-4 md:mb-6">
            <label className="block text-sm md:text-base font-semibold text-gray-900 mb-2">
              Campaign Title
            </label>
            <Input
              type="text"
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
              placeholder="e.g., Holiday Giving Campaign"
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="mb-4 md:mb-6">
            <label className="block text-sm md:text-base font-semibold text-gray-900 mb-2">
              Description
            </label>
            <Textarea
              value={campaignStory}
              onChange={(e) => setCampaignStory(e.target.value)}
              placeholder="Tell people why you're raising money and how it will make an impact..."
              className="w-full min-h-[120px] md:min-h-[150px] resize-none"
            />
          </div>

          {/* Goal Amount */}
          <div className="mb-4 md:mb-6">
            <label className="block text-sm md:text-base font-semibold text-gray-900 mb-2">
              Goal Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                $
              </span>
              <Input
                type="number"
                value={fundraiserData.target_amount || ''}
                disabled={hasDonations}
                className="w-full pl-8"
              />
              {hasDonations && (
                <div className="flex items-center gap-2 mt-2">
                  <Info className="w-4 h-4 text-gray-500" />
                  <span className="text-xs md:text-sm text-gray-600">Cannot change</span>
                </div>
              )}
              {hasDonations && (
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Goal cannot be changed after donations are received.
                </p>
              )}
            </div>
          </div>

          {/* End Date */}
          <div className="mb-4 md:mb-6">
            <label className="block text-sm md:text-base font-semibold text-gray-900 mb-2">
              End Date
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-base md:text-lg font-medium text-gray-900">
                  {endDate ? endDate.format('DD/MM/YYYY') : 'N/A'}
                </div>
                {daysLeft > 0 && (
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                  </p>
                )}
              </div>
              <Button
                onClick={handleExtendDate}
                variant="outline"
                className="bg-[#1600ff] text-white hover:bg-[#1400cc] border-[#1600ff]"
              >
                Extend
              </Button>
            </div>
          </div>
        </div>

        {/* Cover Design */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Cover Design</h2>
          
          {/* Type Selection Buttons */}
          <div className="flex gap-3 mb-4">
            {/* <button
              onClick={() => setCoverType('none')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                coverType === 'none'
                  ? 'bg-white border-gray-400'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className={`font-medium text-sm md:text-base ${coverType === 'none' ? 'text-gray-900' : 'text-gray-600'}`}>
                No Cover
              </span>
            </button> */}
            <button
              onClick={() => setCoverType('color')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                coverType === 'color'
                  ? 'bg-white border-gray-400'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Palette className={`w-5 h-5 ${coverType === 'color' ? 'text-gray-700' : 'text-gray-500'}`} />
              <span className={`font-medium text-sm md:text-base ${coverType === 'color' ? 'text-gray-900' : 'text-gray-600'}`}>
                Color
              </span>
            </button>
            <button
              onClick={() => setCoverType('image')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                coverType === 'image'
                  ? 'bg-white border-gray-400'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <ImageIcon className={`w-5 h-5 ${coverType === 'image' ? 'text-gray-700' : 'text-gray-500'}`} />
              <span className={`font-medium text-sm md:text-base ${coverType === 'image' ? 'text-gray-900' : 'text-gray-600'}`}>
                Image
              </span>
            </button>
          </div>

          {/* Color Picker */}
          {coverType === 'color' && (
            <div>
              <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-3">Choose Background Color</h4>
              <div className="flex flex-wrap gap-3 mb-4">
                {colorSwatches.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg transition-transform hover:scale-110 ${
                      coverColor === color ? 'ring-2 ring-gray-900 ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              
              {/* Color Preview Box */}
              <div className="rounded-lg border border-gray-200 overflow-hidden" style={{ height: '200px' }}>
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: coverColor }}
                >
                  <span className="text-white text-xl md:text-2xl font-bold opacity-50">
                    {campaignTitle || 'Campaign Cover'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Image Upload */}
          {coverType === 'image' && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="cover-image-upload-input"
              />
              {uploadedCoverImagePreview ? (
                <div className="relative rounded-lg border border-gray-200 overflow-hidden" style={{ height: '200px' }}>
                  <img
                    src={uploadedCoverImagePreview}
                    alt="Campaign cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    const input = document.getElementById('cover-image-upload-input');
                    input?.click();
                  }}
                  className="relative rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center"
                  style={{ height: '200px' }}
                >
                  <div className="text-center">
                    <Camera className="w-8 h-8 md:w-10 md:h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm md:text-base text-gray-600 font-medium">
                      Click to upload image
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      Choose from gallery
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Supported Nonprofits */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Supported Nonprofits</h2>
          <p className="text-sm md:text-base text-gray-600 mb-4">
            Add or remove nonprofits. Donations will be split evenly among selected organizations.
          </p>

          {/* Selected Nonprofits */}
          {selectedNonprofitsData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
                Selected ({selectedNonprofitsData.length})
              </h3>
              <div className="space-y-3">
                {selectedNonprofitsData.map((cause: any) => {
                  const avatarBgColor = getConsistentColor(cause.id, cause.name);
                  const initials = getInitials(cause.name || 'Nonprofit');
                  return (
                    <div
                      key={cause.id}
                      className="flex items-center gap-3 md:gap-4 bg-blue-50 rounded-lg p-3 md:p-4"
                    >
                      <Avatar className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                        <AvatarImage src={cause.image} alt={cause.name} />
                        <AvatarFallback
                          style={{ backgroundColor: avatarBgColor }}
                          className="text-white font-bold text-xs md:text-sm"
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm md:text-base text-gray-900 truncate">
                          {cause.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-[#1600ff] text-white text-xs md:text-sm font-medium rounded">
                          Current
                        </span>
                        <button
                          onClick={() => handleRemoveNonprofit(cause.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove nonprofit"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add More Nonprofits */}
          <div>
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">Add More Nonprofits</h3>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search nonprofits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-9 md:pl-10 bg-gray-100 rounded-lg text-sm md:text-base"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {filterCategories.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryFilter(category.id)}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                      isSelected
                        ? 'bg-[#1600ff] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>

            {/* Available Nonprofits List */}
            {isLoadingCauses ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : availableNonprofits.length > 0 ? (
              <div className="space-y-3">
                {availableNonprofits.map((nonprofit: any) => {
                  const avatarBgColor = getConsistentColor(nonprofit.id, nonprofit.name);
                  const initials = getInitials(nonprofit.name);
                  return (
                    <div
                      key={nonprofit.id}
                      className="flex items-center gap-3 md:gap-4 bg-white border border-gray-200 rounded-lg p-3 md:p-4"
                    >
                      <Avatar className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                        <AvatarImage src={nonprofit.image} alt={nonprofit.name} />
                        <AvatarFallback
                          style={{ backgroundColor: avatarBgColor }}
                          className="text-white font-bold text-xs md:text-sm"
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm md:text-base text-gray-900 truncate">
                          {nonprofit.name}
                        </h4>
                        <p className="text-xs md:text-sm text-gray-600">
                          {nonprofit.mission || nonprofit.description || 'Nonprofit organization'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddNonprofit(nonprofit.id)}
                        className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors flex-shrink-0"
                        aria-label="Add nonprofit"
                      >
                        <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : searchQuery || selectedCategory ? (
              <div className="text-center py-12">
                <p className="text-sm md:text-base text-gray-500">No nonprofits found.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 md:px-6 py-4 md:py-5">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleSave}
            disabled={updateFundraiserMutation.isPending}
            className="w-full bg-[#1600ff] hover:bg-[#1400cc] text-white text-sm md:text-base py-3 md:py-4"
          >
            {updateFundraiserMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      {/* Spacer for fixed footer */}
      <div className="h-20 md:h-24"></div>

      {/* Toast */}
      <Toast
        show={showToast}
        onHide={() => setShowToast(false)}
        message={toastMessage}
      />

      {/* Extend Campaign Deadline Modal */}
      <Dialog open={showExtendModal} onOpenChange={setShowExtendModal}>
        <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-bold text-gray-900">
              Extend Campaign Deadline
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base text-gray-600">
              Choose how much time to add to your campaign. Current end date: {endDate ? formatDate(endDate) : 'N/A'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 md:space-y-4 mt-4">
            {/* +1 Week Option */}
            <button
              onClick={() => handleExtendByWeek(1)}
              className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-[#1600ff] hover:bg-blue-50 transition-colors"
            >
              <div className="font-semibold text-base md:text-lg text-gray-900 mb-1">
                +1 Week
              </div>
              <div className="text-sm md:text-base text-gray-600">
                New end date: {endDate ? formatDate(getNewEndDate(1)) : 'N/A'}
              </div>
            </button>

            {/* +2 Weeks Option */}
            <button
              onClick={() => handleExtendByWeek(2)}
              className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-[#1600ff] hover:bg-blue-50 transition-colors"
            >
              <div className="font-semibold text-base md:text-lg text-gray-900 mb-1">
                +2 Weeks
              </div>
              <div className="text-sm md:text-base text-gray-600">
                New end date: {endDate ? formatDate(getNewEndDate(2)) : 'N/A'}
              </div>
            </button>

            {/* +1 Month Option */}
            <button
              onClick={handleExtendByMonth}
              className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-[#1600ff] hover:bg-blue-50 transition-colors"
            >
              <div className="font-semibold text-base md:text-lg text-gray-900 mb-1">
                +1 Month
              </div>
              <div className="text-sm md:text-base text-gray-600">
                New end date: {endDate ? formatDate(getNewEndDateMonth()) : 'N/A'}
              </div>
            </button>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              variant="outline"
              onClick={() => setShowExtendModal(false)}
              className="border-[#1600ff] text-[#1600ff] hover:bg-blue-50"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

