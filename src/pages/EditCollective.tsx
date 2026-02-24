import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2, HelpCircle, Loader2, Palette, Camera, Search, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getCollectiveById, patchCollective, getCollectiveCauses } from '@/services/api/crwd';
import { getCausesBySearch } from '@/services/api/crwd';
import { useAuthStore } from '@/stores/store';
import { categories } from '@/constants/categories';
import { toast } from 'sonner';

// Helper function to get category by ID
const getCategoryById = (categoryId: string | undefined) => {
  if (!categoryId) return null;
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

export default function EditCollectivePage() {
  const { crwdId } = useParams<{ crwdId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // Logo customization state - separate states for letter and upload
  const [logoType, setLogoType] = useState<'letter' | 'upload'>('letter');
  const [letterLogoColor, setLetterLogoColor] = useState('#1600ff'); // State for letter logo background color
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null); // State for uploaded file
  const [uploadedLogoPreview, setUploadedLogoPreview] = useState<string | null>(null); // State for uploaded image preview
  const [showLogoCustomization, setShowLogoCustomization] = useState(false);


  // Causes management state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCauses, setSelectedCauses] = useState<any[]>([]);
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
  const { data: crwdData, isLoading } = useQuery({
    queryKey: ['crwd', crwdId],
    queryFn: () => getCollectiveById(crwdId || ''),
    enabled: !!crwdId,
  });

  // Fetch collective causes
  const { data: collectiveCausesData } = useQuery({
    queryKey: ['collective-causes', crwdId],
    queryFn: () => getCollectiveCauses(crwdId || ''),
    enabled: !!crwdId,
  });

  // Fetch causes for search
  const { data: causesData, isLoading: isCausesLoading } = useQuery({
    queryKey: ['causes-search', searchQuery, searchTrigger],
    queryFn: () => getCausesBySearch(searchQuery || '', '', 1),
    enabled: searchTrigger > 0 && searchQuery.trim().length > 0,
  });

  // Fetch default causes when no search
  const { data: defaultCausesData } = useQuery({
    queryKey: ['default-causes'],
    queryFn: () => getCausesBySearch('', '', 1),
    enabled: searchTrigger === 0 || searchQuery.trim().length === 0,
  });

  // Initialize form data when collective data loads
  useEffect(() => {
    if (crwdData) {
      const apiName = crwdData.name || '';
      const apiDescription = crwdData.description || '';

      setName(apiName);
      setDescription(apiDescription);

      // Determine logo type - prioritize logo (image) over color
      if (crwdData.logo) {
        // Has logo image
        setLogoType('upload');
        setUploadedLogoPreview(crwdData.logo);
        // Keep color as fallback if provided
        if (crwdData.color) {
          setLetterLogoColor(crwdData.color);
        }
      } else if (crwdData.color) {
        // Has color but no logo
        setLogoType('letter');
        setLetterLogoColor(crwdData.color);
      }
    }
  }, [crwdData]);

  // Initialize selected causes from collective causes
  useEffect(() => {
    if (collectiveCausesData) {
      const causes = collectiveCausesData.results || collectiveCausesData || [];
      // Map causes from the API response structure
      const mappedCauses = causes.map((item: any) => {
        // The API returns { id, cause: { id, name, description, category, ... }, ... }
        // We want to store the cause object with the category ID
        return item.cause || item;
      });
      setSelectedCauses(mappedCauses);
    }
  }, [collectiveCausesData]);

  // Update collective mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => patchCollective(crwdId || '', data),
    onSuccess: async () => {
      // Invalidate and refetch queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['crwd', crwdId] });
      await queryClient.invalidateQueries({ queryKey: ['collective-causes', crwdId] });
      await queryClient.refetchQueries({ queryKey: ['crwd', crwdId] });
      await queryClient.refetchQueries({ queryKey: ['collective-causes', crwdId] });
      navigate(`/g/${crwdData.sort_name}`);
    },
    onError: (error: any) => {
      console.error('Update collective error:', error);
    },
  });


  const handleSave = () => {
    if (!name.trim()) {
      return; // Name is required
    }

    // Prepare cause_ids array
    const causeIds = selectedCauses.map(cause => cause.id);

    // Use FormData if there's a file upload, otherwise use JSON
    if (logoType === 'upload' && uploadedLogo !== null) {
      // New file uploaded - use FormData
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());

      // Append each cause_id separately (backend should handle this as an array)
      causeIds.forEach(causeId => {
        formData.append('cause_ids', causeId.toString());
      });

      formData.append('logo_file', uploadedLogo);
      // When logo is being displayed, send empty color string to clear the color
      formData.append('color', '');

      updateMutation.mutate(formData);
    } else {
      // Use JSON - no file upload
      const updateData: any = {
        name: name.trim(),
        description: description.trim(),
        cause_ids: causeIds,
      };

      // If logo is being displayed (logoType === 'upload'), send empty color to clear it
      // Otherwise, send current color
      if (logoType === 'upload') {
        updateData.color = '';
      } else {
        updateData.color = letterLogoColor;
      }

      updateMutation.mutate(updateData);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setLogoType('upload');
    }
  };

  const handleColorSelect = (color: string) => {
    setLetterLogoColor(color);
  };

  // Causes management handlers
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchTrigger(prev => prev + 1);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isCauseSelected = (causeId: number) => {
    return selectedCauses.some(cause => cause.id === causeId);
  };

  const handleToggleCause = (cause: any) => {
    if (isCauseSelected(cause.id)) {
      // Allow removing causes
      setSelectedCauses(prev => prev.filter(c => c.id !== cause.id));
    } else {
      // Check if adding would exceed the limit of 10
      if (selectedCauses.length >= 10) {
        toast.error('You cannot select more than 10 causes.');
        return; // Prevent adding the cause
      }
      setSelectedCauses(prev => [...prev, cause]);
    }
  };

  const handleRemoveCause = (causeId: number) => {
    setSelectedCauses(prev => prev.filter(c => c.id !== causeId));
  };

  // Mutations for causes
  // const addCauseMutation = useMutation({
  //   mutationFn: (causeId: number) => createCollectiveCause(crwdId || '', { cause: causeId }),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['collective-causes', crwdId] });
  //   },
  // });

  // const removeCauseMutation = useMutation({
  //   mutationFn: (causePk: string) => deleteCollectiveCause(crwdId || '', causePk),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['collective-causes', crwdId] });
  //   },
  // });

  const handleSaveCauses = async () => {
    if (!crwdId) return;

    // Get current collective causes
    // const currentCauses = collectiveCausesData?.results || collectiveCausesData || [];

    queryClient.invalidateQueries({ queryKey: ['collective-causes', crwdId] });
    queryClient.invalidateQueries({ queryKey: ['crwd', crwdId] });
  };

  // Check if user is admin
  const isAdmin = currentUser?.id === crwdData?.created_by?.id;

  // Redirect if not admin
  useEffect(() => {
    if (crwdData && !isAdmin) {
      navigate(`/groupcrwd/${crwdId}`);
    }
  }, [crwdData, isAdmin, navigate, crwdId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!crwdData || !isAdmin) {
    return null;
  }

  const logoLetter = crwdData.name?.charAt(0).toUpperCase() || 'C';

  return (
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
        <h1 className="font-bold text-lg md:text-xl text-foreground">Edit Collective</h1>
      </div>

      <div className="px-3 md:px-4 py-4 md:py-6 pb-24 md:pb-28 lg:max-w-[60%] lg:mx-auto">

        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-50 via-pink-50 to-purple-50 px-3 md:px-4 py-4 md:py-6 rounded-xl mb-4 md:mb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1600ff] rounded-full flex items-center justify-center flex-shrink-0">
              <Edit2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg text-foreground mb-1">
                Update Your Collective
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Make changes to your collective name, mission, or the causes you support.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 md:space-y-6">
          {/* Collective Name */}
          <div className='border border-gray-200 rounded-lg p-3 md:p-4'>
            <div className="flex items-center gap-2 mb-2">
              <label className="font-semibold text-sm md:text-base text-foreground">
                Collective Name <span className='text-red-500'>*</span>
              </label>
              <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
            </div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter collective name"
              className="w-full bg-gray-100 rounded-2xl text-sm md:text-base"
            />
          </div>

          {/* Description */}
          <div className='border border-gray-200 rounded-lg p-3 md:p-4'>
            <div className="flex items-center gap-2 mb-2">
              <label className="font-semibold text-sm md:text-base text-foreground">
                What Brings This Group Together? <span className='text-red-500'>*</span>
              </label>
              <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what brings this group together"
              className="w-full min-h-[100px] bg-gray-100 rounded-2xl text-sm md:text-base"
            />
          </div>

          {/* Collective Logo */}
          <div className="border border-gray-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-3 md:gap-4">
              <Avatar className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex-shrink-0">
                {logoType === 'upload' ? (
                  uploadedLogoPreview ? (
                    <AvatarImage src={uploadedLogoPreview} alt={name} />
                  ) : (
                    <AvatarFallback
                      style={{ backgroundColor: '#f3f4f6' }}
                      className="text-gray-400 rounded-lg font-bold text-lg md:text-2xl flex items-center justify-center"
                    >
                      <Camera className="w-6 h-6 md:w-8 md:h-8" />
                    </AvatarFallback>
                  )
                ) : (
                  // <AvatarFallback
                  //   style={{ backgroundColor: letterLogoColor }}
                  //   className="text-white rounded-lg font-bold text-lg md:text-2xl"
                  // >
                  //   {logoLetter}
                  // </AvatarFallback>
                  <div style={{ backgroundColor: letterLogoColor }} className="text-white rounded-lg font-bold text-lg md:text-2xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                    {logoLetter}
                  </div>
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
                    <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                    Done
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                    Customize
                  </>
                )}
              </Button>
            </div>

            {/* Customization Options - Shown when Customize is clicked */}
            {showLogoCustomization && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                  {/* Left Side - Logo Preview (on desktop) */}


                  {/* Right Side - Customization Options */}
                  <div className="flex-1 w-full">
                    {/* Logo Type Selection */}
                    <div className="flex gap-3 mb-4">
                      <Button
                        onClick={() => {
                          setLogoType('letter');
                          // Don't clear uploaded logo - keep it for when switching back to upload
                        }}
                        className={`flex-1 font-semibold rounded-lg py-2.5 md:py-3 text-sm md:text-base ${logoType === 'letter'
                          ? 'bg-[#1600ff] text-white'
                          : 'bg-white border border-gray-300 text-foreground hover:bg-gray-50'
                          }`}
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        Letter
                      </Button>
                      <Button
                        onClick={() => setLogoType('upload')}
                        className={`flex-1 font-semibold rounded-lg py-2.5 md:py-3 text-sm md:text-base ${logoType === 'upload'
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
                        <div className="flex flex-wrap gap-3">
                          {colorSwatches.map((color) => (
                            <button
                              key={color}
                              onClick={() => handleColorSelect(color)}
                              className={`w-10 h-10 md:w-12 md:h-12 rounded-lg transition-transform hover:scale-110 ${letterLogoColor === color ? 'ring-2 ring-gray-900' : ''
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
                        <Button
                          onClick={() => {
                            const input = document.getElementById('logo-upload-input');
                            input?.click();
                          }}
                          variant="outline"
                          className="w-full border-gray-300"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Choose from Gallery
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Causes Management Section */}
          <div className="mt-6 md:mt-8 space-y-4 md:space-y-6">
            {/* Selected Causes */}
            <div className='border border-blue-200 p-3 md:p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50'>
              <h3 className="font-bold text-base md:text-lg text-foreground mb-3 md:mb-4">
                Selected Causes ({selectedCauses.length}/10)
              </h3>
              {selectedCauses.length >= 10 && (
                <div className="mb-3 md:mb-4 p-2 md:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs md:text-sm text-yellow-800">
                    Maximum of 10 causes reached. Remove a cause to add another.
                  </p>
                </div>
              )}
              {selectedCauses.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {selectedCauses.map((cause) => {
                    const causeData = cause.cause || cause;
                    // Get category ID from cause (it's a single letter like "X", "G")
                    // const categoryId = causeData.category || causeData.cause_category;

                    // const category = getCategoryById(categoryId);
                    // const categoryName = category?.name || 'Uncategorized';
                    // const categoryColor = category?.text || '#10B981';

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
                              {/* <span
                            className="inline-flex items-center rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium flex-shrink-0"
                              style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                            >
                              {categoryName}
                            </span> */}
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
              ) : (
                <p className="text-xs md:text-sm text-muted-foreground">No causes selected</p>
              )}
            </div>

            {/* Add or Remove Causes */}
            <div className='border border-gray-200 p-3 md:p-4 rounded-2xl'>
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
                {isCausesLoading ? (
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
                      // const categoryId = cause.category || cause.cause_category;
                      // const category = getCategoryById(categoryId);
                      // const categoryName = category?.name || 'Uncategorized';
                      // const categoryColor = category?.text || '#10B981';
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
                              {/* <span
                                className="inline-flex items-center rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium flex-shrink-0"
                                style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                              >
                                {categoryName}
                              </span> */}
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                              {cause.mission || cause.description}
                            </p>
                          </div>

                          <label className={`flex items-center flex-shrink-0 ${selectedCauses.length >= 10 && !isSelected ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => handleToggleCause(cause)}
                              disabled={selectedCauses.length >= 10 && !isSelected}
                              className="w-4 h-4 md:w-5 md:h-5 text-[#1600ff] focus:ring-[#1600ff] disabled:cursor-not-allowed"
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
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:p-4 flex items-center justify-between gap-3 md:gap-4 z-10">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="border-gray-300 rounded-full font-semibold text-xs md:text-sm text-foreground w-[48%] py-2 md:py-3"
        >
          Cancel
        </Button>
        <Button
          onClick={async () => {
            await handleSave();
            await handleSaveCauses();
          }}
          className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-full px-4 md:px-6 w-[48%] py-2 md:py-3 text-xs md:text-sm"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

