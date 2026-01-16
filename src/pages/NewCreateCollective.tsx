// import { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { ArrowLeft, HelpCircle, Search, X, Loader2, Edit2, Palette, Camera, Users, Check, Minus, Plus, Heart, Eye, Share2, Sparkles } from 'lucide-react';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { createCollective, getCausesBySearch } from '@/services/api/crwd';
// import { getFavoriteCauses } from '@/services/api/social';
// import { getDonationBox, addCausesToBox } from '@/services/api/donation';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
// import { Toast } from '@/components/ui/toast';
// import { categories } from '@/constants/categories';
// import Confetti from 'react-confetti';
// import { SharePost } from '@/components/ui/SharePost';
// import { useAuthStore } from '@/stores/store';
// import { CrwdAnimation } from '@/assets/newLogo';
// import JoinCollectiveBottomSheet from '@/components/newgroupcrwd/JoinCollectiveBottomSheet';
// // CreateCollectivePrompt will be created if needed

// const getCategoryById = (categoryId: string | undefined) => {
//   return categories.find(cat => cat.id === categoryId) || null;
// };

// // Get category names as an array for multi-letter categories (e.g., "MK" -> ["Relief", "Food"])
// const getCategoryNames = (categoryId: string | undefined): string[] => {
//   if (!categoryId) return ['Uncategorized'];

//   // If category is multiple letters, split and get names for each
//   if (categoryId.length > 1) {
//     const categoryNames = categoryId
//       .split('')
//       .map(char => {
//         const category = getCategoryById(char);
//         return category?.name || char;
//       })
//       .filter(Boolean);

//     return categoryNames.length > 0 ? categoryNames : ['Uncategorized'];
//   }

//   // Single letter category
//   const category = getCategoryById(categoryId);
//   return category?.name ? [category.name] : ['Uncategorized'];
// };

// // Get category IDs as an array (for getting individual colors)
// const getCategoryIds = (categoryId: string | undefined): string[] => {
//   if (!categoryId) return [];

//   // If category is multiple letters, split into individual IDs
//   if (categoryId.length > 1) {
//     return categoryId.split('');
//   }

//   // Single letter category
//   return [categoryId];
// };

// // Get category background color for display (use first category's background for multi-letter)
// const getCategoryColor = (categoryId: string | undefined): string => {
//   if (!categoryId) return '#10B981';

//   // For multi-letter categories, use the first category's background color
//   const firstChar = categoryId.charAt(0);
//   const category = getCategoryById(firstChar);
//   return category?.background || '#10B981';
// };

// // Get category text color for display
// const getCategoryTextColor = (categoryId: string | undefined): string => {
//   if (!categoryId) return '#FFFFFF';

//   // For multi-letter categories, use the first category's text color
//   const firstChar = categoryId.charAt(0);
//   const category = getCategoryById(firstChar);
//   return category?.text || '#FFFFFF';
// };

// // Avatar colors for consistent fallback styling
// const avatarColors = [
//   '#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3',
//   '#FFC107', '#E91E63', '#00BCD4', '#8BC34A', '#FF5722',
//   '#673AB7', '#009688', '#FFEB3B', '#795548', '#607D8B',
// ];

// const getConsistentColor = (id: number | string, colors: string[]) => {
//   const hash = typeof id === 'number' ? id : id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
//   return colors[hash % colors.length];
// };

// const getInitials = (name: string) => {
//   const words = name.split(' ').filter(Boolean);
//   if (words.length === 0) return 'N';
//   if (words.length === 1) return words[0].charAt(0).toUpperCase();
//   return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
// };

// export default function NewCreateCollectivePage() {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const location = useLocation();
//   const { user: currentUser, token } = useAuthStore();

//   const handleBack = () => {
//     // Check if we came from specific flows
//     const fromScreen = (location.state as any)?.from;
//     const specialFlows = ['NewNonprofitInterests', 'NewCompleteDonation', 'Login'];

//     if (fromScreen && specialFlows.includes(fromScreen)) {
//       navigate('/');
//     } else {
//       // Default behavior
//       navigate(-1);
//     }
//   };

//   // Form state
//   // const [name, setName] = useState(() => {
//   //   if (typeof window !== 'undefined') {
//   //     return localStorage.getItem('createCrwd_name') || '';
//   //   }
//   //   return '';
//   // });
//   // const [description, setDescription] = useState(() => {
//   //   if (typeof window !== 'undefined') {
//   //     return localStorage.getItem('createCrwd_desc') || '';
//   //   }
//   //   return '';
//   // });
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [selectedCauses, setSelectedCauses] = useState<any[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchTrigger, setSearchTrigger] = useState(0);
//   const [showConfetti, setShowConfetti] = useState(false);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [createdCollective, setCreatedCollective] = useState<any>(null);
//   const [step, setStep] = useState(1);
//   const [hasStarted, setHasStarted] = useState(false);
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState('');
//   const [showAddToBoxModal, setShowAddToBoxModal] = useState(false);

//   // Logo customization state - separate states for letter and upload
//   const [logoType, setLogoType] = useState<'letter' | 'upload'>('letter');
//   const [letterLogoColor, setLetterLogoColor] = useState('#1600ff'); // State for letter logo background color
//   const [uploadedLogo, setUploadedLogo] = useState<File | null>(null); // State for uploaded file
//   const [uploadedLogoPreview, setUploadedLogoPreview] = useState<string | null>(null); // State for uploaded image preview
//   const [showLogoCustomization, setShowLogoCustomization] = useState(false);

//   // Dropdown state for sections
//   const [isYourCausesOpen, setIsYourCausesOpen] = useState(true);
//   const [isSuggestedCausesOpen, setIsSuggestedCausesOpen] = useState(true);

//   // Loading dots state
//   const [dotCount, setDotCount] = useState(0);
//   const [showAnimationComplete, setShowAnimationComplete] = useState(false);

//   const colorSwatches = [
//     '#0000FF', // Blue
//     '#FF3366', // Pink/Red
//     '#ADFF2F', // Lime Green
//     '#A855F7', // Purple
//     '#10B981', // Teal
//     '#FF6B35', // Orange
//     '#EF4444', // Red
//     '#6366F1', // Indigo
//   ];


