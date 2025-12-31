import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Info, Palette, Image as ImageIcon, Camera, X, Check, Search, Building2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCollectiveById, getCausesBySearch, createFundraiser } from '@/services/api/crwd';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { DatePicker } from 'antd';
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

// Filter categories for the fundraiser page - use all categories except "All"
const filterCategories = [
  { id: '', name: 'All' },
  ...categories.filter(cat => cat.id !== '').map(cat => ({ id: cat.id, name: cat.name })),
];

export default function CreateFundraiser() {
  const { collectiveId } = useParams<{ collectiveId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  
  // Step 1 state
  const [coverType, setCoverType] = useState<'color' | 'image'>('color');
  const [coverColor, setCoverColor] = useState('#1600ff');
  const [uploadedCoverImage, setUploadedCoverImage] = useState<File | null>(null);
  const [uploadedCoverImagePreview, setUploadedCoverImagePreview] = useState<string | null>(null);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [fundraisingGoal, setFundraisingGoal] = useState('1000');
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [campaignStory, setCampaignStory] = useState('');
  
  // Step 2 state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedNonprofits, setSelectedNonprofits] = useState<number[]>([]);
  const [searchTrigger, setSearchTrigger] = useState(0);

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

  // Fetch collective data
  const { data: collectiveData, isLoading } = useQuery({
    queryKey: ['crwd', collectiveId],
    queryFn: () => getCollectiveById(collectiveId || ''),
    enabled: !!collectiveId,
  });

  // Fetch causes/nonprofits for step 2
  const { data: causesData, isLoading: isLoadingCauses } = useQuery({
    queryKey: ['causes-search', searchQuery, selectedCategory, searchTrigger],
    queryFn: () => getCausesBySearch(searchQuery || '', selectedCategory || '', 1),
    enabled: (step === 2 && (searchTrigger > 0 || searchQuery.trim().length > 0)),
  });

  // Initial load for step 2
  useEffect(() => {
    if (step === 2 && searchTrigger === 0) {
      setSearchTrigger(1);
    }
  }, [step]);

  // Create fundraiser mutation
  const createFundraiserMutation = useMutation({
    mutationFn: createFundraiser,
    onSuccess: () => {
      toast.success('Fundraiser created successfully!');
      queryClient.invalidateQueries({ queryKey: ['crwd', collectiveId] });
      // Navigate back to the collective page
      navigate(`/groupcrwd/${collectiveId}`);
    },
    onError: (error: any) => {
      console.error('Create fundraiser error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create fundraiser';
      toast.error(errorMessage);
    },
  });

  const handleColorSelect = (color: string) => {
    setCoverColor(color);
    setCoverType('color');
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

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else {
      // Validate required fields
      if (!campaignTitle || !fundraisingGoal || !endDate || !campaignStory || selectedNonprofits.length === 0) {
        toast.error('Please fill in all required fields and select at least one nonprofit');
        return;
      }

      // Prepare request data
      const startDate = new Date().toISOString();
      const endDateISO = endDate ? endDate.toISOString() : '';

      if (coverType === 'image' && uploadedCoverImage) {
        // Use FormData for image upload
        const formData = new FormData();
        formData.append('name', campaignTitle);
        formData.append('description', campaignStory);
        formData.append('image', uploadedCoverImage);
        formData.append('collective', collectiveId || '');
        formData.append('target_amount', fundraisingGoal);
        formData.append('start_date', startDate);
        formData.append('end_date', endDateISO);
        formData.append('is_active', 'true');
        selectedNonprofits.forEach((causeId) => {
          formData.append('cause_ids', causeId.toString());
        });

        createFundraiserMutation.mutate(formData);
      } else {
        // Use JSON for color-based cover
        const requestData = {
          name: campaignTitle,
          description: campaignStory,
          color: coverType === 'color' ? coverColor : '',
          collective: parseInt(collectiveId || '0', 10),
          target_amount: parseFloat(fundraisingGoal),
          start_date: startDate,
          end_date: endDateISO,
          is_active: true,
          cause_ids: selectedNonprofits,
        };

        createFundraiserMutation.mutate(requestData);
      }
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate(-1);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Step 2 handlers
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

  const handleNonprofitToggle = (nonprofitId: number) => {
    setSelectedNonprofits(prev => {
      if (prev.includes(nonprofitId)) {
        return prev.filter(id => id !== nonprofitId);
      } else {
        return [...prev, nonprofitId];
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <button
            onClick={handleBack}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg md:text-xl text-gray-900">Create Fundraiser</h1>
            <p className="text-sm md:text-base text-gray-600">
              For {collectiveData?.name || 'Collective'}
            </p>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center gap-2 md:gap-4 mt-3">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
              step === 1 
                ? 'bg-[#1600ff] text-white' 
                : 'bg-[#1600ff] text-white'
            }`}>
              {step === 2 ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : '1'}
            </div>
            <span className={`text-sm md:text-base font-semibold ${
              step === 1 ? 'text-[#1600ff]' : 'text-[#1600ff]'
            }`}>Details</span>
          </div>
          <div className="flex-1 h-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
              step === 2 
                ? 'bg-[#1600ff] text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className={`text-sm md:text-base font-semibold ${
              step === 2 ? 'text-[#1600ff]' : 'text-gray-500'
            }`}>Nonprofits</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {step === 1 ? (
          <>
            {/* Time-Limited Campaign Info Box */}
        <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-3 md:p-4 mb-6 md:mb-8">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Info className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base text-blue-900 mb-1">
                Time-Limited Campaign
              </h3>
              <p className="text-xs md:text-sm text-blue-800">
                Create urgency for your cause with a deadline. Perfect for emergencies, holidays, or special events.
              </p>
            </div>
          </div>
        </div>

        {/* Campaign Cover */}
        <div className="mb-6 md:mb-8">
          <label className="block text-sm md:text-base font-semibold text-gray-900 mb-3">
            Campaign Cover
          </label>
          
          

          {/* Type Selection Buttons */}
          <div className="flex gap-3 mb-4">
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
                    onClick={() => {
                      setUploadedCoverImage(null);
                      setUploadedCoverImagePreview(null);
                    }}
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

        {/* Campaign Title */}
        <div className="mb-6 md:mb-8">
          <label className="block text-sm md:text-base font-semibold text-gray-900 mb-2">
            Campaign Title <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={campaignTitle}
            onChange={(e) => setCampaignTitle(e.target.value)}
            placeholder="e.g., Kansas Tornado Relief Fund"
            className="w-full"
          />
        </div>

        {/* Fundraising Goal */}
        <div className="mb-6 md:mb-8">
          <label className="block text-sm md:text-base font-semibold text-gray-900 mb-2">
            Fundraising Goal <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
              $
            </span>
            <Input
              type="number"
              value={fundraisingGoal}
              onChange={(e) => setFundraisingGoal(e.target.value)}
              placeholder="1000"
              className="w-full pl-8"
            />
          </div>
        </div>

        {/* Campaign End Date */}
        <div className="mb-6 md:mb-8">
          <label className="block text-sm md:text-base font-semibold text-gray-900 mb-2">
            Campaign End Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            value={endDate}
            onChange={(date) => setEndDate(date)}
            disabledDate={(current) => {
              // Disable dates before today
              return current && current < dayjs().startOf('day');
            }}
            className="w-full"
            placeholder="Select end date"
            format="YYYY-MM-DD"
            size="large"
          />
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Choose when your campaign ends
          </p>
        </div>

        {/* Campaign Story */}
        <div className="mb-6 md:mb-8">
          <label className="block text-sm md:text-base font-semibold text-gray-900 mb-2">
            Campaign Story <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={campaignStory}
            onChange={(e) => setCampaignStory(e.target.value)}
            placeholder="Tell people why you're raising money and how it will make an impact..."
            className="w-full min-h-[120px] md:min-h-[150px] resize-none"
          />
        </div>
          </>
        ) : (
          <>
            {/* Informational Banner */}
            <div className="border-2 border-orange-200 bg-orange-50 rounded-lg p-3 md:p-4 mb-6 md:mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Building2 className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base text-orange-900 mb-1">
                    Choose Any Nonprofits
                  </h3>
                  <p className="text-xs md:text-sm text-orange-800">
                    Your fundraiser can support different nonprofits than your collective's core causes. Perfect for emergencies or special campaigns!
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4 md:mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search nonprofits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full pl-9 md:pl-10"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 scrollbar-hide">
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

            {/* Selected Count */}
            <div className="mb-4 md:mb-6">
              <p className="text-sm md:text-base font-semibold text-gray-900">
                {selectedNonprofits.length} nonprofit{selectedNonprofits.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            {/* Nonprofits List */}
            <div className="space-y-3 md:space-y-4">
              {isLoadingCauses ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (causesData?.results || []).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm md:text-base text-gray-500">No nonprofits found</p>
                </div>
              ) : (
                (causesData?.results || []).map((nonprofit: any) => {
                  const isSelected = selectedNonprofits.includes(nonprofit.id);
                  const avatarBgColor = getConsistentColor(nonprofit.id, nonprofit.name);
                  const initials = getInitials(nonprofit.name || 'N');
                  const category = categories.find(cat => cat.id === nonprofit.category || cat.id === nonprofit.cause_category);
                  const categoryName = category?.name || 'General';

                  return (
                    <div
                      key={nonprofit.id}
                      onClick={() => handleNonprofitToggle(nonprofit.id)}
                      className="flex items-center gap-3 md:gap-4 cursor-pointer p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0">
                        <AvatarImage src={nonprofit.image} alt={nonprofit.name} />
                        <AvatarFallback
                          style={{ backgroundColor: avatarBgColor }}
                          className="text-white font-bold text-xs md:text-sm"
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm md:text-base text-gray-900 mb-1">
                          {nonprofit.name}
                        </h4>
                        <p className="text-xs md:text-sm text-gray-600">
                          {nonprofit.mission || nonprofit.description || categoryName}
                        </p>
                      </div>
                      <label className="flex items-center flex-shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleNonprofitToggle(nonprofit.id)}
                          className="w-4 h-4 md:w-5 md:h-5 text-[#1600ff] focus:ring-[#1600ff] rounded"
                        />
                      </label>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 md:px-6 py-4 md:py-5 flex items-center gap-4 md:justify-center">
        {step === 1 ? (
          <>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="text-xs md:text-sm w-[35%] md:w-[30%]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={!campaignTitle || !fundraisingGoal || !endDate || !campaignStory}
              className=" bg-[#1600ff] hover:bg-[#1400cc] text-white text-xs md:text-sm flex-1 md:flex-none md:w-[30%]"
            >
              Next: Choose Nonprofits
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={handleBack}
              className="text-xs md:text-sm w-[35%] md:w-[30%]"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={createFundraiserMutation.isPending || selectedNonprofits.length === 0}
              className="bg-[#1600ff] hover:bg-[#1400cc] text-white text-xs md:text-sm flex-1 md:flex-none md:w-[30%] disabled:opacity-50"
            >
              {createFundraiserMutation.isPending ? (
                <>
                  <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Fundraiser'
              )}
            </Button>
          </>
        )}
      </div>

      {/* Spacer for fixed footer */}
      <div className="h-20 md:h-24"></div>
    </div>
  );
}

