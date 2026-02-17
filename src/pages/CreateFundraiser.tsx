import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Info, Palette, Image as ImageIcon, Camera, X, Check, Search, Building2, Eye, Share2, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCollectiveById, getCausesBySearch, createFundraiser } from '@/services/api/crwd';
import { Toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { categories } from '@/constants/categories';
import { SharePost } from '@/components/ui/SharePost';
import Confetti from 'react-confetti';
import { CrwdAnimation } from '@/assets/newLogo';
import Cropper, { Area } from 'react-easy-crop';
import { DiscardSheet } from '@/components/ui/DiscardSheet';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';

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
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 state
  const [coverType, setCoverType] = useState<'color' | 'image'>('color');
  const [coverColor, setCoverColor] = useState('#1600ff');
  const [uploadedCoverImage, setUploadedCoverImage] = useState<File | null>(null);
  const [uploadedCoverImagePreview, setUploadedCoverImagePreview] = useState<string | null>(null);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [fundraisingGoal, setFundraisingGoal] = useState('');
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [campaignStory, setCampaignStory] = useState('');

  // Crop state
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Step 2 state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedNonprofits, setSelectedNonprofits] = useState<number[]>([]);
  const [selectedNonprofitsData, setSelectedNonprofitsData] = useState<any[]>([]); // Store full nonprofit objects
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdFundraiser, setCreatedFundraiser] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAnimationComplete, setShowAnimationComplete] = useState(false);
  const [showDiscardSheet, setShowDiscardSheet] = useState(false);
  const [isConfirmedDiscard, setIsConfirmedDiscard] = useState(false);

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

  const hasUnsavedChanges = useMemo(() => {
    return (
      (campaignTitle.trim() !== '' ||
        fundraisingGoal.trim() !== '' ||
        endDate !== null ||
        campaignStory.trim() !== '' ||
        uploadedCoverImage !== null ||
        selectedNonprofits.length > 0) &&
      !showSuccessModal &&
      !createdFundraiser
    );
  }, [campaignTitle, fundraisingGoal, endDate, campaignStory, uploadedCoverImage, selectedNonprofits, showSuccessModal, createdFundraiser]);

  // Use navigation guard hook
  useUnsavedChanges(hasUnsavedChanges, setShowDiscardSheet, isConfirmedDiscard);

  const handleBackConfirmation = () => {
    if (hasUnsavedChanges && !showSuccessModal && !isConfirmedDiscard) {
      setShowDiscardSheet(true);
    } else {
      // Use navigate(-1) directly as handleBack might not be defined or I should define it
      navigate(-1);
    }
  };

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
    onSuccess: (response) => {
      console.log('Create fundraiser successful:', response);
      // Store the created fundraiser data
      setCreatedFundraiser(response);
      // Wait for animation to complete (3 seconds for one full cycle) before showing success
      setTimeout(() => {
        setShowAnimationComplete(true);
        setShowSuccessModal(true);
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 4000);
      }, 3000);
      queryClient.invalidateQueries({ queryKey: ['crwd', collectiveId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: any) => {
      console.error('Create fundraiser error:', error);
      // Check for non_field_errors first (array of error messages)
      let errorMessage = 'Failed to create fundraiser';
      if (error?.response?.data?.non_field_errors && Array.isArray(error.response.data.non_field_errors) && error.response.data.non_field_errors.length > 0) {
        errorMessage = error.response.data.non_field_errors[0];
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      setToastMessage(errorMessage);
      setShowToast(true);
    },
  });

  const handleColorSelect = (color: string) => {
    setCoverColor(color);
    setCoverType('color');
  };

  // Create cropped image utility function
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCropComplete = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], "cropped-image.jpg", {
        type: "image/jpeg",
      });

      setUploadedCoverImage(croppedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(croppedFile);

      setShowCropModal(false);
      setCropImageSrc("");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setCoverType('image');
    } catch (error) {
      console.error("Error cropping image:", error);
      setToastMessage("Failed to crop image. Please try again.");
      setShowToast(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        setCropImageSrc(imageSrc);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      // Validate step 1 fields
      if (!campaignTitle || !fundraisingGoal || !endDate || !campaignStory) {
        setToastMessage('Please fill in all required campaign details.');
        setShowToast(true);
        return;
      }
      if (coverType === 'image' && !uploadedCoverImage) {
        setToastMessage('Please upload an image for the campaign cover');
        setShowToast(true);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate step 2 - at least one nonprofit selected
      if (selectedNonprofits.length === 0) {
        setToastMessage('Please select at least one nonprofit.');
        setShowToast(true);
        return;
      }
      setStep(3);
    }
  };

  const handleLaunch = () => {
    // Prepare request data
    const startDate = new Date().toISOString();
    const endDateISO = endDate ? endDate.toISOString() : '';

    if (coverType === 'image') {
      // If image tab is selected, validate that image exists
      if (!uploadedCoverImage) {
        setToastMessage('Please upload an image for the campaign cover');
        setShowToast(true);
        return;
      }
      // Use FormData for image upload - send only image, no color
      const formData = new FormData();
      formData.append('name', campaignTitle);
      formData.append('description', campaignStory);
      formData.append('image_file', uploadedCoverImage);
      formData.append('collective_id', collectiveId || '');
      formData.append('target_amount', fundraisingGoal);
      formData.append('start_date', startDate);
      formData.append('end_date', endDateISO);
      formData.append('is_active', 'true');
      selectedNonprofits.forEach((causeId) => {
        formData.append('cause_ids', causeId.toString());
      });

      createFundraiserMutation.mutate(formData);
    } else if (coverType === 'color') {
      // Use JSON for color-based cover - send only color, no image
      const requestData = {
        name: campaignTitle,
        description: campaignStory,
        color: coverColor,
        collective_id: parseInt(collectiveId || '0', 10),
        target_amount: parseFloat(fundraisingGoal),
        start_date: startDate,
        end_date: endDateISO,
        is_active: true,
        cause_ids: selectedNonprofits,
      };

      createFundraiserMutation.mutate(requestData);
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
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

  const handleNonprofitToggle = (nonprofitId: number, nonprofitData: any) => {
    setSelectedNonprofits(prev => {
      if (prev.includes(nonprofitId)) {
        return prev.filter(id => id !== nonprofitId);
      } else {
        return [...prev, nonprofitId];
      }
    });
    setSelectedNonprofitsData(prev => {
      if (prev.some(item => item.id === nonprofitId)) {
        return prev.filter(item => item.id !== nonprofitId);
      } else {
        return [...prev, nonprofitData];
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

  // Loading Animation Step (during API call or while animation completes)
  if (createFundraiserMutation.isPending || (createdFundraiser && !showAnimationComplete)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-3 md:px-4">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <CrwdAnimation size="lg" />
        </div>
      </div>
    );
  }

  // Success Step
  if (showSuccessModal && createdFundraiser) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="flex flex-col items-center justify-center min-h-screen px-3 md:px-4 py-8 md:py-12">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 md:p-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-4 md:mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#ADFF2F] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Heading */}
              <div className="text-center mb-3 md:mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🎉</span>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    Campaign is Live!
                  </h2>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8 leading-relaxed">
                Your <strong>{campaignTitle}</strong> fundraiser is now live! Share it with friends to reach your ${parseFloat(fundraisingGoal || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} goal and support {selectedNonprofitsData.length} nonprofit{selectedNonprofitsData.length !== 1 ? 's' : ''}.
              </p>

              {/* Action Buttons */}
              <div className="space-y-3 md:space-y-4">
                {/* View Campaign Button */}
                <Button
                  onClick={() => {
                    if (createdFundraiser?.id) {
                      navigate(`/fundraiser/${createdFundraiser.id}`);
                    }
                  }}
                  className="w-full bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-lg py-3 md:py-4 text-sm md:text-base flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 md:w-5 md:h-5" />
                  View Campaign
                </Button>

                {/* Back to Collective Button */}
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate(`/groupcrwd/${collectiveId}`);
                  }}
                  variant="outline"
                  className="w-full border border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold rounded-lg py-3 md:py-4 text-sm md:text-base"
                >
                  Back to Collective
                </Button>

                {/* Share Campaign Link */}
                <button
                  onClick={() => {
                    setShowShareModal(true);
                  }}
                  className="w-full text-[#1600ff] hover:text-[#1400cc] font-semibold text-sm md:text-base flex items-center justify-center gap-2 py-2 md:py-3"
                >
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                  Share Campaign
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Confetti Animation */}
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={true}
            numberOfPieces={300}
            gravity={0.2}
            wind={0.05}
            opacity={0.8}
          />
        )}

        {/* Share Modal */}
        {createdFundraiser && (
          <SharePost
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            url={window.location.origin + `/fundraiser/${createdFundraiser.id}`}
            title={campaignTitle}
          />
        )}

        {/* Toast */}
        <Toast
          show={showToast}
          onHide={() => setShowToast(false)}
          message={toastMessage}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <button
            onClick={handleBackConfirmation}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg md:text-xl text-gray-900">
              {step === 3 ? 'Confirm & Launch' : 'Create Fundraiser'}
            </h1>
            {step !== 3 && (
              <p className="text-sm md:text-base text-gray-600">
                For {collectiveData?.name || 'Collective'}
              </p>
            )}
          </div>
        </div>

        {/* Progress Indicator - Only show for steps 1 and 2 */}
        {step !== 3 && (
          <div className="flex items-center gap-2 md:gap-4 mt-3">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${step >= 1
                ? 'bg-[#1600ff] text-white'
                : 'bg-gray-200 text-gray-500'
                }`}>
                {step > 1 ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : '1'}
              </div>
              <span className={`text-sm md:text-base font-semibold ${step >= 1 ? 'text-[#1600ff]' : 'text-gray-500'
                }`}>Details</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${step >= 2
                ? 'bg-[#1600ff] text-white'
                : 'bg-gray-200 text-gray-500'
                }`}>
                {step > 2 ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : '2'}
              </div>
              <span className={`text-sm md:text-base font-semibold ${step >= 2 ? 'text-[#1600ff]' : 'text-gray-500'
                }`}>Nonprofits</span>
            </div>
          </div>
        )}
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
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${coverType === 'color'
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
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${coverType === 'image'
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
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-lg transition-transform hover:scale-110 ${coverColor === color ? 'ring-2 ring-gray-900 ring-offset-2' : ''
                          }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>

                  {/* Color Preview Box */}
                  <div className="rounded-lg border border-gray-200 overflow-hidden" style={{ height: '300px' }}>
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: coverColor }}
                    >
                      <span className="text-white text-base md:text-lg font-bold">
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
                    <div className="mb-4">
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 mx-auto w-full" style={{ height: '300px', maxWidth: '600px' }}>
                        <img
                          src={uploadedCoverImagePreview}
                          alt="Selected"
                          className="w-full h-full object-cover"
                          style={{ objectPosition: 'center' }}
                        />
                        <button
                          onClick={() => {
                            setUploadedCoverImage(null);
                            setUploadedCoverImagePreview(null);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        const input = document.getElementById('cover-image-upload-input');
                        input?.click();
                      }}
                      className="relative rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center w-full mx-auto"
                      style={{ height: '300px', maxWidth: '600px' }}
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
                  placeholder="100"
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
                format="MM-DD-YYYY"
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
        ) : step === 2 ? (
          <>
            {/* Informational Banner */}
            <div className="border-2  border-orange-200 bg-amber-100 rounded-lg p-3 md:p-4 mb-6 md:mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Building2 className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm md:text-base text-orange-800 mb-1">
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
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${isSelected
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
                      onClick={() => handleNonprofitToggle(nonprofit.id, nonprofit)}
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
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                          {nonprofit.mission || nonprofit.description || categoryName}
                        </p>
                      </div>
                      <label className="flex items-center flex-shrink-0 cursor-pointer" onClick={(e) => e.stopPropagation()}  >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleNonprofitToggle(nonprofit.id, nonprofit)}
                          className="w-4 h-4 md:w-5 md:h-5 text-[#1600ff] focus:ring-[#1600ff] cursor-pointer rounded"
                        />
                      </label>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : step === 3 ? (
          // Step 3: Confirm & Launch
          <>
            {/* Campaign Preview Card */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 rounded-2xl overflow-hidden">
              {/* Cover Section - Color or Image */}
              <div className="w-full rounded-xl overflow-hidden" style={{ height: '300px' }}>
                {coverType === 'color' ? (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: coverColor }}
                  >

                  </div>
                ) : uploadedCoverImagePreview ? (
                  <div className="w-full h-full mx-auto flex items-center justify-center" style={{ maxWidth: '600px' }}>
                    <img
                      src={uploadedCoverImagePreview}
                      alt="Campaign cover"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: 'center' }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: '#1600ff' }}
                  >
                    <span className="text-white text-2xl md:text-3xl font-bold opacity-50">
                      {campaignTitle || 'Campaign Cover'}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="py-4">
                {/* Campaign Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-[#1600ff] mb-6">
                  {campaignTitle}
                </h1>

                {/* Fundraising Goal and End Date */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className='bg-white p-4 rounded-lg '>
                      <div className="text-xs md:text-sm text-gray-600 font-semibold uppercase mb-2">FUNDRAISING GOAL</div>
                      <div className="text-xl md:text-2xl font-bold text-[#1600ff]">
                        ${parseFloat(fundraisingGoal || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div className='bg-white p-4 rounded-lg'>
                      <div className="text-xs md:text-sm text-gray-600 font-semibold uppercase mb-2">ENDS ON</div>
                      <div className="text-base md:text-xl font-semibold text-gray-900">
                        {endDate ? endDate.format('MMMM D, YYYY') : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campaign Story */}
                <div className="mb-6">
                  <div className="text-xs md:text-base text-gray-600 font-medium uppercase mb-2">CAMPAIGN STORY</div>
                  <div className="text-sm md:text-base text-gray-900 whitespace-pre-line">
                    {campaignStory || 'No story provided'}
                  </div>
                </div>

                {/* Supporting Nonprofits */}
                <div className="mb-6">
                  <div className="text-xs md:text-base text-gray-600 font-medium uppercase mb-3">
                    SUPPORTING {selectedNonprofitsData.length} NONPROFIT{selectedNonprofitsData.length !== 1 ? 'S' : ''}
                  </div>
                  <div className="space-y-3">
                    {selectedNonprofitsData.map((nonprofit: any) => {
                      const avatarBgColor = getConsistentColor(nonprofit.id, nonprofit.name);
                      const initials = getInitials(nonprofit.name || 'N');
                      const category = categories.find(cat => cat.id === nonprofit.category || cat.id === nonprofit.cause_category);
                      const categoryName = category?.name || 'General';

                      return (
                        <div key={nonprofit.id} className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 flex items-center gap-3 md:gap-4">
                          <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0">
                            <AvatarImage src={nonprofit.image} alt={nonprofit.name} />
                            <AvatarFallback
                              style={{ backgroundColor: avatarBgColor }}
                              className="text-white font-bold text-xs md:text-sm rounded-lg"
                            >
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm md:text-base text-gray-900">
                              {nonprofit.name}
                            </h4>
                            <p className="text-xs md:text-sm text-gray-600">
                              {categoryName}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Donation Split Note */}
                <div className="bg-white border border-blue-200 rounded-lg p-3 md:p-4">
                  <p className="text-xs md:text-sm text-gray-700 text-center">
                    All donations will be split evenly across these nonprofits.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : null}
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
        ) : step === 2 ? (
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
              disabled={selectedNonprofits.length === 0}
              className="bg-[#1600ff] hover:bg-[#1400cc] text-white text-xs md:text-sm flex-1 md:flex-none md:w-[30%] disabled:opacity-50"
            >
              Next: Confirm & Launch
            </Button>
          </>
        ) : (
          // Step 3: Launch Campaign button
          <Button
            onClick={handleLaunch}
            disabled={createFundraiserMutation.isPending}
            className="bg-[#1600ff] hover:bg-[#1400cc] text-white text-sm md:text-base font-semibold w-full max-w-2xl mx-auto py-4 md:py-6 rounded-full disabled:opacity-50"
          >
            {createFundraiserMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                Launching...
              </>
            ) : (
              'Launch Campaign'
            )}
          </Button>
        )}
      </div>

      {/* Spacer for fixed footer */}
      <div className="h-20 md:h-24"></div>

      {/* Toast */}
      <Toast
        show={showToast}
        onHide={() => setShowToast(false)}
        message={toastMessage}
      />

      {/* Crop Modal */}
      {showCropModal && cropImageSrc && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex flex-col">
          <div className="flex-1 relative">
            <Cropper
              image={cropImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={600 / 300}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  width: "100%",
                  height: "100%",
                  position: "relative",
                },
              }}
            />
          </div>
          <div className="bg-black p-4 flex items-center justify-between">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 mr-4"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowCropModal(false);
                  setCropImageSrc("");
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                  setCroppedAreaPixels(null);
                }}
                variant="outline"
                className="bg-white text-black hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCropComplete}
                className="bg-[#1600ff] hover:bg-[#1400cc] text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Discard Confirmation Sheet */}
      <DiscardSheet
        isOpen={showDiscardSheet}
        onClose={() => setShowDiscardSheet(false)}
        onDiscard={() => {
          setIsConfirmedDiscard(true);
          setShowDiscardSheet(false);
          setTimeout(() => {
            handleBack();
          }, 0);
        }}
      />
    </div>
  );
}