//   // Save form data to localStorage
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       if (name) {
//         localStorage.setItem('createCrwd_name', name);
//       } else {
//         localStorage.removeItem('createCrwd_name');
//       }
//     }
//   }, [name]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       if (description) {
//         localStorage.setItem('createCrwd_desc', description);
//       } else {
//         localStorage.removeItem('createCrwd_desc');
//       }
//     }
//   }, [description]);

//   // Fetch favorite causes
//   const { data: favoriteCausesData, isLoading: isLoadingFavoriteCauses } = useQuery({
//     queryKey: ['favoriteCauses'],
//     queryFn: () => getFavoriteCauses(),
//     enabled: !!currentUser?.id,
//   });

//   const favoriteCauses = favoriteCausesData?.results || [];

//   // Fetch default causes (no search query)
//   const { data: defaultCausesData, isLoading: defaultCausesLoading } = useQuery({
//     queryKey: ['defaultCauses'],
//     queryFn: () => getCausesBySearch('', '', 1),
//     enabled: true,
//   });

//   // Fetch causes with search
//   const { data: causesData, isLoading: isCausesLoading } = useQuery({
//     queryKey: ['causes-search', searchQuery, searchTrigger],
//     queryFn: () => getCausesBySearch(searchQuery || '', '', 1),
//     enabled: searchTrigger > 0 && searchQuery.trim().length > 0,
//   });

//   // Fetch donation box to check which causes are already added (only when on success step)
//   const { data: donationBoxData } = useQuery({
//     queryKey: ['donationBox', currentUser?.id],
//     queryFn: getDonationBox,
//     enabled: !!currentUser?.id && step === 3 && !!createdCollective,
//   });

//   // Get causes that are already in the donation box
//   const boxCauseIds = new Set(
//     (donationBoxData?.box_causes || []).map((boxCause: any) => {
//       const cause = boxCause.cause || boxCause;
//       return cause?.id?.toString() || boxCause.cause_id?.toString();
//     })
//   );

//   // Filter selected causes to only include those not already in the donation box
//   const causesToAdd = selectedCauses.filter((cause: any) => {
//     const causeData = cause.cause || cause;
//     const causeId = (causeData.id || cause.id)?.toString();
//     return causeId && !boxCauseIds.has(causeId);
//   });

//   // Check if all causes are already in the donation box
//   const allCausesAlreadyAdded = selectedCauses.length > 0 && causesToAdd.length === 0;

//   // Create collective mutation
//   const createCollectiveMutation = useMutation({
//     mutationFn: createCollective,
//     onSuccess: (response) => {
//       console.log('Create collective successful:', response);
//       // Clear saved form data on successful creation
//       if (typeof window !== 'undefined') {
//         localStorage.removeItem('createCrwd_name');
//         localStorage.removeItem('createCrwd_desc');
//       }
//       setCreatedCollective(response);
//       // Wait for animation to complete (3 seconds for one full cycle) before showing success
//       setTimeout(() => {
//         setShowAnimationComplete(true);
//         setStep(3);
//         setShowConfetti(true);
//         setTimeout(() => {
//           setShowConfetti(false);
//         }, 4000);
//       }, 3000);
//       queryClient.invalidateQueries({ queryKey: ['collectives'] });
//       queryClient.invalidateQueries({ queryKey: ['joined-collectives'] });
//     },
//     onError: (error: any) => {
//       console.error('Create collective error:', error);

//       // Check for logo_file validation error
//       if (error.response?.data?.logo_file && Array.isArray(error.response.data.logo_file) && error.response.data.logo_file.length > 0) {
//         setToastMessage(error.response.data.logo_file[0]);
//         setShowToast(true);
//         return;
//       }

//       // Check for other field-specific errors
//       const errorData = error.response?.data;
//       if (errorData) {
//         // Check for name field error specifically (it's an array)
//         if (errorData.name && Array.isArray(errorData.name) && errorData.name.length > 0) {
//           setToastMessage(errorData.name[0]);
//           setShowToast(true);
//           return;
//         }

//         // Check for any other field errors (like description, etc.)
//         const fieldErrors = Object.keys(errorData).filter(key => Array.isArray(errorData[key]) && errorData[key].length > 0);
//         if (fieldErrors.length > 0) {
//           const firstFieldError = errorData[fieldErrors[0]];
//           if (Array.isArray(firstFieldError) && firstFieldError.length > 0) {
//             setToastMessage(firstFieldError[0]);
//             setShowToast(true);
//             return;
//           }
//         }
//       }

//       // Fallback to general error message
//       const errorMessage =
//         error.response?.data?.message ||
//         error.message ||
//         'Failed to create collective';
//       setToastMessage(errorMessage);
//       setShowToast(true);
//     },
//   });

//   // Animate dots during API call or while waiting for animation to complete
//   useEffect(() => {
//     if (createCollectiveMutation.isPending || (createdCollective && !showAnimationComplete)) {
//       const interval = setInterval(() => {
//         setDotCount((prev) => (prev + 1) % 4);
//       }, 500);
//       return () => clearInterval(interval);
//     } else {
//       setDotCount(0);
//     }
//   }, [createCollectiveMutation.isPending, createdCollective, showAnimationComplete]);

//   const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && searchQuery.trim()) {
//       setSearchTrigger((prev) => prev + 1);
//     }
//   };

//   const isCauseSelected = (causeId: number) => {
//     return selectedCauses.some(cause => cause.id === causeId);
//   };

//   const handleToggleCause = (cause: any) => {
//     if (isCauseSelected(cause.id)) {
//       setSelectedCauses(prev => prev.filter(c => c.id !== cause.id));
//     } else {
//       setSelectedCauses(prev => [...prev, cause]);
//     }
//   };

//   const handleRemoveCause = (causeId: number) => {
//     setSelectedCauses(prev => prev.filter(c => c.id !== causeId));
//   };

//   const handleColorSelect = (color: string) => {
//     setLetterLogoColor(color);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setUploadedLogo(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setUploadedLogoPreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleContinueToReview = () => {
//     // Validation
//     if (name.trim() === '') {
//       setToastMessage('Please enter a name for your CRWD');
//       setShowToast(true);
//       return;
//     }
//     if (description.trim() === '') {
//       setToastMessage('Please enter a description for your CRWD');
//       setShowToast(true);
//       return;
//     }
//     if (selectedCauses.length === 0) {
//       setToastMessage('Please select at least one cause');
//       setShowToast(true);
//       return;
//     }

//     // Navigate to review step
//     setStep(2);
//   };

//   const handleCreateCollective = () => {
//     // Create collective via API
//     // Use FormData if there's a file upload, otherwise use JSON
//     if (logoType === 'upload' && uploadedLogo) {
//       const formData = new FormData();
//       formData.append('name', name.trim());
//       formData.append('description', description.trim());
//       // Append each cause_id separately (backend should handle this as an array)
//       selectedCauses.forEach(cause => {
//         formData.append('cause_ids', cause.id.toString());
//       });
//       formData.append('logo_file', uploadedLogo);
//       // Do not send color when upload tab is active
//       createCollectiveMutation.mutate(formData);
//     } else {
//       // Use JSON for letter logo or no logo
//       const requestData: any = {
//         name: name.trim(),
//         description: description.trim(),
//         cause_ids: selectedCauses.map(c => c.id),
//       };

//       // Add color only if logo type is letter (do not send image)
//       if (logoType === 'letter' && letterLogoColor) {
//         requestData.color = letterLogoColor;
//       }

//       createCollectiveMutation.mutate(requestData);
//     }
//   };

//   // Handle adding collective to donation box
//   const handleAddToDonationBox = async () => {
//     if (!createdCollective?.id) {
//       setToastMessage('Collective ID is missing');
//       setShowToast(true);
//       return;
//     }

//     try {
//       // Check if donation box exists
//       const donationBox = await getDonationBox();

//       // If donation box doesn't exist or has no ID, navigate to setup with props
//       if (!donationBox || !donationBox.id) {
//         // Prepare causes data for preselection
//         const preselectedCauses = selectedCauses.map((cause: any) => {
//           const causeData = cause.cause || cause;
//           return {
//             id: causeData.id || cause.id,
//             name: causeData.name || cause.name || 'Unknown Nonprofit',
//             description: causeData.mission || causeData.description || cause.mission || cause.description || '',
//             mission: causeData.mission || cause.mission || '',
//             logo: causeData.image || causeData.logo || cause.image || cause.logo || '',
//           };
//         });
//         const preselectedCauseIds = preselectedCauses.map((cause: any) => cause.id);

//         navigate('/donation?tab=setup', {
//           state: {
//             preselectedItem: {
//               id: createdCollective.id,
//               type: 'collective',
//               data: createdCollective
//             },
//             activeTab: 'collectives',
//             preselectedCauses: preselectedCauseIds,
//             preselectedCausesData: preselectedCauses,
//             preselectedCollectiveId: createdCollective.id,
//           }
//         });
//       } else {
//         // Donation box exists, show bottom sheet to let user select causes
//         setShowAddToBoxModal(true);
//       }
//     } catch (error: any) {
//       console.error('Error checking donation box:', error);
//       // On error, navigate to setup tab with causes
//       const preselectedCauses = selectedCauses.map((cause: any) => {
//         const causeData = cause.cause || cause;
//         return {
//           id: causeData.id || cause.id,
//           name: causeData.name || cause.name || 'Unknown Nonprofit',
//           description: causeData.mission || causeData.description || cause.mission || cause.description || '',
//           mission: causeData.mission || cause.mission || '',
//           logo: causeData.image || causeData.logo || cause.image || cause.logo || '',
//         };
//       });
//       const preselectedCauseIds = preselectedCauses.map((cause: any) => cause.id);

//       navigate('/donation?tab=setup', {
//         state: {
//           preselectedItem: {
//             id: createdCollective.id,
//             type: 'collective',
//             data: createdCollective
//           },
//           activeTab: 'collectives',
//           preselectedCauses: preselectedCauseIds,
//           preselectedCausesData: preselectedCauses,
//           preselectedCollectiveId: createdCollective.id,
//         }
//       });
//     }
//   };

//   // Handle confirm from bottom sheet - add selected causes to donation box
//   const handleAddToBoxConfirm = async (selectedNonprofits: any[], collectiveId: string, shouldSetupDonationBox: boolean) => {
//     if (!createdCollective?.id) return;

//     // If no donation box and user wants to set it up
//     if (shouldSetupDonationBox) {
//       const preselectedCauses = selectedNonprofits.map((np) => {
//         const cause = np.cause || np;
//         return {
//           id: cause.id || np.id,
//           name: cause.name || np.name || 'Unknown Nonprofit',
//           description: cause.mission || cause.description || np.mission || np.description || '',
//           mission: cause.mission || np.mission || '',
//           logo: cause.image || cause.logo || np.image || np.logo || '',
//         };
//       });

//       const preselectedCauseIds = preselectedCauses.map((cause) => cause.id);

//       // Close the modal
//       setShowAddToBoxModal(false);

//       // Navigate to donation setup with preselected causes
//       navigate('/donation?tab=setup', {
//         state: {
//           preselectedCauses: preselectedCauseIds,
//           preselectedCausesData: preselectedCauses,
//           preselectedCollectiveId: parseInt(collectiveId),
//           returnTo: `/groupcrwd/${createdCollective.id}`,
//         },
//       });
//       return;
//     }

//     // If donation box exists and causes are selected, add them
//     if (selectedNonprofits.length > 0) {
//       const causes = selectedNonprofits.map((np) => {
//         const cause = np.cause || np;
//         const causeId = cause.id || np.id;
//         const causeEntry: { cause_id: number; attributed_collective?: number } = {
//           cause_id: causeId,
//           attributed_collective: parseInt(collectiveId),
//         };
//         return causeEntry;
//       });

//       try {
//         await addCausesToBox({ causes });
//         queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
//         await queryClient.refetchQueries({ queryKey: ['donationBox', currentUser?.id] });
//         setToastMessage('Nonprofits added to your donation box!');
//         setShowToast(true);
//       } catch (error: any) {
//         console.error('Error adding causes to donation box:', error);
//         setToastMessage(error?.response?.data?.message || 'Failed to add nonprofits to donation box. Please try again.');
//         setShowToast(true);
//       }
//     }

//     // Close the modal
//     setShowAddToBoxModal(false);
//   };

//   // Show prompt if user is not logged in
//   if (!currentUser?.id || !token?.access_token) {
//     return (
//       <div className="min-h-screen bg-white flex flex-col items-center">
//         {/* header */}
//         <div className="sticky top-0 z-10 w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b bg-white">
//           <button
//             onClick={handleBack}
//             className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
//             aria-label="Go back"
//           >
//             <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
//           </button>
//           <h1 className="font-bold text-lg md:text-xl text-foreground">Create a Collective</h1>
//         </div>
//         <div className="mb-6 md:mb-8">
//           <div className="w-12 h-12 md:w-16 md:h-16 rounded-full mt-4 md:mt-5 bg-blue-100 flex items-center justify-center">
//             <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
//           </div>
//         </div>
//         <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-4 md:mb-6 px-4">
//           Lead a Giving Community
//         </h2>
//         <p className="text-sm md:text-base text-gray  -700 text-center max-w-md mb-8 md:mb-12 leading-relaxed px-4">
//           You pick the causes. You invite the people. They give monthly. No money touches your hands. You just rally the movement.
//         </p>
//         <div className="w-full max-w-xs px-4 flex gap-3">
//           <Button
//             onClick={() => navigate('/onboarding?redirectTo=/create-crwd')}
//             className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-lg px-4 md:px-6 py-3 md:py-6 text-sm md:text-base flex-1"
//           >
//             Get Started
//           </Button>
//           <Button
//             onClick={() => navigate(`/login?redirectTo=/create-crwd`)}
//             className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-lg px-4 md:px-6 py-3 md:py-6 text-sm md:text-base flex-1"
//           >
//             Log in
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   // Show "Lead a Giving Community" view as first step for logged-in users (only if form is empty and hasn't started)
//   const isFormEmpty = !name && !description && selectedCauses.length === 0;
//   if (step === 1 && isFormEmpty && !hasStarted) {
//     return (
//       <div className="min-h-screen bg-white flex flex-col items-center">
//         {/* header */}
//         <div className="sticky top-0 z-10 w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b bg-white">
//           <button
//             onClick={handleBack}
//             className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
//             aria-label="Go back"
//           >
//             <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
//           </button>
//           <h1 className="font-bold text-lg md:text-xl text-foreground">Create a Collective</h1>
//         </div>
//         <div className="mb-6 md:mb-8">
//           <div className="w-12 h-12 md:w-16 md:h-16 rounded-full mt-4 md:mt-5 bg-blue-100 flex items-center justify-center">
//             <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
//           </div>
//         </div>
//         <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-4 md:mb-6 px-4">
//           Lead a Giving Community
//         </h2>
//         <p className="text-sm md:text-base text-gray-700 text-center max-w-md mb-8 md:mb-12 leading-relaxed px-4">
//           You pick the causes. You invite the people. They give monthly. No money touches your hands. You just rally the movement.
//         </p>
//         <div className="w-fit mx-4">
//           <Button
//             onClick={() => {
//               // Clear any saved form data and proceed to form
//               if (typeof window !== 'undefined') {
//                 localStorage.removeItem('createCrwd_name');
//                 localStorage.removeItem('createCrwd_desc');
//               }
//               setName('');
//               setDescription('');
//               setSelectedCauses([]);
//               setHasStarted(true);
//             }}
//             className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-md px-3 md:px-6 py-3 md:py-6 text-sm md:text-base w-fit"
//           >
//             Get Started
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const logoLetter = name?.charAt(0).toUpperCase() || 'C';

//   // Review/Confirmation Step
//   if (step === 2 && !createdCollective) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         {/* Header */}
//         <div className="sticky top-0 z-10 w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b bg-white">
//           <button
//             onClick={() => setStep(1)}
//             className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
//             aria-label="Go back"
//           >
//             <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
//           </button>
//           <h1 className="font-bold text-lg md:text-xl text-foreground">Confirm & Create</h1>
//         </div>

//         <div className="px-3 md:px-4 py-4 md:py-6 pb-24 md:pb-28 lg:max-w-[60%] lg:mx-auto">
//           <div className="bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 rounded-2xl p-4 md:p-6 shadow-sm">
//             {/* Collective Info Section */}
//             <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
//               <Avatar className="w-16 h-16 md:w-20 md:h-20 rounded-lg flex-shrink-0">
//                 {logoType === 'upload' ? (
//                   uploadedLogoPreview ? (
//                     <AvatarImage src={uploadedLogoPreview} alt={name} />
//                   ) : (
//                     <AvatarFallback
//                       style={{ backgroundColor: '#f3f4f6' }}
//                       className="text-gray-400 rounded-lg font-bold text-2xl md:text-3xl flex items-center justify-center"
//                     >
//                       <Camera className="w-8 h-8 md:w-10 md:h-10" />
//                     </AvatarFallback>
//                   )
//                 ) : (
//                   <AvatarFallback
//                     style={{ backgroundColor: letterLogoColor }}
//                     className="text-white rounded-lg font-bold text-2xl md:text-3xl"
//                   >
//                     {logoLetter}
//                   </AvatarFallback>
//                 )}
//               </Avatar>
//               <div className="flex-1 min-w-0">
//                 <h2 className="font-bold text-lg md:text-xl text-[#1600ff] mb-1 md:mb-2">{name}</h2>
//                 <div className="mb-2">
//                   <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wide mb-1">What Brings Us Together</p>
//                   <p className="text-sm md:text-base text-gray-700">{description}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Supported Causes Section */}
//             <div className="mb-4 md:mb-6">
//               <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wide mb-3 md:mb-4">
//                 Supporting {selectedCauses.length} {selectedCauses.length === 1 ? 'Cause' : 'Causes'}
//               </p>
//               <div className="space-y-2 md:space-y-3">
//                 {selectedCauses.map((cause) => {
//                   const causeData = cause.cause || cause;
//                   const categoryId = causeData.category || causeData.cause_category;
//                   const categoryNames = getCategoryNames(categoryId);
//                   const categoryIds = getCategoryIds(categoryId);
//                   const avatarBgColor = getConsistentColor(causeData.id, avatarColors);
//                   const initials = getInitials(causeData.name || 'N');


//                   return (
//                     <div key={cause.id} className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
//                       <div className="flex items-center gap-3 md:gap-4">
//                         <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0">
//                           <AvatarImage src={causeData.image} alt={causeData.name} />
//                           <AvatarFallback
//                             style={{ backgroundColor: avatarBgColor }}
//                             className="text-white font-bold text-xs md:text-sm"
//                           >
//                             {initials}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div className="flex-1 min-w-0">
//                           <h4 className="font-bold text-sm md:text-base text-foreground mb-1">{causeData.name}</h4>
//                           <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-2">
//                             {causeData.mission || causeData.description}
//                           </p>
//                           <div className="flex flex-wrap gap-1.5 md:gap-2">
//                             {categoryNames.map((name, index) => {
//                               const singleCategoryId = categoryIds[index];
//                               const bgColor = getCategoryColor(singleCategoryId);
//                               const textColor = getCategoryTextColor(singleCategoryId);
//                               return (
//                                 <span
//                                   key={index}
//                                   className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] md:text-xs font-medium"
//                                   style={{ backgroundColor: bgColor, color: textColor }}
//                                 >
//                                   {name}
//                                 </span>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Donation Splitting Note */}
//             <div className="bg-gray-100 rounded-lg p-3 md:p-4">
//               <p className="text-xs md:text-sm text-gray-600 text-center">
//                 All member donations will be split evenly across these causes.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Footer Button */}
//         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 md:px-4 py-3 z-10">
//           <div className="w-full lg:max-w-[60%] lg:mx-auto">
//             <Button
//               onClick={handleCreateCollective}
//               className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-full px-4 md:px-6 py-5 md:py-6 w-full text-sm md:text-base"
//               disabled={createCollectiveMutation.isPending}
//             >
//               Create Collective
//             </Button>
//           </div>
//         </div>

//         {/* Custom Toast */}
//         <Toast
//           message={toastMessage}
//           show={showToast}
//           onHide={() => setShowToast(false)}
//         />
//       </div>
//     );
//   }

//   // Loading Animation Step (during API call or while animation completes)
//   if (createCollectiveMutation.isPending || (createdCollective && !showAnimationComplete)) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 flex items-center justify-center px-3 md:px-4">
//         <div className="flex flex-col items-center gap-6 md:gap-8">
//           <CrwdAnimation size="lg" />
//           {/* <p className="text-base md:text-lg font-medium text-gray-700">
//             {createCollectiveMutation.isPending ? 'Creating collective' : 'Collective created'}{'.'.repeat(dotCount)}
//           </p> */}
//         </div>
//       </div>
//     );
//   }

//   // Success Step
//   if (step === 3 && createdCollective) {
//     return (
//       <>
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50">
//           <div className="flex flex-col items-center justify-center min-h-screen px-3 md:px-4 py-8 md:py-12">
//             <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 md:p-8">
//               {/* Success Icon */}
//               <div className="flex justify-center mb-4 md:mb-6">
//                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#ADFF2F] flex items-center justify-center">
//                   <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2.5} />
//                 </div>
//               </div>

//               {/* Heading */}
//               <div className="text-center mb-3 md:mb-4">
//                 <h2 className="text-xl md:text-2xl font-bold text-gray-900">
//                   {name} is <span className="font-bold">Live!</span>
//                 </h2>
//               </div>

//               {/* Description */}
//               <p className="text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8 leading-relaxed">
//                 {allCausesAlreadyAdded ? (
//                   <>
//                     Your collective is ready to go! All causes are already in your donation box.{' '}
//                     Start sharing to grow your community.
//                   </>
//                 ) : donationBoxData && donationBoxData.id ? (
//                   <>
//                     Your collective is ready to go! Add causes to your donation box or start sharing to grow your community.
//                   </>
//                 ) : (
//                   <>
//                     Your collective is ready to go! Set up your donation box to support your causes, or start sharing to grow your community.
//                   </>
//                 )}
//               </p>

//               {/* Action Buttons */}
//               <div className="space-y-3 md:space-y-4">
//                 {!allCausesAlreadyAdded && (
//                   <Button
//                     onClick={handleAddToDonationBox}
//                     className="w-full bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-lg py-3 md:py-4 text-sm md:text-base flex items-center justify-center gap-2"
//                   >
//                     <Heart className="w-4 h-4 md:w-5 md:h-5" />
//                     {donationBoxData && donationBoxData.id ? 'Add to Donation Box' : 'Set Up Donation Box'}
//                   </Button>
//                 )}

//                 <Button
//                   onClick={() => navigate(`/groupcrwd/${createdCollective.id}`)}
//                   variant="outline"
//                   className="w-full border border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold rounded-lg py-3 md:py-4 text-sm md:text-base flex items-center justify-center gap-2"
//                 >
//                   <Eye className="w-4 h-4 md:w-5 md:h-5" />
//                   View My Collective
//                 </Button>

//                 <button
//                   onClick={() => setShowShareModal(true)}
//                   className="w-full text-[#1600ff] hover:text-[#1400cc] font-semibold text-sm md:text-base flex items-center justify-center gap-2 py-2 md:py-3"
//                 >
//                   <Share2 className="w-4 h-4 md:w-5 md:h-5" />
//                   Share Link
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {showConfetti && (
//           <Confetti
//             width={window.innerWidth}
//             height={window.innerHeight}
//             recycle={true}
//             numberOfPieces={300}
//             gravity={0.2}
//             wind={0.05}
//             opacity={0.8}
//           />
//         )}

//         <SharePost
//           url={window.location.origin + `/groupcrwd/${createdCollective.id}`}
//           title={`Join my new CRWD: ${name}`}
//           description={description}
//           isOpen={showShareModal}
//           onClose={() => setShowShareModal(false)}
//         />

//         {/* Add to Donation Box Bottom Sheet */}
//         <JoinCollectiveBottomSheet
//           isOpen={showAddToBoxModal}
//           onClose={() => setShowAddToBoxModal(false)}
//           collectiveName={name}
//           nonprofits={selectedCauses.map((cause: any) => {
//             const causeData = cause.cause || cause;
//             return {
//               id: causeData.id || cause.id,
//               name: causeData.name || cause.name,
//               image: causeData.image || cause.image,
//               logo: causeData.logo || cause.logo,
//               description: causeData.description || cause.description,
//               mission: causeData.mission || cause.mission,
//               cause: causeData
//             };
//           })}
//           collectiveId={createdCollective.id.toString()}
//           onJoin={handleAddToBoxConfirm}
//           isJoining={false}
//           donationBox={donationBoxData}
//         />

//         {/* Custom Toast */}
//         <Toast
//           message={toastMessage}
//           show={showToast}
//           onHide={() => setShowToast(false)}
//         />
//       </>
//     );
//   }

//   return (
//     <>
//       <div className="min-h-screen bg-white">
//         {/* Header */}
//         <div className="sticky top-0 z-10 w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b bg-white">
//           <button
//             onClick={handleBack}
//             className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
//             aria-label="Go back"
//           >
//             <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
//           </button>
//           <h1 className="font-bold text-lg md:text-xl text-foreground">Create a Collective</h1>
//         </div>

//         <div className="px-3 md:px-4 py-4 md:py-6 pb-24 md:pb-28 lg:max-w-[60%] lg:mx-auto">
//           {/* Collective Name */}
//           <div className="border border-gray-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
//             <div className="flex items-center gap-2 mb-2">
//               <label className="font-semibold text-sm md:text-base text-foreground">
//                 Name Your Collective <span className="text-red-500">*</span>
//               </label>
//               <div className="group relative">
//                 <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 cursor-pointer" />
//                 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 md:px-3 py-1.5 md:py-2 bg-gray-100 text-gray-500 text-xs md:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
//                   Keep it short & memorable ({'<'}{'40'} characters)
//                   <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
//                 </div>
//               </div>
//             </div>
//             <Input
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder='"Atlanta Climate Action"'
//               className={`w-full bg-gray-50 rounded-2xl text-sm md:text-base ${name.length > 0 ? '' : 'italic'}`}
//             />
//           </div>

//           {/* Description */}
//           <div className="border border-gray-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
//             <div className="flex items-center gap-2 mb-2">
//               <label className="font-semibold text-sm md:text-base text-foreground">
//                 What Brings This Group Together? <span className="text-red-500">*</span>
//               </label>
//               <div className="group relative">
//                 <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 cursor-pointer" />
//                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 md:px-3 py-1.5 md:py-2 bg-gray-100 text-gray-500 text-xs md:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-normal max-w-[180px] md:max-w-[200px] z-10">
//                   A quick one-liner works best ({'<'}{'160'} characters)
//                   <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
//                 </div>
//               </div>
//             </div>
//             <Textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder={`"We're classmates giving back to Atlanta."\n"Our office team supporting local families."\n"A community of friends passionate about clean water."`}
//               className={`w-full min-h-[100px] bg-gray-50 rounded-2xl text-sm md:text-base ${description.length > 0 ? '' : 'italic'}`}
//             />
//           </div>

//           {/* Collective Logo */}
//           <div className="border border-gray-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
//             <div className="flex items-center gap-3 md:gap-4">
//               <Avatar className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex-shrink-0">
//                 {logoType === 'upload' ? (
//                   uploadedLogoPreview ? (
//                     <AvatarImage src={uploadedLogoPreview} alt={name} />
//                   ) : (
//                     <AvatarFallback
//                       style={{ backgroundColor: '#f3f4f6' }}
//                       className="text-gray-400 rounded-lg font-bold text-lg md:text-2xl flex items-center justify-center"
//                     >
//                       <Camera className="w-6 h-6 md:w-8 md:h-8" />
//                     </AvatarFallback>
//                   )
//                 ) : (
//                   // <AvatarFallback
//                   //   style={{ backgroundColor: letterLogoColor }}
//                   //   className="text-white rounded-lg font-bold text-lg md:text-2xl"
//                   // >
//                   //   {logoLetter}
//                   // </AvatarFallback>
//                   <div style={{ backgroundColor: letterLogoColor }} className="text-white rounded-lg font-bold text-lg md:text-2xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
//                     {logoLetter}
//                   </div>
//                 )}
//               </Avatar>
//               <div className="flex-1">
//                 <label className="font-bold text-sm md:text-base text-foreground block">
//                   Collective Logo
//                 </label>
//                 <p className="text-xs md:text-sm text-muted-foreground">
//                   {logoType === 'letter' ? 'Letter logo' : 'Custom image'}
//                 </p>
//               </div>
//               <Button
//                 onClick={() => setShowLogoCustomization(!showLogoCustomization)}
//                 variant="outline"
//                 className="border-gray-300 text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2"
//               >
//                 {showLogoCustomization ? (
//                   <>
//                     <Edit2 className="w-4 h-4 mr-2" />
//                     Done
//                   </>
//                 ) : (
//                   <>
//                     <Edit2 className="w-4 h-4 mr-2" />
//                     Customize
//                   </>
//                 )}
//               </Button>
//             </div>

//             {/* Customization Options - Shown when Customize is clicked */}
//             {showLogoCustomization && (
//               <div className="mt-6 pt-6 border-t border-gray-200">
//                 <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
//                   {/* Right Side - Customization Options */}
//                   <div className="flex-1 w-full">
//                     {/* Logo Type Selection */}
//                     <div className="flex gap-3 mb-4">
//                       <Button
//                         onClick={() => {
//                           setLogoType('letter');
//                           // Don't clear uploaded logo - keep it for when switching back to upload
//                         }}
//                         className={`flex-1 font-semibold rounded-lg py-2.5 md:py-3 text-sm md:text-base ${logoType === 'letter'
//                           ? 'bg-[#1600ff] text-white'
//                           : 'bg-white border border-gray-300 text-foreground hover:bg-gray-50'
//                           }`}
//                       >
//                         <Palette className="w-4 h-4 mr-2" />
//                         Letter
//                       </Button>
//                       <Button
//                         onClick={() => setLogoType('upload')}
//                         className={`flex-1 font-semibold rounded-lg py-2.5 md:py-3 text-sm md:text-base ${logoType === 'upload'
//                           ? 'bg-[#1600ff] text-white'
//                           : 'bg-white border border-gray-300 text-foreground hover:bg-gray-50'
//                           }`}
//                       >
//                         <Camera className="w-4 h-4 mr-2" />
//                         Upload
//                       </Button>
//                     </div>

//                     {/* Letter Logo Options */}
//                     {logoType === 'letter' && (
//                       <div>
//                         <h4 className="font-semibold text-foreground mb-3 text-sm md:text-base">Background Color</h4>
//                         {/* <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 sm:flex sm:gap-3 gap-2"> */}
//                         <div className="flex flex-wrap gap-3">
//                           {colorSwatches.map((color) => (
//                             <button
//                               key={color}
//                               onClick={() => handleColorSelect(color)}
//                               className={`w-10 h-10 md:w-12 md:h-12 rounded-lg transition-transform hover:scale-110 ${letterLogoColor === color ? 'ring-2 ring-gray-900' : ''
//                                 }`}
//                               style={{ backgroundColor: color }}
//                               aria-label={`Select color ${color}`}
//                             />
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {/* Upload Logo Options */}
//                     {logoType === 'upload' && (
//                       <div>
//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={handleFileChange}
//                           className="hidden"
//                           id="logo-upload-input"
//                         />
//                         <label
//                           htmlFor="logo-upload-input"
//                           className="cursor-pointer"
//                         >
//                           <Button
//                             type="button"
//                             variant="outline"
//                             className="w-full border-gray-300"
//                             onClick={() => {
//                               const input = document.getElementById('logo-upload-input');
//                               input?.click();
//                             }}
//                           >
//                             <Camera className="w-4 h-4 mr-2" />
//                             Upload
//                           </Button>
//                         </label>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Causes Management Section */}
//           <div className="mt-6 md:mt-8 space-y-4 md:space-y-6">
//             {/* Selected Causes - Only show if there are selected causes */}
//             {selectedCauses.length > 0 && (
//               <div className="border border-blue-200 p-3 md:p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50">
//                 <div className="flex items-center justify-between mb-3 md:mb-4">
//                   <h3 className="font-bold text-base md:text-lg text-foreground">
//                     Selected Causes ({selectedCauses.length})
//                   </h3>
//                   <Button variant="default" className="text-xs rounded-full md:text-sm px-2 md:px-4 py-1.5 md:py-2 font-[800]">
//                     <Check className="w-4 h-4" strokeWidth={3} />
//                     Ready
//                   </Button>
//                 </div>
//                 <div className="space-y-2 md:space-y-3">
//                   {selectedCauses.map((cause) => {
//                     const causeData = cause.cause || cause;
//                     // Get category ID from cause (can be single letter like "F" or multi-letter like "MK")
//                     const categoryId = causeData.category || causeData.cause_category;
//                     const categoryNames = getCategoryNames(categoryId);
//                     const categoryIds = getCategoryIds(categoryId);
//                     const avatarBgColor = getConsistentColor(causeData.id, avatarColors);
//                     const initials = getInitials(causeData.name || 'N');

//                     return (
//                       <div key={cause.id} className="bg-white rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
//                         <div className="flex items-center gap-3 md:gap-4">
//                           <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0">
//                             <AvatarImage src={causeData.image} alt={causeData.name} />
//                             <AvatarFallback
//                               style={{ backgroundColor: avatarBgColor }}
//                               className="text-white font-bold text-xs md:text-sm"
//                             >
//                               {initials}
//                             </AvatarFallback>
//                           </Avatar>
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2 mb-1 flex-wrap">
//                               <h4 className="font-bold text-sm md:text-base text-foreground truncate">{causeData.name}</h4>
//                               {categoryNames.map((name, index) => {
//                                 const singleCategoryId = categoryIds[index];
//                                 const bgColor = getCategoryColor(singleCategoryId);
//                                 const textColor = getCategoryTextColor(singleCategoryId);
//                                 return (
//                                   <span
//                                     key={index}
//                                     className="inline-flex items-center rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium flex-shrink-0"
//                                     style={{ backgroundColor: bgColor, color: textColor }}
//                                   >
//                                     {name}
//                                   </span>
//                                 );
//                               })}
//                             </div>
//                             <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{causeData.mission || causeData.description}</p>
//                           </div>
//                           <button
//                             onClick={() => handleRemoveCause(cause.id)}
//                             className="p-1.5 md:p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
//                           >
//                             <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {/* Add or Remove Causes */}
//             <div className="border border-gray-200 p-3 md:p-4 rounded-2xl">
//               <h3 className="font-bold text-base md:text-lg text-foreground mb-2 md:mb-3">
//                 Add or Remove Causes <span className="text-red-500">*</span>
//               </h3>

//               {/* Search Bar */}
//               <div className="relative mb-3 md:mb-4">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
//                 <Input
//                   type="text"
//                   placeholder="Search causes or nonprofits"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   onKeyPress={handleSearchKeyPress}
//                   className="pl-9 md:pl-10 bg-gray-100 rounded-lg text-sm md:text-base py-5 sm:py-6"
//                 />
//               </div>

//               {/* Your Causes - Only show if there are favorite causes */}
//               {favoriteCauses.length > 0 && (
//                 <div className="mb-3 md:mb-4">
//                   <button
//                     onClick={() => setIsYourCausesOpen(!isYourCausesOpen)}
//                     className="flex items-center justify-between w-full gap-2 mb-3 md:mb-4 bg-blue-100 p-3 rounded-xl"
//                   >
//                     <div className="flex items-center gap-2">
//                       <div className="w-2 h-2 rounded-full bg-blue-500"></div>
//                       <h3 className="font-semibold text-sm  sm:text-base  md:text-lg text-blue-600">
//                         Your Causes ({favoriteCauses.length})
//                       </h3>
//                     </div>
//                     {/* <ChevronDown
//                     className={`w-4 h-4 md:w-5 md:h-5 text-blue-600 transition-transform ${
//                       isYourCausesOpen ? 'rotate-180' : ''
//                     }`}
//                   /> */}
//                     {isYourCausesOpen ? (
//                       <Minus className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
//                     ) : (
//                       <Plus className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
//                     )}
//                   </button>
//                   {isYourCausesOpen && (
//                     <div className="space-y-2 md:space-y-3">
//                       {isLoadingFavoriteCauses ? (
//                         <div className="flex items-center justify-center py-6 md:py-8">
//                           <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
//                         </div>
//                       ) : (
//                         favoriteCauses.map((item: any) => {
//                           const cause = item.cause || item;
//                           const categoryId = cause.category || cause.cause_category;
//                           const categoryName = getCategoryNames(categoryId);
//                           const categoryColor = getCategoryColor(categoryId);
//                           const isSelected = isCauseSelected(cause.id);
//                           const avatarBgColor = getConsistentColor(cause.id, avatarColors);
//                           const initials = getInitials(cause.name || 'N');

//                           return (
//                             <div
//                               key={cause.id}
//                               onClick={() => handleToggleCause(cause)}
//                               className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white cursor-pointer"
//                             >
//                               <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0">
//                                 <AvatarImage src={cause.image} alt={cause.name} />
//                                 <AvatarFallback
//                                   style={{ backgroundColor: avatarBgColor }}
//                                   className="text-white font-bold text-xs md:text-sm"
//                                 >
//                                   {initials}
//                                 </AvatarFallback>
//                               </Avatar>
//                               <div className="flex-1 min-w-0">
//                                 <div className="flex items-center gap-2 mb-1 flex-wrap">
//                                   <h4 className="font-bold text-sm md:text-base text-foreground truncate">{cause.name}</h4>
//                                   <span
//                                     className="inline-flex items-center rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium flex-shrink-0"
//                                     style={{ backgroundColor: categoryColor, color: getCategoryTextColor(cause.category || cause.cause_category) }}
//                                   >
//                                     {categoryName}
//                                   </span>
//                                 </div>
//                                 <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
//                                   {cause.mission || cause.description}
//                                 </p>
//                               </div>
//                               <div className="flex items-center cursor-pointer flex-shrink-0">
//                                 <div
//                                   className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center ${isSelected
//                                     ? 'border-[#1600ff] bg-[#1600ff]'
//                                     : 'border-gray-300 bg-white'
//                                     }`}
//                                 >
//                                   {isSelected && (
//                                     <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-white" />
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           );
//                         })
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}



//               {/* Suggested Causes List */}
//               {(() => {
//                 const causes = searchTrigger > 0 && searchQuery.trim()
//                   ? (causesData?.results || [])
//                   : (defaultCausesData?.results || []);

//                 // Get favorite cause IDs to exclude from search results
//                 const favoriteCauseIds = new Set(
//                   favoriteCauses.map((item: any) => {
//                     const cause = item.cause || item;
//                     return cause.id;
//                   })
//                 );

//                 // Filter out favorite causes and already selected causes
//                 const filteredCauses = causes.filter((cause: any) => {
//                   const causeId = cause.id;
//                   return causeId && !favoriteCauseIds.has(causeId) && !selectedCauses.some(selected => selected.id === causeId);
//                 });

//                 if (filteredCauses.length === 0 && !(searchTrigger > 0 && searchQuery.trim()) && defaultCausesData?.results?.length === 0) {
//                   return null;
//                 }

//                 return (
//                   <button
//                     onClick={() => setIsSuggestedCausesOpen(!isSuggestedCausesOpen)}
//                     className="flex items-center justify-between w-full gap-2 mb-3 md:mb-4 bg-purple-100 p-3 rounded-xl"
//                   >
//                     <div className="flex items-center gap-2">
//                       <div className="w-2 h-2 rounded-full bg-purple-500"></div>
//                       <h4 className="font-semibold text-sm  sm:text-base  md:text-lg text-purple-600">
//                         Suggested Causes ({filteredCauses.length})
//                       </h4>
//                     </div>
//                     {isSuggestedCausesOpen ? (
//                       <Minus className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
//                     ) : (
//                       <Plus className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
//                     )}
//                   </button>
//                 );
//               })()}

//               {/* Causes List */}
//               {isSuggestedCausesOpen && (
//                 <div className="space-y-2 md:space-y-3 max-h-96 overflow-y-auto">
//                   {(isCausesLoading || defaultCausesLoading) ? (
//                     <div className="flex items-center justify-center py-6 md:py-8">
//                       <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
//                     </div>
//                   ) : (
//                     (() => {
//                       const causes = searchTrigger > 0 && searchQuery.trim()
//                         ? (causesData?.results || [])
//                         : (defaultCausesData?.results || []);

//                       // Get favorite cause IDs to exclude from search results
//                       const favoriteCauseIds = new Set(
//                         favoriteCauses.map((item: any) => {
//                           const cause = item.cause || item;
//                           return cause.id;
//                         })
//                       );

//                       // Filter out favorite causes and already selected causes
//                       const availableCauses = causes.filter((cause: any) => {
//                         const causeId = cause.id;
//                         return causeId && !favoriteCauseIds.has(causeId) && !selectedCauses.some(selected => selected.id === causeId);
//                       });

//                       if (availableCauses.length === 0) {
//                         return (
//                           <p className="text-xs md:text-sm text-muted-foreground text-center py-6 md:py-8">
//                             No causes found
//                           </p>
//                         );
//                       }

//                       return availableCauses.map((cause: any) => {
//                         // Get category ID from cause (can be single letter like "F" or multi-letter like "MK")
//                         const categoryId = cause.category || cause.cause_category;
//                         const categoryNames = getCategoryNames(categoryId);
//                         const categoryIds = getCategoryIds(categoryId);
//                         const isSelected = isCauseSelected(cause.id);

//                         const avatarBgColor = getConsistentColor(cause.id, avatarColors);
//                         const initials = getInitials(cause.name || 'N');

//                         return (
//                           <div
//                             key={cause.id}
//                             onClick={() => handleToggleCause(cause)}
//                             className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
//                           >
//                             <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0">
//                               <AvatarImage src={cause.image} alt={cause.name} />
//                               <AvatarFallback
//                                 style={{ backgroundColor: avatarBgColor }}
//                                 className="text-white font-bold text-xs md:text-sm"
//                               >
//                                 {initials}
//                               </AvatarFallback>
//                             </Avatar>
//                             <div className="flex-1 min-w-0">
//                               <div className="flex items-center gap-2 mb-1 flex-wrap">
//                                 <h4 className="font-bold text-sm md:text-base text-foreground truncate">{cause.name}</h4>
//                                 {categoryNames.map((name, index) => {
//                                   const singleCategoryId = categoryIds[index];
//                                   const bgColor = getCategoryColor(singleCategoryId);
//                                   const textColor = getCategoryTextColor(singleCategoryId);
//                                   return (
//                                     <span
//                                       key={index}
//                                       className="inline-flex items-center rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium flex-shrink-0"
//                                       style={{ backgroundColor: bgColor, color: textColor }}
//                                     >
//                                       {name}
//                                     </span>
//                                   );
//                                 })}
//                               </div>
//                               <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
//                                 {cause.mission || cause.description}
//                               </p>
//                             </div>

//                             <div className="flex items-center cursor-pointer flex-shrink-0">
//                               <div
//                                 className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center ${isSelected
//                                   ? 'border-[#1600ff] bg-[#1600ff]'
//                                   : 'border-gray-300 bg-white'
//                                   }`}
//                               >
//                                 {isSelected && (
//                                   <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-white" />
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       });
//                     })()
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Footer Buttons */}
//           <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 md:px-4 py-3 z-10">
//             <div className="w-full lg:max-w-[60%] lg:mx-auto">
//               {(() => {
//                 const isFormComplete = name.trim() !== '' && description.trim() !== '' && selectedCauses.length > 0;

