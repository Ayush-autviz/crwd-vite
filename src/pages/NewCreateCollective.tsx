import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Search, X, Loader2, Edit2, Palette, Camera, Users } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCollective, getCausesBySearch } from '@/services/api/crwd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { categories } from '@/constants/categories';
import Confetti from 'react-confetti';
import { SharePost } from '@/components/ui/SharePost';
import { useAuthStore } from '@/stores/store';
// CreateCollectivePrompt will be created if needed

const getCategoryById = (categoryId: string | undefined) => {
  return categories.find(cat => cat.id === categoryId) || null;
};

// Avatar colors for consistent fallback styling
const avatarColors = [
  '#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3',
  '#FFC107', '#E91E63', '#00BCD4', '#8BC34A', '#FF5722',
  '#673AB7', '#009688', '#FFEB3B', '#795548', '#607D8B',
];

const getConsistentColor = (id: number | string, colors: string[]) => {
  const hash = typeof id === 'number' ? id : id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getInitials = (name: string) => {
  const words = name.split(' ').filter(Boolean);
  if (words.length === 0) return 'N';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export default function NewCreateCollectivePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser, token } = useAuthStore();

  // Form state
  const [name, setName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('createCrwd_name') || '';
    }
    return '';
  });
  const [description, setDescription] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('createCrwd_desc') || '';
    }
    return '';
  });
  const [selectedCauses, setSelectedCauses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [createdCollective, setCreatedCollective] = useState<any>(null);
  const [step, setStep] = useState(1);

  // Logo customization state
  const [logo, setLogo] = useState<string | File>('');
  const [logoType, setLogoType] = useState<'letter' | 'upload'>('letter');
  const [logoColor, setLogoColor] = useState('#1600ff');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showLogoCustomization, setShowLogoCustomization] = useState(false);

  const colorSwatches = [
    '#1600ff', // Blue
    '#ff3366', // Pink/Red
    '#aeff30', // Lime Green
    '#a955f7', // Purple
    '#13b981', // Teal
    '#ff6c36', // Orange
    '#ef4444', // Red
    '#6367f1', // Indigo
  ];

  // Save form data to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (name) {
        localStorage.setItem('createCrwd_name', name);
      } else {
        localStorage.removeItem('createCrwd_name');
      }
    }
  }, [name]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (description) {
        localStorage.setItem('createCrwd_desc', description);
      } else {
        localStorage.removeItem('createCrwd_desc');
      }
    }
  }, [description]);

  // Fetch default causes (no search query)
  const { data: defaultCausesData, isLoading: defaultCausesLoading } = useQuery({
    queryKey: ['defaultCauses'],
    queryFn: () => getCausesBySearch('', '', 1),
    enabled: true,
  });

  // Fetch causes with search
  const { data: causesData, isLoading: isCausesLoading } = useQuery({
    queryKey: ['causes-search', searchQuery, searchTrigger],
    queryFn: () => getCausesBySearch(searchQuery || '', '', 1),
    enabled: searchTrigger > 0 && searchQuery.trim().length > 0,
  });

  // Create collective mutation
  const createCollectiveMutation = useMutation({
    mutationFn: createCollective,
    onSuccess: (response) => {
      console.log('Create collective successful:', response);
      // Clear saved form data on successful creation
      if (typeof window !== 'undefined') {
        localStorage.removeItem('createCrwd_name');
        localStorage.removeItem('createCrwd_desc');
      }
      setCreatedCollective(response);
      setStep(2);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
      queryClient.invalidateQueries({ queryKey: ['collectives'] });
      queryClient.invalidateQueries({ queryKey: ['joined-collectives'] });
    },
    onError: (error: any) => {
      console.error('Create collective error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create collective';
      toast.error(errorMessage);
    },
  });

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setSearchTrigger((prev) => prev + 1);
    }
  };

  const isCauseSelected = (causeId: number) => {
    return selectedCauses.some(cause => cause.id === causeId);
  };

  const handleToggleCause = (cause: any) => {
    if (isCauseSelected(cause.id)) {
      setSelectedCauses(prev => prev.filter(c => c.id !== cause.id));
    } else {
      setSelectedCauses(prev => [...prev, cause]);
    }
  };

  const handleRemoveCause = (causeId: number) => {
    setSelectedCauses(prev => prev.filter(c => c.id !== causeId));
  };

  const handleColorSelect = (color: string) => {
    setLogoColor(color);
    if (logoType === 'letter') {
      setLogo(color);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCollective = () => {
    // Validation
    if (name.trim() === '') {
      toast.error('Please enter a name for your CRWD');
      return;
    }
    if (description.trim() === '') {
      toast.error('Please enter a description for your CRWD');
      return;
    }
    if (selectedCauses.length === 0) {
      toast.error('Please select at least one cause');
      return;
    }

    // Create collective via API
    // Use FormData if there's a file upload, otherwise use JSON
    if (logoType === 'upload' && logo instanceof File) {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      // Append each cause_id separately (backend should handle this as an array)
      selectedCauses.forEach(cause => {
        formData.append('cause_ids', cause.id.toString());
      });
      formData.append('logo_file', logo);
      // Add color even when uploading file (for fallback)
      if (logoColor) {
        formData.append('color', logoColor);
      }
      createCollectiveMutation.mutate(formData);
    } else {
      // Use JSON for letter logo or no logo
      const requestData: any = {
        name: name.trim(),
        description: description.trim(),
        cause_ids: selectedCauses.map(c => c.id),
      };

      // Add color if logo type is letter
      if (logoType === 'letter' && logoColor) {
        requestData.color = logoColor;
      }

      createCollectiveMutation.mutate(requestData);
    }
  };

  // Show prompt if user is not logged in
  if (!currentUser?.id || !token?.access_token) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center">
        {/* header */}
        <div className="sticky top-0 z-10 w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b bg-white">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-lg md:text-xl text-foreground">Create a CRWD Collective</h1>
        </div>
        <div className="mb-6 md:mb-8">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full mt-4 md:mt-5 bg-blue-100 flex items-center justify-center">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
          </div>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-4 md:mb-6 px-4">
          Lead a Giving Community
        </h2>
        <p className="text-sm md:text-base text-gray-700 text-center max-w-md mb-8 md:mb-12 leading-relaxed px-4">
          You pick the causes. You invite the people. They give monthly. No money touches your hands. You just rally the movement.
        </p>
        <Button
          onClick={() => navigate('/onboarding')}
          className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-lg px-4 md:px-6 py-3 md:py-6 text-sm md:text-base w-full max-w-xs mx-4"
        >
          Get Started
        </Button>
      </div>
    );
  }

  const logoLetter = name?.charAt(0).toUpperCase() || 'C';
  const displayLogo = logoPreview || (logoType === 'upload' && typeof logo === 'string' && (logo.startsWith('http') || logo.startsWith('/') || logo.startsWith('data:'))
    ? logo 
    : null);

  if (step === 2 && createdCollective) {
    return (
      <>
        <div className="min-h-screen bg-white">
          <div className="sticky top-0 z-10 w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b bg-white">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </button>
            <h1 className="font-bold text-lg md:text-xl text-foreground">Create a CRWD Collective</h1>
          </div>

          <div className="flex flex-col gap-4 items-center justify-center h-[65vh] md:h-[75vh] px-3 md:px-4">
            <div className="w-full max-w-md gap-4">
              <img
                src="/icons/CRWD.png"
                alt="CRWD Logo"
                className="w-24 h-24 md:w-32 md:h-32 object-contain mx-auto mb-4 md:mb-6"
              />
              <h2 className="text-lg md:text-xl font-bold text-center mb-4 md:mb-6">
                You've started a CRWD!
              </h2>
              {createdCollective && (
                <div className="text-center mb-4 px-4">
                  <p className="text-xs md:text-sm text-gray-600 mb-2">
                    <strong>{createdCollective.name}</strong> has been created successfully!
                  </p>
                  <p className="text-xs text-gray-500">{createdCollective.description}</p>
                </div>
              )}
              <div className="flex flex-col gap-2 px-4">
                <Button
                  className="w-full text-sm md:text-base py-2.5 md:py-3"
                  onClick={() => setShowShareModal(true)}
                >
                  Invite Friends
                </Button>
                <Button
                  onClick={() => navigate(`/groupcrwd/${createdCollective.id}`)}
                  variant="outline"
                  className="w-full text-sm md:text-base py-2.5 md:py-3"
                >
                  View Collective
                </Button>
              </div>
            </div>
          </div>
        </div>

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

        <SharePost
          url={window.location.origin + `/groupcrwd/${createdCollective.id}`}
          title={`Join my new CRWD: ${name}`}
          description={description}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b bg-white">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-lg md:text-xl text-foreground">Create a CRWD Collective</h1>
        </div>

        <div className="px-3 md:px-4 py-4 md:py-6 pb-24 md:pb-28 lg:max-w-[60%] lg:mx-auto">
          {/* Collective Name */}
          <div className="border border-gray-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
            <div className="flex items-center gap-2 mb-2">
              <label className="font-semibold text-sm md:text-base text-foreground">
                Name Your Collective <span className="text-red-500">*</span>
              </label>
              <div className="group relative">
                <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 cursor-pointer" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 md:px-3 py-1.5 md:py-2 bg-gray-100 text-gray-500 text-xs md:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Keep it short & memorable ({'<'}{'40'} characters)
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Atlanta Climate Action"
              className="w-full bg-gray-100 rounded-2xl text-sm md:text-base"
            />
          </div>

          {/* Description */}
          <div className="border border-gray-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
            <div className="flex items-center gap-2 mb-2">
              <label className="font-semibold text-sm md:text-base text-foreground">
                What Brings This Group Together? <span className="text-red-500">*</span>
              </label>
              <div className="group relative">
                <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 cursor-pointer" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 md:px-3 py-1.5 md:py-2 bg-gray-100 text-gray-500 text-xs md:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-normal max-w-[180px] md:max-w-[200px] z-10">
                  A quick one-liner works best ({'<'}{'160'} characters)
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`"We're classmates giving back to Atlanta."\n"Our office team supporting local families."\n"A community of friends passionate about clean water."`}
              className="w-full min-h-[100px] bg-gray-100 rounded-2xl text-sm md:text-base"
            />
          </div>

          {/* Collective Logo */}
          <div className="border border-gray-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
            <div className="flex items-center gap-3 md:gap-4">
              <Avatar className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex-shrink-0">
                {displayLogo ? (
                  <AvatarImage src={displayLogo} alt={name} />
                ) : (
                  <AvatarFallback
                    style={{ backgroundColor: logoColor }}
                    className="text-white rounded-lg font-bold text-lg md:text-2xl"
                  >
                    {logoLetter}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <label className="font-bold text-sm md:text-base text-foreground block">
                  Collective Logo
                </label>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {logoType === 'letter' ? 'Letter logo' : 'Custom image'}
                </p>
              </div>
              <Button
                onClick={() => setShowLogoCustomization(!showLogoCustomization)}
                variant="outline"
                className="border-gray-300 text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2"
              >
                {showLogoCustomization ? (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Done
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Customize
                  </>
                )}
              </Button>
            </div>

            {/* Customization Options - Shown when Customize is clicked */}
            {showLogoCustomization && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                  {/* Right Side - Customization Options */}
                  <div className="flex-1 w-full">
                    {/* Logo Type Selection */}
                    <div className="flex gap-3 mb-4">
                      <Button
                        onClick={() => {
                          setLogoType('letter');
                          setLogoPreview(null);
                          setLogo(logoColor);
                        }}
                        className={`flex-1 font-semibold rounded-lg py-2.5 md:py-3 text-sm md:text-base ${
                          logoType === 'letter'
                            ? 'bg-[#1600ff] text-white'
                            : 'bg-white border border-gray-300 text-foreground hover:bg-gray-50'
                        }`}
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        Letter
                      </Button>
                      <Button
                        onClick={() => setLogoType('upload')}
                        className={`flex-1 font-semibold rounded-lg py-2.5 md:py-3 text-sm md:text-base ${
                          logoType === 'upload'
                            ? 'bg-[#1600ff] text-white'
                            : 'bg-white border border-gray-300 text-foreground hover:bg-gray-50'
                        }`}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>

                    {/* Letter Logo Options */}
                    {logoType === 'letter' && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 text-sm md:text-base">Background Color</h4>
                        <div className="grid grid-cols-4 md:flex md:gap-3 gap-2">
                          {colorSwatches.map((color) => (
                            <button
                              key={color}
                              onClick={() => handleColorSelect(color)}
                              className={`w-10 h-10 md:w-12 md:h-12 rounded-lg transition-transform hover:scale-110 ${
                                logoColor === color ? 'ring-2 ring-gray-900' : ''
                              }`}
                              style={{ backgroundColor: color }}
                              aria-label={`Select color ${color}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload Logo Options */}
                    {logoType === 'upload' && (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="logo-upload-input"
                        />
                        <label
                          htmlFor="logo-upload-input"
                          className="cursor-pointer"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-gray-300"
                            onClick={() => {
                              const input = document.getElementById('logo-upload-input');
                              input?.click();
                            }}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Upload
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Causes Management Section */}
          <div className="mt-6 md:mt-8 space-y-4 md:space-y-6">
            {/* Selected Causes - Only show if there are selected causes */}
            {selectedCauses.length > 0 && (
              <div className="border border-blue-200 p-3 md:p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50">
                <h3 className="font-bold text-base md:text-lg text-foreground mb-3 md:mb-4">
                  Selected Causes ({selectedCauses.length})
                </h3>
                <div className="space-y-2 md:space-y-3">
                  {selectedCauses.map((cause) => {
                    const causeData = cause.cause || cause;
                    // Get category ID from cause (it's a single letter like "X", "G")
                    const categoryId = causeData.category || causeData.cause_category;
                    const category = getCategoryById(categoryId);
                    const categoryName = category?.name || 'Uncategorized';
                    const categoryColor = category?.text || '#10B981';
                    const avatarBgColor = getConsistentColor(causeData.id, avatarColors);
                    const initials = getInitials(causeData.name || 'N');
                    
                    return (
                      <div key={cause.id} className="bg-white rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 md:gap-4">
                          <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0">
                            <AvatarImage src={causeData.image} alt={causeData.name} />
                            <AvatarFallback
                              style={{ backgroundColor: avatarBgColor }}
                              className="text-white font-bold text-xs md:text-sm"
                            >
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-bold text-sm md:text-base text-foreground truncate">{causeData.name}</h4>
                              <span
                                className="inline-flex items-center rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium flex-shrink-0"
                                style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                              >
                                {categoryName}
                              </span>
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{causeData.mission || causeData.description}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveCause(cause.id)}
                            className="p-1.5 md:p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add or Remove Causes */}
            <div className="border border-gray-200 p-3 md:p-4 rounded-2xl">
              <h3 className="font-bold text-base md:text-lg text-foreground mb-2 md:mb-3">
                Add or Remove Causes <span className="text-red-500">*</span>
              </h3>
              
              {/* Search Bar */}
              <div className="relative mb-3 md:mb-4">
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

              {/* Causes List */}
              <div className="space-y-2 md:space-y-3 max-h-96 overflow-y-auto">
                {(isCausesLoading || defaultCausesLoading) ? (
                  <div className="flex items-center justify-center py-6 md:py-8">
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  (() => {
                    const causes = searchTrigger > 0 && searchQuery.trim()
                      ? (causesData?.results || [])
                      : (defaultCausesData?.results || []);
                    
                    // Filter out already selected causes
                    const availableCauses = causes.filter((cause: any) => 
                      !selectedCauses.some(selected => selected.id === cause.id)
                    );

                    if (availableCauses.length === 0) {
                      return (
                        <p className="text-xs md:text-sm text-muted-foreground text-center py-6 md:py-8">
                          No causes found
                        </p>
                      );
                    }

                    return availableCauses.map((cause: any) => {
                      // Get category ID from cause (it's a single letter like "X", "G")
                      const categoryId = cause.category || cause.cause_category;
                      const category = getCategoryById(categoryId);
                      const categoryName = category?.name || 'Uncategorized';
                      const categoryColor = category?.text || '#10B981';
                      const isSelected = isCauseSelected(cause.id);

                      const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                      const initials = getInitials(cause.name || 'N');
                      
                      return (
                        <div
                          key={cause.id}
                          className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0">
                            <AvatarImage src={cause.image} alt={cause.name} />
                            <AvatarFallback
                              style={{ backgroundColor: avatarBgColor }}
                              className="text-white font-bold text-xs md:text-sm"
                            >
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-bold text-sm md:text-base text-foreground truncate">{cause.name}</h4>
                              <span
                                className="inline-flex items-center rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium flex-shrink-0"
                                style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                              >
                                {categoryName}
                              </span>
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                              {cause.mission || cause.description}
                            </p>
                          </div>
                          
                          <label className="flex items-center cursor-pointer flex-shrink-0">
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => handleToggleCause(cause)}
                              className="w-4 h-4 md:w-5 md:h-5 text-[#1600ff] focus:ring-[#1600ff]"
                            />
                          </label>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 md:px-4 py-3 z-10">
            <div className="w-full lg:max-w-[60%] lg:mx-auto">
              <Button
                onClick={handleCreateCollective}
                className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-full px-4 md:px-6 py-2 md:py-2.5 w-full text-sm md:text-base"
                disabled={createCollectiveMutation.isPending}
              >
                {createCollectiveMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create CRWD'
                )}
              </Button>
            </div>
          </div>
        
        </div>
      </div>
    </>
  );
}
