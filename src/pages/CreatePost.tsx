"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { ImageIcon, X, Loader2, ArrowLeft, Globe, ChevronDown, Check, Link2, Heart, Video } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createPost, getLinkPreview, mentionSearch } from "@/services/api/social";
import { getJoinCollective } from "@/services/api/crwd";
import { useAuthStore } from "@/stores/store";
import { DiscardSheet } from "@/components/ui/DiscardSheet";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import VideoPlayer from "@/components/ui/VideoPlayer";

import { MentionSearchResults } from "@/components/post/MentionSearchResults";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function CreatePostPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Get collective_id from location state
  const initialCollective = location.state?.collectiveData || null;
  const isFromSpecificCollective = !!location.state?.collectiveData;
  const [selectedCollective, setSelectedCollective] = useState<any>(initialCollective);

  // Fetch joined collectives
  const { data: joinedCollectivesData } = useQuery({
    queryKey: ['joined-collectives', currentUser?.id],
    queryFn: () => getJoinCollective(currentUser?.id?.toString() || ''),
    enabled: !!currentUser?.id,
  });

  const userCollectives = joinedCollectivesData?.data || [];

  const getIconColor = (index: number): string => {
    const colors = [
      "#1600ff", // Blue
      "#10B981", // Green
      "#EC4899", // Pink
      "#F59E0B", // Amber
      "#8B5CF6", // Purple
      "#EF4444", // Red
    ];
    return colors[index % colors.length];
  };

  const getIconLetter = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDiscardSheet, setShowDiscardSheet] = useState(false);
  const [isConfirmedDiscard, setIsConfirmedDiscard] = useState(false);

  const [form, setForm] = useState({

    content: "",
    url: "",
  });

  // Track which post type is selected
  const [postType, setPostType] = useState<"link" | "image" | "video" | "event" | "fundraiser" | null>(
    null
  );

  // Track selected image
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Track selected video
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Track URL validation
  const [urlError, setUrlError] = useState<string | null>(null);

  // Track link preview
  const [showPreview, setShowPreview] = useState(false);

  const [mentionSearchQuery, setMentionSearchQuery] = useState<string | null>(null);
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<{ type: string; id: number | string; name: string }[]>([]);

  // Validate URL format - defined before useQuery
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Fetch link preview automatically when URL is valid
  const { data: previewData, isLoading: isLoadingPreview, refetch: fetchPreview } = useQuery({
    queryKey: ['link-preview', form.url],
    queryFn: () => getLinkPreview(form.url),
    enabled: form.url.trim().length > 0 && validateUrl(form.url) && !urlError,
  });

  // Show preview when data is available
  useEffect(() => {
    if (previewData && form.url && validateUrl(form.url) && !urlError) {
      setShowPreview(true);
    } else if (!form.url || !validateUrl(form.url) || urlError) {
      setShowPreview(false);
    }
  }, [previewData, form.url, urlError]);

  const hasUnsavedChanges = useMemo(() => {
    return form.content.trim() !== "" || form.url.trim() !== "" || selectedImage !== null || selectedVideo !== null;
  }, [form.content, form.url, selectedImage, selectedVideo]);

  // Use navigation guard hook
  useUnsavedChanges(hasUnsavedChanges, setShowDiscardSheet, isConfirmedDiscard);

  const handleBackConfirmation = () => {
    if (hasUnsavedChanges && !isConfirmedDiscard) {
      setShowDiscardSheet(true);
    } else {
      if (location.key === 'default') {
        navigate('/');
      } else {
        navigate(-1);
      }
    }
  };

  const handleDiscard = () => {
    setIsConfirmedDiscard(true);
    setShowDiscardSheet(false);

    setTimeout(() => {
      if (location.key === 'default') {
        navigate('/');
      } else {
        // Use -2 to go back to the page before the flow, 
        // since useUnsavedChanges pushes a dummy state.
        navigate(-2);
      }
    }, 0);
  };

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (response) => {
      console.log('Post created successfully:', response);
      setToastMessage("Post created successfully!");
      setShowToast(true);

      // Invalidate posts queries to refresh the list
      const collectiveId = selectedCollective?.collective?.id || selectedCollective?.id;
      if (collectiveId) {
        // Invalidate posts for the specific collective
        queryClient.invalidateQueries({ queryKey: ['posts', collectiveId.toString()] });
      }
      // Also invalidate all posts query to refresh home page and other places
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['communityUpdatesPosts'] });

      // Navigate back to the collective page or home
      setTimeout(() => {
        setIsConfirmedDiscard(true); // Don't trigger guard sheet

        if (location.key === 'default') {
          navigate('/');
        } else {
          // If we had text, use -2 to skip the dummy state.
          // If not, -1 would suffice, but -2 is safer for skip.
          if (hasUnsavedChanges) {
            navigate(-2);
          } else {
            navigate(-1);
          }
        }
      }, 1500);
    },
    onError: (error: any) => {
      console.error('Error creating post:', error);
      setToastMessage("Failed to create post. Please try again.");
      setShowToast(true);
    },
  });

  const [isSearchingMentions, setIsSearchingMentions] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    let finalValue = value;
    if (name === "content" && value.length > maxCharacters) {
      finalValue = value.substring(0, maxCharacters);
    }

    setForm((prev) => ({ ...prev, [name]: finalValue }));

    // Clear URL error when user starts typing
    if (name === "url" && urlError) {
      setUrlError(null);
    }

    // Mention search logic
    if (name === "content") {
      const cursorPosition = (e.target as HTMLTextAreaElement).selectionStart;
      const textBeforeCursor = value.substring(0, cursorPosition);
      const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');

      if (lastAtSymbolIndex !== -1) {
        const charBeforeAt = lastAtSymbolIndex > 0 ? textBeforeCursor[lastAtSymbolIndex - 1] : null;
        const isStartOfWord = !charBeforeAt || charBeforeAt === ' ' || charBeforeAt === '\n';

        if (isStartOfWord) {
          const query = textBeforeCursor.substring(lastAtSymbolIndex + 1);

          // Check if this query already corresponds to a mention we just selected
          // We look for the name followed by a space to see if we've moved past it
          const isAlreadySelected = selectedMentions.some(m =>
            query === m.name || query === m.name + ' ' || query.startsWith(m.name + ' ')
          );

          // Allow up to 2 spaces in the query to support full name search
          if (!isAlreadySelected && query.split(' ').length <= 3 && !query.includes('\n')) {
            setMentionSearchQuery(query);
          } else {
            setMentionSearchQuery(null);
          }
        } else {
          setMentionSearchQuery(null);
        }
      } else {
        setMentionSearchQuery(null);
      }
    }
  };

  useEffect(() => {
    if (mentionSearchQuery === null) {
      setMentionResults([]);
      setIsSearchingMentions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingMentions(true);
      try {
        const data = await mentionSearch(mentionSearchQuery);
        setMentionResults(data.results || (Array.isArray(data) ? data : []));
      } catch (error) {
        console.error('Mention search error:', error);
        setMentionResults([]);
      } finally {
        setIsSearchingMentions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [mentionSearchQuery]);

  const handleMentionSelect = (user: any) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = form.content.substring(0, cursorPosition);
    const textAfterCursor = form.content.substring(cursorPosition);

    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');
    // Use user.name or user.username - keeping consistent with user.name for now as per existing logic
    const mentionName = user.name || user.username;
    let newContent = textBeforeCursor.substring(0, lastAtSymbolIndex) + `@${mentionName} ` + textAfterCursor;

    if (newContent.length > maxCharacters) {
      newContent = newContent.substring(0, maxCharacters);
    }

    setForm(prev => ({ ...prev, content: newContent }));
    setSelectedMentions(prev => [
      ...prev.filter(m => m.name !== mentionName),
      { type: user.type, id: user.id, name: mentionName }
    ]);
    setMentionSearchQuery(null);
    setMentionResults([]);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const mentionPart = textBeforeCursor.substring(0, lastAtSymbolIndex) + `@${mentionName} `;
        const newCursorPos = mentionPart.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle URL validation
  const handleUrlBlur = () => {
    if (form.url && !validateUrl(form.url)) {
      setUrlError("Oops, this link isn't valid. Double-check, and try again.");
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = "";
    }
  };

  // Handle video selection
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideo(file);
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
    }
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = "";
    }
  };

  // Handle post type selection
  const handlePostTypeSelect = (type: "link" | "image" | "video" | "event") => {
    setPostType(type);

    // Reset form fields when switching post types
    setForm((prev) => ({
      ...prev,
      url: "",
    }));

    // Reset media selection
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedVideo(null);
    setVideoPreview(null);
    setUrlError(null);

    // Trigger image picker for image posts
    if (type === "image" && fileInputRef.current) {
      fileInputRef.current.click();
    } else if (type === "video" && videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  // Check if post can be submitted
  const canSubmitPost = () => {
    // Post can be submitted with just content (text-only post)
    if (!form.content.trim()) return false;

    // If URL is provided, it must be valid
    if (form.url.trim() && (!validateUrl(form.url) || urlError)) {
      return false;
    }

    // Must have a destination (Feed or Collective) - though Feed is default
    return true;
  };

  // Handle form submission
  const handleSubmitPost = () => {
    if (!canSubmitPost() || createPostMutation.isPending) return;

    const formData = new FormData();
    const collectiveId = selectedCollective?.collective?.id || selectedCollective?.id;
    if (collectiveId) {
      formData.append('collective_id', collectiveId.toString());
    }
    formData.append('content', form.content);
    formData.append('post_type', selectedCollective ? 'collective' : 'feed');

    const finalMentions = selectedMentions
      .filter(m => form.content.includes(`@${m.name}`))
      .map(({ type, id }) => ({ type, id }));

    if (finalMentions.length > 0) {
      formData.append('mentions', JSON.stringify(finalMentions));
    }

    // Add media file if it's an image post
    if (postType === "image" && selectedImage) {
      formData.append('media_file', selectedImage);
    }

    // Add media file if it's a video post
    if (postType === "video" && selectedVideo) {
      formData.append('media_file', selectedVideo);
      formData.append('media_type', 'video');
    }

    // Add media_url if URL is provided (for link posts or when URL is filled)
    if (form.url.trim() && validateUrl(form.url)) {
      formData.append('media_url', form.url);
    }

    createPostMutation.mutate(formData);
  };

  const renderHighlightedText = (text: string) => {
    if (!text) return null;

    const mentionNames = selectedMentions.map(m => `@${m.name}`);
    const mentionNamesLower = mentionNames.map(n => n.toLowerCase());
    mentionNames.sort((a, b) => b.length - a.length);

    // Fallback: simple highlighter if no selected mentions
    if (mentionNames.length === 0) {
      return text.split(/(@[\w\s]{1,30}(?=\s|$)|@\w+)/g).map((part, index) => {
        if (part.startsWith('@')) {
          return <span key={index} className="text-blue-600 font-medium">{part}</span>;
        }
        return <span key={index}>{part}</span>;
      });
    }

    const pattern = mentionNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');

    return text.split(regex).map((part, index) => {
      if (mentionNamesLower.includes(part.toLowerCase())) {
        return <span key={index} className="text-blue-600 font-medium">{part}</span>;
      }
      return part.split(/(@[\w\s]{1,30}(?=\s|$)|@\w+)/g).map((subPart, subIndex) => {
        if (subPart.startsWith('@')) {
          return <span key={`${index}-${subIndex}`} className="text-blue-600 font-medium">{subPart}</span>;
        }
        return <span key={`${index}-${subIndex}`}>{subPart}</span>;
      });
    });
  };

  if (!currentUser?.id) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={handleBackConfirmation}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Create Post</h1>
          </div>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700 mb-2">
              Sign in to create a post
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Sign in to create a post, manage your causes, and connect with your community.
            </div>
            <Button onClick={() => navigate('/login')}>
              Sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Removed direct collectiveData check to allow posting to "Your Feed"

  // Main create post form
  const characterCount = form.content.length;
  const maxCharacters = 500;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackConfirmation}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-[20px] font-bold text-gray-900">Create Post</h1>
          </div>
          <Button
            onClick={handleSubmitPost}
            variant={'outline'}
            disabled={!canSubmitPost() || createPostMutation.isPending}
            // className="bg-[#f3f4f6] hover:bg-gray-200 text-gray-400 disabled:text-gray-300 px-6 py-1.5 rounded-md font-bold transition-all"
            style={{
              // backgroundColor: canSubmitPost() ? '#1600ff' : '#f3f4f6',
              color: canSubmitPost() ? '#000000' : '#4B5563'
            }}
          >
            {createPostMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 py-4 max-w-2xl mx-auto w-full">
        {/* Collective Selector */}
        <div className="mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                // disabled={isFromSpecificCollective}
                disabled={true}
                className={`w-full flex items-center justify-between px-3 py-2.5 bg-blue-100 border border-[#cce3ff] rounded-xl text-[#0066ff] transition-all group ${isFromSpecificCollective ? ' opacity-80' : 'hover:bg-[#e6f2ff]'}`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={selectedCollective ? {
                      backgroundColor: (selectedCollective.collective || selectedCollective).color || getIconColor(0)
                    } : { backgroundColor: '#f0f7ff' }}
                  >
                    {selectedCollective ? (
                      (() => {
                        const circle = selectedCollective.collective || selectedCollective;
                        const hasColor = circle.color;
                        const hasLogo = circle.logo && (circle.logo.startsWith("http") || circle.logo.startsWith("/") || circle.logo.startsWith("data:"));
                        const showImage = !hasColor && hasLogo;

                        if (showImage) {
                          return <img src={circle.logo} alt="" className="w-full h-full object-cover" />;
                        }
                        return <span className="text-white font-bold text-xs">{getIconLetter(circle.name || "C")}</span>;
                      })()
                    ) : (
                      <Globe className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-sm font-semibold">
                    Posting to <span className="font-bold">{selectedCollective ? (selectedCollective.collective || selectedCollective).name : "Your Feed"}</span>
                  </span>
                </div>
                {/* {!isFromSpecificCollective && (
                  <ChevronDown className="w-4 h-4 text-[#0066ff] group-data-[state=open]:rotate-180 transition-transform" />
                )} */}
              </button>
            </DropdownMenuTrigger>
            {/* {!isFromSpecificCollective && (
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-2 rounded-2xl shadow-2xl border-gray-100" align="start">
                <DropdownMenuItem
                  onClick={() => setSelectedCollective(null)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-blue-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Your Feed</p>
                  </div>
                  {!selectedCollective && <Check className="w-5 h-5 text-blue-600" />}
                </DropdownMenuItem>

                <div className="px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  YOUR COLLECTIVES
                </div>

                {userCollectives?.map((item: any, index: number) => {
                  const circle = item.collective || item;
                  const hasColor = circle.color;
                  const hasLogo = circle.logo && (circle.logo.startsWith("http") || circle.logo.startsWith("/") || circle.logo.startsWith("data:"));
                  const iconColor = hasColor ? circle.color : (!hasLogo ? getIconColor(index) : undefined);
                  const showImage = !hasColor && hasLogo;
                  const isSelected = (selectedCollective?.collective?.id || selectedCollective?.id) === circle.id;

                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => setSelectedCollective(item)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-1 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                        style={iconColor ? { backgroundColor: iconColor } : {}}
                      >
                        {showImage ? (
                          <img src={circle.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {getIconLetter(circle.name || "C")}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold ${isSelected ? 'text-[#0066ff]' : 'text-gray-900'}`}>{circle.name}</p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            )} */}
          </DropdownMenu>
        </div>
        {/* Main Content Input */}
        <div className="mb-6">
          <div className=" rounded-xl p-4 bg-[#f6f5ed]  focus-within:border-blue-400 transition-all relative min-h-[240px]">
            {/* Mirror Div for styling mentions */}
            {/* <div
              className="absolute inset-x-4 inset-y-4 text-[16px] whitespace-pre-wrap break-words pointer-events-none text-gray-900 border-none"
              style={{ font: 'inherit', lineHeight: '1.6' }}
            >
              {renderHighlightedText(form.content)}
              {form.content.endsWith('\n') ? '\n' : ''}
            </div> */}
            <textarea
              ref={textareaRef}
              name="content"
              value={form.content}
              onChange={handleInputChange}
              placeholder="What's on your mind?"
              className="w-full min-h-[200px] p-0 border-0 bg-transparent text-[16px] text-gray-900 focus:outline-none resize-none placeholder:text-gray-700"
              style={{ lineHeight: '1.6' }}
              maxLength={maxCharacters}
            />
            {isSearchingMentions ? (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl mt-2 p-4 z-[60] flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            ) : (
              <MentionSearchResults
                results={mentionResults}
                onSelect={handleMentionSelect}
                className="mt-1"
                position="bottom"
              />
            )}

            {/* Character Count */}
            <div className="absolute bottom-3 right-4">
              <span className="text-[13px] font-medium text-gray-400">
                {characterCount}/{maxCharacters}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          <button
            onClick={() => handlePostTypeSelect("image")}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
          >
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <span className="text-[14px] font-bold text-gray-800">Add Image</span>
          </button>
          <button
            onClick={() => handlePostTypeSelect("link")}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
          >
            <Link2 className="w-5 h-5 text-gray-600" />
            <span className="text-[14px] font-bold text-gray-800">Add Link</span>
          </button>
          <button
            onClick={() => handlePostTypeSelect("video")}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
          >
            <Video className="w-5 h-5 text-gray-600" />
            <span className="text-[14px] font-bold text-gray-800">Add Video</span>
          </button>
          {/* {selectedCollective && (selectedCollective.created_by.id === currentUser?.id) && ( */}
          <button
            onClick={() => {
              const collective = selectedCollective?.collective || selectedCollective;
              if (collective?.id) {
                navigate(`/create-fundraiser/${collective.id}`);
              } else {
                navigate('/create-fundraiser');
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
          >
            <Heart className="w-5 h-5 text-gray-600" />
            <span className="text-[14px] font-bold text-gray-800">Create Fundraiser</span>
          </button>
          {/* )} */}
        </div>

        {/* Link Input Field - Show when link is selected or URL is entered */}
        {(postType === "link" || form.url) && (
          <div className="mb-4">
            <div className="relative border border-gray-300 rounded-lg">
              <Input
                name="url"
                value={form.url}
                onChange={handleInputChange}
                onBlur={handleUrlBlur}
                placeholder="https://example.com/article"
                className={`px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1600ff] focus:border-transparent w-full ${form.url ? 'pr-10' : ''}`}
              />
              {form.url && (
                <button
                  onClick={() => {
                    setForm((prev) => ({ ...prev, url: "" }));
                    if (postType === "link") setPostType(null);
                    setShowPreview(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 z-10"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {urlError && (
              <div className="text-red-500 text-sm mt-2">
                {urlError}
              </div>
            )}
            {/* Preview Button - Manual refresh */}
            {form.url && validateUrl(form.url) && !urlError && (
              <button
                onClick={() => {
                  fetchPreview();
                }}
                disabled={isLoadingPreview}
                className="mt-2 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingPreview ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm font-medium text-gray-700">Loading Preview...</span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-gray-700">Refresh Preview</span>
                )}
              </button>
            )}
            {/* Link Preview Card */}
            {showPreview && previewData && !isLoadingPreview && (
              <div className="mt-4 w-full rounded-lg overflow-hidden border border-gray-200 bg-white">
                <div className="flex flex-col md:flex-row bg-white">
                  {/* Preview Image */}
                  {previewData.image && (
                    <div className="w-full md:w-48  aspect-[2/1] md:aspect-auto flex-shrink-0">
                      <img
                        src={previewData.image}
                        alt={previewData.title || 'Link preview'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {/* Preview Content */}
                  <div className="flex-1 p-2.5 md:p-3">
                    {previewData.site_name && (
                      <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">
                        {previewData.site_name}
                      </div>
                    )}
                    {previewData.title && (
                      <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-0.5 md:mb-1 line-clamp-2">
                        {previewData.title}
                      </h3>
                    )}
                    {previewData.description && (
                      <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1 line-clamp-2">
                        {previewData.description}
                      </p>
                    )}
                    {previewData.domain && (
                      <div className="text-[10px] md:text-[11px] text-gray-500 truncate">
                        {previewData.domain}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Preview */}
        {selectedImage && imagePreview && (
          <div className="mb-4">
            <div className="relative rounded-lg overflow-hidden w-fit" style={{ maxWidth: '600px', maxHeight: '200px' }}>
              <img
                src={imagePreview}
                alt="Selected"
                className="max-h-[200px] object-contain rounded-lg"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                  if (postType === "image") setPostType(null);
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Video Preview */}
        {selectedVideo && videoPreview && (
          <div className="mb-4">
            <div className="relative rounded-lg overflow-hidden w-fit" style={{ maxWidth: '600px', maxHeight: '300px' }}>
              <VideoPlayer
                src={videoPreview}
                className="max-h-[300px]"
                disableFullscreen={true}
              />
              <button
                onClick={() => {
                  setSelectedVideo(null);
                  setVideoPreview(null);
                  if (postType === "video") setPostType(null);
                }}
                className="absolute top-2 cursor-pointer right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* <div className="px-4 py-4 max-w-2xl mx-auto w-full">
        <div className="text-right mb-4">
          <span className="text-sm font-medium text-gray-400">
            {characterCount}/{maxCharacters}
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5 mb-8 ">
          <button
            onClick={() => handlePostTypeSelect("image")}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
          >
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <span className="text-[14px] font-bold text-gray-800">Add Image</span>
          </button>
          <button
            onClick={() => handlePostTypeSelect("link")}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
          >
            <Link2 className="w-5 h-5 text-gray-600" />
            <span className="text-[14px] font-bold text-gray-800">Add Link</span>
          </button>
          {selectedCollective && (selectedCollective.role === "admin" || selectedCollective.role === "Admin") && (
            <button
              onClick={() => {
                const collective = selectedCollective?.collective || selectedCollective;
                if (collective?.id) {
                  navigate(`/create-fundraiser/${collective.id}`);
                } else {
                  navigate('/create-fundraiser');
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
            >
              <Heart className="w-5 h-5 text-gray-600" />
              <span className="text-[14px] font-bold text-gray-800">Create Fundraiser</span>
            </button>
          )}
        </div>
      </div> */}

      {/* Posting Tips Box */}
      {/* <div className="mt-auto bg-[#f0f7ff] rounded-2xl p-5 border border-[#e0efff]">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">💡</span>
            <h3 className="text-[15px] font-bold text-[#0047cc]">Posting Tips</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0066ff] flex-shrink-0" />
              <span className="text-[14px] text-[#0047cc] font-medium leading-tight">Share inspiring stories about the causes you support</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0066ff] flex-shrink-0" />
              <span className="text-[14px] text-[#0047cc] font-medium leading-tight">Post updates about your collective's impact</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0066ff] flex-shrink-0" />
              <span className="text-[14px] text-[#0047cc] font-medium leading-tight">Include relevant articles or resources to engage members</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0066ff] flex-shrink-0" />
              <span className="text-[14px] text-[#0047cc] font-medium leading-tight">Use "Create Event" or "Create Fundraiser" to organize your community</span>
            </li>
          </ul>
        </div> */}
      {/* </div> */}

      {/* Hidden file input for media selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoSelect}
        className="hidden"
      />

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
      <DiscardSheet
        isOpen={showDiscardSheet}
        onClose={() => setShowDiscardSheet(false)}
        onDiscard={handleDiscard}
      />
    </div>
  );
}