//                 if (!isFormComplete) {
//                   return (
//                     <Button
//                       disabled
//                       className="bg-gray-300 text-white font-semibold rounded-full px-4 md:px-6 py-5 md:py-6 w-full text-sm md:text-base cursor-not-allowed"
//                     >
//                       Complete Required Fields
//                     </Button>
//                   );
//                 }

//                 return (
//                   <Button
//                     onClick={handleContinueToReview}
//                     className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-full px-4 md:px-6 py-5 md:py-6 w-full text-sm md:text-base"
//                   >
//                     Continue to Review
//                   </Button>
//                 );
//               })()}
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* Custom Toast */}
//       <Toast
//         message={toastMessage}
//         show={showToast}
//         onHide={() => setShowToast(false)}
//       />
//     </>
//   );
// }














import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Search, X, Loader2, Edit2, Palette, Camera, Users, Check, Minus, Plus, Heart, Eye, Share2, Sparkles } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCollective, getCausesBySearch } from '@/services/api/crwd';
import { getFavoriteCauses } from '@/services/api/social';
import { getDonationBox, addCausesToBox } from '@/services/api/donation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Toast } from '@/components/ui/toast';
import { categories } from '@/constants/categories';
import Confetti from 'react-confetti';
import { SharePost } from '@/components/ui/SharePost';
import { useAuthStore } from '@/stores/store';
import { CrwdAnimation } from '@/assets/newLogo';
import JoinCollectiveBottomSheet from '@/components/newgroupcrwd/JoinCollectiveBottomSheet';

