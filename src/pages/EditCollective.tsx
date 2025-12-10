import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2, HelpCircle, Loader2, Palette, Camera, Search, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getCollectiveById, updateCollective, getCollectiveCauses, createCollectiveCause, deleteCollectiveCause } from '@/services/api/crwd';
import { getCausesBySearch } from '@/services/api/crwd';
import { useAuthStore } from '@/stores/store';
import { categories } from '@/constants/categories';

// Helper function to get category by ID
const getCategoryById = (categoryId: string | undefined) => {
  if (!categoryId) return null;
  return categories.find(cat => cat.id === categoryId) || null;
};

export default function EditCollectivePage() {
  const { crwdId } = useParams<{ crwdId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<string | File>('');
  const [logoType, setLogoType] = useState<'letter' | 'upload'>('letter');
  const [logoColor, setLogoColor] = useState('#EC4899');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showLogoCustomization, setShowLogoCustomization] = useState(false);
  
  // Causes management state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCauses, setSelectedCauses] = useState<any[]>([]);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const colorSwatches = [
    '#3B82F6', // Blue
    '#EC4899', // Pink/Red
    '#84CC16', // Lime Green
    '#8B5CF6', // Purple
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#EF4444', // Red
    '#06B6D4', // Light Blue/Periwinkle
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
      setName(crwdData.name || '');
      setDescription(crwdData.description || '');
      
      // Determine logo type
      if (crwdData.avatar || crwdData.image) {
        const logoUrl = crwdData.avatar || crwdData.image;
        if (logoUrl.startsWith('http') || logoUrl.startsWith('/') || logoUrl.startsWith('data:')) {
          setLogoType('upload');
          setLogo(logoUrl);
          setLogoPreview(logoUrl);
        } else {
          setLogoType('letter');
          setLogoColor(logoUrl);
          setLogo(logoUrl);
        }
      }
    }
  }, [crwdData]);

  // Initialize selected causes from collective causes
  useEffect(() => {
    if (collectiveCausesData) {
      const causes = collectiveCausesData.results || collectiveCausesData || [];
      // Map causes from the API response structure
      setSelectedCauses(causes.map((item: any) => {
        // The API returns { id, cause: { id, name, description, category, ... }, ... }
        // We want to store the cause object with the category ID
        return item.cause || item;
      }));
    }
  }, [collectiveCausesData]);

  // Update collective mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => updateCollective(crwdId || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crwd', crwdId] });
      navigate(`/groupcrwd/${crwdId}`);
    },
    onError: (error: any) => {
      console.error('Update collective error:', error);
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      return; // Name is required
    }

    // Check if we have a file upload, then use FormData, otherwise use JSON
    const hasFileUpload = logo instanceof File;

    if (hasFileUpload) {
      const formData = new FormData();
      formData.append('name', name);
      if (description) {
        formData.append('description', description);
      }
      formData.append('image', logo);
      updateMutation.mutate(formData);
    } else {
      // Use JSON for regular updates
      const updateData: any = {
        name: name.trim(),
      };
      
      if (description) {
        updateData.description = description.trim();
      }

      // Handle logo
      if (logoType === 'letter') {
        updateData.avatar = logoColor;
      } else if (logo && typeof logo === 'string') {
        // Keep existing logo URL
        updateData.avatar = logo;
      }

      updateMutation.mutate(updateData);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      setLogoType('upload');
    }
  };

  const handleColorSelect = (color: string) => {
    setLogoColor(color);
    setLogo(color);
    setLogoType('letter');
    setLogoPreview(null);
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
      setSelectedCauses(prev => prev.filter(c => c.id !== cause.id));
    } else {
      setSelectedCauses(prev => [...prev, cause]);
    }
  };

  const handleRemoveCause = (causeId: number) => {
    setSelectedCauses(prev => prev.filter(c => c.id !== causeId));
  };

  // Mutations for causes
  const addCauseMutation = useMutation({
    mutationFn: (causeId: number) => createCollectiveCause(crwdId || '', { cause: causeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collective-causes', crwdId] });
    },
  });

  const removeCauseMutation = useMutation({
    mutationFn: (causePk: string) => deleteCollectiveCause(crwdId || '', causePk),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collective-causes', crwdId] });
    },
  });

  const handleSaveCauses = async () => {
    if (!crwdId) return;

    // Get current collective causes
    const currentCauses = collectiveCausesData?.results || collectiveCausesData || [];
    const currentCauseIds = new Set(currentCauses.map((item: any) => (item.cause || item).id));
    const selectedCauseIds = new Set(selectedCauses.map(c => c.id));

    // Add new causes
    for (const cause of selectedCauses) {
      if (!currentCauseIds.has(cause.id)) {
        await addCauseMutation.mutateAsync(cause.id);
      }
    }

    // Remove causes that are no longer selected
    for (const item of currentCauses) {
      const cause = item.cause || item;
      if (!selectedCauseIds.has(cause.id)) {
        const causePk = item.id || cause.id;
        await removeCauseMutation.mutateAsync(causePk.toString());
      }
    }

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
  const displayLogo = logoPreview || (logoType === 'upload' && typeof logo === 'string' && (logo.startsWith('http') || logo.startsWith('/') || logo.startsWith('data:'))
    ? logo 
    : null);

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
                        setLogoPreview(null);
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
              Selected Causes ({selectedCauses.length})
            </h3>
            {selectedCauses.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                {selectedCauses.map((cause) => {
                  const causeData = cause.cause || cause;
                  // Get category ID from cause (it's a single letter like "X", "G")
                  const categoryId = causeData.category || causeData.cause_category;
                  const category = getCategoryById(categoryId);
                  const categoryName = category?.name || 'Uncategorized';
                  const categoryColor = category?.text || '#10B981';
                  
                  return (
                    <div key={cause.id} className="bg-white rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 md:gap-4">
                        <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0">
                          <AvatarImage src={causeData.image} alt={causeData.name} />
                          <AvatarFallback className="bg-gray-200 text-gray-600 font-bold text-xs md:text-sm">
                            {causeData.name?.charAt(0).toUpperCase()}
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
                    const categoryId = cause.category || cause.cause_category;
                    const category = getCategoryById(categoryId);
                    const categoryName = category?.name || 'Uncategorized';
                    const categoryColor = category?.text || '#10B981';
                    const isSelected = isCauseSelected(cause.id);

                    return (
                      <div
                        key={cause.id}
                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0">
                          <AvatarImage src={cause.image} alt={cause.name} />
                          <AvatarFallback className="bg-gray-200 text-gray-600 font-bold text-xs md:text-sm">
                            {cause.name?.charAt(0).toUpperCase()}
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
      </div>
      </div>

      {/* Footer Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:p-4 flex items-center justify-between gap-3 md:gap-4 z-10 lg:max-w-[60%] lg:left-1/2 lg:transform lg:-translate-x-1/2">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="border-gray-300 rounded-full font-semibold text-xs md:text-sm text-foreground w-[48%] py-2 md:py-2.5"
        >
          Cancel
        </Button>
        <Button
          onClick={async () => {
            await handleSave();
            await handleSaveCauses();
          }}
          className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-full px-4 md:px-6 w-[48%] py-2 md:py-2.5 text-xs md:text-sm"
          disabled={updateMutation.isPending || addCauseMutation.isPending || removeCauseMutation.isPending}
        >
          {updateMutation.isPending || addCauseMutation.isPending || removeCauseMutation.isPending ? (
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