const getCategoryById = (categoryId: string | undefined) => {
  return categories.find(cat => cat.id === categoryId) || null;
};

// Get category names as an array for multi-letter categories (e.g., "MK" -> ["Relief", "Food"])
const getCategoryNames = (categoryId: string | undefined): string[] => {
  if (!categoryId) return ['Uncategorized'];

  // If category is multiple letters, split and get names for each
  if (categoryId.length > 1) {
    const categoryNames = categoryId
      .split('')
      .map(char => {
        const category = getCategoryById(char);
        return category?.name || char;
      })
      .filter(Boolean);

    return categoryNames.length > 0 ? categoryNames : ['Uncategorized'];
  }

  // Single letter category
  const category = getCategoryById(categoryId);
  return category?.name ? [category.name] : ['Uncategorized'];
};

// Get category IDs as an array (for getting individual colors)
const getCategoryIds = (categoryId: string | undefined): string[] => {
  if (!categoryId) return [];

  // If category is multiple letters, split into individual IDs
  if (categoryId.length > 1) {
    return categoryId.split('');
  }

  // Single letter category
  return [categoryId];
};

// Get category background color for display (use first category's background for multi-letter)
const getCategoryColor = (categoryId: string | undefined): string => {
  if (!categoryId) return '#10B981';

  // For multi-letter categories, use the first category's background color
  const firstChar = categoryId.charAt(0);
  const category = getCategoryById(firstChar);
  return category?.background || '#10B981';
};

// Get category text color for display
const getCategoryTextColor = (categoryId: string | undefined): string => {
  if (!categoryId) return '#FFFFFF';

  // For multi-letter categories, use the first category's text color
  const firstChar = categoryId.charAt(0);
  const category = getCategoryById(firstChar);
  return category?.text || '#FFFFFF';
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
  const location = useLocation();
  const { user: currentUser, token } = useAuthStore();

  const handleBack = () => {
    // Check if we came from specific flows
    const fromScreen = (location.state as any)?.from;
    const specialFlows = ['NewNonprofitInterests', 'NewCompleteDonation', 'Login'];

    if (fromScreen && specialFlows.includes(fromScreen)) {
      navigate('/');
    } else {
      // Default behavior
      navigate(-1);
    }
  };

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCauses, setSelectedCauses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [createdCollective, setCreatedCollective] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAddToBoxModal, setShowAddToBoxModal] = useState(false);

  // Logo customization state - separate states for letter and upload
  const [logoType, setLogoType] = useState<'letter' | 'upload'>('letter');
  const [letterLogoColor, setLetterLogoColor] = useState('#1600ff'); // State for letter logo background color
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null); // State for uploaded file
  const [uploadedLogoPreview, setUploadedLogoPreview] = useState<string | null>(null); // State for uploaded image preview
  const [showLogoCustomization, setShowLogoCustomization] = useState(false);

  // Dropdown state for sections
  const [isYourCausesOpen, setIsYourCausesOpen] = useState(true);
  const [isSuggestedCausesOpen, setIsSuggestedCausesOpen] = useState(true);

  // Loading dots state
  const [dotCount, setDotCount] = useState(0);
  const [showAnimationComplete, setShowAnimationComplete] = useState(false);

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

  // Fetch favorite causes
  const { data: favoriteCausesData, isLoading: isLoadingFavoriteCauses } = useQuery({
    queryKey: ['favoriteCauses'],
    queryFn: () => getFavoriteCauses(),
    enabled: !!currentUser?.id,
  });

  const favoriteCauses = favoriteCausesData?.results || [];

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

  // Fetch donation box to check which causes are already added (only when on success step)
  const { data: donationBoxData } = useQuery({
    queryKey: ['donationBox', currentUser?.id],
    queryFn: getDonationBox,
    enabled: !!currentUser?.id && step === 3 && !!createdCollective,
  });

  // Get causes that are already in the donation box
  const boxCauseIds = new Set(
    (donationBoxData?.box_causes || []).map((boxCause: any) => {
      const cause = boxCause.cause || boxCause;
      return cause?.id?.toString() || boxCause.cause_id?.toString();
    })
  );

  // Filter selected causes to only include those not already in the donation box
  const causesToAdd = selectedCauses.filter((cause: any) => {
    const causeData = cause.cause || cause;
    const causeId = (causeData.id || cause.id)?.toString();
    return causeId && !boxCauseIds.has(causeId);
  });

  // Check if all causes are already in the donation box
  const allCausesAlreadyAdded = selectedCauses.length > 0 && causesToAdd.length === 0;

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
      // Wait for animation to complete (3 seconds for one full cycle) before showing success
      setTimeout(() => {
        setShowAnimationComplete(true);
        setStep(3);
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 4000);
      }, 3000);
      queryClient.invalidateQueries({ queryKey: ['collectives'] });
      queryClient.invalidateQueries({ queryKey: ['joined-collectives'] });
    },
    onError: (error: any) => {
      console.error('Create collective error:', error);

      // Check for logo_file validation error
      if (error.response?.data?.logo_file && Array.isArray(error.response.data.logo_file) && error.response.data.logo_file.length > 0) {
        setToastMessage(error.response.data.logo_file[0]);
        setShowToast(true);
        return;
      }

      // Check for other field-specific errors
      const errorData = error.response?.data;
      if (errorData) {
        // Check for name field error specifically (it's an array)
        if (errorData.name && Array.isArray(errorData.name) && errorData.name.length > 0) {
          setToastMessage(errorData.name[0]);
          setShowToast(true);
          return;
        }

        // Check for any other field errors (like description, etc.)
        const fieldErrors = Object.keys(errorData).filter(key => Array.isArray(errorData[key]) && errorData[key].length > 0);
        if (fieldErrors.length > 0) {
          const firstFieldError = errorData[fieldErrors[0]];
          if (Array.isArray(firstFieldError) && firstFieldError.length > 0) {
            setToastMessage(firstFieldError[0]);
            setShowToast(true);
            return;
          }
        }
      }

      // Fallback to general error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create collective';
      setToastMessage(errorMessage);
      setShowToast(true);
    },
  });

  // Animate dots during API call or while waiting for animation to complete
  useEffect(() => {
    if (createCollectiveMutation.isPending || (createdCollective && !showAnimationComplete)) {
      const interval = setInterval(() => {
        setDotCount((prev) => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setDotCount(0);
    }
  }, [createCollectiveMutation.isPending, createdCollective, showAnimationComplete]);

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
    setLetterLogoColor(color);
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
    }
  };

  const handleContinueToReview = () => {
    // Validation
    if (name.trim() === '') {
      setToastMessage('Please enter a name for your CRWD');
      setShowToast(true);
      return;
    }
    if (description.trim() === '') {
      setToastMessage('Please enter a description for your CRWD');
      setShowToast(true);
      return;
    }
    if (selectedCauses.length === 0) {
      setToastMessage('Please select at least one cause');
      setShowToast(true);
      return;
    }

    // Navigate to review step
    setStep(2);
  };

  const handleCreateCollective = () => {
    // Create collective via API
    // Use FormData if there's a file upload, otherwise use JSON
    if (logoType === 'upload' && uploadedLogo) {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      // Append each cause_id separately (backend should handle this as an array)
      selectedCauses.forEach(cause => {
        formData.append('cause_ids', cause.id.toString());
      });
      formData.append('logo_file', uploadedLogo);
      // Do not send color when upload tab is active
      createCollectiveMutation.mutate(formData);
    } else {
      // Use JSON for letter logo or no logo
      const requestData: any = {
        name: name.trim(),
        description: description.trim(),
        cause_ids: selectedCauses.map(c => c.id),
      };

      // Add color only if logo type is letter (do not send image)
      if (logoType === 'letter' && letterLogoColor) {
        requestData.color = letterLogoColor;
      }

      createCollectiveMutation.mutate(requestData);
    }
  };

  // Handle adding collective to donation box
  const handleAddToDonationBox = async () => {
    if (!createdCollective?.id) {
      setToastMessage('Collective ID is missing');
      setShowToast(true);
      return;
    }

    try {
      // Check if donation box exists
      const donationBox = await getDonationBox();

      // If donation box doesn't exist or has no ID, navigate to setup with props
      if (!donationBox || !donationBox.id) {
        // Prepare causes data for preselection
        const preselectedCauses = selectedCauses.map((cause: any) => {
          const causeData = cause.cause || cause;
          return {
            id: causeData.id || cause.id,
            name: causeData.name || cause.name || 'Unknown Nonprofit',
            description: causeData.mission || causeData.description || cause.mission || cause.description || '',
            mission: causeData.mission || cause.mission || '',
            logo: causeData.image || causeData.logo || cause.image || cause.logo || '',
          };
        });
        const preselectedCauseIds = preselectedCauses.map((cause: any) => cause.id);

        navigate('/donation?tab=setup', {
          state: {
            preselectedItem: {
              id: createdCollective.id,
              type: 'collective',
              data: createdCollective
            },
            activeTab: 'collectives',
            preselectedCauses: preselectedCauseIds,
            preselectedCausesData: preselectedCauses,
            preselectedCollectiveId: createdCollective.id,
          }
        });
      } else {
        // Donation box exists, show bottom sheet to let user select causes
        setShowAddToBoxModal(true);
      }
    } catch (error: any) {
      console.error('Error checking donation box:', error);
      // On error, navigate to setup tab with causes
      const preselectedCauses = selectedCauses.map((cause: any) => {
        const causeData = cause.cause || cause;
        return {
          id: causeData.id || cause.id,
          name: causeData.name || cause.name || 'Unknown Nonprofit',
          description: causeData.mission || causeData.description || cause.mission || cause.description || '',
          mission: causeData.mission || cause.mission || '',
          logo: causeData.image || causeData.logo || cause.image || cause.logo || '',
        };
      });
      const preselectedCauseIds = preselectedCauses.map((cause: any) => cause.id);

      navigate('/donation?tab=setup', {
        state: {
          preselectedItem: {
            id: createdCollective.id,
            type: 'collective',
            data: createdCollective
          },
          activeTab: 'collectives',
          preselectedCauses: preselectedCauseIds,
          preselectedCausesData: preselectedCauses,
          preselectedCollectiveId: createdCollective.id,
        }
      });
    }
  };

  // Handle confirm from bottom sheet - add selected causes to donation box
  const handleAddToBoxConfirm = async (selectedNonprofits: any[], collectiveId: string, shouldSetupDonationBox: boolean) => {
    if (!createdCollective?.id) return;

    // If no donation box and user wants to set it up
    if (shouldSetupDonationBox) {
      const preselectedCauses = selectedNonprofits.map((np) => {
        const cause = np.cause || np;
        return {
          id: cause.id || np.id,
          name: cause.name || np.name || 'Unknown Nonprofit',
          description: cause.mission || cause.description || np.mission || np.description || '',
          mission: cause.mission || np.mission || '',
          logo: cause.image || cause.logo || np.image || np.logo || '',
        };
      });

      const preselectedCauseIds = preselectedCauses.map((cause) => cause.id);

      // Close the modal
      setShowAddToBoxModal(false);

      // Navigate to donation setup with preselected causes
      navigate('/donation?tab=setup', {
        state: {
          preselectedCauses: preselectedCauseIds,
          preselectedCausesData: preselectedCauses,
          preselectedCollectiveId: parseInt(collectiveId),
          returnTo: `/groupcrwd/${createdCollective.id}`,
        },
      });
      return;
    }

    // If donation box exists and causes are selected, add them
    if (selectedNonprofits.length > 0) {
      const causes = selectedNonprofits.map((np) => {
        const cause = np.cause || np;
        const causeId = cause.id || np.id;
        const causeEntry: { cause_id: number; attributed_collective?: number } = {
          cause_id: causeId,
          attributed_collective: parseInt(collectiveId),
        };
        return causeEntry;
      });

      try {
        await addCausesToBox({ causes });
        queryClient.invalidateQueries({ queryKey: ['donationBox', currentUser?.id] });
        await queryClient.refetchQueries({ queryKey: ['donationBox', currentUser?.id] });
        setToastMessage('Nonprofits added to your donation box!');
        setShowToast(true);
      } catch (error: any) {
        console.error('Error adding causes to donation box:', error);
        setToastMessage(error?.response?.data?.message || 'Failed to add nonprofits to donation box. Please try again.');
        setShowToast(true);
      }
    }

    // Close the modal
    setShowAddToBoxModal(false);
  };

  // Show prompt if user is not logged in
  if (!currentUser?.id || !token?.access_token) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center">
        {/* header */}
        <div className="sticky top-0 z-10 w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b bg-white">
          <button
            onClick={handleBack}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-lg md:text-xl text-foreground">Create a Collective</h1>
        </div>
        <div className="mb-6 md:mb-8">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full mt-4 md:mt-5 bg-blue-100 flex items-center justify-center">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
          </div>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-4 md:mb-6 px-4">
          Lead a Giving Community
        </h2>
        <p className="text-sm xs:text-base md:text-lg text-gray-700 text-center max-w-md mb-8 md:mb-12 px-4">
          You pick the causes. You invite the people. They give monthly. No money touches your hands. You just rally the movement.
        </p>
        <div className="w-full max-w-sm px-4 flex gap-3">
          <Button
            onClick={() => navigate('/onboarding?redirectTo=/create-crwd')}
            className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-lg px-4 md:px-6 py-3 md:py-6 text-base md:text-lg flex-1"
          >
            Get Started
          </Button>
          <Button
            onClick={() => navigate(`/login?redirectTo=/create-crwd`)}
            className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-lg px-4 md:px-6 py-3 md:py-6 text-base md:text-lg flex-1"
          >
            Log in
          </Button>
        </div>
      </div>
    );
  }

  // Show "Lead a Giving Community" view as first step for logged-in users (only if form is empty and hasn't started)
  const isFormEmpty = !name && !description && selectedCauses.length === 0;
  if (step === 1 && isFormEmpty && !hasStarted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center">
        {/* header */}
        <div className="sticky top-0 z-10 w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b bg-white">
          <button
            onClick={handleBack}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-lg md:text-xl text-foreground">Create a Collective</h1>
        </div>
        <div className="mb-6 md:mb-8">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full mt-4 md:mt-5 bg-blue-100 flex items-center justify-center">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
          </div>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-4 md:mb-6 px-4">
          Lead a Giving Community
        </h2>
        <p className="text-sm xs:text-base md:text-lg text-gray-700 text-center max-w-md mb-8 md:mb-12 px-4">
          You pick the causes. You invite the people. They give monthly. No money touches your hands. You just rally the movement.
        </p>
        <div className="w-fit ">
          <Button
            onClick={() => {
              // Clear any saved form data and proceed to form
              if (typeof window !== 'undefined') {
                localStorage.removeItem('createCrwd_name');
                localStorage.removeItem('createCrwd_desc');
              }
              setName('');
              setDescription('');
              setSelectedCauses([]);
              setHasStarted(true);
            }}
            className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-md px-4 md:px-6 py-3 md:py-6 text-base md:text-lg w-fit"
          >
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  const logoLetter = name?.charAt(0).toUpperCase() || 'C';

  // Review/Confirmation Step
  if (step === 2 && !createdCollective) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b bg-white">
          <button
            onClick={() => setStep(1)}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-lg md:text-xl text-foreground">Confirm & Create</h1>
        </div>

        <div className="px-3 md:px-4 py-4 md:py-6 pb-24 md:pb-28 lg:max-w-[60%] lg:mx-auto">
          <div className="bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 rounded-2xl p-4 md:p-6 shadow-sm">
            {/* Collective Info Section */}
            <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
              <Avatar className="w-16 h-16 md:w-20 md:h-20 rounded-lg flex-shrink-0">
                {logoType === 'upload' ? (
                  uploadedLogoPreview ? (
                    <AvatarImage src={uploadedLogoPreview} alt={name} />
                  ) : (
                    <AvatarFallback
                      style={{ backgroundColor: '#f3f4f6' }}
                      className="text-gray-400 rounded-lg font-bold text-2xl md:text-3xl flex items-center justify-center"
                    >
                      <Camera className="w-8 h-8 md:w-10 md:h-10" />
                    </AvatarFallback>
                  )
                ) : (
                  <AvatarFallback
                    style={{ backgroundColor: letterLogoColor }}
                    className="text-white rounded-lg font-bold text-2xl md:text-3xl"
                  >
                    {logoLetter}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg md:text-xl text-[#1600ff] mb-1 md:mb-2">{name}</h2>
                <div className="mb-2">
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1">What Brings Us Together</p>
                  <p className="text-xs xs:text-sm md:text-base text-gray-700">{description}</p>
                </div>
              </div>
            </div>

            {/* Supported Causes Section */}
            <div className="mb-4 md:mb-6">
              <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-3 md:mb-4">
                Supporting {selectedCauses.length} {selectedCauses.length === 1 ? 'Cause' : 'Causes'}
              </p>
              <div className="space-y-2 md:space-y-3">
                {selectedCauses.map((cause) => {
                  const causeData = cause.cause || cause;
                  const categoryId = causeData.category || causeData.cause_category;
                  const categoryNames = getCategoryNames(categoryId);
                  const categoryIds = getCategoryIds(categoryId);
                  const avatarBgColor = getConsistentColor(causeData.id, avatarColors);
                  const initials = getInitials(causeData.name || 'N');


                  return (
                    <div key={cause.id} className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
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
                          <h4 className="font-bold text-sm xs:text-base md:text-lg text-foreground mb-1">{causeData.name}</h4>
                          <p className="text-xs xs:text-sm md:text-base text-gray-600 line-clamp-2 mb-2">
                            {causeData.mission || causeData.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5 md:gap-2">
                            {categoryNames.map((name, index) => {
                              const singleCategoryId = categoryIds[index];
                              const bgColor = getCategoryColor(singleCategoryId);
                              const textColor = getCategoryTextColor(singleCategoryId);
                              return (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] md:text-xs font-medium"
                                  style={{ backgroundColor: bgColor, color: textColor }}
                                >
                                  {name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Donation Splitting Note */}
            <div className="bg-gray-100 rounded-lg p-3 md:p-4">
              <p className="text-xs xs:text-sm md:text-base text-gray-600 text-center">
                All member donations will be split evenly across these causes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 md:px-4 py-3 z-10">
          <div className="w-full lg:max-w-[60%] lg:mx-auto">
            <Button
              onClick={handleCreateCollective}
              className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-full px-4 md:px-6 py-5 md:py-6 w-full text-sm md:text-base"
              disabled={createCollectiveMutation.isPending}
            >
              Create Collective
            </Button>
          </div>
        </div>

        {/* Custom Toast */}
        <Toast
          message={toastMessage}
          show={showToast}
          onHide={() => setShowToast(false)}
        />
      </div>
    );
  }

  // Loading Animation Step (during API call or while animation completes)
  if (createCollectiveMutation.isPending || (createdCollective && !showAnimationComplete)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 flex items-center justify-center px-3 md:px-4">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <CrwdAnimation size="lg" />
          {/* <p className="text-base md:text-lg font-medium text-gray-700">
            {createCollectiveMutation.isPending ? 'Creating collective' : 'Collective created'}{'.'.repeat(dotCount)}
          </p> */}
        </div>
      </div>
    );
  }

  // Success Step
  if (step === 3 && createdCollective) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50">
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
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {name} is <span className="font-bold">Live!</span>
                </h2>
              </div>

              {/* Description */}
              <p className="text-xs xs:text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8 leading-relaxed">
                {allCausesAlreadyAdded ? (
                  <>
                    Your collective is ready to go! All causes are already in your donation box.{' '}
                    Start sharing to grow your community.
                  </>
                ) : donationBoxData && donationBoxData.id ? (
                  <>
                    Your collective is ready to go! Add causes to your donation box or start sharing to grow your community.
                  </>
                ) : (
                  <>
                    Your collective is ready to go! Set up your donation box to support your causes, or start sharing to grow your community.
                  </>
                )}
              </p>

              {/* Action Buttons */}
              <div className="space-y-3 md:space-y-4">
                {!allCausesAlreadyAdded && (
                  <Button
                    onClick={handleAddToDonationBox}
                    className="w-full bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-lg py-3 md:py-4 text-sm md:text-base flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4 md:w-5 md:h-5" />
                    {donationBoxData && donationBoxData.id ? 'Add to Donation Box' : 'Set Up Donation Box'}
                  </Button>
                )}

                <Button
                  onClick={() => navigate(`/groupcrwd/${createdCollective.id}`)}
                  variant="outline"
                  className="w-full border border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold rounded-lg py-3 md:py-4 text-sm md:text-base flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 md:w-5 md:h-5" />
                  View My Collective
                </Button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full text-[#1600ff] hover:text-[#1400cc] font-semibold text-sm md:text-base flex items-center justify-center gap-2 py-2 md:py-3"
                >
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                  Share Link
                </button>
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

        {/* Add to Donation Box Bottom Sheet */}
        <JoinCollectiveBottomSheet
          isOpen={showAddToBoxModal}
          onClose={() => setShowAddToBoxModal(false)}
          collectiveName={name}
          nonprofits={selectedCauses.map((cause: any) => {
            const causeData = cause.cause || cause;
            return {
              id: causeData.id || cause.id,
              name: causeData.name || cause.name,
              image: causeData.image || cause.image,
              logo: causeData.logo || cause.logo,
              description: causeData.description || cause.description,
              mission: causeData.mission || cause.mission,
              cause: causeData
            };
          })}
          collectiveId={createdCollective.id.toString()}
          onJoin={handleAddToBoxConfirm}
          isJoining={false}
          donationBox={donationBoxData}
        />

        {/* Custom Toast */}
        <Toast
          message={toastMessage}
          show={showToast}
          onHide={() => setShowToast(false)}
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
            onClick={handleBack}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-lg md:text-xl text-foreground">Create a Collective</h1>
        </div>

        <div className="px-3 md:px-4 py-4 md:py-6 pb-24 md:pb-28 lg:max-w-[60%] lg:mx-auto">
          {/* Collective Name */}
          <div className="border border-gray-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
            <div className="flex items-center gap-2 mb-2">
              <label className="font-semibold text-sm xs:text-base md:text-lg text-foreground">
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
              placeholder='"Atlanta Climate Action"'
              className={`w-full bg-gray-50 rounded-2xl text-sm md:text-base ${name.length > 0 ? '' : 'italic'}`}
            />
          </div>

          {/* Description */}
          <div className="border border-gray-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
            <div className="flex items-center gap-2 mb-2">
              <label className="font-semibold text-sm xs:text-base md:text-lg text-foreground">
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
              className={`w-full min-h-[100px] bg-gray-50 rounded-2xl text-xs xs:text-sm md:text-base ${description.length > 0 ? '' : 'italic'}`}
            />
          </div>

          {/* Collective Logo */}
          <div className="border border-gray-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
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
                  <div style={{ backgroundColor: letterLogoColor }} className="text-white rounded-lg font-bold text-lg md:text-2xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                    {logoLetter}
                  </div>
                )}
              </Avatar>
              <div className="flex-1">
                <label className="font-bold text-sm xs:text-base md:text-lg text-foreground block">
                  Collective Logo
                </label>
                <p className="text-[10px] md:text-xs text-muted-foreground">
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
                        {/* <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 sm:flex sm:gap-3 gap-2"> */}
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
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="font-bold text-sm xs:text-base md:text-lg text-foreground">
                    Selected Causes ({selectedCauses.length})
                  </h3>
                  <Button variant="default" className="text-xs rounded-full md:text-sm px-2 md:px-4 py-1.5 md:py-2 font-[800]">
                    <Check className="w-4 h-4" strokeWidth={3} />
                    Ready
                  </Button>
                </div>
                <div className="space-y-2 md:space-y-3">
                  {selectedCauses.map((cause) => {
                    const causeData = cause.cause || cause;
                    // Get category ID from cause (can be single letter like "F" or multi-letter like "MK")
                    const categoryId = causeData.category || causeData.cause_category;
                    const categoryNames = getCategoryNames(categoryId);
                    const categoryIds = getCategoryIds(categoryId);
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
                              <h4 className="font-bold text-sm xs:text-base md:text-lg text-foreground truncate">{causeData.name}</h4>
                              {categoryNames.map((name, index) => {
                                const singleCategoryId = categoryIds[index];
                                const bgColor = getCategoryColor(singleCategoryId);
                                const textColor = getCategoryTextColor(singleCategoryId);
                                return (
                                  <span
                                    key={index}
                                    className="inline-flex items-center rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium flex-shrink-0"
                                    style={{ backgroundColor: bgColor, color: textColor }}
                                  >
                                    {name}
                                  </span>
                                );
                              })}
                            </div>
                            <p className="text-xs xs:text-sm md:text-base text-gray-600 line-clamp-2 mb-2">
                              {causeData.mission || causeData.description}
                            </p>
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
              <h3 className="font-bold text-sm xs:text-base md:text-lg text-foreground mb-2 md:mb-3">
                Add or Remove Causes <span className="text-red-500">*</span>
              </h3>

              {/* Search Bar */}
              <div className="relative mb-3 md:mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search causes or nonprofits"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-9 md:pl-10 bg-gray-100 rounded-lg text-sm md:text-base py-5 sm:py-6"
                />
              </div>

              {/* Your Causes - Only show if there are favorite causes */}
              {favoriteCauses.length > 0 && (
                <div className="mb-3 md:mb-4">
                  <button
                    onClick={() => setIsYourCausesOpen(!isYourCausesOpen)}
                    className="flex items-center justify-between w-full gap-2 mb-3 md:mb-4 bg-blue-100 p-3 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h3 className="font-semibold text-sm xs:text-base md:text-lg text-blue-600">
                        Your Causes ({favoriteCauses.length})
                      </h3>
                    </div>
                    {isYourCausesOpen ? (
                      <Minus className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    ) : (
                      <Plus className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    )}
                  </button>
                  {isYourCausesOpen && (
                    <div className="space-y-2 md:space-y-3">
                      {isLoadingFavoriteCauses ? (
                        <div className="flex items-center justify-center py-6 md:py-8">
                          <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
                        </div>
                      ) : (
                        favoriteCauses.map((item: any) => {
                          const cause = item.cause || item;
                          const categoryId = cause.category || cause.cause_category;
                          const categoryName = getCategoryNames(categoryId);
                          const categoryColor = getCategoryColor(categoryId);
                          const isSelected = isCauseSelected(cause.id);
                          const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                          const initials = getInitials(cause.name || 'N');

                          return (
                            <div
                              key={cause.id}
                              onClick={() => handleToggleCause(cause)}
                              className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white cursor-pointer"
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
                                  <h4 className="font-bold text-sm xs:text-base md:text-lg text-foreground truncate">{cause.name}</h4>
                                  <span
                                    className="inline-flex items-center rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium flex-shrink-0"
                                    style={{ backgroundColor: categoryColor, color: getCategoryTextColor(cause.category || cause.cause_category) }}
                                  >
                                    {categoryName}
                                  </span>
                                </div>
                                <p className="text-xs xs:text-sm md:text-base text-muted-foreground line-clamp-2">
                                  {cause.mission || cause.description}
                                </p>
                              </div>
                              <div className="flex items-center cursor-pointer flex-shrink-0">
                                <div
                                  className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                    ? 'border-[#1600ff] bg-[#1600ff]'
                                    : 'border-gray-300 bg-white'
                                    }`}
                                >
                                  {isSelected && (
                                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-white" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}



              {/* Suggested Causes List */}
              {(() => {
                const causes = searchTrigger > 0 && searchQuery.trim()
                  ? (causesData?.results || [])
                  : (defaultCausesData?.results || []);

                // Get favorite cause IDs to exclude from search results
                const favoriteCauseIds = new Set(
                  favoriteCauses.map((item: any) => {
                    const cause = item.cause || item;
                    return cause.id;
                  })
                );

                // Filter out favorite causes and already selected causes
                const filteredCauses = causes.filter((cause: any) => {
                  const causeId = cause.id;
                  return causeId && !favoriteCauseIds.has(causeId) && !selectedCauses.some(selected => selected.id === causeId);
                });

                if (filteredCauses.length === 0 && !(searchTrigger > 0 && searchQuery.trim()) && defaultCausesData?.results?.length === 0) {
                  return null;
                }

                return (
                  <button
                    onClick={() => setIsSuggestedCausesOpen(!isSuggestedCausesOpen)}
                    className="flex items-center justify-between w-full gap-2 mb-3 md:mb-4 bg-purple-100 p-3 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <h4 className="font-semibold text-sm xs:text-base md:text-lg text-purple-600">
                        Suggested Causes ({filteredCauses.length})
                      </h4>
                    </div>
                    {isSuggestedCausesOpen ? (
                      <Minus className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                    ) : (
                      <Plus className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                    )}
                  </button>
                );
              })()}

              {/* Causes List */}
              {isSuggestedCausesOpen && (
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

                      // Get favorite cause IDs to exclude from search results
                      const favoriteCauseIds = new Set(
                        favoriteCauses.map((item: any) => {
                          const cause = item.cause || item;
                          return cause.id;
                        })
                      );

                      // Filter out favorite causes and already selected causes
                      const availableCauses = causes.filter((cause: any) => {
                        const causeId = cause.id;
                        return causeId && !favoriteCauseIds.has(causeId) && !selectedCauses.some(selected => selected.id === causeId);
                      });

                      if (availableCauses.length === 0) {
                        return (
                          <p className="text-xs md:text-sm text-muted-foreground text-center py-6 md:py-8">
                            No causes found
                          </p>
                        );
                      }

                      return availableCauses.map((cause: any) => {
                        // Get category ID from cause (can be single letter like "F" or multi-letter like "MK")
                        const categoryId = cause.category || cause.cause_category;
                        const categoryNames = getCategoryNames(categoryId);
                        const categoryIds = getCategoryIds(categoryId);
                        const isSelected = isCauseSelected(cause.id);

                        const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                        const initials = getInitials(cause.name || 'N');

                        return (
                          <div
                            key={cause.id}
                            onClick={() => handleToggleCause(cause)}
                            className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
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
                                <h4 className="font-bold text-sm xs:text-base md:text-lg text-foreground truncate">{cause.name}</h4>
                                {categoryNames.map((name, index) => {
                                  const singleCategoryId = categoryIds[index];
                                  const bgColor = getCategoryColor(singleCategoryId);
                                  const textColor = getCategoryTextColor(singleCategoryId);
                                  return (
                                    <span
                                      key={index}
                                      className="inline-flex items-center rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium flex-shrink-0"
                                      style={{ backgroundColor: bgColor, color: textColor }}
                                    >
                                      {name}
                                    </span>
                                  );
                                })}
                              </div>
                              <p className="text-xs xs:text-sm md:text-base text-muted-foreground line-clamp-2">
                                {cause.mission || cause.description}
                              </p>
                            </div>

                            <div className="flex items-center cursor-pointer flex-shrink-0">
                              <div
                                className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                  ? 'border-[#1600ff] bg-[#1600ff]'
                                  : 'border-gray-300 bg-white'
                                  }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-white" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 md:px-4 py-3 z-10">
            <div className="w-full lg:max-w-[60%] lg:mx-auto">
              {(() => {
                const isFormComplete = name.trim() !== '' && description.trim() !== '' && selectedCauses.length > 0;

                if (!isFormComplete) {
                  return (
                    <Button
                      disabled
                      className="bg-gray-300 text-white font-semibold rounded-full px-4 md:px-6 py-5 md:py-6 w-full text-sm md:text-base cursor-not-allowed"
                    >
                      Complete Required Fields
                    </Button>
                  );
                }

                return (
                  <Button
                    onClick={handleContinueToReview}
                    className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-full px-4 md:px-6 py-5 md:py-6 w-full text-sm md:text-base"
                  >
                    Continue to Review
                  </Button>
                );
              })()}
            </div>
          </div>

        </div>
      </div>

      {/* Custom Toast */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
      />
    </>
  );
}